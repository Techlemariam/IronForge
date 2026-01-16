/**
 * Territory Service - Core business logic for Territory Conquest
 * 
 * Handles:
 * - Processing GPS tracks into tile conquests
 * - Control point calculations with diminishing returns
 * - Weekly settlement for ownership
 * - Passive income calculations
 */

import prisma from "@/lib/prisma";
import {
    getTilesFromGpsTrack,
    isWithinHomeZone,
    countConnectedTiles,
} from "@/lib/territory/tileUtils";
import { calculateEffortScore, EffortInput } from "./EffortCalculator";
import { NotificationService } from "@/services/notifications";

// ============================================
// TYPES
// ============================================

export interface ConquestResult {
    tilesConquered: number;
    tilesReinforced: number;
    totalControlGained: number;
    newTileIds: string[];
}

export interface SettlementResult {
    tilesSettled: number;
    ownershipChanges: number;
}

export interface TerritoryStats {
    ownedTiles: number;
    contestedTiles: number;
    totalControlPoints: number;
    dailyGold: number;
    dailyXP: number;
    largestConnectedArea: number;
}

export interface Income {
    gold: number;
    xp: number;
}

// ============================================
// CONSTANTS
// ============================================

/** Base control points for first daily visit */
const BASE_CONTROL_FIRST_VISIT = 10;

/** Control points for subsequent visits (diminishing) */
const CONTROL_SECOND_VISIT = 7;
const CONTROL_THIRD_PLUS_VISIT = 4;

/** Maximum control points a tile can have */
const MAX_CONTROL_POINTS = 100;

/** Minimum control to "own" a tile */
const OWNERSHIP_THRESHOLD = 50;

/** Home zone bonus multiplier */
const HOME_ZONE_BONUS = 1.5;

/** Control lost when rival visits your tile */
const RIVAL_ATTACK_LOSS = 7;



/** Passive income per owned tile */
const GOLD_PER_TILE = 0.5;
const XP_PER_TILE = 1.0;

/** Maximum adjacency bonus */
const MAX_ADJACENCY_BONUS = 0.5;

// ============================================
// CONQUEST
// ============================================

/**
 * Process a GPS track and update territory control
 */
export async function conquestFromActivity(
    userId: string,
    gpsTrack: Array<{ lat: number; lng: number }>,
    effortInput: EffortInput
): Promise<ConquestResult> {
    const tileIds = getTilesFromGpsTrack(gpsTrack);
    if (tileIds.length === 0) {
        return {
            tilesConquered: 0,
            tilesReinforced: 0,
            totalControlGained: 0,
            newTileIds: [],
        };
    }

    // Get user for home zone calculation
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { homeLatitude: true, homeLongitude: true },
    });

    const effortResult = calculateEffortScore(effortInput);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let tilesConquered = 0;
    let tilesReinforced = 0;
    let totalControlGained = 0;
    const newTileIds: string[] = [];

    for (const tileId of tileIds) {
        // Ensure tile exists
        await prisma.territoryTile.upsert({
            where: { id: tileId },
            create: { id: tileId },
            update: {},
        });

        // Get or create control record
        const existingControl = await prisma.tileControl.findUnique({
            where: {
                tileId_userId: { tileId, userId },
            },
        });

        // Calculate diminishing returns
        let dailyVisits = 1;
        let basePoints = BASE_CONTROL_FIRST_VISIT;

        if (existingControl) {
            // Check if we need to reset daily visits
            const lastReset = new Date(existingControl.lastDailyReset);
            lastReset.setHours(0, 0, 0, 0);

            if (lastReset.getTime() === today.getTime()) {
                // Same day - apply diminishing returns
                dailyVisits = existingControl.dailyVisits + 1;
                if (dailyVisits === 2) {
                    basePoints = CONTROL_SECOND_VISIT;
                } else {
                    basePoints = CONTROL_THIRD_PLUS_VISIT;
                }
            }
            // Different day - reset to full points
        }

        // Apply effort bonus
        let controlGain = basePoints + effortResult.controlBonus;

        // Apply home zone bonus
        if (user?.homeLatitude && user?.homeLongitude) {
            if (isWithinHomeZone(tileId, user.homeLatitude, user.homeLongitude)) {
                controlGain = Math.round(controlGain * HOME_ZONE_BONUS);
            }
        }

        // Update control record
        if (existingControl) {
            const newPoints = Math.min(
                existingControl.controlPoints + controlGain,
                MAX_CONTROL_POINTS
            );

            await prisma.tileControl.update({
                where: { id: existingControl.id },
                data: {
                    controlPoints: newPoints,
                    lastVisitAt: new Date(),
                    visitCount: existingControl.visitCount + 1,
                    dailyVisits: dailyVisits,
                    lastDailyReset:
                        dailyVisits === 1 ? today : existingControl.lastDailyReset,
                },
            });

            tilesReinforced++;
            totalControlGained += controlGain;
        } else {
            // New tile for this user
            await prisma.tileControl.create({
                data: {
                    tileId,
                    userId,
                    controlPoints: Math.min(controlGain, MAX_CONTROL_POINTS),
                    dailyVisits: 1,
                    lastDailyReset: today,
                },
            });

            tilesConquered++;
            totalControlGained += controlGain;
            newTileIds.push(tileId);
        }

        // Handle rival control reduction
        await reduceRivalControl(tileId, userId);
    }

    return {
        tilesConquered,
        tilesReinforced,
        totalControlGained,
        newTileIds,
    };
}

/**
 * Reduce control for other users when someone visits a tile
 */
async function reduceRivalControl(
    tileId: string,
    activeUserId: string
): Promise<void> {
    const rivalControls = await prisma.tileControl.findMany({
        where: {
            tileId,
            userId: { not: activeUserId },
        },
    });

    for (const rival of rivalControls) {
        // Apply loss with daily cap check (simplified - would need tracking)
        const newPoints = Math.max(0, rival.controlPoints - RIVAL_ATTACK_LOSS);

        if (newPoints !== rival.controlPoints) {
            await prisma.tileControl.update({
                where: { id: rival.id },
                data: { controlPoints: newPoints },
            });
        }
    }
}

// ============================================
// WEEKLY SETTLEMENT
// ============================================

/**
 * Run weekly settlement to determine tile ownership
 * Should be called every Sunday at 23:59
 */
export async function runWeeklySettlement(): Promise<SettlementResult> {
    // Get all tiles with control records
    const tiles = await prisma.territoryTile.findMany({
        include: {
            controls: true,
        },
    });

    let tilesSettled = 0;
    let ownershipChanges = 0;

    for (const tile of tiles) {
        // Find the user with highest control
        let maxControl = 0;
        let newOwnerId: string | null = null;

        for (const control of tile.controls) {
            if (control.controlPoints > maxControl) {
                maxControl = control.controlPoints;
                newOwnerId = control.userId;
            }
        }

        // Only own if above threshold
        if (maxControl < OWNERSHIP_THRESHOLD) {
            newOwnerId = null;
        }

        // Update ownership if changed
        if (tile.currentOwnerId !== newOwnerId) {
            await prisma.territoryTile.update({
                where: { id: tile.id },
                data: { currentOwnerId: newOwnerId },
            });
            ownershipChanges++;
        }

        tilesSettled++;
    }

    console.log(
        `[Territory Settlement] Settled ${tilesSettled} tiles, ${ownershipChanges} ownership changes`
    );

    return { tilesSettled, ownershipChanges };
}

// ============================================
// INCOME
// ============================================

/**
 * Calculate daily passive income for a user
 */
export async function calculateDailyIncome(
    userId: string
): Promise<Income> {
    const ownedTiles = await prisma.territoryTile.findMany({
        where: { currentOwnerId: userId },
        select: { id: true },
    });

    if (ownedTiles.length === 0) {
        return { gold: 0, xp: 0 };
    }

    // Calculate adjacency bonus
    const ownedTileIds = new Set(ownedTiles.map((t) => t.id));
    let largestConnected = 0;

    for (const tile of ownedTiles) {
        const connected = countConnectedTiles(ownedTileIds, tile.id);
        if (connected > largestConnected) {
            largestConnected = connected;
        }
    }

    // 2% per connected tile, max 50%
    const adjacencyBonus = Math.min(
        MAX_ADJACENCY_BONUS,
        largestConnected * 0.02
    );

    const multiplier = 1 + adjacencyBonus;
    const gold = Math.floor(ownedTiles.length * GOLD_PER_TILE * multiplier);
    const xp = Math.floor(ownedTiles.length * XP_PER_TILE * multiplier);

    return { gold, xp };
}

/**
 * Distribute daily income to all users with territory
 */
export async function distributeDailyIncome(): Promise<void> {
    // Get all users with owned tiles
    const usersWithTerritory = await prisma.user.findMany({
        where: {
            ownedTiles: { some: {} },
        },
        select: { id: true },
    });

    for (const user of usersWithTerritory) {
        const income = await calculateDailyIncome(user.id);

        if (income.gold > 0 || income.xp > 0) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    gold: { increment: income.gold },
                    totalExperience: { increment: income.xp },
                },
            });

            await NotificationService.create({
                userId: user.id,
                type: "SYSTEM",
                message: `💰 Territory Income: +${income.gold} Gold, +${income.xp} XP`,
            });
        }
    }

    console.log(
        `[Territory Income] Distributed income to ${usersWithTerritory.length} users`
    );
}

// ============================================
// STATS
// ============================================

/**
 * Get territory statistics for a user
 */
export async function getUserTerritoryStats(
    userId: string
): Promise<TerritoryStats> {
    const [ownedTiles, controlRecords] = await Promise.all([
        prisma.territoryTile.findMany({
            where: { currentOwnerId: userId },
            select: { id: true },
        }),
        prisma.tileControl.findMany({
            where: { userId },
            select: { controlPoints: true, tileId: true },
        }),
    ]);

    const ownedTileIds = new Set(ownedTiles.map((t) => t.id));

    // Count contested tiles (has control but doesn't own)
    const contestedTiles = controlRecords.filter(
        (c) => c.controlPoints > 0 && !ownedTileIds.has(c.tileId)
    ).length;

    // Total control points
    const totalControlPoints = controlRecords.reduce(
        (sum, c) => sum + c.controlPoints,
        0
    );

    // Calculate largest connected area
    let largestConnected = 0;
    for (const tile of ownedTiles) {
        const connected = countConnectedTiles(ownedTileIds, tile.id);
        if (connected > largestConnected) {
            largestConnected = connected;
        }
    }

    // Calculate income
    const income = await calculateDailyIncome(userId);

    return {
        ownedTiles: ownedTiles.length,
        contestedTiles,
        totalControlPoints,
        dailyGold: income.gold,
        dailyXP: income.xp,
        largestConnectedArea: largestConnected,
    };
}
