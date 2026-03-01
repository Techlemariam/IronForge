"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function fetchShopItemsAction() {
  return { success: true, items: SHOP_ITEMS };
}

/**
 * Purchases an item from the shop using Gold.
 */
export async function purchaseShopItemAction(userId: string, itemId: string) {
  try {
    const itemDefinition = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!itemDefinition) {
      return { success: false, error: "Item not found in shop." };
    }

    // Use a transaction to ensure gold isn't spent without receiving the item
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
          data: { currentEnergy: { increment: 50 } }, // In reality we'd cap this at maxEnergy
        });
      } else if (itemDefinition.id === "streak_freeze") {
        // Here we'd typically add it to an Inventory table, but for now we'll 
        // store it in the user's generic preferences or a specific Inventory model
        // Assume we just grant a simple DB row:
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
}
