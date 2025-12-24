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
});

export const PerformCombatActionInputSchema = z.object({
    action: CombatActionSchema,
    clientState: CombatStateSchema.optional(),
});
