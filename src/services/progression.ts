
import prisma from '@/lib/prisma';
import { ACHIEVEMENTS } from '../data/static';
import { calculateWilks } from '@/utils/wilks';

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
    },

    /**
     * Calculates and updates the user's Wilks Score based on best lifts.
     */
    async updateWilksScore(userId: string) {
        // 1. Get User Bodyweight
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { bodyWeight: true }
        });

        if (!user) throw new Error("User not found");

        // 2. Find Best Lifts (e1rm)
        // We look for exercise names that distinctively match powerlifts
        // This is a naive heuristic; ideally we'd have semantic tags.
        const bestSquat = await this.findBestLift(userId, ['Squat', 'Back Squat', 'Low Bar Squat']);
        const bestBench = await this.findBestLift(userId, ['Bench Press', 'Flat Barbell Bench Press']);
        const bestDeadlift = await this.findBestLift(userId, ['Deadlift', 'Conventional Deadlift', 'Sumo Deadlift']);

        const total = bestSquat + bestBench + bestDeadlift;

        if (total === 0) return 0;

        // 3. Calculate Wilks
        // Warning: Assuming 'male' coeffs for now until Gender is in User model.
        // TODO: Add gender to User model for accurate Wilks.
        const wilks = calculateWilks({
            weightLifted: total,
            bodyWeight: user.bodyWeight,
            sex: 'male'
        });

        // 4. Update PVP Profile
        await prisma.pvpProfile.upsert({
            where: { userId },
            create: {
                userId,
                highestWilksScore: wilks,
                rankScore: 1000 // Default
            },
            update: {
                highestWilksScore: wilks
            }
        });

        return wilks;
    },

    /**
     * Helper to find max e1rm for a set of exercise names.
     */
    async findBestLift(userId: string, exerciseNames: string[]): Promise<number> {
        // Query logs where exerciseId (name) is in list
        // Prisma doesn't do "max" easily on a string match query without groupBy or raw
        // But since exerciseId is a string, let's just fetch simplified.

        // Actually, matching exact strings is brittle. 
        // Hevy returns "Barbell Squat", "Bench Press (Barbell)", etc.
        // For robustness, let's use 'contains' OR logic if possible, or just exact matches from known list.
        // Using `in` operator.

        const bestLog = await prisma.exerciseLog.findFirst({
            where: {
                userId,
                // Partial matching is hard with `in`, so we rely on exact matches or simple `contains` 
                // Creating a simplified OR structure for partial matching:
                OR: exerciseNames.map(name => ({
                    exerciseId: { contains: name, mode: 'insensitive' }
                }))
            },
            orderBy: { e1rm: 'desc' },
            take: 1
        });

        return bestLog ? bestLog.e1rm : 0;
    }
};
