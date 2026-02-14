"use server";

import { z } from "zod";
import { TerritoryService } from "@/services/game/TerritoryService";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

// --- Schemas ---

const claimTerritorySchema = z.object({
    guildId: z.string().uuid(),
    territoryId: z.string().uuid(),
});

const contestTerritorySchema = z.object({
    attackerId: z.string().uuid(),
    territoryId: z.string().uuid(),
});

// --- Helpers ---

async function verifyTerritoryAuth() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
        throw new Error("Unauthorized: Please sign in to continue.");
    }

    // Fetch DB user to check guild
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, guildId: true, email: true }
    });

    if (!user) throw new Error("User record not found.");

    return { session, user };
}

// --- Actions ---

/**
 * Fetch all territories with contest data.
 */
export async function getTerritoriesAction() {
    await verifyTerritoryAuth();
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
export async function claimTerritoryAction(guildId: string, territoryId: string) {
    const { user } = await verifyTerritoryAuth();

    if (user.guildId !== guildId) {
        throw new Error("Forbidden: You are not a member of this guild.");
    }

    const parsed = claimTerritorySchema.safeParse({ guildId, territoryId });
    if (!parsed.success) {
        throw new Error("Invalid input format (must be valid UUIDs)");
    }

    try {
        const result = await TerritoryService.claimTerritory(guildId, territoryId, user.id);
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
export async function contestTerritoryAction(attackerId: string, territoryId: string) {
    const { user } = await verifyTerritoryAuth();

    if (user.guildId !== attackerId) {
        throw new Error("Forbidden: You are not a member of the attacking guild.");
    }

    const parsed = contestTerritorySchema.safeParse({ attackerId, territoryId });
    if (!parsed.success) {
        throw new Error("Invalid input format (must be valid UUIDs)");
    }

    try {
        const result = await TerritoryService.contestTerritory(attackerId, territoryId, user.id);
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
    const { session } = await verifyTerritoryAuth();

    // Check if user is admin (assuming admin email for now based on context)
    const isAdmin = session.user.email?.endsWith("@ironforge.rpg");
    if (!isAdmin) {
        throw new Error("Forbidden: This action requires administrator privileges.");
    }

    try {
        await TerritoryService.resolveExpiredContests();
        revalidatePath("/citadel");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("[TerritoryActions] resolveExpiredContests error:", error.message);
        throw new Error("Failed to resolve contests");
    }
}
