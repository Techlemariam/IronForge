import { db } from '../lib/db';
import { calculateWilks } from '../utils/wilks';

/**
 * Service to handle Iron Colosseum (PvP) Logic.
 */
export class PvPService {

    /**
     * Updates or initializes a user's PvP profile.
     * Calculates new Wilks score based on latest best lifts.
     */
    static async updateProfile(userId: string, weightLifted: number, bodyWeight: number, sex: 'male' | 'female' = 'male') {
        const wilks = calculateWilks({ weightLifted, bodyWeight, sex });

        // Check existing
        const existing = await db.pvpProfile.findUnique({ where: { userId } });

        if (!existing) {
            return db.pvpProfile.create({
                data: {
                    userId,
                    highestWilksScore: wilks,
                    rankScore: 1000,
                }
            });
        }

        // Only update if better, or accumulate damage
        if (wilks > existing.highestWilksScore) {
            await db.pvpProfile.update({
                where: { userId },
                data: { highestWilksScore: wilks }
            });
        }
    }

    /**
     * Fetches the global leaderboard sorted by RankScore (MMR) or Wilks.
     */
    static async getLeaderboard(sortBy: 'rank' | 'wilks' = 'rank') {
        return db.pvpProfile.findMany({
            orderBy: sortBy === 'rank' ? { rankScore: 'desc' } : { highestWilksScore: 'desc' },
            take: 50,
            include: { user: { select: { heroName: true, level: true } } }
        });
    }

    /**
     * Logs a battle result.
     */
    static async logBattle(attackerId: string, defenderId: string, winnerId: string, logData: any) {
        // 1. Log Battle
        await db.battleLog.create({
            data: {
                attackerId,
                defenderId,
                winnerId,
                logData
            }
        });

        // 2. Update Elo/Rank (Simplified implementation)
        // Winner +25, Loser -25
        const loserId = winnerId === attackerId ? defenderId : attackerId;

        await db.pvpProfile.update({
            where: { userId: winnerId },
            data: { rankScore: { increment: 25 }, wins: { increment: 1 } }
        });

        await db.pvpProfile.update({
            where: { userId: loserId },
            data: { rankScore: { decrement: 25 }, losses: { increment: 1 } }
        });
    }
}
