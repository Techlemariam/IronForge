
/**
 * Loot System Type Definitions
 */

export enum Rarity {
    COMMON = 'common',       // Grey
    UNCOMMON = 'uncommon',   // Green
    RARE = 'rare',           // Blue
    EPIC = 'epic',           // Purple
    LEGENDARY = 'legendary', // Orange
    MYTHIC = 'mythic'        // Red (Special Events)
}

export enum ItemType {
    CURRENCY = 'currency',   // Gold, Kinetic Charge
    CONSUMABLE = 'consumable', // Potions, XP Tomes
    MATERIAL = 'material',   // Crafting mats (future)
    KEY_ITEM = 'key_item',   // Quest items
    COSMETIC = 'cosmetic'    // Paper Doll gear
}

export interface LootItem {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    rarity: Rarity;
    power?: number;
    image: string | null;
    icon?: string; // Legacy/Lucide support
    value?: number; // Sale value or effect magnitude
    effects?: {
        type: 'restore_hp' | 'grant_xp' | 'boost_stat' | 'grant_kc';
        value: number;
        duration?: number;
    }[];
}

export interface LootTableEntry {
    item: LootItem;
    weight: number; // Probability weight
    minQuantity: number;
    maxQuantity: number;
}

export interface LootTable {
    id: string;
    description: string;
    items: LootTableEntry[];
    rolls: number; // How many times to roll on this table
}

export interface LootDrop {
    id: string; // Unique instance ID
    item: LootItem;
    quantity: number;
    obtainedAt: string; // ISO Date
}
