"use server";

import { revalidatePath } from "next/cache";

export async function recalculatePowerRatingAction(userId: string) {
    try {
        const { PowerRatingService } = await import("@/services/game/PowerRatingService");

        const result = await PowerRatingService.syncPowerRating(userId);

        revalidatePath("/dashboard");
        revalidatePath("/citadel");
        revalidatePath("/leaderboard");

        return { success: true, data: result.titan };

    } catch (error: any) {
        console.error("Error recalculating Power Rating:", error);
        return { success: false, error: error.message };
    }
}
