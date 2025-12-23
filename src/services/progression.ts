
import prisma from '@/lib/prisma';
import { ACHIEVEMENTS } from '../data/static';

/**
 * Progression Service (Server-Side)
 * Handles XP and Gold management using Prisma.
 */

const XP_PER_ACHIEVEMENT_POINT = 100;
const XP_LEVEL_THRESHOLD = 1000;

export const ProgressionService = {

    /**
     * Awards Gold to a user.
     */
    async awardGold(userId: string, amount: number) {
        return prisma.user.update({
            where: { id: userId },
            data: { gold: { increment: amount } }
        });
    },

    /**
     * Awards Experience to a user and handles leveling.
     */
    async addExperience(userId: string, amount: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { totalExperience: true, level: true }
        });

        if (!user) throw new Error("User not found");

        const newTotalXp = user.totalExperience + amount;
        const newLevel = Math.floor(newTotalXp / XP_LEVEL_THRESHOLD) + 1;

        return prisma.user.update({
            where: { id: userId },
            data: {
                totalExperience: newTotalXp,
                level: newLevel
            }
        });
    },

    /**
     * Awards an achievement and its associated rewards.
     */
    async awardAchievement(userId: string, achievementId: string) {
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement) return;

        // 1. Record the achievement
        await prisma.userAchievement.upsert({
            where: { userId_achievementId: { userId, achievementId } },
            create: { userId, achievementId },
            update: {} // Already has it
        });

        // 2. Award rewards
        const goldReward = achievement.points * 50;
        const xpReward = achievement.points * XP_PER_ACHIEVEMENT_POINT;

        await this.awardGold(userId, goldReward);
        await this.addExperience(userId, xpReward);
    },

    /**
     * Gets the full progression state for a user.
     */
    async getProgressionState(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                level: true,
                totalExperience: true,
                gold: true,
                kineticEnergy: true
            }
        });

        if (!user) return null;

        const xpInCurrentLevel = user.totalExperience % XP_LEVEL_THRESHOLD;
        const progressPct = (xpInCurrentLevel / XP_LEVEL_THRESHOLD) * 100;
        const xpToNextLevel = XP_LEVEL_THRESHOLD - xpInCurrentLevel;

        return {
            level: user.level,
            totalXp: user.totalExperience,
            xpToNextLevel,
            progressPct,
            gold: user.gold,
            kineticEnergy: user.kineticEnergy
        };
    }
};
