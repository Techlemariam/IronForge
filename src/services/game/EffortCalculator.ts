/**
 * Effort Calculator for Territory Conquest
 * 
 * Normalizes different effort metrics (HR, Power, Pace) to a 0-100 score
 * Used to calculate territory control point bonuses
 */

export interface EffortInput {
    avgHr?: number;
    maxHr?: number;
    avgPower?: number;
    ftp?: number;
    avgPaceSecondsPerKm?: number;
    thresholdPaceSecondsPerKm?: number;
}

export interface EffortResult {
    score: number;          // 0-100
    source: "power" | "hr" | "pace" | "none";
    zoneName: string;       // e.g. "Threshold", "Tempo"
    controlBonus: number;   // 0-10 bonus points
}

/**
 * Zone definitions with corresponding effort scores and bonuses
 */
const EFFORT_ZONES = [
    { name: "Recovery", min: 0, max: 30, bonus: 0 },
    { name: "Endurance", min: 31, max: 50, bonus: 5 },
    { name: "Tempo", min: 51, max: 70, bonus: 8 },
    { name: "Threshold", min: 71, max: 90, bonus: 10 }, // Max bonus!
    { name: "VO2max", min: 91, max: 100, bonus: 8 },    // Diminishing returns
];

/**
 * Calculate effort score from HR percentage of max
 */
function hrToEffort(hrPercent: number): number {
    if (hrPercent < 60) return 20;
    if (hrPercent < 70) return 40;
    if (hrPercent < 80) return 60;
    if (hrPercent < 90) return 80;
    return 100;
}

/**
 * Calculate effort score from power percentage of FTP
 */
function powerToEffort(powerPercent: number): number {
    if (powerPercent < 56) return 20;
    if (powerPercent < 76) return 40;
    if (powerPercent < 90) return 60;
    if (powerPercent < 105) return 80;
    return 100;
}

/**
 * Calculate effort score from pace percentage of threshold
 * Note: Pace is inverse - lower is faster/harder
 */
function paceToEffort(pacePercent: number): number {
    // pacePercent = current / threshold, so <100% means faster than threshold
    if (pacePercent > 140) return 20;  // Very slow
    if (pacePercent > 120) return 40;  // Easy
    if (pacePercent > 105) return 60;  // Tempo
    if (pacePercent > 95) return 80;   // Threshold
    return 100;                         // Above threshold
}

/**
 * Get zone info from effort score
 */
function getZoneInfo(score: number): { name: string; bonus: number } {
    for (const zone of EFFORT_ZONES) {
        if (score >= zone.min && score <= zone.max) {
            return { name: zone.name, bonus: zone.bonus };
        }
    }
    return { name: "Unknown", bonus: 0 };
}

/**
 * Calculate unified effort score from available metrics
 * 
 * Priority: Power > HR > Pace
 * Power is most accurate for hilly terrain
 * 
 * @returns Effort score (0-100) and control point bonus (0-10)
 */
export function calculateEffortScore(input: EffortInput): EffortResult {
    let score = 0;
    let source: EffortResult["source"] = "none";

    // Priority 1: Power-based (best for hills)
    if (input.avgPower && input.ftp && input.ftp > 0) {
        const powerPercent = (input.avgPower / input.ftp) * 100;
        score = powerToEffort(powerPercent);
        source = "power";
    }
    // Priority 2: Heart Rate
    else if (input.avgHr && input.maxHr && input.maxHr > 0) {
        const hrPercent = (input.avgHr / input.maxHr) * 100;
        score = hrToEffort(hrPercent);
        source = "hr";
    }
    // Priority 3: Pace (fallback)
    else if (
        input.avgPaceSecondsPerKm &&
        input.thresholdPaceSecondsPerKm &&
        input.thresholdPaceSecondsPerKm > 0
    ) {
        const pacePercent =
            (input.avgPaceSecondsPerKm / input.thresholdPaceSecondsPerKm) * 100;
        score = paceToEffort(pacePercent);
        source = "pace";
    }

    const zoneInfo = getZoneInfo(score);

    return {
        score,
        source,
        zoneName: zoneInfo.name,
        controlBonus: zoneInfo.bonus,
    };
}

/**
 * Calculate effort score from Intervals.icu activity data
 * 
 * Convenience wrapper that maps Intervals fields to our input format
 */
export function calculateEffortFromActivity(
    avgHr: number | undefined,
    maxHr: number | undefined,
    avgPower: number | undefined,
    ftp: number | undefined,
    movingTimeSeconds: number | undefined,
    distanceMeters: number | undefined
): EffortResult {
    let avgPaceSecondsPerKm: number | undefined;

    if (movingTimeSeconds && distanceMeters && distanceMeters > 0) {
        avgPaceSecondsPerKm = movingTimeSeconds / (distanceMeters / 1000);
    }

    return calculateEffortScore({
        avgHr,
        maxHr,
        avgPower,
        ftp,
        avgPaceSecondsPerKm,
        thresholdPaceSecondsPerKm: 300, // Default 5:00/km threshold
    });
}
