"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/lib/safe-action";

/**
 * Valid items for purchase in the Gold Shop.
 */
const SHOP_ITEMS = [
  {
    id: "streak_freeze",
    name: "Streak Freeze Shield",
    description: "Equip this to protect your streak if you miss a single day.",
    cost: 1500, // Gold sink
    type: "CONSUMABLE",
  },
  {
    id: "energy_potion",
    name: "Titan Energy Potion",
    description: "Instantly restores 50 Energy to your Titan.",
    cost: 500,
    type: "CONSUMABLE",
  },
  {
    id: "oracle_reroll",
    name: "Oracle Decree Reroll",
    description: "Change today's Oracle Decree if it gave you a DEBUFF.",
    cost: 3000,
    type: "CONSUMABLE",
  }
];

export const fetchShopItemsAction = authActionClient
  .action(async () => {
    return { success: true, items: SHOP_ITEMS };
  });

/**
 * Purchases an item from the shop using Gold.
 */
export const purchaseShopItemAction = authActionClient
  .schema(z.string())
  .action(async ({ parsedInput: itemId, ctx: { userId } }) => {
    try {
      const itemDefinition = SHOP_ITEMS.find((i) => i.id === itemId);
      if (!itemDefinition) {
        return { success: false, error: "Item not found in shop." };
      }

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { gold: true },
        });

        if (!user) throw new Error("User not found");
        if (user.gold < itemDefinition.cost) {
          throw new Error("Not enough gold");
        }

        // Deduct Gold
        await tx.user.update({
          where: { id: userId },
          data: { gold: { decrement: itemDefinition.cost } },
        });

        // Grant Item Effect
        if (itemDefinition.id === "energy_potion") {
          await tx.titan.update({
            where: { userId },
            data: { currentEnergy: { increment: 50 } },
          });
        } else if (itemDefinition.id === "streak_freeze") {
          const systemItem = await tx.item.upsert({
            where: { id: "item_streak_freeze" },
            create: { id: "item_streak_freeze", name: itemDefinition.name, description: itemDefinition.description, type: "CONSUMABLE", rarity: "EPIC" },
            update: {}
          });

          await tx.userEquipment.upsert({
            where: { userId_equipmentId: { userId, equipmentId: systemItem.id } },
            create: { userId, equipmentId: systemItem.id, isOwned: true },
            update: {}
          });
        }

        return { success: true };
      });

      revalidatePath("/dashboard");
      return result;

    } catch (error: any) {
      console.error("Purchase failed:", error);
      return { success: false, error: error.message || "Transaction failed" };
    }
  });
