"use server";

import { TerritoryControlService } from "@/services/TerritoryControlService";

export async function getTerritoryMapAction() {
    try {
        const mapState = await TerritoryControlService.getMapState();
        return { success: true, data: mapState };
    } catch (error) {
        console.error("getTerritoryMapAction error:", error);
        return { success: false, error: "Failed to load territory map" };
    }
}

export async function contestTerritoryAction(_territoryId: string, _guildId: string) {
    try {
        // This would be called when a guild member completes a workout
        // For now, just a placeholder
        return { success: true };
    } catch (error) {
        console.error("contestTerritoryAction error:", error);
        return { success: false, error: "Failed to contest territory" };
    }
}
