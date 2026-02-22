import { z } from 'zod';

/**
 * Represents the health and status of a single factory station.
 */
export const FactoryStatusSchema = z.object({
  id: z.string(),
  station: z.string(),
  health: z.number().min(0).max(100),
  current: z.string().nullable(),
  updatedAt: z.date(),
  metadata: z.any().optional(),
});

export type FactoryStatusData = z.infer<typeof FactoryStatusSchema>;

/**
 * Core Titan State Schema (Zod validation)
 */
export const TitanStateSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  version: z.number().int().positive(),
  lastModified: z.date(),

  // Identity
  name: z.string().min(1).max(50),
  class: z.enum(["WARRIOR", "MAGE", "RANGER", "TITAN", "BERSERKER"]),
  level: z.number().int().min(1).max(999),
  prestige: z.number().int().min(0).max(100),

  // Core Stats
  stats: z.object({
    strength: z.number().int().min(1),
    vitality: z.number().int().min(1),
    endurance: z.number().int().min(1),
    agility: z.number().int().min(1),
    willpower: z.number().int().min(1),
    intelligence: z.number().int().min(1),
  }),

  // Resources
  resources: z.object({
    hp: z.number().int().min(0),
    maxHp: z.number().int().min(1),
    energy: z.number().int().min(0),
    maxEnergy: z.number().int().min(1),
    xp: z.number().int().min(0),
    xpToNext: z.number().int().min(1),
  }),

  // Economy
  economy: z.object({
    gold: z.number().int().min(0),
    gems: z.number().int().min(0),
    materials: z.record(z.string(), z.number().int().min(0)),
  }),

  // Progress
  progress: z.object({
    totalWorkouts: z.number().int().min(0),
    totalVolume: z.number().min(0),
    totalPRs: z.number().int().min(0),
    currentStreak: z.number().int().min(0),
    longestStreak: z.number().int().min(0),
    dungeonFloor: z.number().int().min(0),
  }),

  // Equipped Items
  equipment: z.object({
    weapon: z.string().nullable(),
    armor: z.string().nullable(),
    accessory1: z.string().nullable(),
    accessory2: z.string().nullable(),
  }),

  // Buffs/Debuffs
  statusEffects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["BUFF", "DEBUFF"]),
      stat: z.string(),
      value: z.number(),
      expiresAt: z.date().nullable(),
      stacks: z.number().int().min(1),
    }),
  ),

  // Sync metadata
  syncMetadata: z.object({
    deviceId: z.string().optional(),
    syncedAt: z.date(),
    conflictResolution: z
      .enum(["SERVER_WINS", "CLIENT_WINS", "MERGE"])
      .optional(),
  }),
});

export type TitanState = z.infer<typeof TitanStateSchema>;

/**
 * Partial update schema for mutations
 */
export const TitanMutationSchema = z.object({
  version: z.number().int().positive(), // Optimistic locking
  changes: z.record(z.string(), z.unknown()),
  source: z.enum(["WORKOUT", "COMBAT", "QUEST", "PURCHASE", "ADMIN", "SYNC"]),
  timestamp: z.date(),
});

export type TitanMutation = z.infer<typeof TitanMutationSchema>;

/**
 * Schema for starting a boss fight.
 */
export const StartBossFightSchema = z.object({
  bossId: z.string(),
  tier: z.enum(["STORY", "HEROIC", "TITAN_SLAYER"]),
});

/**
 * Schema for performing a combat action.
 */
export const PerformCombatActionInputSchema = z.object({
  action: z.any(),
  clientState: z.any().optional(),
});

/**
 * Schema for awarding gold to a user.
 */
export const AwardGoldSchema = z.object({
  amount: z.number().nonnegative()
});

/**
 * Helper schema for Hevy API interactions.
 */
export const HevyHelperSchema = z.object({
  apiKey: z.string().min(1, "Hevy API Key is required."),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  count: z.number().int().positive().optional(),
});

/**
 * Schema for importing Hevy workout history.
 */
export const ImportHevyHistorySchema = z.object({
  workouts: z.array(z.any()),
});

/**
 * Schema for crafting an item.
 */
export const CraftItemSchema = z.object({
  recipeId: z.string().min(1),
});

