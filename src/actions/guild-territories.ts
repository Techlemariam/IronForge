"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Allows a Guild Leader to set a specific territory as their active target
 * for the current week. This creates a `TerritoryContestEntry`.
 */
export async function setGuildTerritoryTarget(
    guildId: string,
    territoryId: string,
    userId: string
) {
    try {
        // 1. Verify User is Leader of the Guild
        const guild = await prisma.guild.findUnique({
            where: { id: guildId },
            select: { leaderId: true },
        });

        if (!guild || guild.leaderId !== userId) {
            return { success: false, error: "Only the Guild Leader can set territory targets." };
        }

        // 2. Verify Territory exists
        const territory = await prisma.territory.findUnique({
            where: { id: territoryId },
        });

        if (!territory) {
            return { success: false, error: "Territory not found." };
        }

        // 3. Get Current Week
        const now = new Date();
        const weekNumber = getISOWeek(now);
        const year = now.getFullYear();

        // 4. Check if they already have an entry for this territory
        const existingEntry = await prisma.territoryContestEntry.findUnique({
            where: {
                territoryId_guildId_weekNumber_year: {
                    territoryId,
                    guildId,
                    weekNumber,
                    year,
                },
            },
        });

        if (existingEntry) {
            return { success: false, error: "Your guild is already targeting this territory." };
        }

        // Optional: We can enforce a limit on how many territories a guild can target per week.
        // For now, let's keep it simple.

        // 5. Create the Commitment Entry
        await prisma.territoryContestEntry.create({
            data: {
                territoryId,
                guildId,
                weekNumber,
                year,
                totalVolume: 0,
                workoutCount: 0,
                xpEarned: 0,
                memberCount: 0,
            },
        });

        revalidatePath("/map");
        revalidatePath("/guild");

        return {
            success: true,
            message: `Successfully set ${territory.name} as your target for this week.`,
        };
    } catch (error) {
        console.error("Failed to set territory target:", error);
        return { success: false, error: "An internal error occurred." };
    }
}

// Helper for ISO Week
function getISOWeek(date: Date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}
