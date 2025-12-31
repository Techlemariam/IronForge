"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInventoryAction(userId: string) {
    try {
        const inventory = await prisma.userEquipment.findMany({
            where: { userId },
            include: { item: true },
            orderBy: { item: { power: 'desc' } }
        });
        return { success: true, inventory };
    } catch (error) {
        console.error("Error fetching inventory:", error);
        return { success: false, error: "Failed to load inventory" };
    }
}

export async function toggleEquipAction(userId: string, equipmentId: string, isEquipping: boolean) {
    try {
        // Validation: If equipping, maybe check slots? (Skipping for MVP, allow unlimited equips)

        await prisma.userEquipment.update({
            where: {
                userId_equipmentId: {
                    userId,
                    equipmentId
                }
            },
            data: { equipped: isEquipping }
        });

        revalidatePath("/armory");
        revalidatePath("/dashboard");
        revalidatePath("/logger"); // Revalidate logger to update capabilities

        return { success: true };
    } catch (error) {
        console.error("Error toggling equip:", error);
        return { success: false, error: "Failed to update equipment" };
    }
}
