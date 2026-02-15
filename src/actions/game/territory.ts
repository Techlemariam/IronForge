"use server";

import { z } from "zod";
import { TerritoryService } from "@/services/game/TerritoryService";
import { revalidatePath } from "next/cache";

// --- Schemas ---

const claimTerritorySchema = z.object({
    guildId: z.string(),
    territoryId: z.string(),
    userId: z.string(),
});

const contestTerritorySchema = z.object({
    attackerId: z.string(),
    territoryId: z.string(),
    userId: z.string(),
});

// --- Actions ---

/**
 * Fetch all territories with contest data.
 */
export async function getTerritoriesAction() {
    try {
        return await TerritoryService.getMapData();
    } catch (error: any) {
        console.error("[TerritoryActions] getTerritories error:", error.message);
        throw new Error("Failed to fetch territories");
    }
}

/**
 * Claim an unclaimed territory.
 */
export async function claimTerritoryAction(guildId: string, territoryId: string, userId: string) {
    const parsed = claimTerritorySchema.safeParse({ guildId, territoryId, userId });
    if (!parsed.success) {
        throw new Error("Invalid input");
    }

    try {
        const result = await TerritoryService.claimTerritory(guildId, territoryId, userId);
        revalidatePath("/citadel");
        revalidatePath("/dashboard");
        return result;
    } catch (error: any) {
        console.error("[TerritoryActions] claimTerritory error:", error.message);
        throw new Error(error.message || "Failed to claim territory");
    }
}

/**
 * Initiate a contest for an owned territory.
 */
export async function contestTerritoryAction(attackerId: string, territoryId: string, userId: string) {
    const parsed = contestTerritorySchema.safeParse({ attackerId, territoryId, userId });
    if (!parsed.success) {
        throw new Error("Invalid input");
    }

    try {
        const result = await TerritoryService.contestTerritory(attackerId, territoryId, userId);
        revalidatePath("/citadel");
        revalidatePath("/dashboard");
        return result;
    } catch (error: any) {
        console.error("[TerritoryActions] contestTerritory error:", error.message);
        throw new Error(error.message || "Failed to initiate contest");
    }
}

/**
 * Manual trigger for contest resolution (admin only).
 */
export async function resolveExpiredContestsAction() {
    try {
        // In a real app, we'd check for admin role here
        await TerritoryService.resolveExpiredContests();
        revalidatePath("/citadel");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("[TerritoryActions] resolveExpiredContests error:", error.message);
        throw new Error("Failed to resolve contests");
    }
}
