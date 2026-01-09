import {
    WardensManifest,
    SystemMetrics,
    MacroPhase,
    TrainingGoal,
    WeeklyTargets,
    DailyResourceBudget,
    MuscleHeatmap
} from '@/types/goals';
import { WORKOUT_LIBRARY } from '@/data/workouts';
import { WorkoutDefinition, MuscleGroup } from '@/types/training';
import { HEVY_EXERCISE_MAP } from '@/data/hevyExercises';


// Phase Allocation Matrix
const PHASE_ALLOCATION: Record<MacroPhase, { strength: number; cardio: number; mobility: number; description: string }> = {
    CARDIO_BUILD: {
        strength: 0.20,
        cardio: 0.70,
        mobility: 0.10,
        description: "Building aerobic engine. Strength maintenance only.",
    },
    STRENGTH_BUILD: {
        strength: 0.70,
        cardio: 0.20,
        mobility: 0.10,
        description: "Building strength. Light cardio for recovery.",
    },
    BALANCED: {
        strength: 0.45,
        cardio: 0.45,
        mobility: 0.10,
        description: "Maintaining both systems. No peak adaptation.",
    },
    PEAK: {
        strength: 0.30,
        cardio: 0.50,
        mobility: 0.20,
        description: "Competition prep. Reduced volume, high intensity.",
    },
    DELOAD: {
        strength: 0.25,
        cardio: 0.25,
        mobility: 0.50,
        description: "Recovery week. Focus on mobility and light movement.",
    },
};

export class GoalPriorityEngine {

    /**
     * Determines optimal phase based on goal priorities and current state.
     */
    static selectPhase(
        manifest: WardensManifest,
        metrics: SystemMetrics
    ): MacroPhase {

        // 1. Safety Override - Always check first
        if (this.needsDeload(metrics)) return "DELOAD";

        // 2. Deadline Check - Peak if event within 2 weeks
        const upcomingDeadline = this.getUpcomingDeadline(manifest.goals);
        if (upcomingDeadline && upcomingDeadline.daysUntil <= 14) {
            return "PEAK";
        }

        // 3. Post-Deload - Always return to cardio (build base first)
        if (manifest.phase === "DELOAD" && metrics.tsb > 0) {
            return "CARDIO_BUILD";
        }

        // 4. Phase Rotation - Based on primary goal
        const primaryGoal = manifest.goals[0]?.goal;

        if (this.isCardioGoal(primaryGoal)) {
            return this.shouldTransition(manifest, metrics)
                ? "STRENGTH_BUILD"  // Recovery rotation
                : "CARDIO_BUILD";
        }

        if (this.isStrengthGoal(primaryGoal)) {
            return this.shouldTransition(manifest, metrics)
                ? "CARDIO_BUILD"    // Recovery rotation
                : "STRENGTH_BUILD";
        }

        return "BALANCED";
    }

    /**
     * Hysteresis-based transition logic.
     * Requires 4+ weeks in phase AND progress stall.
     */
    static shouldTransition(
        manifest: WardensManifest,
        metrics: SystemMetrics
    ): boolean {
        if (manifest.phaseWeek < 4) return false; // Minimum phase duration
        if (metrics.consecutiveStalls >= 3) return true; // Plateau detected
        if (metrics.atl > metrics.ctl * 1.3) return true; // Overreaching
        return false;
    }

    static needsDeload(metrics: SystemMetrics): boolean {
        // Fallback: If critical data missing, use subjective fail-safes
        if (metrics.hrv === null || metrics.hrv === undefined || metrics.tsb === null || metrics.tsb === undefined) {
            return (
                metrics.soreness > 7 ||
                metrics.mood === "EXHAUSTED" ||
                metrics.sleepScore < 30
            );
        }

        // Relative Thresholds
        const hrvBaseline = metrics.hrvBaseline || 50;
        const isCrashing = metrics.hrv < (hrvBaseline * 0.75);
        const isTanked = metrics.tsb < -40;
        const isSpiked = metrics.acwr > 1.5;

        return isCrashing || isTanked || isSpiked;
    }

    static isCardioGoal(goal: TrainingGoal): boolean {
        return ["VO2MAX", "FTP_BIKE", "FTP_RUN", "ENDURANCE", "FITNESS"].includes(goal);
    }

    static isStrengthGoal(goal: TrainingGoal): boolean {
        return ["STRENGTH", "HYPERTROPHY", "BODY_COMP"].includes(goal);
    }

    private static getUpcomingDeadline(goals: WardensManifest['goals']): { date: Date, daysUntil: number } | null {
        const deadlines = goals
            .filter(g => g.deadline)
            .map(g => ({ date: g.deadline!, daysUntil: Math.ceil((new Date(g.deadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) }))
            .filter(d => d.daysUntil >= 0)
            .sort((a, b) => a.daysUntil - b.daysUntil);

        return deadlines[0] || null;
    }

    /**
     * Calculates concrete weekly targets based on phase and goals.
     */
    static calculateWeeklyTargets(
        manifest: WardensManifest,
        phase: MacroPhase,
        metrics: SystemMetrics
    ): WeeklyTargets {

        const allocation = PHASE_ALLOCATION[phase];
        const baseHours = this.getBaseHours(metrics); // ~6-12h/week

        // Base allocation
        let strengthHours = baseHours * allocation.strength;
        let cardioHours = baseHours * allocation.cardio;
        let mobilityHours = baseHours * allocation.mobility;

        // Apply bio-modifiers
        const modifier = this.getBioModifier(metrics);
        strengthHours *= modifier;
        cardioHours *= modifier; // Note: Specs says * modifier for both, let's stick to that.

        // Apply Tapering for PEAK phase
        if (phase === "PEAK") {
            const taperMult = Math.max(0.5, 1.0 - (manifest.phaseWeek * 0.1)); // Reduce 10% per week
            strengthHours *= taperMult;
            cardioHours *= taperMult;
            // Note: Mobility not tapered
        }

        return {
            strengthHours: Number(strengthHours.toFixed(1)),
            cardioHours: Number(cardioHours.toFixed(1)),
            mobilityHours: Number(mobilityHours.toFixed(1)),
            primaryFocus: manifest.goals[0]?.goal || "FITNESS",
            phaseDescription: allocation.description
        };
    }

    private static getBaseHours(metrics: SystemMetrics): number {
        // Simple logic based on CTL (Fitness)
        // CTL 0-40: 4h
        // CTL 40-70: 6h
        // CTL 70-100: 9h
        // CTL 100+: 12h
        if (metrics.ctl > 100) return 12;
        if (metrics.ctl > 70) return 9;
        if (metrics.ctl > 40) return 6;
        return 4;
    }

    private static getBioModifier(metrics: SystemMetrics): number {
        // Reduce volume if recovery is poor
        if (metrics.sleepScore < 50) return 0.8;
        if (metrics.soreness > 6) return 0.85;
        if (metrics.tsb < -20) return 0.9;

        // Increase if primed? 
        if (metrics.tsb > 10 && metrics.sleepScore > 85) return 1.1;

        return 1.0;
    }

    /**
     * Selects the optimal workout from the library based on phase, budget, and muscle gaps.
     */
    static selectWorkout(
        manifest: WardensManifest,
        phase: MacroPhase,
        budget: DailyResourceBudget,
        heatmap?: MuscleHeatmap, // Optional, primarily for STRENGTH workouts
        preferences?: {
            maxDuration?: number;
            preferredTypes?: string[];
            availableEquipment?: string[]; // Todo: Integrate with The Armory
        },
        allowBudgetOverride?: boolean
    ): WorkoutDefinition[] {

        // 1. Filter by phase priority
        let candidates = WORKOUT_LIBRARY.filter(w =>
            this.matchesPhase(w, phase)
        );

        // 2. Filter by preferences
        if (preferences) {
            if (preferences.maxDuration) {
                candidates = candidates.filter(w => w.durationMin <= preferences.maxDuration!);
            }
            if (preferences.preferredTypes && preferences.preferredTypes.length > 0) {
                candidates = candidates.filter(w => preferences.preferredTypes!.includes(w.type));
            }
        }

        // 3. Filter by budget (strict unless override)
        if (!allowBudgetOverride) {
            candidates = candidates.filter(w =>
                (w.resourceCost.CNS ?? 0) <= budget.cns &&
                (w.resourceCost.MUSCULAR ?? 0) <= budget.muscular &&
                (w.resourceCost.METABOLIC ?? 0) <= budget.metabolic
            );
        }

        // 4. Sort by "fit score" (higher = better match)
        candidates.sort((a, b) =>
            this.calculateFitScore(b, phase, heatmap, manifest) -
            this.calculateFitScore(a, phase, heatmap, manifest)
        );

        // Return top 3 recommendations
        return candidates.slice(0, 3);
    }

    private static matchesPhase(w: WorkoutDefinition, phase: MacroPhase): boolean {
        if (phase === 'CARDIO_BUILD') {
            return ['RUN', 'BIKE', 'SWIM'].includes(w.type);
        }
        if (phase === 'STRENGTH_BUILD') {
            return w.type === 'STRENGTH';
        }
        if (phase === 'DELOAD') {
            return w.intensity === 'LOW' || w.type === 'MOBILITY';
        }
        if (phase === 'PEAK') {
            // Peak logic: High intensity, lower volume? 
            // For now, allow everything but prioritize intensity in scoring
            return true;
        }
        return true; // BALANCED: all types allowed
    }

    private static calculateFitScore(
        w: WorkoutDefinition,
        phase: MacroPhase,
        heatmap: MuscleHeatmap | undefined,
        manifest: WardensManifest
    ): number {
        let score = 100;

        // Bonus for matching recommended path
        // Assuming current path is derived from phase or manifest goals? 
        // For now, let's just check if any recommended path matches a known user path preference if we had one.
        // Actually, manifest doesn't explicitly store "Path", but goals implicate it.
        // Let's rely on simple Phase matching for now.

        // Phase specific bonuses
        if (phase === 'PEAK' && w.intensity === 'HIGH') score += 20;
        if (phase === 'DELOAD' && w.intensity === 'LOW') score += 20;

        // Bonus for filling heatmap gaps (strength workouts only)
        if (w.type === 'STRENGTH' && w.exercises && heatmap) {
            const targetedMuscles = w.exercises.map(e => this.getMuscleForExercise(e.id));

            // Find unique muscles targeted that are in MV (Maintenance) or MEV (Min Effective)
            // We want to push them to MAV (Max Adaptive).
            const uniqueMuscles = Array.from(new Set(targetedMuscles)).filter(Boolean) as MuscleGroup[];

            let gapFillScore = 0;
            uniqueMuscles.forEach(m => {
                const status = heatmap[m]?.status;
                if (status === 'MV' || status === 'MEV') {
                    gapFillScore += 10;
                }
            });
            score += gapFillScore;
        }

        return score;
    }

    private static getMuscleForExercise(exerciseIdOrName: string): MuscleGroup | null {
        // Try direct map
        let muscle = HEVY_EXERCISE_MAP[exerciseIdOrName];

        // If not found, try generic matches (naive implementation)
        if (!muscle) {
            // Fallbacks for known IDs in workouts.ts if they differ from Hevy names
            return null;
        }

        // Map Hevy lowercase to MuscleGroup uppercase
        const mapping: Record<string, MuscleGroup> = {
            "quadriceps": "QUADS",
            "hamstrings": "HAMS",
            "glutes": "GLUTES",
            "chest": "CHEST",
            "upper_back": "BACK",
            "lats": "BACK", // or separate
            "lower_back": "BACK",
            "shoulders": "SHOULDERS",
            "biceps": "BICEPS",
            "triceps": "TRICEPS",
            "abdominals": "ABS",
            "calves": "CALVES",
            "forearms": "BICEPS" // Rough approx
        };

        return mapping[muscle] || null;
    }
}
