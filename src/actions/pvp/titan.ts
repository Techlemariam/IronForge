"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { PvpCombatService } from "@/services/pvp/PvpCombatService";
import { revalidatePath } from "next/cache";

/**
 * Execute a combat turn in a Titan vs Titan duel.
 * Both players attack each other, and scores are updated.
 */
export async function executeTitanCombatTurnAction(duelId: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // 1. Fetch the duel
        const duel = await prisma.duelChallenge.findUnique({
            where: { id: duelId },
        });

        if (!duel) return { success: false, error: "Duel not found" };
        if (duel.status !== "ACTIVE")
            return { success: false, error: "Duel is not active" };
        if (duel.duelType !== "TITAN_VS_TITAN")
            return { success: false, error: "Not a Titan vs Titan duel" };

        // 2. Verify user is a participant
        const isChallenger = duel.challengerId === user.id;
        const isDefender = duel.defenderId === user.id;
        if (!isChallenger && !isDefender) {
            return { success: false, error: "Not a participant in this duel" };
        }

        // 3. Execute combat round using PvpCombatService
        const [attack1, attack2] = await PvpCombatService.simulateRound(
            duel.challengerId,
            duel.defenderId
        );

        // 4. Update scores (damage dealt = score gained)
        const challengerDamage = attack1.damageDealt;
        const defenderDamage = attack2.damageDealt;

        const updatedDuel = await prisma.duelChallenge.update({
            where: { id: duelId },
            data: {
                challengerScore: { increment: challengerDamage },
                defenderScore: { increment: defenderDamage },
            },
        });

        revalidatePath("/iron-arena");

        // 5. Return combat log
        return {
            success: true,
            combatLog: [attack1.message, attack2.message],
            scores: {
                challenger: updatedDuel.challengerScore,
                defender: updatedDuel.defenderScore,
            },
            damageDealt: {
                challenger: challengerDamage,
                defender: defenderDamage,
            },
        };
    } catch (error) {
        console.error("Combat turn error:", error);
        return { success: false, error: "Failed to execute combat turn" };
    }
}

/**
 * Get the current state of a Titan vs Titan duel with combat stats.
 */
export async function getTitanDuelStateAction(duelId: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const duel = await prisma.duelChallenge.findUnique({
            where: { id: duelId },
            include: {
                challenger: {
                    select: { id: true, heroName: true, level: true },
                },
                defender: {
                    select: { id: true, heroName: true, level: true },
                },
            },
        });

        if (!duel) return { success: false, error: "Duel not found" };

        return {
            success: true,
            duel: {
                id: duel.id,
                status: duel.status,
                duelType: duel.duelType,
                challenger: duel.challenger,
                defender: duel.defender,
                challengerScore: duel.challengerScore || 0,
                defenderScore: duel.defenderScore || 0,
                endDate: duel.endDate,
            },
        };
    } catch (error) {
        console.error("Get duel state error:", error);
        return { success: false, error: "Failed to fetch duel state" };
    }
}
