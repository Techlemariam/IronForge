import prisma from "@/lib/prisma";
import { EquipmentType as PrismaEquipmentType } from "@prisma/client";
import { canPerformExercise, EquipmentType as CodeEqType } from "@/data/equipmentDb";

// Map Prisma Enum to Code Enum (should be 1:1, but good to separate)
function mapPrismaToCodeType(pType: PrismaEquipmentType): CodeEqType | null {
    switch (pType) {
        case "BARBELL": return CodeEqType.BARBELL;
        case "DUMBBELL": return CodeEqType.DUMBBELL;
        case "MACHINE": return CodeEqType.MACHINE;
        case "CABLE": return CodeEqType.CABLE;
        case "KETTLEBELL": return CodeEqType.KETTLEBELL;
        case "BAND": return CodeEqType.BAND;
        case "BODYWEIGHT": return CodeEqType.BODYWEIGHT;
        case "HYPER_PRO": return CodeEqType.HYPER_PRO;
        default: return null;
    }
}

export class EquipmentService {

    /**
     * Gets the list of EquipmentTypes available to the user based on their
     * EQUIPPED items in The Armory.
     */
    static async getUserCapabilities(userId: string): Promise<CodeEqType[]> {
        const equippedItems = await prisma.userEquipment.findMany({
            where: {
                userId,
                equipped: true, // ONLY effective if equipped
            },
            include: { item: true }
        });

        const capabilities = new Set<CodeEqType>();

        // Always have Bodyweight available
        capabilities.add(CodeEqType.BODYWEIGHT);

        equippedItems.forEach(ue => {
            if (ue.item.equipmentType) {
                const codeType = mapPrismaToCodeType(ue.item.equipmentType);
                if (codeType) capabilities.add(codeType);
            }
        });

        // Check for specific "Gym Access" item or similar meta-items if they exist
        // For MVP, if you have a "Gym Membership" item enabled, maybe add ALL?

        return Array.from(capabilities);
    }

    /**
     * Checks if a specific exercise is doable with currently equipped gear.
     */
    static async canPerform(userId: string, exerciseName: string): Promise<{ possible: boolean, missing: CodeEqType[] }> {
        const capabilities = await this.getUserCapabilities(userId);
        const possible = canPerformExercise(exerciseName, capabilities, true); // prioritiseHyperPro = true 

        // If impossible, let's find what's missing (simple brute force or inspection)
        // ... (This logic isn't in canPerformExercise, maybe just return boolean for now)

        return { possible, missing: [] };
    }

    /**
     * Calculates total stats bonuses from equipped items.
     * Used by Iron Logger to calculate final XP/Damage.
     */
    static async getEquippedStats(userId: string) {
        const equippedItems = await prisma.userEquipment.findMany({
            where: { userId, equipped: true },
            include: { item: true }
        });

        let totalPower = 0;
        // Add other accumulations here (e.g. XP multiplier)

        equippedItems.forEach(ue => {
            totalPower += ue.item.power;
        });

        return { totalPower };
    }
}
