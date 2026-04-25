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
  class: z.enum(['WARRIOR', 'MAGE', 'RANGER', 'TITAN', 'BERSERKER']),
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
      type: z.enum(['BUFF', 'DEBUFF']),
      stat: z.string(),
      value: z.number(),
      expiresAt: z.date().nullable(),
      stacks: z.number().int().min(1),
    })
  ),

  // Sync metadata
  syncMetadata: z.object({
    deviceId: z.string().optional(),
    syncedAt: z.date(),
    conflictResolution: z.enum(['SERVER_WINS', 'CLIENT_WINS', 'MERGE']).optional(),
  }),
});

export type TitanState = z.infer<typeof TitanStateSchema>;

/**
 * Partial update schema for mutations
 */
export const TitanMutationSchema = z.object({
  version: z.number().int().positive(), // Optimistic locking
  changes: z.record(z.string(), z.unknown()),
  source: z.enum(['WORKOUT', 'COMBAT', 'QUEST', 'PURCHASE', 'ADMIN', 'SYNC']),
  timestamp: z.date(),
});

export type TitanMutation = z.infer<typeof TitanMutationSchema>;

/**
 * Schema for starting a boss fight.
 */
export const StartBossFightSchema = z.object({
  bossId: z.string(),
  tier: z.enum(['STORY', 'HEROIC', 'TITAN_SLAYER']),
});

/**
 * Schema for performing a combat action.
 */
export const PerformCombatActionInputSchema = z.object({
  action: z.object({
    type: z.enum(['ATTACK', 'DEFEND', 'HEAL', 'ULTIMATE']),
    payload: z.any().optional(),
  }),
  clientState: z.any().optional(),
});

/**
 * Schema for awarding gold to a user.
 */
export const AwardGoldSchema = z.object({
  amount: z.number().nonnegative().max(1000000),
});

/**
 * Helper schema for Hevy API interactions.
 */
export const HevyHelperSchema = z.object({
  apiKey: z.string().min(1, 'Hevy API Key is required.'),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  count: z.number().int().positive().optional(),
});

/**
 * Hevy Integration Schemas
 */
export const HevySetSchema = z.object({
  weight_kg: z.number(),
  reps: z.number(),
  index: z.number().int().optional(),
  type: z.string().optional(),
});

export const HevyExerciseTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  primary_muscle_group: z.string().optional(),
});

export const HevyExerciseSchema = z.object({
  exercise_template_id: z.string(),
  exercise_template: HevyExerciseTemplateSchema,
  sets: z.array(HevySetSchema),
  notes: z.string().optional(),
});

export const HevyRoutineSchema = z.object({
  id: z.string(),
  title: z.string(),
  folder_id: z.number().int().nullable().optional(),
  updated_at: z.string().optional(),
  created_at: z.string().optional(),
  notes: z.string().optional(),
  exercises: z.array(HevyExerciseSchema).optional(),
});

export const HevyWorkoutSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date().optional(),
  duration_seconds: z.number().optional(),
  exercises: z.array(HevyExerciseSchema),
});

export type HevyWorkout = z.infer<typeof HevyWorkoutSchema>;
export type HevyRoutine = z.infer<typeof HevyRoutineSchema>;

/**
 * Strava Integration Schemas
 */
export const StravaTokenResponseSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  expires_at: z.number(),
  expires_in: z.number(),
  refresh_token: z.string(),
  athlete: z.object({
    id: z.number(),
    username: z.string().nullable().optional(),
    firstname: z.string().nullable().optional(),
    lastname: z.string().nullable().optional(),
  }),
});

export const StravaActivitySchema = z.object({
  id: z.number(),
  name: z.string(),
  distance: z.number(),
  moving_time: z.number(),
  elapsed_time: z.number(),
  total_elevation_gain: z.number(),
  type: z.string(),
  start_date: z.string(),
  average_speed: z.number(),
  max_speed: z.number(),
  average_heartrate: z.number().optional(),
  max_heartrate: z.number().optional(),
  suffer_score: z.number().optional(),
});

export const StravaUploadResponseSchema = z.object({
  id: z.number(),
  id_str: z.string(),
  external_id: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  status: z.string(),
  activity_id: z.number().nullable().optional(),
});

export type StravaActivity = z.infer<typeof StravaActivitySchema>;
export type StravaTokenResponse = z.infer<typeof StravaTokenResponseSchema>;
export type StravaUploadResponse = z.infer<typeof StravaUploadResponseSchema>;

/**
 * Schema for importing Hevy workout history.
 */
export const ImportHevyHistorySchema = z.object({
  workouts: z.array(HevyWorkoutSchema),
});

/**
 * Schema for crafting an item.
 */
export const CraftItemSchema = z.object({
  recipeId: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid recipe format'),
});

/**
 * Safe User Schema (Excludes sensitive API keys and tokens)
 */
export const SafeUserSchema = z
  .object({
    id: z.string(),
    heroName: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    gold: z.number().int(),
    level: z.number().int(),
    totalExperience: z.number().int(),
    kineticEnergy: z.number().int(),
    bodyWeight: z.number(),
    prioritizeHyperPro: z.boolean(),
    activePath: z.string().nullable().optional(),
    archetype: z.string().optional(),
    faction: z.string().optional(),
    lastLoginDate: z.union([z.date(), z.string()]).nullable().optional(),
    loginStreak: z.number().int().optional(),
    // Add other non-sensitive fields as needed
  })
  .passthrough();

export type SafeUser = z.infer<typeof SafeUserSchema>;
