"use server";

import { prisma } from "@/lib/prisma";

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    heroName: string;
    value: number;
    avatar?: string | null;
}

/**
 * Get Global Strength Leaderboard (based on Wilks/Strength Index)
 */
export async function getStrengthLeaderboardAction(limit = 50): Promise<LeaderboardEntry[]> {
    try {
        const titans = await prisma.titan.findMany({
            orderBy: { strengthIndex: "desc" },
            take: limit,
            include: {
                user: {
                    select: {
                        heroName: true,
                        // image: true // If User model has image, verify schema
                    }
                }
            }
        });

        return titans.map((t, index) => ({
            rank: index + 1,
            userId: t.userId,
            heroName: t.user.heroName || "Unknown Titan",
            value: t.strengthIndex,
            // avatar: t.user.image 
        }));
    } catch (error) {
        console.error("Error fetching strength leaderboard:", error);
        return [];
    }
}

/**
 * Get Titan Level Leaderboard
 */
export async function getLevelLeaderboardAction(limit = 50): Promise<LeaderboardEntry[]> {
    try {
        const titans = await prisma.titan.findMany({
            orderBy: { level: "desc" }, // Secondary sort by XP?
            take: limit,
            include: {
                user: { select: { heroName: true } }
            }
        });

        return titans.map((t, index) => ({
            rank: index + 1,
            userId: t.userId,
            heroName: t.user.heroName || "Unknown Titan",
            value: t.level
        }));
    } catch (error) {
        console.error("Error fetching level leaderboard:", error);
        return [];
    }
}
