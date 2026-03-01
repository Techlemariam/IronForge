import prisma from "@/lib/prisma";
import { ProgressionService } from "./progression";

export const PhysicalSkillService = {
    /**
     * Evaluates a user's physical metrics and unlocks associated skills
     * if they meet the physical thresholds.
     * This should be called after a workout is logged.
     */
    async evaluateAndUnlockSkills(userId: string) {
        const unlockedLog: string[] = [];

        // 1. Get User Baseline
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { bodyWeight: true, archetype: true },
        });

        if (!user) return unlockedLog;

        // 2. Evaluate JUGGERNAUT (Strength) Skills
        // Requirements: High Wilks or High e1rm
        const wilksScore = await ProgressionService.updateWilksScore(userId);
        const bestDeadlift = await ProgressionService.findBestLift(userId, ["Deadlift", "Sumo Deadlift"]);

        if (wilksScore > 250 || (bestDeadlift / user.bodyWeight) >= 1.5) {
            const unlocked = await this.unlockSkillSafely(userId, "SKILL_JUGGERNAUT_CLEAVE", "Tier 1: Cleave Strike");
            if (unlocked) unlockedLog.push("Cleave Strike unlocked (Strength Threshold Reached)");
        }

        if (wilksScore > 350 || (bestDeadlift / user.bodyWeight) >= 2.0) {
            const unlocked = await this.unlockSkillSafely(userId, "SKILL_JUGGERNAUT_EARTHQUAKE", "Tier 3: Earthquake Smash");
            if (unlocked) unlockedLog.push("Earthquake Smash unlocked (Titan Strength Reached!)");
        }

        // 3. Evaluate PATHFINDER (Endurance) Skills
        // Requirements: Long Zone 2 Cardio Sessions
        const longRuns = await prisma.cardioLog.count({
            where: {
                userId,
                type: "Run",
                duration: { gte: 2700 }, // > 45 minutes
            },
        });

        if (longRuns >= 5) {
            const unlocked = await this.unlockSkillSafely(userId, "SKILL_PATHFINDER_SWIFTWIND", "Tier 1: Swiftwind Dash");
            if (unlocked) unlockedLog.push("Swiftwind Dash unlocked (Endurance Milestone Reached)");
        }

        if (longRuns >= 20) {
            const unlocked = await this.unlockSkillSafely(userId, "SKILL_PATHFINDER_SECOND_WIND", "Tier 3: Second Wind");
            if (unlocked) unlockedLog.push("Second Wind unlocked (Marathoner Level Reached!)");
        }

        // 4. Evaluate WARDEN (Vitality) Skills
        // Requirements: Mobility / Recovery
        const mobilitySessions = await prisma.mobilityLog.count({
            where: { userId },
        });

        if (mobilitySessions >= 10) {
            const unlocked = await this.unlockSkillSafely(userId, "SKILL_WARDEN_HEALING_AURA", "Tier 1: Healing Aura");
            if (unlocked) unlockedLog.push("Healing Aura unlocked (Mobility Milestone Reached)");
        }

        // 5. If new skills unlocked, we'd fire a notification here
        if (unlockedLog.length > 0) {
            try {
                const { NotificationService } = await import("@/services/notifications");
                await NotificationService.create({
                    userId,
                    type: "SKILL_UNLOCKED",
                    message: `Physical thresholds met! New Skills Unlocked: ${unlockedLog.join(", ")}`,
                });
            } catch (err) {
                console.error("Failed to notify user about skill unlock", err);
            }
        }

        return unlockedLog;
    },

    /**
     * Helper to unlock a skill in UserSkill without duplicating
     */
    async unlockSkillSafely(userId: string, skillId: string, skillName: string): Promise<boolean> {
        const existing = await prisma.userSkill.findUnique({
            where: { userId_skillId: { userId, skillId } },
        });

        if (existing && existing.unlocked) {
            return false; // Already unlocked
        }

        await prisma.userSkill.upsert({
            where: { userId_skillId: { userId, skillId } },
            create: { userId, skillId, status: "UNLOCKED", unlocked: true },
            update: { status: "UNLOCKED", unlocked: true },
        });

        return true;
    },
};
