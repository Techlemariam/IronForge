"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export type LootResult = {
  success: boolean;
  message: string;
  item?: {
    id: string;
    name: string;
    rarity: string;
    image: string | null;
  };
};

export async function simulateLootDrop(): Promise<LootResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User not authenticated" };
  }

  try {
    console.log(`🎰 Simulating Drop for ${user.id}...`);

    // --- Inlined Loot Logic ---
    const dropChance = 95; // Fixed high chance for testing
    const roll = Math.random() * 100;

    if (roll > dropChance) {
      return { success: false, message: "No loot this time." };
    }

    const allItems = await prisma.item.findMany();
    const userInventory = await prisma.userEquipment.findMany({
      where: { userId: user.id },
      select: { equipmentId: true },
    });

    const ownedIds = new Set(userInventory.map((i) => i.equipmentId));
    const unownedItems = allItems.filter((i) => !ownedIds.has(i.id));

    if (unownedItems.length === 0) {
      return { success: false, message: "All items unlocked!" };
    }

    const rarityWeights: Record<string, number> = {
      common: 60,
      rare: 30,
      epic: 8,
      legendary: 2,
    };

    const weightedPool = [];
    for (const item of unownedItems) {
      const weight = rarityWeights[item.rarity] || 10;
      for (let i = 0; i < weight; i++) weightedPool.push(item);
    }

    const selectedItem =
      weightedPool[Math.floor(Math.random() * weightedPool.length)];

    await prisma.userEquipment.create({
      data: {
        userId: user.id,
        equipmentId: selectedItem.id,
        isOwned: true,
      },
    });
    // ---------------------------

    revalidatePath("/armory");
    return {
      success: true,
      message: "Loot Drop!",
      item: {
        id: selectedItem.id,
        name: selectedItem.name,
        rarity: selectedItem.rarity,
        image: selectedItem.image,
      },
    };
  } catch (error) {
    console.error("Loot Action Error:", error);
    return { success: false, message: "System malfunction." };
  }
}
