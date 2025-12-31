
import { MacroCycle, SystemMetrics, BuildVolumeTargets, TrainingPath, NutritionMode } from "@/types/training";
import { BUILD_VOLUME_TARGETS_ALPHA, BUILD_VOLUME_TARGETS_BETA } from "@/data/builds";

/**
 * The Auto-Spec Engine
 * 
 * Logic to transition user between Macro-Cycles (Alpha/Beta/Gamma)
 * based on physiological data with "Bio-Safeguards".
 */
export class AutoSpecEngine {

    /**
     * Evaluates if a transition is needed based on current metrics.
     * Uses "Hysteresis" to prevent flip-flopping (requires 3 consecutive stalls).
     */
    static evaluateTransition(currentPhase: MacroCycle, metrics: SystemMetrics): MacroCycle {
        console.log(`AutoSpec: Evaluating transition from ${currentPhase}`, metrics);

        // 1. Parenting / Safety Fail-safe
        if (metrics.hrv < 40 || metrics.tsb < -40) {
            console.warn("AutoSpec: CRITICAL STRESS. FORCE DELOAD.");
            return "GAMMA";
        }

        // Legacy Safety Checks (from conversation)
        if (metrics.sleepScore < 30) return "GAMMA"; // Extreme sleep deprivation

        // 2. GAMMA Exit
        if (currentPhase === "GAMMA") {
            if (metrics.tsb > 0) return "ALPHA";
        }

        // 3. ALPHA -> BETA (Fitness Peak)
        if (currentPhase === "ALPHA") {
            // Must be in phase for at least 4 weeks to allow adaptation
            if (metrics.weeksInPhase >= 4 && metrics.ctl > 80 && metrics.tsb > -10) {
                return "BETA";
            }
        }

        // 4. BETA -> ALPHA (Strength Plateau)
        if (currentPhase === "BETA") {
            // HYSTERESIS: Require 3 consecutive weeks of stalls
            if (metrics.consecutiveStalls >= 3) {
                console.log("AutoSpec: 3 weeks of stagnation. Switching to Alpha.");
                return "ALPHA";
            }
            // Or excessive fatigue
            if (metrics.atl > metrics.ctl * 1.3) {
                return "ALPHA";
            }
        }

        return currentPhase;
    }

    /**
     * Calculates specific weekly targets with ALL Bio-Optimizations.
     */
    static calculateVolumeTargets(
        activePath: TrainingPath,
        phase: MacroCycle,
        weeksInPhase: number,
        currentCardioTss: number,
        metrics: SystemMetrics
    ): BuildVolumeTargets {
        // 1. Get Base Targets from Matrix
        const baseTargets = phase === "ALPHA"
            ? BUILD_VOLUME_TARGETS_ALPHA[activePath]
            : BUILD_VOLUME_TARGETS_BETA[activePath];

        // If Gamma, everything is minimal (50%)
        if (phase === "GAMMA") {
            return this.applyModifiers(baseTargets, 0.5);
        }

        // --- BIO-MODIFIERS ---
        let globalModifier = 1.0;

        // 2. Volume Ramp-up (Safeguard)
        // Only applies when entering a High Volume phase (e.g. Strength in Beta)
        if (phase === "BETA" && weeksInPhase <= 1) globalModifier *= 0.7; // Week 1: 70%
        else if (phase === "BETA" && weeksInPhase === 2) globalModifier *= 0.85; // Week 2: 85%

        // 3. Interference Penalty
        if (phase === "BETA" && currentCardioTss > baseTargets.cardioTss * 1.5) {
            globalModifier *= 0.8;
            console.warn("AutoSpec: Heavy Interference. Penalizing Strength.");
        }

        // 4. Nutrition Blindspot
        globalModifier *= this.getNutritionModifier(metrics.nutritionMode);

        // 5. Sleep Debt
        globalModifier *= this.getSleepDebtModifier(metrics.sleepDebt);

        // 6. ACWR Danger Zone
        if (metrics.acwr > 1.5) {
            globalModifier *= 0.6; // Dramatic cut to prevent snap city
            console.warn("AutoSpec: ACWR > 1.5. Danger Zone Protocol Activated.");
        }

        return this.applyModifiers(baseTargets, globalModifier);
    }

    static applyModifiers(targets: BuildVolumeTargets, factor: number): BuildVolumeTargets {
        return {
            strengthSets: Math.floor(targets.strengthSets * factor),
            cardioTss: Math.floor(targets.cardioTss * factor), // Cardio usually scales too
            mobilitySets: targets.mobilitySets // Mobility stays high
        };
    }

    static getNutritionModifier(mode: NutritionMode): number {
        if (mode === "DEFICIT") return 0.7; // 30% reduction on cut
        if (mode === "SURPLUS") return 1.1; // 10% boost on bulk
        return 1.0;
    }

    static getSleepDebtModifier(debtHours: number): number {
        // debt > 0 means missing sleep
        if (debtHours > 10) return 0.5; // Emergency
        if (debtHours > 5) return 0.8; // Tired parent
        return 1.0;
    }
}
