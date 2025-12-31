import { Monster } from "./index";

/**
 * State for an active chase session
 */
export interface ChaseState {
    /** The monster chasing the player */
    chaser: Monster;
    /** Distance gap in meters. Positive = player ahead, Negative = caught */
    distanceGapMeters: number;
    /** Player has been caught */
    isCaught: boolean;
    /** Player has escaped (reached safe distance) */
    hasEscaped: boolean;
    /** Goal distance to fully escape */
    escapeDistanceMeters: number;
    /** Session elapsed time in seconds */
    elapsedSeconds: number;
    /** Total player distance traveled in meters */
    playerDistanceMeters: number;
    /** Total chaser distance traveled in meters */
    chaserDistanceMeters: number;
}

/**
 * Chase difficulty presets
 */
export type ChaseDifficulty = "easy" | "normal" | "hard" | "nightmare";

/**
 * Configuration for chase initialization
 */
export interface ChaseConfig {
    difficulty: ChaseDifficulty;
    /** Starting gap in meters (player head start) */
    startingGapMeters: number;
    /** Distance needed to fully escape */
    escapeDistanceMeters: number;
    /** Speed modifier for chaser (1.0 = base speed) */
    chaserSpeedModifier: number;
}

/**
 * Difficulty presets for chase mode
 */
export const CHASE_DIFFICULTY_PRESETS: Record<ChaseDifficulty, ChaseConfig> = {
    easy: {
        difficulty: "easy",
        startingGapMeters: 200,
        escapeDistanceMeters: 1000,
        chaserSpeedModifier: 0.8,
    },
    normal: {
        difficulty: "normal",
        startingGapMeters: 100,
        escapeDistanceMeters: 1500,
        chaserSpeedModifier: 1.0,
    },
    hard: {
        difficulty: "hard",
        startingGapMeters: 50,
        escapeDistanceMeters: 2000,
        chaserSpeedModifier: 1.15,
    },
    nightmare: {
        difficulty: "nightmare",
        startingGapMeters: 25,
        escapeDistanceMeters: 3000,
        chaserSpeedModifier: 1.3,
    },
};
