"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";

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
export const getStrengthLeaderboardAction = authActionClient
    .schema(z.number().default(50))
    .action(async ({ parsedInput: limit }) => {
        try {
            const titans = await prisma.titan.findMany({
                orderBy: { strengthIndex: "desc" },
                take: limit,
                include: {
                    user: {
                        select: {
                            heroName: true,
                        }
                    }
                }
            });

            return titans.map((t, index) => ({
                rank: index + 1,
                userId: t.userId,
                heroName: t.user.heroName || "Unknown Titan",
                value: t.strengthIndex,
            }));
        } catch (error) {
            console.error("Error fetching strength leaderboard:", error);
            return [];
        }
    });

/**
 * Get Titan Level Leaderboard
 */
export const getLevelLeaderboardAction = authActionClient
    .schema(z.number().default(50))
    .action(async ({ parsedInput: limit }) => {
        try {
            const titans = await prisma.titan.findMany({
                orderBy: { level: "desc" },
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
    });
