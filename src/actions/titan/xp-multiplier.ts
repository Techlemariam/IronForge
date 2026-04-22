'use server';

import { checkOvertrainingStatusAction } from '@/actions/training/overtraining';
import { getStreakStatusAction } from '@/actions/user/streak';
import { prisma } from '@/lib/prisma';

interface XpMultiplierResult {
  baseMultiplier: number;
  streakBonus: number;
  wellnessBonus: number;
  overtrainingPenalty: number;
  finalMultiplier: number;
  breakdown: string[];
}

/**
 * Calculates XP multiplier based on various factors:
 * - Streak bonuses (consistency rewards)
 * - Wellness bonuses (good sleep/recovery)
 * - Overtraining penalties (fatigue protection)
 */
export async function calculateXpMultiplierAction(
  userId: string,
  wellnessScore?: number,
  sleepScore?: number
): Promise<XpMultiplierResult> {
  try {
    const [overtraining, streak] = await Promise.all([
      checkOvertrainingStatusAction(userId),
      getStreakStatusAction(userId),
    ]);

    const baseMultiplier = 1.0;
    let streakBonus = 0;
    let wellnessBonus = 0;
    let overtrainingPenalty = 0;
    const breakdown: string[] = [];

    // Streak bonuses
    const currentStreak = streak.currentStreak || 0;
    if (currentStreak >= 100) {
      streakBonus = 0.5; // +50%
      breakdown.push('🔥 Legendary Streak (100+ days): +50%');
    } else if (currentStreak >= 30) {
      streakBonus = 0.3; // +30%
      breakdown.push('⚡ Epic Streak (30+ days): +30%');
    } else if (currentStreak >= 7) {
      streakBonus = 0.15; // +15%
      breakdown.push('💪 Weekly Streak (7+ days): +15%');
    } else if (currentStreak >= 3) {
      streakBonus = 0.05; // +5%
      breakdown.push('🌱 Starting Streak (3+ days): +5%');
    }

    // Wellness bonuses (if data available)
    if (sleepScore !== undefined && sleepScore >= 85) {
      wellnessBonus += 0.1; // +10%
      breakdown.push('😴 Excellent Sleep: +10%');
    }
    if (wellnessScore !== undefined && wellnessScore >= 85) {
      wellnessBonus += 0.1; // +10%
      breakdown.push('💚 Peak Wellness: +10%');
    }

    // Overtraining penalties
    if (overtraining.isCapped) {
      overtrainingPenalty = 1.0; // Completely capped
      breakdown.push('🛑 Daily XP Cap Reached: 0% XP');
    } else if (overtraining.isFatigued) {
      overtrainingPenalty = 0.5; // -50%
      breakdown.push('😓 Fatigue Detected: -50%');
    } else if (overtraining.xpMultiplier < 1.0) {
      overtrainingPenalty = 1.0 - overtraining.xpMultiplier;
      breakdown.push(`⚠️ Recovery Warning: -${Math.round(overtrainingPenalty * 100)}%`);
    }

    // Calculate final multiplier
    let finalMultiplier = baseMultiplier + streakBonus + wellnessBonus;

    if (overtraining.isCapped) {
      finalMultiplier = 0;
    } else {
      finalMultiplier = finalMultiplier * (1 - overtrainingPenalty);
    }

    // Clamp to reasonable range
    finalMultiplier = Math.max(0, Math.min(3.0, finalMultiplier));

    if (breakdown.length === 0) {
      breakdown.push('⚖️ Base Rate: 1.0x');
    }

    return {
      baseMultiplier,
      streakBonus,
      wellnessBonus,
      overtrainingPenalty,
      finalMultiplier: Math.round(finalMultiplier * 100) / 100,
      breakdown,
    };
  } catch (error) {
    console.error('Error calculating XP multiplier:', error);
    return {
      baseMultiplier: 1.0,
      streakBonus: 0,
      wellnessBonus: 0,
      overtrainingPenalty: 0,
      finalMultiplier: 1.0,
      breakdown: ['⚖️ Base Rate: 1.0x'],
    };
  }
}

/**
 * Awards XP with all multipliers applied.
 */
export async function awardXpWithMultiplierAction(
  userId: string,
  baseXp: number,
  _source: string,
  wellnessScore?: number,
  sleepScore?: number
): Promise<{ finalXp: number; multiplier: number; breakdown: string[] }> {
  const result = await calculateXpMultiplierAction(userId, wellnessScore, sleepScore);
  const finalXp = Math.round(baseXp * result.finalMultiplier);

  if (finalXp > 0) {
    await prisma.titan.updateMany({
      where: { userId },
      data: { xp: { increment: finalXp } },
    });
  }

  return {
    finalXp,
    multiplier: result.finalMultiplier,
    breakdown: result.breakdown,
  };
}
