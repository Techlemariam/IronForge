"use server";

import { GarminService, GarminWellnessData } from "@/services/bio/GarminService";
import { getSession } from "@/lib/auth";

export async function getGarminWellnessAction(): Promise<GarminWellnessData | null> {
    try {
        const session = await getSession();
        if (!session?.user) return null;

        return await GarminService.getTitanWellness(session.user.id);
    } catch (error) {
        console.error("Error in getGarminWellnessAction:", error);
        return null;
    }
}
