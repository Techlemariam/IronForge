"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const getInventoryAction = authActionClient
    .action(async ({ ctx: { userId } }) => {
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
    });

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";

const toggleEquipSchema = z.object({
    equipmentId: z.string().min(1),
    isEquipping: z.boolean()
});

export const toggleEquipAction = authActionClient
    .schema(toggleEquipSchema)
    .action(async ({ parsedInput: { equipmentId, isEquipping }, ctx: { userId } }) => {
        try {
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
            revalidatePath("/logger");

            return { success: true };
        } catch (error) {
            console.error("Error toggling equip:", error);
            return { success: false, error: "Failed to update equipment" };
        }
    });
