import { z } from 'zod';

// Helper for Combat Action Types
export const CombatActionTypeSchema = z.enum(['ATTACK', 'DEFEND', 'HEAL', 'ULTIMATE']);

export const CombatActionSchema = z.object({
    type: CombatActionTypeSchema,
    payload: z.any().optional(), // Payload can be anything for now, usually null
});

// Full Combat State Schema (if we need to validate client state, though server state is authority)
export const CombatStateSchema = z.object({
    playerHp: z.number(),
    playerMaxHp: z.number(),
    bossHp: z.number(),
    bossMaxHp: z.number(),
    turnCount: z.number(),
    logs: z.array(z.string()),
    isVictory: z.boolean(),
    isDefeat: z.boolean(),
});

// Progression Schemas
export const AwardGoldSchema = z.object({
    amount: z.number().int().positive().max(1000000), // Cap at 1M to prevent overflow attacks
});

// Forge Schemas
export const CraftItemSchema = z.object({
    recipeId: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/), // Basic ID validation
});

// Combat Action Schemas
export const StartBossFightSchema = z.object({
    bossId: z.string().min(1).max(100),
    tier: z.enum(['STORY', 'HEROIC', 'TITAN_SLAYER']).default('HEROIC'),
});

export const PerformCombatActionInputSchema = z.object({
    action: CombatActionSchema,
    clientState: CombatStateSchema.optional(),
});

// Hevy Schemas
export const HevyHelperSchema = z.object({
    apiKey: z.string().min(1, "API Key is required"),
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().max(50).default(10),
    count: z.number().int().positive().max(100).default(30),
});

export const HevySetSchema = z.object({
    weight_kg: z.number().nullable().optional(),
    reps: z.number().nullable().optional(),
    index: z.number().optional(),
    type: z.string().optional(),
    rpe: z.number().nullable().optional(),
});

export const HevyExerciseSchema = z.object({
    exercise_template_id: z.string().nullable().optional(),
    title: z.string().optional(),
    sets: z.array(HevySetSchema).optional(),
    notes: z.string().nullable().optional(),
});

export const HevyWorkoutSchema = z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    start_time: z.string(),
    duration_seconds: z.number().optional(),
    exercises: z.array(HevyExerciseSchema),
});

export const ImportHevyHistorySchema = z.object({
    workouts: z.array(HevyWorkoutSchema),
});
