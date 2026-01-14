import prisma from "@/lib/prisma";
import { getWellnessAction, getActivitiesAction } from "@/actions/integrations/intervals";
import { TrainingPath, SystemMetrics, MacroCycle, NutritionMode } from "@/types/training";
import { EXERCISE_DB } from "@/data/exerciseDb";
import { PATH_VOLUME_MODIFIERS } from "@/data/builds";
import { AutoSpecEngine } from "@/services/game/AutoSpecEngine";
import { Prisma } from "@prisma/client";

// --- Types ---
export interface VolumeStatus {
    muscleGroup: string;
    weeklySets: number;
    mrv: number;
    status: "LOW" | "OPTIMAL" | "OVERREACHING" | "OVERTRAINING";
    percentage: number;
}

export interface TrainingContext {
    readiness: "HIGH" | "MODERATE" | "LOW" | "RECOVERY_NEEDED";
    cnsFatigue: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
    cardioStress: "LOW" | "MODERATE" | "HIGH";
    volume: Record<string, VolumeStatus>;
    warnings: string[];
}

interface WorkoutSet {
    reps: number;
    weight?: number;
    rpe?: number;
    isWarmup?: boolean;
}

// Helper to safely parse sets from Prisma JSON
function parseSets(json: Prisma.JsonValue): WorkoutSet[] {
    if (!Array.isArray(json)) return [];
    return (json as unknown as any[]).map((item) => ({
        reps: Number(item?.reps || 0),
        weight: Number(item?.weight || 0),
        rpe: typeof item?.rpe === 'number' ? item.rpe : undefined,
        isWarmup: Boolean(item?.isWarmup)
    }));
}

// --- Configuration ---

const MRV_DEFAULTS: Record<string, number> = {
    CHEST: 20,
    BACK: 25,
    QUADS: 20,
    HAMS: 16,
    GLUTES: 16,
    SHOULDERS: 20,
    BICEPS: 20,
    TRICEPS: 20,
    ABS: 25,
    CALVES: 20,
    UNKNOWN: 20
};

export class TrainingContextService {

    /**
     * Aggregates weekly volume from DB and calculates status.
    /**
     * Aggregates weekly volume from DB and calculates status.
     * @param mrvScaleFactor Modifier for volume ramps (e.g. 0.7 for first week of block)
     * @param activePath Optional path to apply specific MRV modifiers (e.g. Engine Quads = 0.7)
     */
    static async getWeeklyVolume(userId: string, mrvScaleFactor: number = 1.0, activePath?: TrainingPath): Promise<Record<string, VolumeStatus>> {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const logs = await prisma.exerciseLog.findMany({
            where: {
                userId,
                date: { gte: oneWeekAgo }
            },
            include: { exercise: true }
        });

        const volumeMap: Record<string, number> = {};

        logs.forEach(log => {
            // 1. Try explicit muscle group from Exercise
            let muscle = log.exercise.muscleGroup?.toUpperCase() || "UNKNOWN";

            // 2. Fallback to Map if needed, or normalize
            const mappedMuscle = workoutToMuscleMap(log.exercise.name);
            if (mappedMuscle) {
                muscle = mappedMuscle;
            }

            // Count valid sets (sets > 0 reps)
            const sets = parseSets(log.sets);
            const validSets = sets.filter(s => s.reps > 0).length;
            volumeMap[muscle] = (volumeMap[muscle] || 0) + validSets;
        });

        // Build Status Objects
        const result: Record<string, VolumeStatus> = {};
        for (const [muscle, sets] of Object.entries(volumeMap)) {
            let baseMrv = MRV_DEFAULTS[muscle] || 20;

            // Apply Path-Specific Modifiers
            if (activePath && PATH_VOLUME_MODIFIERS[activePath]) {
                const modifiers = PATH_VOLUME_MODIFIERS[activePath] as Record<string, number>;
                const modifier = modifiers[muscle];
                if (modifier !== undefined) {
                    baseMrv = Math.round(baseMrv * modifier);
                }
            }

            const mrv = Math.floor(baseMrv * mrvScaleFactor); // Apply Ramp-up / Penalty
            const pct = mrv > 0 ? (sets / mrv) * 100 : 0;

            let status: VolumeStatus["status"] = "LOW";
            if (pct >= 50) status = "OPTIMAL";
            if (pct >= 100) status = "OVERREACHING";
            if (pct >= 125) status = "OVERTRAINING";

            result[muscle] = {
                muscleGroup: muscle,
                weeklySets: sets,
                mrv,
                status,
                percentage: pct
            };
        }

        return result;
    }

    /**
     * Fetches external context (Intervals) and combines with internal fatigue logic.
     */
    static async getTrainingContext(userId: string): Promise<TrainingContext> {
        const warnings: string[] = [];

        // 0. Fetch Extended User Context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                activePath: true,
                currentMacroCycle: true,
                macroCycleStartDate: true,
                consecutiveStalls: true,
                totalExperience: true,
                nutritionMode: true
            }
        });

        // 1. Calculate Time in Phase
        const now = new Date();
        const start = user?.macroCycleStartDate || now;
        const weeksInPhase = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));

        // 2. Fetch External Data first (needed for AutoSpec)
        const today = new Date().toISOString().split('T')[0];
        const wellness = await getWellnessAction(today);

        // 3. Fetch Recent Activities (Last 48h for acute fatigue)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 2);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const recentActivities = await getActivitiesAction(yesterdayStr, today);

        const totalTss = recentActivities.reduce((acc, act) => acc + (act.icu_intensity || 0), 0); // using intensity as proxy if TSS missing, actually we need TSS field. 

        // 4. Auto-Spec Evaluation
        const currentPhase = (user?.currentMacroCycle as MacroCycle) || "ALPHA";
        const nutritionMode = (user?.nutritionMode as NutritionMode) || "MAINTENANCE";

        // Calculate sleep debt: 7h is baseline. Wellness returns secs.
        const sleepHours = wellness?.sleepSecs ? wellness.sleepSecs / 3600 : 7;
        const sleepDebt = Math.max(0, 7.5 - sleepHours); // Assume 7.5h goal

        // ACWR: ATL / CTL
        const ctl = wellness?.ctl || 40;
        const atl = wellness?.atl || wellness?.tsb ? (ctl - (wellness.tsb || 0)) : 40;
        const acwr = ctl > 0 ? atl / ctl : 1.0;

        const metrics: SystemMetrics = {
            ctl: wellness?.ctl || 0,
            atl: wellness?.atl || 0,
            tsb: wellness?.tsb || 0,
            hrv: wellness?.hrv || 0,
            sleepScore: wellness?.sleepScore || (wellness?.sleepSecs ? (wellness.sleepSecs / 3600 / 8) * 100 : 0),
            bodyBattery: wellness?.bodyBattery || 0, // In IronForge wellness, readiness is bodyBattery
            strengthDelta: 0,
            consecutiveStalls: user?.consecutiveStalls || 0,
            weeksInPhase: weeksInPhase,
            nutritionMode: nutritionMode,
            sleepDebt,
            acwr,
            junkMilePercent: 0,
            neuralLoad: 0,
            impactLoad: 0,
            interferenceEvents: 0
        };

        const recommendedPhase = AutoSpecEngine.evaluateTransition(currentPhase, metrics);
        if (recommendedPhase !== currentPhase) {
            warnings.push(`AutoSpec Recommends Phase Change: ${currentPhase} -> ${recommendedPhase} `);
            // Logic to auto-update DB could go here or be a separate action
        }

        // 5. Calculate Dynamic Targets (Ramp-up & Interference)
        const rawPath = user?.activePath || "WARDEN";
        // Map legacy HYBRID_WARDEN to WARDEN if present in DB
        const activePath = (rawPath === "HYBRID_WARDEN" ? "WARDEN" : rawPath) as TrainingPath;
        const _targets = AutoSpecEngine.calculateVolumeTargets(
            activePath,
            currentPhase,
            weeksInPhase,
            totalTss,
            metrics
        );

        // 6. Fetch Volume (Pass dynamic MRV scale factor)
        // We use strengthSets target as a proxy for "Global MRV Scale" or calculate explicitly.
        // INTEGRAL FIX: MRV must scale with Bio-State, not just Ramp-up.

        const _junkMilePercent = 0; // Calculate from cardio analysis

        const nutritionMod = AutoSpecEngine.getNutritionModifier(nutritionMode);
        const sleepMod = AutoSpecEngine.getSleepDebtModifier(sleepDebt);
        let acwrMod = 1.0;
        if (acwr > 1.5) acwrMod = 0.6;

        let globalBioMod = nutritionMod * sleepMod * acwrMod;

        let rampFactor = 1.0;
        if (currentPhase === "BETA" && weeksInPhase === 1) rampFactor = 0.7;
        else if (currentPhase === "BETA" && weeksInPhase === 2) rampFactor = 0.85;

        const effectiveScaleFactor = rampFactor * globalBioMod;

        // For now, let's pass the raw scale factor to getWeeklyVolume
        const volume = await this.getWeeklyVolume(userId, effectiveScaleFactor, activePath);

        // 7. Calculate Readiness (Based on HRV/Sleep)
        let readiness: TrainingContext["readiness"] = "HIGH";
        if (wellness && wellness.hrv) {
            const score = wellness.bodyBattery || 50;
            if (score < 30) {
                readiness = "RECOVERY_NEEDED";
                warnings.push("Recovery is critical. Low HRV/Sleep.");
            } else if (score < 60) {
                readiness = "LOW";
                warnings.push("Recovery is suboptimal.");
            } else if (score < 80) {
                readiness = "MODERATE";
            }
        }

        // 8. Calculate Cardio Stress (TSS)
        let cardioStress: TrainingContext["cardioStress"] = "LOW";
        if (totalTss > 250) {
            cardioStress = "HIGH";
            warnings.push("High cardio fatigue detected (Long session detected).");
        } else if (totalTss > 100) {
            cardioStress = "MODERATE";
        }
        // 4b. Path-Specific Metrics Calculation
        // Neural Load (Juggernaut)
        // Need to fetch logs if not already filtered. getWeeklyVolume fetches them internally.
        // Let's do a quick fetch for metrics (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentLogs = await prisma.exerciseLog.findMany({
            where: { userId, date: { gte: sevenDaysAgo } },
            include: { exercise: true }
        });

        let _neuralLoad = 0;
        recentLogs.forEach(log => {
            const sets = parseSets(log.sets);
            sets.forEach(set => {
                if (set.reps > 0) {
                    const cost = TrainingContextService.estimateCnsCost(log.exercise.name, set.rpe || 7, set.reps);
                    _neuralLoad += (cost === "HIGH" ? 3 : cost === "MEDIUM" ? 2 : 1);
                }
            });
        });

        // Impact Load (Engine) - Run TSS
        const _impactLoad = recentActivities
            .filter(a => a.type === "Run")
            .reduce((acc, a) => acc + (a.icu_intensity || 0), 0);

        // Interference (Warden)
        let _interferenceEvents = 0;
        // Group by date
        const cardiosByDate = new Map<string, Date[]>();
        recentActivities.forEach(a => {
            const dateStr = new Date(a.start_date_local).toISOString().split('T')[0];
            const time = new Date(a.start_date_local);
            if (!cardiosByDate.has(dateStr)) cardiosByDate.set(dateStr, []);
            cardiosByDate.get(dateStr)?.push(time);
        });

        recentLogs.forEach(log => {
            const dateStr = log.date.toISOString().split('T')[0];
            const strengthTime = log.date;
            if (cardiosByDate.has(dateStr)) {
                // Check delta
                const cardioTimes = cardiosByDate.get(dateStr) || [];
                for (const cTime of cardioTimes) {
                    const diffHours = Math.abs(cTime.getTime() - strengthTime.getTime()) / 3600000;
                    if (diffHours < 6) {
                        _interferenceEvents++;
                        warnings.push(`Interference Detected: Strength & Cardio within ${diffHours.toFixed(1)}h on ${dateStr} `);
                    }
                }
            }
        });

        // Titan Gatekeeper Check
        if (user?.activePath === "TITAN") {
            let junkSets = 0;
            let totalSets = 0;
            recentLogs.forEach(log => {
                const sets = parseSets(log.sets);
                sets.forEach(set => {
                    totalSets++;
                    if ((set.rpe || 0) < 7) junkSets++;
                });
            });
            if (totalSets > 0 && (junkSets / totalSets) > 0.3) {
                warnings.push(`Titan Alert: ${junkSets} sets were 'Junk Volume'(RPE < 7).Intensity needed!`);
            }

            // 5. Frequency Violation
            const muscleLastSeen = new Map<string, Date>();
            recentLogs.sort((a, b) => a.date.getTime() - b.date.getTime()).forEach(log => {
                const muscle = log.exercise.muscleGroup || "UNKNOWN";
                if (muscleLastSeen.has(muscle)) {
                    const last = muscleLastSeen.get(muscle)!;
                    const diffHours = (log.date.getTime() - last.getTime()) / 3600000;
                    if (diffHours < 40) { // < 40h allows some wiggle room for "48h" if logging times vary
                        warnings.push(`Frequency Violation: ${muscle} trained twice within ${Math.round(diffHours)} h.Hypertrophy requires rest.`);
                    }
                }
                muscleLastSeen.set(muscle, log.date);
            });

            // 6. Rep Range Mismatch
            let lowRepSets = 0;
            recentLogs.forEach(log => {
                const sets = parseSets(log.sets);
                sets.forEach(set => {
                    if (set.reps < 5) lowRepSets++;
                });
            });
            if (totalSets > 0 && (lowRepSets / totalSets) > 0.5) {
                warnings.push(`Titan Mismatch: > 50 % of volume is < 5 reps.Leave the powerlifting to Juggernaut.`);
            }
        }


        // Note: Path-specific metrics kept for future expansion

        // 9. CNS Fatigue Estimate
        let cnsFatigue: TrainingContext["cnsFatigue"] = "LOW";
        if (readiness === "LOW" && cardioStress === "HIGH") {
            cnsFatigue = "CRITICAL";
            warnings.push("CNS is fried. Rest.");
        }

        return {
            readiness,
            cnsFatigue,
            cardioStress,
            volume,
            warnings
        };
    }

    /**
     * Estimates CNS cost of a planned session or set.
     */
    static estimateCnsCost(exerciseName: string, rpe: number, _reps: number): "LOW" | "MEDIUM" | "HIGH" {
        // 1. Explicit Lookup
        let baseCost = 3;
        const entry = EXERCISE_DB[exerciseName] || EXERCISE_DB[exerciseName.replace(/\s\(.*?\)/, "")] || null;

        if (entry) {
            baseCost = entry.cnsTier;
            // Fallback Heuristics (for non-Hevy names)
            const name = exerciseName.toLowerCase();

            // Tier 1: Axial Loading / Neurologically Demanding (Base 9)
            if (
                (name.includes("squat") || name.includes("deadlift") || name.includes("clean") || name.includes("snatch")) &&
                !name.includes("belt") &&
                !name.includes("goblet") &&
                !name.includes("split") &&
                !name.includes("hack")
            ) {
                baseCost = 9;
            }
            // Tier 2: Compound / Heavy Load (Base 7)
            else if (
                name.includes("bench") ||
                name.includes("row") ||
                name.includes("press") ||
                name.includes("pull up") ||
                name.includes("leg press") ||
                name.includes("belt squat") ||
                name.includes("hack squat") ||
                name.includes("split squat")
            ) {
                baseCost = 7;
            }

            // RPE Multiplier
            let multiplier = 1.0;
            if (rpe >= 9) multiplier = 1.3;
            if (rpe <= 6) multiplier = 0.8;

            const totalLoad = baseCost * multiplier;

            if (totalLoad >= 8.5) return "HIGH";
            if (totalLoad >= 5) return "MEDIUM";
            return "LOW";
        }
        // Fallback if no entry found
        return "MEDIUM";
    }
}

// Helper to map exercise names to muscle groups using Hevy data
function workoutToMuscleMap(exerciseName: string): string | null {
    // 1. Direct lookup in DB
    const entry = EXERCISE_DB[exerciseName];
    if (entry) {
        return normalizeMuscleGroup(entry.muscle);
    }

    // 2. Fuzzy match
    const lowerName = exerciseName.toLowerCase();
    for (const [key, val] of Object.entries(EXERCISE_DB)) {
        if (lowerName.includes(key.toLowerCase())) {
            return normalizeMuscleGroup(val.muscle);
        }
    }

    return null;
}

function normalizeMuscleGroup(hevyGroup: string): string {
    const map: Record<string, string> = {
        "chest": "CHEST",
        "lats": "BACK",
        "upper_back": "BACK",
        "lower_back": "BACK",
        "traps": "BACK", // Or SHOULDERS?
        "shoulders": "SHOULDERS",
        "biceps": "BICEPS",
        "triceps": "TRICEPS",
        "quadriceps": "QUADS",
        "hamstrings": "HAMSTRINGS",
        "glutes": "GLUTES",
        "calves": "CALVES",
        "abdominals": "ABS",
        "core": "ABS",
        "cardio": "CARDIO",
        "full_body": "FULL_BODY"
    };
    return map[hevyGroup] || "UNKNOWN";
}
