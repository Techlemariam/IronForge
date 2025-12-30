"use server";

import { revalidatePath } from "next/cache";

type EnchantType = "FIRE" | "ICE" | "LIGHTNING" | "HOLY" | "SHADOW" | "NATURE";
type EnchantRarity = "MINOR" | "MAJOR" | "SUPERIOR" | "LEGENDARY";

interface Enchantment {
  id: string;
  type: EnchantType;
  rarity: EnchantRarity;
  name: string;
  description: string;
  stats: Record<string, number>;
  conflictsWith?: EnchantType[];
}

interface EnchantableItem {
  id: string;
  name: string;
  maxEnchantSlots: number;
  currentEnchants: Enchantment[];
  canBeEnchanted: boolean;
}

interface EnchantResult {
  success: boolean;
  item: EnchantableItem;
  newEnchant?: Enchantment;
  message: string;
}

// Enchantment pool
const ENCHANTMENTS: Enchantment[] = [
  // Fire
  {
    id: "fire-minor",
    type: "FIRE",
    rarity: "MINOR",
    name: "Ember Touch",
    description: "+5% fire damage",
    stats: { fireDamage: 5 },
  },
  {
    id: "fire-major",
    type: "FIRE",
    rarity: "MAJOR",
    name: "Flame Burst",
    description: "+15% fire damage, +5% crit",
    stats: { fireDamage: 15, critChance: 5 },
  },
  {
    id: "fire-superior",
    type: "FIRE",
    rarity: "SUPERIOR",
    name: "Inferno",
    description: "+30% fire damage, burn on hit",
    stats: { fireDamage: 30, burnChance: 20 },
    conflictsWith: ["ICE"],
  },

  // Ice
  {
    id: "ice-minor",
    type: "ICE",
    rarity: "MINOR",
    name: "Frost Touch",
    description: "+5% ice damage",
    stats: { iceDamage: 5 },
  },
  {
    id: "ice-major",
    type: "ICE",
    rarity: "MAJOR",
    name: "Frozen Edge",
    description: "+15% ice damage, slow on hit",
    stats: { iceDamage: 15, slowChance: 10 },
  },

  // Lightning
  {
    id: "lightning-minor",
    type: "LIGHTNING",
    rarity: "MINOR",
    name: "Spark",
    description: "+5% lightning damage",
    stats: { lightningDamage: 5 },
  },
  {
    id: "lightning-superior",
    type: "LIGHTNING",
    rarity: "SUPERIOR",
    name: "Thunderstrike",
    description: "+25% lightning, chain damage",
    stats: { lightningDamage: 25, chainDamage: 15 },
  },

  // Holy
  {
    id: "holy-major",
    type: "HOLY",
    rarity: "MAJOR",
    name: "Sacred Blessing",
    description: "+10% HP, +10% healing",
    stats: { maxHp: 10, healingBonus: 10 },
    conflictsWith: ["SHADOW"],
  },

  // Shadow
  {
    id: "shadow-major",
    type: "SHADOW",
    rarity: "MAJOR",
    name: "Dark Embrace",
    description: "+20% crit damage, lifesteal",
    stats: { critDamage: 20, lifesteal: 5 },
    conflictsWith: ["HOLY"],
  },

  // Nature
  {
    id: "nature-minor",
    type: "NATURE",
    rarity: "MINOR",
    name: "Natural Recovery",
    description: "+5 HP regen",
    stats: { hpRegen: 5 },
  },
];

/**
 * Get available enchantments.
 */
export async function getAvailableEnchantmentsAction(
  itemId: string,
): Promise<Enchantment[]> {
  return ENCHANTMENTS;
}

/**
 * Enchant an item.
 */
export async function enchantItemAction(
  userId: string,
  itemId: string,
  enchantId: string,
): Promise<EnchantResult> {
  try {
    const enchant = ENCHANTMENTS.find((e) => e.id === enchantId);
    if (!enchant) {
      return {
        success: false,
        item: {
          id: itemId,
          name: "",
          maxEnchantSlots: 0,
          currentEnchants: [],
          canBeEnchanted: false,
        },
        message: "Enchantment not found",
      };
    }

    console.log(`Enchanted item ${itemId} with ${enchant.name}`);
    revalidatePath("/inventory");

    return {
      success: true,
      item: {
        id: itemId,
        name: "Iron Sword",
        maxEnchantSlots: 2,
        currentEnchants: [enchant],
        canBeEnchanted: true,
      },
      newEnchant: enchant,
      message: `Successfully applied ${enchant.name}!`,
    };
  } catch (error) {
    console.error("Error enchanting item:", error);
    return {
      success: false,
      item: {
        id: itemId,
        name: "",
        maxEnchantSlots: 0,
        currentEnchants: [],
        canBeEnchanted: false,
      },
      message: "Enchanting failed",
    };
  }
}

/**
 * Remove enchantment from item.
 */
export async function removeEnchantmentAction(
  userId: string,
  itemId: string,
  enchantSlot: number,
): Promise<{ success: boolean; message: string }> {
  console.log(`Removed enchantment from slot ${enchantSlot} of item ${itemId}`);
  revalidatePath("/inventory");
  return { success: true, message: "Enchantment removed" };
}

/**
 * Get enchanting cost.
 */
export function getEnchantingCost(enchant: Enchantment): {
  gold: number;
  materials: Array<{ name: string; amount: number }>;
} {
  const baseCost = {
    MINOR: { gold: 100, materials: [{ name: "Magic Dust", amount: 1 }] },
    MAJOR: {
      gold: 500,
      materials: [
        { name: "Magic Dust", amount: 5 },
        { name: "Enchanting Stone", amount: 1 },
      ],
    },
    SUPERIOR: {
      gold: 2000,
      materials: [
        { name: "Magic Dust", amount: 10 },
        { name: "Enchanting Stone", amount: 3 },
      ],
    },
    LEGENDARY: {
      gold: 10000,
      materials: [
        { name: "Magic Dust", amount: 25 },
        { name: "Legendary Essence", amount: 1 },
      ],
    },
  };

  return baseCost[enchant.rarity];
}
