
import { LootTable, LootTableEntry, LootDrop, LootItem } from '../types/loot';

/**
 * LOOT ENGINE
 * Handles the randomization logic for generating rewards.
 */

/**
 * Rolls on a specific loot table to generate drops.
 * @param table The loot table to roll on.
 * @param rollModifier Optional multiplier for luck/rolls (default 1).
 * @returns Array of LootDrop instances.
 */
export const rollLootTable = (table: LootTable, rollModifier: number = 1): LootDrop[] => {
    const drops: LootDrop[] = [];
    const totalRolls = Math.max(1, Math.round(table.rolls * rollModifier));

    for (let i = 0; i < totalRolls; i++) {
        const item = selectWeightedItem(table.items);
        if (item) {
            const quantity = getRandomInt(item.minQuantity, item.maxQuantity);

            drops.push({
                id: crypto.randomUUID(),
                item: item.item,
                quantity: quantity,
                obtainedAt: new Date().toISOString()
            });
        }
    }

    return drops;
};

/**
 * Selects an item from a list based on weight.
 * Algorithms: Weighted Random Selection
 */
const selectWeightedItem = (entries: LootTableEntry[]): LootTableEntry | null => {
    const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
    let random = Math.random() * totalWeight;

    for (const entry of entries) {
        if (random < entry.weight) {
            return entry;
        }
        random -= entry.weight;
    }

    return entries[0] || null; // Fallback
};

/**
 * Helper: Random Integer inclusive
 */
const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
