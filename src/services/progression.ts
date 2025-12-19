
import { StorageService } from './storage';
import { ACHIEVEMENTS } from '../data/static';

/**
 * Progression Service
 * Handles XP calculation and level management.
 */

const XP_PER_ACHIEVEMENT_POINT = 100;
const XP_PER_TITAN_LOAD_UNIT = 10;
const XP_LEVEL_THRESHOLD = 1000;

export const ProgressionService = {

    /**
     * Calculates total XP based on stored achievements and workout history.
     */
    async calculateTotalXp(): Promise<number> {
        // 1. Calculate XP from Achievements
        const unlockedAchievementIds = await StorageService.getState<string[]>('achievements') || [];
        const achievementXp = unlockedAchievementIds.reduce((acc, id) => {
            const ach = ACHIEVEMENTS.find(a => a.id === id);
            return acc + (ach ? ach.points * XP_PER_ACHIEVEMENT_POINT : 0);
        }, 0);

        // 2. Calculate XP from Workout History (Titan Load Proxy)
        const history = await StorageService.getHistory();
        // For now, we use a simple proxy: each logged set gives 50 XP
        // In a real scenario, we'd pull Titan Load from AnalyticsService
        const workoutXp = history.length * 50;

        return achievementXp + workoutXp;
    },

    /**
     * Calculates total Gold.
     * Gold is earned by:
     * 1. Completing Workouts (10 Gold per session)
     * 2. Unlocking Achievements (50 Gold per achievement)
     * 3. Manual adjustments (Marketplace purchases deduct gold)
     * 
     * NOTE: Since we don't have a transaction ledger yet, we store the *current balance* directly in StorageService.
     * The logic below is for initial seed or backup. 
     * Ideally, we should just read 'gold' from storage.
     */
    async getCurrentGold(): Promise<number> {
        // Try to get stored gold balance
        const storedGold = await StorageService.getGold();

        // IF no gold is stored (first run after update), calculate retroactive gold
        if (storedGold === 0) {
            const history = await StorageService.getHistory();
            const unlockedAchievementIds = await StorageService.getState<string[]>('achievements') || [];

            // Retroactive formula: 10g per workout + 50g per achievement
            const retroactiveGold = (history.length * 10) + (unlockedAchievementIds.length * 50);

            // Save this initial balance so we can deduct from it later
            if (retroactiveGold > 0) {
                await StorageService.saveGold(retroactiveGold);
                return retroactiveGold;
            }
        }

        return storedGold;
    },

    /**
     * Awards Gold to the user.
     */
    async awardGold(amount: number): Promise<number> {
        const current = await this.getCurrentGold();
        const newBalance = current + amount;
        await StorageService.saveGold(newBalance);
        return newBalance;
    },

    /**
     * Maps total XP to a Level.
     */
    calculateLevel(totalXp: number): number {
        // Linear leveling for now: 1000 XP per level, starting at level 1
        const level = Math.floor(totalXp / XP_LEVEL_THRESHOLD) + 1;
        return Math.max(1, level);
    },

    /**
     * Gets the full progression state.
     */
    async getProgressionState(): Promise<{ level: number; totalXp: number; xpToNextLevel: number; progressPct: number; gold: number }> {
        const totalXp = await this.calculateTotalXp();
        const level = this.calculateLevel(totalXp);
        const gold = await this.getCurrentGold();

        const xpInCurrentLevel = totalXp % XP_LEVEL_THRESHOLD;
        const progressPct = (xpInCurrentLevel / XP_LEVEL_THRESHOLD) * 100;
        const xpToNextLevel = XP_LEVEL_THRESHOLD - xpInCurrentLevel;

        return {
            level,
            totalXp,
            xpToNextLevel,
            progressPct,
            gold
        };
    }
};
