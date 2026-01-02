export type ItemType = "material" | "consumable" | "equipment" | "currency";
export type ItemRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic";

export interface GameItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  effect?: string; // e.g. "+10% XP", "Restores 50 HP"
  value: number; // Gold value
  image: string; // Emoji or URL
  stackable: boolean;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  resultItemId: string;
  resultCount: number;
  materials: { itemId: string; count: number }[];
  goldCost: number;
  requiredLevel?: number;
  craftingTimeSeconds?: number;
}

export interface InventorySlot {
  itemId: string;
  count: number;
}

export interface UserInventory {
  userId: string;
  gold: number;
  items: InventorySlot[];
}

// ============================================================================
// Player Context System (Unified Modifier Hub)
// ============================================================================

import { Archetype } from "@prisma/client";

// Player Identity
export interface PlayerIdentity {
  userId: string;
  archetype: Archetype;
  archetypeName: string; // "Iron Juggernaut", "The Pathfinder", etc.
  level: number;
  titanName: string;
}

/**
 * All multipliers are expressed as decimals.
 * 1.0 = no change, 1.5 = +50%, 0.8 = -20%
 */
export interface PlayerModifiers {
  // XP & Rewards
  xpGain: number;           // Global XP multiplier
  strengthXp: number;       // Strength-specific XP
  cardioXp: number;         // Cardio-specific XP
  goldGain: number;         // Gold multiplier
  lootLuck: number;         // Drop rate modifier

  // Training
  titanLoad: number;        // Titan Load calculation modifier
  mrvScale: number;         // Maximum Recoverable Volume modifier
  recoverySpeed: number;    // TSB / Body Battery recovery modifier

  // Combat
  attackPower: number;      // Boss damage multiplier
  defense: number;          // Damage reduction
  critChance: number;       // Critical hit chance (0-1)
  stamina: number;          // Combat stamina / endurance
}

export const DEFAULT_MODIFIERS: PlayerModifiers = {
  xpGain: 1.0,
  strengthXp: 1.0,
  cardioXp: 1.0,
  goldGain: 1.0,
  lootLuck: 1.0,
  titanLoad: 1.0,
  mrvScale: 1.0,
  recoverySpeed: 1.0,
  attackPower: 1.0,
  defense: 1.0,
  critChance: 0.05, // 5% base crit
  stamina: 1.0,
};

export type BuffSource = "ARCHETYPE" | "SKILL" | "ORACLE" | "EQUIPMENT" | "TERRITORY" | "PVP";

export interface ActiveBuff {
  id: string;
  source: BuffSource;
  name: string;
  description: string;
  icon?: string;
  expiresAt?: Date;
  /** Which modifiers this buff affects */
  modifiers: Partial<PlayerModifiers>;
}

export interface CombatStats {
  /** Effective attack power after all modifiers */
  effectiveAttack: number;
  /** Effective defense after all modifiers */
  effectiveDefense: number;
  /** Damage per volume unit (DPV) */
  damagePerVolume: number;
  /** Critical hit multiplier */
  critMultiplier: number;
}

export interface PlayerContext {
  identity: PlayerIdentity;
  modifiers: PlayerModifiers;
  activeBuffs: ActiveBuff[];
  combat: CombatStats;

  /** Raw data for debugging/display */
  raw: {
    unlockedSkillIds: string[];
    equippedItemIds: string[];
    oracleDecreeType?: "BUFF" | "DEBUFF" | "NEUTRAL";
  };
}

