"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ============================================
// UNIFIED TITAN SOUL - STATE SCHEMA
// Authoritative server-side Titan state management
// ============================================

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
 * Get authoritative Titan state from server.
 */
export async function getAuthoritativeTitanState(
  userId: string,
): Promise<TitanState | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { titan: true },
  });

  if (!user || !user.titan) return null;

  const titan = user.titan;

  return {
    id: titan.id,
    userId: user.id,
    version: 1,
    lastModified: new Date(),
    name: titan.name,
    class: "TITAN" as TitanState["class"], // Default class since Titan model has no class field
    level: user.level,
    prestige: 0,
    stats: {
      strength: titan.strength,
      vitality: titan.vitality,
      endurance: titan.endurance,
      agility: titan.agility,
      willpower: titan.willpower,
      intelligence: 10,
    },
    resources: {
      hp: titan.currentHp,
      maxHp: titan.maxHp,
      energy: titan.currentEnergy,
      maxEnergy: 100,
      xp: user.totalExperience,
      xpToNext: user.level * 1000,
    },
    economy: {
      gold: user.gold,
      gems: 0,
      materials: {},
    },
    progress: {
      totalWorkouts: 0,
      totalVolume: 0,
      totalPRs: 0,
      currentStreak: titan.streak,
      longestStreak: titan.streak,
      dungeonFloor: 0,
    },
    equipment: {
      weapon: null,
      armor: null,
      accessory1: null,
      accessory2: null,
    },
    statusEffects: [],
    syncMetadata: {
      syncedAt: new Date(),
    },
  };
}
