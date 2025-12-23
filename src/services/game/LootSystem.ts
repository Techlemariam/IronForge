
import prisma from '@/lib/prisma';

export class LootSystem {
    /**
     * Calculates the drop chance percent (0-100) based on workout intensity/duration.
     * For now, we return a fixed high chance for testing.
     */
    static calculateDropChance(intensity: number = 0.5, durationMinutes: number = 30): number {
        // Base chance logic (placeholder)
        const baseChance = 20; // 20% base
        const intensityBonus = intensity * 30; // Up to 30% from intensity
        const durationBonus = Math.min(durationMinutes, 60) * 0.5; // Up to 30% from duration (max 60m)

        // For testing, let's make it very easy to get loot
        return Math.min(95, baseChance + intensityBonus + durationBonus);
    }

    /**
     * Rolls for loot for a specific user.
     * 1. Checks RNG against drop chance.
     * 2. Finds items user DOESN'T have.
     * 3. Picks one based on rarity weights.
     * 4. Unlocks it in DB.
     * @returns The unlocked Item or null.
     */
    static async rollForLoot(userId: string): Promise<any | null> {
        const dropChance = this.calculateDropChance(1.0, 60); // Max stats for demo
        const roll = Math.random() * 100;

        console.log(`🎲 Loot Roll: ${roll.toFixed(1)} / ${dropChance.toFixed(1)}`);

        if (roll > dropChance) {
            return null; // No drop
        }

        // Fetch unowned items
        const allItems = await prisma.item.findMany();
        const userInventory = await prisma.userEquipment.findMany({
            where: { userId },
            select: { equipmentId: true }
        });

        const ownedIds = new Set(userInventory.map(i => i.equipmentId));
        const unownedItems = allItems.filter(i => !ownedIds.has(i.id));

        if (unownedItems.length === 0) {
            return null; // Already has everything
        }

        // Weighted Selection
        // Common: 60, Rare: 30, Epic: 8, Legendary: 2
        const rarityWeights: Record<string, number> = {
            'common': 60,
            'rare': 30,
            'epic': 8,
            'legendary': 2
        };

        const weightedPool: any[] = [];
        for (const item of unownedItems) {
            const weight = rarityWeights[item.rarity] || 10;
            // Add item to pool 'weight' times
            for (let i = 0; i < weight; i++) {
                weightedPool.push(item);
            }
        }

        const selectedItem = weightedPool[Math.floor(Math.random() * weightedPool.length)];

        // Unlock in DB
        await prisma.userEquipment.create({
            data: {
                userId,
                equipmentId: selectedItem.id,
                isOwned: true
            }
        });

        return selectedItem;
    }
}
