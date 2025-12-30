import { LootTable, LootItem, ItemType, Rarity } from "../types/loot";

/**
 * Standard Loot Definitions
 */

// --- CURRENCIES ---
const KC_ORB_SMALL: LootItem = {
  id: "kc_orb_small",
  name: "Small Kinetic Orb",
  description: "A faint glimmer of kinetic energy.",
  type: ItemType.CURRENCY,
  rarity: Rarity.COMMON,
  image: null,
  value: 10,
  effects: [{ type: "grant_kc", value: 10 }],
};

const KC_ORB_MEDIUM: LootItem = {
  id: "kc_orb_medium",
  name: "Charged Kinetic Orb",
  description: "Pulsating with workout energy.",
  type: ItemType.CURRENCY,
  rarity: Rarity.UNCOMMON,
  image: null,
  value: 50,
  effects: [{ type: "grant_kc", value: 50 }],
};

const KC_ORB_LARGE: LootItem = {
  id: "kc_orb_large",
  name: "Radiant Kinetic Core",
  description: "A stable containment field of pure force.",
  type: ItemType.CURRENCY,
  rarity: Rarity.RARE,
  image: null,
  value: 150,
  effects: [{ type: "grant_kc", value: 150 }],
};

// --- CONSUMABLES ---
const POTION_STAMINA: LootItem = {
  id: "potion_stamina_minor",
  name: "Minor Stamina Draught",
  description: "Restores a small amount of vigor.",
  type: ItemType.CONSUMABLE,
  rarity: Rarity.COMMON,
  image: null,
  effects: [{ type: "boost_stat", value: 5 }],
};

const TUME_OF_KNOWLEDGE: LootItem = {
  id: "tome_xp_minor",
  name: "Tome of Discipline",
  description: "Grants 100 XP to your character.",
  type: ItemType.CONSUMABLE,
  rarity: Rarity.UNCOMMON,
  image: null,
  effects: [{ type: "grant_xp", value: 100 }],
};

// --- LOOT TABLES ---

/**
 * Standard Quest Reward Table
 * Rolled upon completing a standard Daily Quest.
 */
export const LT_STANDARD_QUEST: LootTable = {
  id: "lt_standard_quest",
  description: "Rewards for standard daily quests",
  rolls: 1, // 1 Guaranteed roll + chance for extras handled by engine
  items: [
    { item: KC_ORB_SMALL, weight: 60, minQuantity: 1, maxQuantity: 3 },
    { item: KC_ORB_MEDIUM, weight: 30, minQuantity: 1, maxQuantity: 1 },
    { item: POTION_STAMINA, weight: 15, minQuantity: 1, maxQuantity: 1 },
    { item: KC_ORB_LARGE, weight: 5, minQuantity: 1, maxQuantity: 1 },
    { item: TUME_OF_KNOWLEDGE, weight: 2, minQuantity: 1, maxQuantity: 1 },
  ],
};

/**
 * Boss / PR Reward Table
 * Rolled when setting a new PR or completing a Weekly Raid.
 */
export const LT_BOSS_CHEST: LootTable = {
  id: "lt_boss_chest",
  description: "High tier rewards for major achievements",
  rolls: 3,
  items: [
    { item: KC_ORB_MEDIUM, weight: 50, minQuantity: 2, maxQuantity: 5 },
    { item: KC_ORB_LARGE, weight: 30, minQuantity: 1, maxQuantity: 2 },
    { item: TUME_OF_KNOWLEDGE, weight: 20, minQuantity: 1, maxQuantity: 3 },
  ],
};
