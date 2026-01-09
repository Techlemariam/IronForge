"use server";

import { z } from "zod";

// ============================================
// UNIFIED TITAN SOUL - STATE VALIDATION
// Comprehensive Zod schemas for all mutations
// ============================================

// ===== Core Validation Schemas =====

export const UserIdSchema = z.string().uuid().or(z.string().startsWith("cm"));

export const PositiveIntSchema = z.number().int().positive();
export const NonNegativeIntSchema = z.number().int().nonnegative();
export const PercentSchema = z.number().min(0).max(100);

// ===== Titan Identity Validation =====

export const TitanNameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(30, "Name must be at most 30 characters")
  .regex(
    /^[a-zA-Z0-9\s-_]+$/,
    "Name can only contain letters, numbers, spaces, hyphens, and underscores",
  );

export const TitanClassSchema = z.enum([
  "WARRIOR",
  "MAGE",
  "RANGER",
  "TITAN",
  "BERSERKER",
]);

// ===== Stats Validation =====

export const StatValueSchema = z.number().int().min(1).max(9999);

export const StatsChangeSchema = z
  .object({
    strength: z.number().int().optional(),
    vitality: z.number().int().optional(),
    endurance: z.number().int().optional(),
    agility: z.number().int().optional(),
    willpower: z.number().int().optional(),
    intelligence: z.number().int().optional(),
  })
  .refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    "At least one stat change must be provided",
  );

// ===== Resource Validation =====

export const ResourceChangeSchema = z
  .object({
    hp: z.number().int().optional(),
    energy: z.number().int().optional(),
    maxHp: PositiveIntSchema.optional(),
    maxEnergy: PositiveIntSchema.optional(),
  })
  .refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    "At least one resource change must be provided",
  );

// ===== Economy Validation =====

export const GoldChangeSchema = z.number().int();
export const GemsChangeSchema = z.number().int();

export const EconomyChangeSchema = z
  .object({
    gold: z.number().int().optional(),
    gems: z.number().int().optional(),
  })
  .refine(
    (data) => data.gold !== undefined || data.gems !== undefined,
    "At least one economy change must be provided",
  );

// ===== XP Validation =====

export const XpGainSchema = z.object({
  amount: z.number().int().positive().max(100000),
  source: z.enum([
    "WORKOUT",
    "QUEST",
    "COMBAT",
    "ACHIEVEMENT",
    "BONUS",
    "DAILY",
    "EVENT",
  ]),
  multiplier: z.number().positive().max(10).optional(),
});

// ===== Combat Validation =====

export const CombatActionSchema = z.object({
  action: z.enum(["ATTACK", "DEFEND", "HEAL", "SKILL", "FLEE"]),
  targetId: z.string().optional(),
  skillId: z.string().optional(),
  itemId: z.string().optional(),
});

export const DamageSchema = z.object({
  amount: PositiveIntSchema,
  type: z.enum(["PHYSICAL", "MAGICAL", "TRUE", "ELEMENTAL"]),
  source: z.string(),
  isCritical: z.boolean().optional(),
});

// ===== Item Validation =====

export const EquipItemSchema = z.object({
  itemId: z.string(),
  slot: z.enum(["weapon", "armor", "accessory1", "accessory2"]),
});

// ===== Buff/Debuff Validation =====

export const StatusEffectSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["BUFF", "DEBUFF"]),
  stat: z.string(),
  value: z.number(),
  duration: z.number().int().positive().optional(),
  stacks: z.number().int().min(1).max(99).optional(),
});

// ===== Mutation Request Validation =====

export const MutationSourceSchema = z.enum([
  "WORKOUT",
  "COMBAT",
  "QUEST",
  "PURCHASE",
  "CRAFT",
  "SYNC",
  "ADMIN",
  "SYSTEM",
  "EVENT",
]);

export const MutationRequestSchema = z.object({
  userId: UserIdSchema,
  source: MutationSourceSchema,
  timestamp: z.date().or(z.string().datetime()),
  deviceId: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

// ===== Sync Validation =====

export const SyncRequestSchema = z.object({
  userId: UserIdSchema,
  deviceId: z.string(),
  clientVersion: PositiveIntSchema,
  lastSyncedAt: z.union([z.date(), z.string().datetime({})]),
  changes: z.record(z.string(), z.unknown()).optional(),
});

// ===== Validation Helpers =====

export function validateMutation<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { valid: true; data: T } | { valid: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { valid: true, data: result.data };
  }

  return {
    valid: false,
    errors: result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
  };
}

export function validateXpGain(data: unknown) {
  return validateMutation(XpGainSchema, data);
}

export function validateStatsChange(data: unknown) {
  return validateMutation(StatsChangeSchema, data);
}

export function validateResourceChange(data: unknown) {
  return validateMutation(ResourceChangeSchema, data);
}

export function validateEconomyChange(data: unknown) {
  return validateMutation(EconomyChangeSchema, data);
}

export function validateCombatAction(data: unknown) {
  return validateMutation(CombatActionSchema, data);
}

export function validateSyncRequest(data: unknown) {
  return validateMutation(SyncRequestSchema, data);
}

// ===== Rate Limiting Schemas =====

export const RateLimitConfigSchema = z.object({
  maxRequests: PositiveIntSchema,
  windowMs: PositiveIntSchema,
  blockDurationMs: PositiveIntSchema.optional(),
});

// ===== Export All =====

export const Schemas = {
  UserId: UserIdSchema,
  TitanName: TitanNameSchema,
  TitanClass: TitanClassSchema,
  StatsChange: StatsChangeSchema,
  ResourceChange: ResourceChangeSchema,
  EconomyChange: EconomyChangeSchema,
  XpGain: XpGainSchema,
  CombatAction: CombatActionSchema,
  EquipItem: EquipItemSchema,
  StatusEffect: StatusEffectSchema,
  MutationRequest: MutationRequestSchema,
  SyncRequest: SyncRequestSchema,
};
