import prisma from "@/lib/prisma";

export class LootSystem {
  /**
   * Calculates drop chance (0-100) based on workout metrics and player lootLuck modifier.
   *
   * Formula: min(95, (20 + intensity*30 + min(duration,60)*0.5) * lootLuck)
   *
   * @param intensity - Workout intensity 0.0-1.0
   * @param durationMinutes - Workout duration in minutes
   * @param lootLuck - Player's lootLuck modifier from PlayerContext (default 1.0)
   */
  static calculateDropChance(
    intensity: number = 0.5,
    durationMinutes: number = 30,
    lootLuck: number = 1.0,
  ): number {
    const baseChance = 20;
    const intensityBonus = intensity * 30;
    const durationBonus = Math.min(durationMinutes, 60) * 0.5;

    // Apply lootLuck modifier from PlayerContext
    const modifiedChance = (baseChance + intensityBonus + durationBonus) * lootLuck;
    return Math.min(95, modifiedChance);
  }

  /**
   * Rolls for loot for a specific user.
   * 1. Checks RNG against drop chance.
   * 2. Finds items user DOESN'T have.
   * 3. Picks one based on rarity weights.
   * 4. Unlocks it in DB.
   * @returns The unlocked Item or null.
   */
  static async rollForLoot(
    userId: string,
    intensity: number = 0.5,
    durationMinutes: number = 30,
    lootLuck: number = 1.0,
  ): Promise<any | null> {
    const dropChance = this.calculateDropChance(intensity, durationMinutes, lootLuck);
    const roll = Math.random() * 100;

    console.log(`🎲 Loot Roll: ${roll.toFixed(1)} / ${dropChance.toFixed(1)}`);

    if (roll > dropChance) {
      return null; // No drop
    }

    // Fetch unowned items
    const allItems = await prisma.item.findMany();
    const userInventory = await prisma.userEquipment.findMany({
      where: { userId },
      select: { equipmentId: true },
    });

    const ownedIds = new Set(userInventory.map((i) => i.equipmentId));
    const unownedItems = allItems.filter((i) => !ownedIds.has(i.id));

    if (unownedItems.length === 0) {
      return null; // Already has everything
    }

    // Weighted Selection
    // Common: 60, Rare: 30, Epic: 8, Legendary: 2
    const rarityWeights: Record<string, number> = {
      common: 60,
      rare: 30,
      epic: 8,
      legendary: 2,
    };

    const weightedPool: any[] = [];
    for (const item of unownedItems) {
      const weight = rarityWeights[item.rarity] || 10;
      // Add item to pool 'weight' times
      for (let i = 0; i < weight; i++) {
        weightedPool.push(item);
      }
    }

    const selectedItem =
      weightedPool[Math.floor(Math.random() * weightedPool.length)];

    // Unlock in DB
    await prisma.userEquipment.create({
      data: {
        userId,
        equipmentId: selectedItem.id,
        isOwned: true,
      },
    });

    return selectedItem;
  }
}
