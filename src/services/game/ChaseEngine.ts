import { Monster } from "@/types";
import {
    ChaseState,
    ChaseDifficulty,
    CHASE_DIFFICULTY_PRESETS,
} from "@/types/chase";
import { MONSTERS } from "@/data/gameData";

/**
 * ChaseEngine - Handles chase mode logic for cardio sessions
 *
 * The player runs to maintain distance from a pursuing monster.
 * If caught, combat is triggered. If escaped, rewards are given.
 */
export class ChaseEngine {
    /**
     * Get all monsters that have chase capability (chaseSpeedKph defined)
     */
    static getChaserMonsters(): Monster[] {
        return MONSTERS.filter((m) => m.chaseSpeedKph !== undefined);
    }

    /**
     * Get a random chaser monster
     */
    static getRandomChaser(): Monster | null {
        const chasers = this.getChaserMonsters();
        if (chasers.length === 0) {
            // Fallback: use any monster with a default chase speed
            const fallback = MONSTERS[0];
            if (fallback) {
                return { ...fallback, chaseSpeedKph: 8 };
            }
            return null;
        }
        return chasers[Math.floor(Math.random() * chasers.length)];
    }

    /**
     * Initialize a new chase session
     */
    static initializeChase(
        monster: Monster,
        difficulty: ChaseDifficulty = "normal"
    ): ChaseState {
        const config = CHASE_DIFFICULTY_PRESETS[difficulty];

        return {
            chaser: monster,
            distanceGapMeters: config.startingGapMeters,
            isCaught: false,
            hasEscaped: false,
            escapeDistanceMeters: config.escapeDistanceMeters,
            elapsedSeconds: 0,
            playerDistanceMeters: 0,
            chaserDistanceMeters: 0,
        };
    }

    /**
     * Update chase state based on player speed
     *
     * @param state Current chase state
     * @param playerSpeedKph Player's current speed in km/h
     * @param deltaSeconds Time elapsed since last update
     * @param difficulty Current difficulty for speed modifier
     * @returns Updated chase state
     */
    static updateChase(
        state: ChaseState,
        playerSpeedKph: number,
        deltaSeconds: number,
        difficulty: ChaseDifficulty = "normal"
    ): ChaseState {
        // Don't update if already resolved
        if (state.isCaught || state.hasEscaped) {
            return state;
        }

        const config = CHASE_DIFFICULTY_PRESETS[difficulty];
        const chaserBaseSpeed = state.chaser.chaseSpeedKph ?? 8;
        const chaserEffectiveSpeed = chaserBaseSpeed * config.chaserSpeedModifier;

        // Calculate distance traveled (km/h -> m/s -> meters)
        const playerDistanceIncrement =
            (playerSpeedKph / 3600) * deltaSeconds * 1000;
        const chaserDistanceIncrement =
            (chaserEffectiveSpeed / 3600) * deltaSeconds * 1000;

        // Update distances
        const newPlayerDistance =
            state.playerDistanceMeters + playerDistanceIncrement;
        const newChaserDistance =
            state.chaserDistanceMeters + chaserDistanceIncrement;

        // Calculate new gap
        const newGap =
            state.distanceGapMeters +
            (playerDistanceIncrement - chaserDistanceIncrement);

        // Check win/lose conditions
        const isCaught = newGap <= 0;
        const hasEscaped = newGap >= state.escapeDistanceMeters;

        return {
            ...state,
            distanceGapMeters: newGap,
            isCaught,
            hasEscaped,
            elapsedSeconds: state.elapsedSeconds + deltaSeconds,
            playerDistanceMeters: newPlayerDistance,
            chaserDistanceMeters: newChaserDistance,
        };
    }

    /**
     * Get danger level based on current gap
     * @returns 0-1 where 1 is maximum danger (about to be caught)
     */
    static getDangerLevel(state: ChaseState): number {
        if (state.isCaught) return 1;
        if (state.hasEscaped) return 0;

        // Danger increases as gap decreases
        // At 0m gap = 1.0, at escapeDistance = 0.0
        const normalizedGap = Math.max(
            0,
            Math.min(state.distanceGapMeters / state.escapeDistanceMeters, 1)
        );
        return 1 - normalizedGap;
    }

    /**
     * Get status message based on current state
     */
    static getStatusMessage(state: ChaseState): string {
        if (state.isCaught) {
            return `${state.chaser.name} caught you!`;
        }
        if (state.hasEscaped) {
            return `You escaped from ${state.chaser.name}!`;
        }

        const gap = Math.round(state.distanceGapMeters);
        if (gap < 25) {
            return "IT'S RIGHT BEHIND YOU!";
        }
        if (gap < 50) {
            return "You can feel its breath!";
        }
        if (gap < 100) {
            return "It's gaining on you!";
        }
        if (gap < 200) {
            return "Keep running!";
        }
        return "Maintain your pace!";
    }

    /**
     * Calculate required pace to escape
     * @returns Required speed in kph to outrun the chaser
     */
    static getRequiredPace(
        state: ChaseState,
        difficulty: ChaseDifficulty = "normal"
    ): number {
        const config = CHASE_DIFFICULTY_PRESETS[difficulty];
        const chaserBaseSpeed = state.chaser.chaseSpeedKph ?? 8;
        return chaserBaseSpeed * config.chaserSpeedModifier;
    }
}
