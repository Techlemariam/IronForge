"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";

interface GoldMultiplier {
  source: string;
  value: number;
  expiresAt?: Date;
  isPermanent: boolean;
}

interface GoldMultiplierStatus {
  baseMultiplier: number;
  totalMultiplier: number;
  activeMultipliers: GoldMultiplier[];
  streakBonus: number;
  prestigeBonus: number;
  eventBonus: number;
}

// Streak thresholds for gold bonuses
const STREAK_BONUSES: Array<{ days: number; bonus: number }> = [
  { days: 3, bonus: 5 },
  { days: 7, bonus: 10 },
  { days: 14, bonus: 15 },
  { days: 30, bonus: 25 },
  { days: 60, bonus: 35 },
  { days: 90, bonus: 50 },
  { days: 180, bonus: 75 },
  { days: 365, bonus: 100 },
];

/**
 * Calculate streak gold bonus.
 */
export function calculateStreakBonus(streakDays: number): number {
  let bonus = 0;
  for (const tier of STREAK_BONUSES) {
    if (streakDays >= tier.days) {
      bonus = tier.bonus;
    } else {
      break;
    }
  }
  return bonus;
}

/**
 * Get gold multiplier status.
 */
export const getGoldMultiplierStatusAction = authActionClient
  .action(async ({ ctx: { userId } }): Promise<GoldMultiplierStatus> => {
    const streakDays = 15;
    const prestigeLevel = 2;

    const streakBonus = calculateStreakBonus(streakDays);
    const prestigeBonus = prestigeLevel * 5;
    const eventBonus = 10; // Winter event

    const activeMultipliers: GoldMultiplier[] = [
      {
        source: `${streakDays}-Day Streak`,
        value: streakBonus,
        isPermanent: false,
      },
      {
        source: `Prestige ${prestigeLevel}`,
        value: prestigeBonus,
        isPermanent: true,
      },
      {
        source: "Winter Festival",
        value: eventBonus,
        expiresAt: new Date("2025-01-10"),
        isPermanent: false,
      },
    ];

    const totalBonus = streakBonus + prestigeBonus + eventBonus;

    return {
      baseMultiplier: 100,
      totalMultiplier: 100 + totalBonus,
      activeMultipliers,
      streakBonus,
      prestigeBonus,
      eventBonus,
    };
  });

/**
 * Calculate gold with multipliers.
 */
export const calculateGoldWithMultipliersAction = authActionClient
  .schema(z.object({ baseGold: z.number() }))
  .action(async ({ parsedInput: { baseGold }, ctx: { userId } }) => {
    // We execute the inner function of the client Action directly or call the raw one
    // But since it's wrapped, it returns { data, serverError... } 
    // To support `await getGoldMultiplierStatusAction(...)` from inside here,
    // we would ideally abstract the inner logic, but for now we can invoke the wrapped 
    // function by manually passing context if it was exported, or better - abstract it.
    // However, since GET is deterministic mock data right now, we can inline it or call it securely.

    // Abstracted internal call due to actionClient nesting restrictions
    const status = await getGoldMultiplierStatusInternal(userId);
    const totalGold = Math.floor(baseGold * (status.totalMultiplier / 100));

    return {
      baseGold,
      multiplier: status.totalMultiplier,
      totalGold,
      breakdown: status.activeMultipliers,
    };
  });

// Internal helper to avoid invoking Server Action from Server Action directly (which returns wrappers)
async function getGoldMultiplierStatusInternal(userId: string): Promise<GoldMultiplierStatus> {
  const streakDays = 15;
  const prestigeLevel = 2;

  const streakBonus = calculateStreakBonus(streakDays);
  const prestigeBonus = prestigeLevel * 5;
  const eventBonus = 10;

  const activeMultipliers: GoldMultiplier[] = [
    {
      source: `${streakDays}-Day Streak`,
      value: streakBonus,
      isPermanent: false,
    },
    {
      source: `Prestige ${prestigeLevel}`,
      value: prestigeBonus,
      isPermanent: true,
    },
    {
      source: "Winter Festival",
      value: eventBonus,
      expiresAt: new Date("2025-01-10"),
      isPermanent: false,
    },
  ];

  const totalBonus = streakBonus + prestigeBonus + eventBonus;

  return {
    baseMultiplier: 100,
    totalMultiplier: 100 + totalBonus,
    activeMultipliers,
    streakBonus,
    prestigeBonus,
    eventBonus,
  };
}

/**
 * Get next streak milestone.
 */
export function getNextStreakMilestone(
  currentStreak: number,
): { days: number; bonus: number; daysRemaining: number } | null {
  for (const tier of STREAK_BONUSES) {
    if (currentStreak < tier.days) {
      return {
        ...tier,
        daysRemaining: tier.days - currentStreak,
      };
    }
  }
  return null;
}

/**
 * Apply temporary gold boost.
 */
export const applyGoldBoostAction = authActionClient
  .schema(z.object({ boostPercent: z.number(), durationHours: z.number() }))
  .action(async ({ parsedInput: { boostPercent, durationHours }, ctx: { userId } }) => {
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    console.log(`Applied ${boostPercent}% gold boost for ${durationHours} hours to ${userId}`);
    return { success: true, expiresAt };
  });
