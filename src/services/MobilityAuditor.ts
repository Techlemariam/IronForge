/**
 * MobilityAuditor
 * 
 * Analyzes mobility training data to detect stiff/neglected regions
 * and provide recommendations for the GPE and Oracle.
 */

import { MobilityRegion, MOBILITY_EXERCISES, getExercisesByRegion } from '@/data/mobilityExercises';

export interface MobilityAuditReport {
    totalWeeklyMinutes: number;
    passiveLayerLevel: 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD';
    regionCoverage: Record<MobilityRegion, number>; // Minutes per region
    neglectedRegions: MobilityRegion[];
    recommendedExercises: { region: MobilityRegion; exerciseId: string; exerciseName: string }[];
    insight: string;
}

// Target minutes per region per week for balanced mobility
const REGION_TARGET_MINUTES: Record<MobilityRegion, number> = {
    ankle: 10,
    hip_flexor: 15,
    hip_external_rotation: 10,
    thoracic: 10,
    shoulder: 10,
    wrist: 5,
    hamstring: 15,
    quad: 10,
    knee: 10,
    calf: 8,
    neck: 5,
    lower_back: 10,
};

/**
 * Audits user's mobility training for the week.
 */
export function auditMobility(
    logs: { exerciseId: string; durationSecs: number }[]
): MobilityAuditReport {
    // Calculate total minutes
    const totalWeeklyMinutes = logs.reduce((sum, log) => sum + log.durationSecs / 60, 0);

    // Calculate passive layer level
    const passiveLayerLevel: MobilityAuditReport['passiveLayerLevel'] =
        totalWeeklyMinutes >= 60 ? 'GOLD' :
            totalWeeklyMinutes >= 30 ? 'SILVER' :
                totalWeeklyMinutes >= 15 ? 'BRONZE' : 'NONE';

    // Calculate region coverage
    const regionCoverage: Record<MobilityRegion, number> = {
        ankle: 0,
        hip_flexor: 0,
        hip_external_rotation: 0,
        thoracic: 0,
        shoulder: 0,
        wrist: 0,
        hamstring: 0,
        quad: 0,
        knee: 0,
        calf: 0,
        neck: 0,
        lower_back: 0,
    };

    for (const log of logs) {
        const exercise = MOBILITY_EXERCISES.find(e => e.id === log.exerciseId);
        if (exercise) {
            const minutes = log.durationSecs / 60;
            for (const region of exercise.targetRegions) {
                regionCoverage[region] += minutes;
            }
        }
    }

    // Find neglected regions (below 50% of target)
    const neglectedRegions: MobilityRegion[] = [];
    for (const [region, target] of Object.entries(REGION_TARGET_MINUTES)) {
        const actual = regionCoverage[region as MobilityRegion];
        if (actual < target * 0.5) {
            neglectedRegions.push(region as MobilityRegion);
        }
    }

    // Sort neglected regions by severity (most neglected first)
    neglectedRegions.sort((a, b) => {
        const aRatio = regionCoverage[a] / REGION_TARGET_MINUTES[a];
        const bRatio = regionCoverage[b] / REGION_TARGET_MINUTES[b];
        return aRatio - bRatio;
    });

    // Recommend exercises for top 3 neglected regions
    const recommendedExercises: MobilityAuditReport['recommendedExercises'] = [];
    for (const region of neglectedRegions.slice(0, 3)) {
        const exercises = getExercisesByRegion(region);
        if (exercises.length > 0) {
            // Prefer beginner exercises
            const sorted = exercises.sort((a, b) => {
                const diffOrder = { BEGINNER: 0, INTERMEDIATE: 1, ADVANCED: 2 };
                return diffOrder[a.difficulty] - diffOrder[b.difficulty];
            });
            recommendedExercises.push({
                region,
                exerciseId: sorted[0].id,
                exerciseName: sorted[0].name,
            });
        }
    }

    // Generate insight
    let insight: string;
    if (totalWeeklyMinutes === 0) {
        insight = "No mobility work logged this week. Start with 15 minutes to unlock Bronze tier.";
    } else if (neglectedRegions.length > 5) {
        insight = `Many regions need attention. Focus on ${neglectedRegions.slice(0, 3).join(', ')}.`;
    } else if (neglectedRegions.length > 0) {
        insight = `Good progress! Prioritize ${neglectedRegions[0]} to balance your mobility.`;
    } else if (passiveLayerLevel === 'GOLD') {
        insight = "Excellent! All regions covered. Maintain this for maximum injury prevention.";
    } else {
        insight = "Solid coverage. Increase weekly volume to reach Gold tier.";
    }

    return {
        totalWeeklyMinutes: Math.round(totalWeeklyMinutes * 10) / 10,
        passiveLayerLevel,
        regionCoverage,
        neglectedRegions,
        recommendedExercises,
        insight,
    };
}

/**
 * Integration with GPE: Check if user needs mobility focus
 */
export function needsMobilityFocus(auditReport: MobilityAuditReport): boolean {
    return auditReport.neglectedRegions.length > 5 || auditReport.passiveLayerLevel === 'NONE';
}

/**
 * Get recommended mobility session based on neglected regions
 */
export function getRecommendedSession(
    neglectedRegions: MobilityRegion[],
    availableMinutes: number = 15
): { exerciseId: string; durationSecs: number }[] {
    const session: { exerciseId: string; durationSecs: number }[] = [];
    let remainingMinutes = availableMinutes;

    for (const region of neglectedRegions) {
        if (remainingMinutes <= 0) break;

        const exercises = getExercisesByRegion(region);
        if (exercises.length > 0) {
            const exercise = exercises[0];
            const duration = Math.min(exercise.durationSecs, remainingMinutes * 60);
            session.push({
                exerciseId: exercise.id,
                durationSecs: duration,
            });
            remainingMinutes -= duration / 60;
        }
    }

    return session;
}
