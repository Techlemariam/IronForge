import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ProgressionService } from "@/services/progression";
import { IntervalsWellness } from "@/types";
import { BioBuff } from "@/features/bio/BioBuffService";
import { getSkillNodeById } from "@/features/neural-lattice/data";
import { StatModifier } from "@/features/neural-lattice/types";
import { SKILL_TREE, ACHIEVEMENTS } from "@/data/static";

export interface EffectiveTitanStats {
    maxHp: number;
    maxEnergy: number;
    strength: number;
    vitality: number;
    endurance: number;
    agility: number;
    willpower: number;
}

export interface TitanAttributes {
    strength: number;
    endurance: number;
    technique: number;
    recovery: number;
    mental: number;
    hypertrophy: number;
}

export class TitanService {
    static async getTitan(userId: string) {
        return prisma.titan.findUnique({
            where: { userId },
            include: {
                memories: true,
                scars: true,
            },
        });
    }

    static async getTitanWithModifiers(userId: string) {
        const titan = await prisma.titan.findUnique({
            where: { userId },
            include: {
                user: {
                    include: {
                        skills: true,
                        achievements: true,
                        meditationLogs: {
                            orderBy: { date: 'desc' },
                            take: 20
                        }
                    }
                }
            }
        });

        if (!titan) return null;

        const baseStats = {
            maxHp: titan.maxHp,
            maxEnergy: titan.maxEnergy,
            strength: titan.strength,
            vitality: titan.vitality,
            endurance: titan.endurance,
            agility: titan.agility,
            willpower: titan.willpower,
        };

        const unlockedSkills = titan.user?.skills.filter((s: any) => s.unlocked) || [];
        const purchasedSkillIds = new Set(unlockedSkills.map((s: any) => s.skillId));
        const unlockedAchievementIds = new Set(titan.user?.achievements.map((a: any) => a.achievementId) || []);

        const flatModifiers: StatModifier[] = [];
        const percentageModifiers: StatModifier[] = [];

        unlockedSkills.forEach((skill: any) => {
            const node = getSkillNodeById(skill.skillId);
            if (node) {
                node.modifiers.forEach((mod) => {
                    if (mod.isPercentage) {
                        percentageModifiers.push(mod);
                    } else {
                        flatModifiers.push(mod);
                    }
                });
            }
        });

        const effectiveStats: EffectiveTitanStats = { ...baseStats };

        // 1. Apply Flat Math
        flatModifiers.forEach((mod) => {
            if (mod.stat in effectiveStats) {
                effectiveStats[mod.stat as keyof EffectiveTitanStats] += mod.value;
            }
        });

        // 2. Apply Percentage Math
        percentageModifiers.forEach((mod) => {
            if (mod.stat in effectiveStats) {
                const baseVal = baseStats[mod.stat as keyof typeof baseStats];
                effectiveStats[mod.stat as keyof EffectiveTitanStats] += Math.floor(baseVal * (mod.value / 100));
            }
        });

        // 3. Bridge to legacy TitanAttributes (1-20 scale)
        // Consolidating logic from root_utils.ts
        const normalize = (val: number, max: number) => Math.max(1, Math.min(20, Math.round((val / max) * 20)));

        // Strength Calculation
        const strengthTalents = SKILL_TREE.filter(n => n.category === "push" || n.category === "legs").length;
        const strengthUnlocked = SKILL_TREE.filter(n => (n.category === "push" || n.category === "legs") && purchasedSkillIds.has(n.id)).length;
        let strengthAttr = normalize(strengthUnlocked, strengthTalents + 5);

        // Endurance Calculation
        const endTalents = SKILL_TREE.filter(n => n.category === "endurance").length;
        const endUnlocked = SKILL_TREE.filter(n => n.category === "endurance" && purchasedSkillIds.has(n.id)).length;
        const enduranceAttr = normalize(endUnlocked, endTalents + 8);

        // Hypertrophy Calculation
        const pullSkills = SKILL_TREE.filter(n => n.category === "pull" && purchasedSkillIds.has(n.id)).length;
        const hypertrophyAttr = normalize(pullSkills * 2 + unlockedAchievementIds.size / 2, 25);

        // Mental Calculation
        const mindfulnessBonus = Math.min(10, Math.ceil((titan.user?.meditationLogs?.reduce((sum, log) => sum + log.durationMinutes, 0) || 0) / 12));
        const mentalAttr = Math.min(20, normalize(titan.level, 10) + mindfulnessBonus);

        // Recovery Calculation
        const recoveryAttr = Math.max(1, Math.min(20, Math.round(effectiveStats.vitality / 2))); // Simple 1-20 scale from vitality

        // Technique Calculation
        const coreSkills = SKILL_TREE.filter(n => n.category === "core" && purchasedSkillIds.has(n.id)).length;
        const techAchievements = ACHIEVEMENTS.filter(a => a.category === "professions" && unlockedAchievementIds.has(a.id)).length;
        const techniqueAttr = normalize(techAchievements + coreSkills, 10);

        const attributes: TitanAttributes = {
            strength: Math.min(20, strengthAttr + (effectiveStats.strength - baseStats.strength)),
            endurance: Math.min(20, enduranceAttr + (effectiveStats.endurance - baseStats.endurance)),
            technique: Math.min(20, techniqueAttr + (effectiveStats.agility - baseStats.agility)),
            mental: Math.min(20, mentalAttr + (effectiveStats.willpower - baseStats.willpower)),
            recovery: Math.min(20, recoveryAttr + (effectiveStats.vitality - baseStats.vitality)),
            hypertrophy: hypertrophyAttr,
        };

        return {
            titan,
            effectiveStats,
            attributes,
            activeModifiers: [...flatModifiers, ...percentageModifiers]
        };
    }

    static async ensureTitan(userId: string) {
        return prisma.titan.upsert({
            where: { userId },
            update: {},
            create: {
                userId,
                name: "Iron Initiate",
                level: 1,
                xp: 0,
                currentHp: 100,
                maxHp: 100,
                currentEnergy: 100,
                maxEnergy: 100,
                mood: "NEUTRAL",
            },
        });
    }

    static async modifyHealth(userId: string, delta: number, _reason: string) {
        const titanData = await TitanService.getTitanWithModifiers(userId);
        if (!titanData) throw new Error("Titan not found");

        const { titan, effectiveStats } = titanData;

        let newHp = titan.currentHp + delta;
        if (newHp > effectiveStats.maxHp) newHp = effectiveStats.maxHp;
        if (newHp < 0) newHp = 0;

        const isInjured = newHp === 0;
        let mood = titan.mood;
        if (isInjured) mood = "WEAKENED";

        const updated = await prisma.titan.update({
            where: { userId },
            data: {
                currentHp: newHp,
                isInjured: isInjured,
                mood: mood,
                lastActive: new Date(),
            },
        });

        revalidatePath("/citadel");
        revalidatePath("/dashboard");
        return updated;
    }

    static async awardXp(userId: string, amount: number, _source: string) {
        const titanData = await TitanService.getTitanWithModifiers(userId);
        if (!titanData) throw new Error("Titan not found");

        const { titan, effectiveStats, activeModifiers } = titanData;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        const decree = titan.dailyDecree as any;
        const multiplier = ProgressionService.calculateMultiplier(
            titan.streak,
            titan.mood,
            user?.subscriptionTier || "FREE",
            decree?.type,
            titan.level,
        );

        const adjustedAmount = Math.floor(amount * multiplier);

        let newXp = titan.xp + adjustedAmount;
        let newLevel = titan.level;
        let leveledUp = false;

        const xpToNext = newLevel * 1000;

        while (newXp >= xpToNext) {
            newXp -= xpToNext;
            newLevel++;
            leveledUp = true;
        }

        const data: any = {
            xp: newXp,
            level: newLevel,
            lastActive: new Date(),
        };

        if (leveledUp) {
            data.maxHp = 100 + newLevel * 10;

            // Calculate new effective Max HP
            let newEffectiveMaxHp = data.maxHp;
            activeModifiers.filter(m => !m.isPercentage && m.stat === "maxHp").forEach(m => newEffectiveMaxHp += m.value);
            activeModifiers.filter(m => m.isPercentage && m.stat === "maxHp").forEach(m => newEffectiveMaxHp += Math.floor(data.maxHp * (m.value / 100)));

            // Calculate new effective Max Energy
            let newEffectiveMaxEnergy = 100;
            activeModifiers.filter(m => !m.isPercentage && m.stat === "maxEnergy").forEach(m => newEffectiveMaxEnergy += m.value);
            activeModifiers.filter(m => m.isPercentage && m.stat === "maxEnergy").forEach(m => newEffectiveMaxEnergy += Math.floor(100 * (m.value / 100)));

            data.currentHp = newEffectiveMaxHp;
            data.currentEnergy = newEffectiveMaxEnergy;
        }

        const updated = await prisma.titan.update({
            where: { userId },
            data,
        });

        revalidatePath("/citadel");
        return { titan: updated, leveledUp };
    }

    static async consumeEnergy(userId: string, amount: number) {
        const titan = await prisma.titan.findUnique({ where: { userId } });
        if (!titan) throw new Error("Titan not found");

        if (titan.currentEnergy < amount) {
            throw new Error("Not enough energy");
        }

        const updated = await prisma.titan.update({
            where: { userId },
            data: {
                currentEnergy: { decrement: amount },
                lastActive: new Date(),
            },
        });

        revalidatePath("/citadel");
        return updated;
    }

    static async syncWellness(userId: string, wellness: IntervalsWellness) {
        const titanData = await TitanService.getTitanWithModifiers(userId);
        if (!titanData) throw new Error("Titan not found");

        const { titan, effectiveStats } = titanData;

        let newEnergy = titan.currentEnergy;
        if (wellness.bodyBattery !== undefined) {
            // Scale energy based on effective Max Energy
            newEnergy = Math.floor((wellness.bodyBattery / 100) * effectiveStats.maxEnergy);
        }

        let newMood = "NEUTRAL";
        const sleepScore = wellness.sleepScore || 0;
        const hrv = wellness.hrv || 0;

        if (
            (wellness.bodyBattery && wellness.bodyBattery < 30) ||
            (hrv > 0 && hrv < 30)
        ) {
            newMood = "WEAKENED";
        } else if (
            wellness.bodyBattery &&
            wellness.bodyBattery > 80 &&
            sleepScore > 80
        ) {
            newMood = "FOCUSED";
        }

        const isResting = (wellness.bodyBattery || 100) < 20;

        return prisma.titan.update({
            where: { userId },
            data: {
                currentEnergy: newEnergy,
                mood: newMood,
                isResting: isResting,
                lastActive: new Date(),
            },
        });
    }

    static async updateStreak(userId: string, timezone: string = "UTC") {
        const titan = await prisma.titan.findUnique({ where: { userId } });
        if (!titan) throw new Error("Titan not found");

        const now = new Date();
        const lastActive = new Date(titan.lastActive);
        const options: Intl.DateTimeFormatOptions = { timeZone: timezone };

        let todayStr: string;
        let lastActiveStr: string;
        try {
            todayStr = now.toLocaleDateString("en-CA", options);
            lastActiveStr = lastActive.toLocaleDateString("en-CA", options);
        } catch {
            const utcOptions = { timeZone: "UTC" };
            todayStr = now.toLocaleDateString("en-CA", utcOptions);
            lastActiveStr = lastActive.toLocaleDateString("en-CA", utcOptions);
        }

        if (todayStr === lastActiveStr) {
            return { streak: titan.streak, status: "SAME_DAY" };
        }

        const yesterdayTs = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        let yesterdayStr: string;
        try {
            yesterdayStr = yesterdayTs.toLocaleDateString("en-CA", options);
        } catch {
            yesterdayStr = yesterdayTs.toLocaleDateString("en-CA", {
                timeZone: "UTC",
            });
        }

        let newStreak = 1;
        if (lastActiveStr === yesterdayStr) {
            newStreak = titan.streak + 1;
        }

        const updated = await prisma.titan.update({
            where: { userId },
            data: {
                streak: newStreak,
                lastActive: new Date(),
            },
        });

        revalidatePath("/citadel");
        revalidatePath("/dashboard");

        return { streak: newStreak, status: "UPDATED", titan: updated };
    }
}
