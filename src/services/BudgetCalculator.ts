/**
 * BudgetCalculator
 * 
 * Applies bio-modifiers from Intervals.icu wellness data to Daily Resource Budgets.
 * Integrates with the Goal-Priority Engine for maximum physiological fidelity.
 */

import { DailyResourceBudget, SystemMetrics } from '@/types/goals';
import { WellnessData } from '@/lib/intervals';

// Default budget values
const DEFAULT_BUDGET: DailyResourceBudget = {
    cns: 100,
    muscular: 100,
    metabolic: 100,
};

/**
 * Calculates the daily resource budget based on wellness data.
 * Uses Phase 2 Maximum Data Utilization fields.
 */
export function calculateDailyBudget(
    wellness: WellnessData | null,
    baseMetrics?: Partial<SystemMetrics>
): DailyResourceBudget {
    if (!wellness) {
        return DEFAULT_BUDGET;
    }

    let cns = 100;
    let muscular = 100;
    let metabolic = 100;

    // === RECOVERY MODIFIERS ===

    // Sleep Debt: Poor sleep reduces all budgets
    if (wellness.sleepScore !== null && wellness.sleepScore !== undefined) {
        if (wellness.sleepScore < 50) {
            cns *= 0.7;
            muscular *= 0.8;
            metabolic *= 0.85;
        } else if (wellness.sleepScore < 70) {
            cns *= 0.85;
            muscular *= 0.9;
        }
    }

    // Hydration: Dehydration hits metabolic hardest
    if (wellness.hydration !== null && wellness.hydration !== undefined) {
        if (wellness.hydration < 40) {
            metabolic *= 0.7;
            muscular *= 0.85;
        } else if (wellness.hydration < 60) {
            metabolic *= 0.85;
        }
    }

    // Resting HR: Elevated resting HR = overreaching
    if (wellness.restingHR !== null && wellness.restingHR !== undefined) {
        const baselineRHR = baseMetrics?.hrvBaseline ? 60 : 60; // TODO: Use actual baseline
        if (wellness.restingHR > baselineRHR * 1.15) {
            cns *= 0.8;
            muscular *= 0.85;
        }
    }

    // === STRESS MODIFIERS ===

    // Life Stress: High stress = reduced CNS capacity
    if (wellness.stress !== null && wellness.stress !== undefined) {
        if (wellness.stress > 7) {
            cns *= 0.7;
        } else if (wellness.stress > 5) {
            cns *= 0.85;
        }
    }

    // Mood: Low mood reduces all budgets
    if (wellness.mood !== null && wellness.mood !== undefined) {
        if (wellness.mood < -3) {
            cns *= 0.75;
            muscular *= 0.85;
            metabolic *= 0.85;
        } else if (wellness.mood < 0) {
            cns *= 0.9;
        }
    }

    // Fatigue: Systemic fatigue reduces everything
    if (wellness.fatigue !== null && wellness.fatigue !== undefined) {
        if (wellness.fatigue > 80) {
            cns *= 0.6;
            muscular *= 0.7;
            metabolic *= 0.7;
        } else if (wellness.fatigue > 60) {
            cns *= 0.8;
            muscular *= 0.85;
        }
    }

    // === MENSTRUAL CYCLE MODIFIERS ===

    // Cycle-Synced Volume: Reduce volume in luteal phase
    if (wellness.menstrualPhase) {
        const phase = wellness.menstrualPhase.toUpperCase();
        if (phase === 'LUTEAL' || phase === 'LATE_LUTEAL') {
            // Luteal phase: Reduce high-intensity capacity
            cns *= 0.85;
            metabolic *= 0.9;
        } else if (phase === 'MENSTRUATION') {
            // Menstruation: Focus on recovery
            cns *= 0.75;
            muscular *= 0.8;
        }
        // Follicular phase: No modifier (optimal training window)
    }

    // === SAFETY HARD LOCKS ===

    // Injury: Hard lock - force rest
    if (wellness.injury && wellness.injury.trim().length > 0) {
        muscular *= 0.3; // Severe muscular reduction
        cns *= 0.5;      // Allow light recovery work only
    }

    // Soreness: High soreness = muscular cap
    if (wellness.soreness !== null && wellness.soreness !== undefined) {
        if (wellness.soreness >= 8) {
            muscular *= 0.4; // Force recovery
        } else if (wellness.soreness >= 6) {
            muscular *= 0.7;
        } else if (wellness.soreness >= 4) {
            muscular *= 0.85;
        }
    }

    // === ACTIVE RECOVERY CHECK ===

    // Steps: Low step count = sedentary (slight CNS boost for active day)
    if (wellness.steps !== null && wellness.steps !== undefined) {
        if (wellness.steps > 10000) {
            cns *= 1.05; // Light boost for active baseline
        } else if (wellness.steps < 2000) {
            metabolic *= 0.95; // Slightly reduced metabolic efficiency
        }
    }

    // === HRV CRASH ===

    // HRV below baseline = reduced capacity
    if (wellness.hrv !== null && wellness.hrv !== undefined) {
        const baseline = baseMetrics?.hrvBaseline || 50;
        if (wellness.hrv < baseline * 0.75) {
            cns *= 0.6;
            muscular *= 0.7;
            metabolic *= 0.8;
        } else if (wellness.hrv < baseline * 0.9) {
            cns *= 0.85;
        }
    }

    // === TSB (FORM) CHECK ===

    // Deep fatigue = reduced capacity
    if (wellness.tsb !== null && wellness.tsb !== undefined) {
        if (wellness.tsb < -40) {
            cns *= 0.5;
            muscular *= 0.6;
            metabolic *= 0.6;
        } else if (wellness.tsb < -20) {
            cns *= 0.75;
            muscular *= 0.8;
        }
    }

    return {
        cns: Math.round(Math.max(10, cns)),       // Floor at 10 (never zero)
        muscular: Math.round(Math.max(10, muscular)),
        metabolic: Math.round(Math.max(10, metabolic)),
    };
}

/**
 * Maps WellnessData to SystemMetrics for use in GoalPriorityEngine.
 */
export function wellnessToSystemMetrics(
    wellness: WellnessData | null,
    additionalMetrics?: Partial<SystemMetrics>
): SystemMetrics {
    return {
        hrv: wellness?.hrv ?? 0,
        hrvBaseline: additionalMetrics?.hrvBaseline ?? 50,
        tsb: wellness?.tsb ?? 0,
        atl: wellness?.atl ?? 0,
        ctl: wellness?.ctl ?? 0,
        acwr: wellness?.atl && wellness?.ctl && wellness.ctl > 0
            ? wellness.atl / wellness.ctl
            : 1.0,
        sleepScore: wellness?.sleepScore ?? 80,
        soreness: wellness?.soreness ?? 0,
        mood: wellness?.mood !== null && wellness?.mood !== undefined
            ? (wellness.mood < -3 ? 'EXHAUSTED' : wellness.mood < 0 ? 'TIRED' : 'NORMAL')
            : 'NORMAL',
        consecutiveStalls: additionalMetrics?.consecutiveStalls ?? 0,
    };
}
