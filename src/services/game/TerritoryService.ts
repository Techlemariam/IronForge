import prisma from '@/lib/prisma';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import { tileIdToCoords, HOME_ZONE_RADIUS_METERS, isWithinHomeZone } from '@/lib/territory/tileUtils';

const CONTEST_COST_GOLD = 1000;

export class TerritoryService {
  /**
   * Records activity for a guild's target territory.
   * Ensures that activity only counts for the focused target.
   */
  static async recordActivity(
    guildId: string,
    territoryId: string,
    metrics: { volume: number; xp: number }
  ) {
    const now = new Date();
    const weekNumber = getISOWeek(now);
    const year = getISOWeekYear(now);

    // Count guild members for the entry
    const memberCount = await prisma.user.count({
      where: { guildId },
    });

    return await prisma.territoryContestEntry.upsert({
      where: {
        territoryId_guildId_weekNumber_year: {
          territoryId,
          guildId,
          weekNumber,
          year,
        },
      },
      update: {
        totalVolume: { increment: metrics.volume },
        workoutCount: { increment: 1 },
        xpEarned: { increment: metrics.xp },
        memberCount,
      },
      create: {
        territoryId,
        guildId,
        weekNumber,
        year,
        totalVolume: metrics.volume,
        workoutCount: 1,
        xpEarned: metrics.xp,
        memberCount,
      },
    });
  }

  /**
   * Weekly resolution of all territory contests.
   * Runs at the end of the week.
   */
  static async resolveWeeklyCycle() {
    console.log('[TerritoryManager] Starting weekly resolution cycle...');
    const now = new Date();
    // Resolve for the week that just ended (or is current)
    const weekNumber = getISOWeek(now);
    const year = getISOWeekYear(now);

    const territories = await prisma.territory.findMany({
      include: {
        contestEntries: {
          where: { weekNumber, year },
          orderBy: { totalVolume: 'desc' },
        },
      },
    });

    const results = [];

    for (const territory of territories) {
      const topEntry = territory.contestEntries[0];
      const previousOwnerId = territory.controlledById;

      if (!topEntry || topEntry.totalVolume === 0) {
        // No activity - territory goes wild if owned
        if (previousOwnerId) {
          await prisma.territory.update({
            where: { id: territory.id },
            data: { controlledById: null, controlledAt: null },
          });
          results.push({ territory: territory.name, winner: null, status: 'GOES_WILD' });
        }
        continue;
      }

      const winnerId = topEntry.guildId;

      await prisma.$transaction(async (tx) => {
        // Update ownership
        await tx.territory.update({
          where: { id: territory.id },
          data: { controlledById: winnerId, controlledAt: now },
        });

        // Record history
        await tx.territoryHistory.create({
          data: {
            territoryId: territory.id,
            guildId: winnerId,
            weekNumber,
            year,
            totalXp: topEntry.xpEarned,
            totalVolume: topEntry.totalVolume,
            result: previousOwnerId === winnerId ? 'DEFENDED' : 'CAPTURED',
          },
        });

        // Enforce 3-territory limit
        await this.enforceTerritoryCap(winnerId, tx);
      });

      results.push({
        territory: territory.name,
        winner: winnerId,
        status: previousOwnerId === winnerId ? 'DEFENDED' : 'CAPTURED',
      });
    }

    return results;
  }

  /**
   * Distribute daily income to guilds based on controlled territories.
   */
  static async distributeDailyIncome() {
    const guilds = await prisma.guild.findMany({
      where: { territories: { some: {} } },
      include: { territories: { orderBy: { controlledAt: 'asc' } } },
    });

    for (const guild of guilds) {
      // Limit to 3 territories for income calculation
      const activeTerritories = guild.territories.slice(0, 3);
      const totalGold = activeTerritories.length * 100;
      const totalXP = activeTerritories.length * 50;

      if (totalGold > 0 || totalXP > 0) {
        await prisma.guild.update({
          where: { id: guild.id },
          data: {
            gold: { increment: totalGold },
            xp: { increment: totalXP },
          },
        });
      }
    }
  }

  /**
   * Enforces the 3-territory cap. Forfeits oldest territory if over limit.
   */
  private static async enforceTerritoryCap(guildId: string, tx: any) {
    const controlled = await tx.territory.findMany({
      where: { controlledById: guildId },
      orderBy: { controlledAt: 'asc' },
    });

    if (controlled.length > 3) {
      const toForfeit = controlled[0];
      await tx.territory.update({
        where: { id: toForfeit.id },
        data: { controlledById: null, controlledAt: null },
      });

      await tx.territoryHistory.create({
        data: {
          territoryId: toForfeit.id,
          guildId,
          weekNumber: 0,
          year: getISOWeekYear(new Date()),
          result: 'FORFEITED_LIMIT',
        },
      });
    }
  }
  /**
   * Returns all territories with their controlling guilds and current week's contest entries.
   * Logic ported from getWorldMapAction for consistency.
   */
  static async getMapData() {
    const now = new Date();
    const weekNumber = getISOWeek(now);
    const year = getISOWeekYear(now);

    const territories = await prisma.territory.findMany({
      include: {
        controlledBy: {
          select: { id: true, name: true, tag: true },
        },
        contestEntries: {
          where: { weekNumber, year },
          orderBy: { totalVolume: 'desc' },
        },
        activeContests: {
          where: { status: 'active' },
          include: {
            attacker: { select: { id: true, name: true, tag: true } },
            defender: { select: { id: true, name: true, tag: true } },
          },
        },
      },
      orderBy: [{ region: 'asc' }, { name: 'asc' }],
    });

    return territories;
  }

  /**
   * Helper to charge a guild or user for territory actions.
   * Priority: Guild Gold > User Gold (if leader/active).
   */
  private static async chargeForAction(tx: any, guildId: string, userId: string) {
    const guild = await tx.guild.findUnique({
      where: { id: guildId },
      select: { gold: true, leaderId: true },
    });
    const user = await tx.user.findUnique({ where: { id: userId }, select: { gold: true } });

    if (!user) throw new Error('User not found');

    if (guild && guild.gold >= CONTEST_COST_GOLD) {
      await tx.guild.update({
        where: { id: guildId },
        data: { gold: { decrement: CONTEST_COST_GOLD } },
      });
    } else if (user.gold >= CONTEST_COST_GOLD) {
      await tx.user.update({
        where: { id: userId },
        data: { gold: { decrement: CONTEST_COST_GOLD } },
      });
    } else {
      throw new Error(`Insufficient gold. Need ${CONTEST_COST_GOLD} (Guild or Personal).`);
    }
  }

  /**
   * Claim an unclaimed territory.
   */
  static async claimTerritory(guildId: string, territoryId: string, userId: string) {
    const now = new Date();

    return await prisma.$transaction(async (tx) => {
      const territory = await tx.territory.findUnique({
        where: { id: territoryId },
      });

      if (!territory) throw new Error('Territory not found');
      if (territory.controlledById) throw new Error('Territory already claimed');

      // Charge for the action
      await this.chargeForAction(tx, guildId, userId);

      // Update territory
      const updated = await tx.territory.update({
        where: { id: territoryId },
        data: {
          controlledById: guildId,
          controlledAt: now,
        },
      });

      // Record history
      await tx.territoryHistory.create({
        data: {
          territoryId,
          guildId,
          weekNumber: getISOWeek(now),
          year: getISOWeekYear(now),
          result: 'CAPTURED',
        },
      });

      return updated;
    });
  }

  /**
   * Initiate a contest for an owned territory.
   */
  static async contestTerritory(attackerId: string, territoryId: string, userId: string) {
    const now = new Date();
    const weekNumber = getISOWeek(now);
    const year = getISOWeekYear(now);

    return await prisma.$transaction(async (tx) => {
      const territory = await tx.territory.findUnique({
        where: { id: territoryId },
      });

      if (!territory) throw new Error('Territory not found');
      if (!territory.controlledById) throw new Error('Territory is unclaimed, use claim instead');
      if (territory.controlledById === attackerId) throw new Error('You already own this territory');

      const existingEntry = await tx.territoryContestEntry.findUnique({
        where: {
          territoryId_guildId_weekNumber_year: {
            territoryId,
            guildId: attackerId,
            weekNumber,
            year,
          },
        },
      });

      if (existingEntry) throw new Error('Already contesting this territory this week');

      // Charge for the action
      await this.chargeForAction(tx, attackerId, userId);

      // Create contest entry to start tracking volume
      return await tx.territoryContestEntry.create({
        data: {
          territoryId,
          guildId: attackerId,
          weekNumber,
          year,
          workoutCount: 0,
          totalVolume: 0,
          xpEarned: 0,
          memberCount: 1,
        },
      });
    });
  }

  /**
   * Get solo territory stats for a user.
   */
  static async getUserTerritoryStats(userId: string) {
    const [tilesCount, controlPoints, rank] = await Promise.all([
      prisma.territoryTile.count({ where: { currentOwnerId: userId } }),
      prisma.tileControl.aggregate({
        where: { userId },
        _sum: { controlPoints: true },
      }),
      // Simple rank based on owned tiles
      prisma.user.count({
        where: {
          ownedTiles: {
            some: {},
          },
          ownedTiles: {
            _count: {
              gt: await prisma.territoryTile.count({ where: { currentOwnerId: userId } }),
            },
          },
        },
      }).then((count) => count + 1),
    ]);

    return {
      tilesOwned: tilesCount,
      totalControlPoints: controlPoints._sum.controlPoints || 0,
      rank,
    };
  }

  /**
   * Get solo map data for a user.
   */
  static async getSoloMapData(userId: string) {
    const [stats, controlRecords, user] = await Promise.all([
      this.getUserTerritoryStats(userId),
      prisma.tileControl.findMany({
        where: { userId },
        include: {
          tile: {
            include: {
              currentOwner: {
                select: { heroName: true },
              },
            },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { homeLatitude: true, homeLongitude: true },
      }),
    ]);

    // Map to UI format
    const mapTiles = controlRecords.map((c: any) => {
      const coords = tileIdToCoords(c.tileId);
      let state: 'OWNED' | 'HOSTILE' | 'CONTESTED' | 'HOME_ZONE' = 'CONTESTED';

      if (c.tile.currentOwnerId === userId) {
        state = 'OWNED';
      } else if (c.tile.currentOwnerId) {
        state = 'HOSTILE';
      }

      // Home Zone Override
      if (user?.homeLatitude && user?.homeLongitude) {
        if (isWithinHomeZone(c.tileId, user.homeLatitude, user.homeLongitude, HOME_ZONE_RADIUS_METERS)) {
          state = 'HOME_ZONE';
        }
      }

      return {
        id: c.tileId,
        lat: coords.lat,
        lng: coords.lng,
        state,
        controlPoints: c.controlPoints,
        ownerName: c.tile.currentOwner?.heroName || undefined,
        cityName: c.tile.cityName || undefined,
      };
    });

    return {
      stats,
      tiles: mapTiles,
      homeLocation: user?.homeLatitude && user?.homeLongitude
        ? { lat: user.homeLatitude, lng: user.homeLongitude }
        : null,
    };
  }

  /**
   * Manual trigger for contest resolution.
   */
  static async resolveExpiredContests() {
    return await this.resolveWeeklyCycle();
  }
}
