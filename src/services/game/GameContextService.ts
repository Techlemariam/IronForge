/**
 * @fileoverview GameContextService - Unified Modifier Hub
 * 
 * This service aggregates all sources of player power:
 * - Archetype (JUGGERNAUT/PATHFINDER/WARDEN)
 * - Unlocked Skills (from skill tree)
 * - Oracle Decrees (daily buffs/debuffs)
 * - Equipped Items
 * - Territory Bonuses (future)
 * 
 * Returns a unified PlayerContext object that any system can consume.
 */

import prisma from "@/lib/prisma";
import { Archetype } from "@prisma/client";
import {
    PlayerContext,
    PlayerModifiers,
    DEFAULT_MODIFIERS,
    ActiveBuff,
    CombatStats,
    PlayerIdentity
} from "@/types/game";
import { PATH_MODIFIERS, PATH_INFO } from "@/data/builds";
import { SKILL_TREE_V2, getNodeById } from "@/data/skill-tree-v2";
import { SkillNodeV2 } from "@/types/skills";
import { TrainingPath } from "@/types/training";

// ============================================================================
// Archetype → TrainingPath Mapping
// ============================================================================

const ARCHETYPE_TO_PATH: Record<Archetype, TrainingPath> = {
    JUGGERNAUT: "JUGGERNAUT",
    PATHFINDER: "PATHFINDER",
    WARDEN: "WARDEN",
};

// ============================================================================
// Service
// ============================================================================

export class GameContextService {
    /**
     * Get the unified PlayerContext for a user.
     * This is the main entry point for any system needing player modifiers.
     */
    static async getPlayerContext(userId: string): Promise<PlayerContext> {
        // 1. Fetch all required data in parallel
        const [user, titan, unlockedSkills, equippedItems, pvpProfile] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    archetype: true,
                    level: true,
                    heroName: true,
                },
            }),
            prisma.titan.findUnique({
                where: { userId },
                select: {
                    name: true,
                    level: true,
                    dailyDecree: true,
                    currentBuff: true,
                    strength: true,
                    vitality: true,
                },
            }),
            prisma.userSkill.findMany({
                where: { userId, unlocked: true },
                select: { skillId: true },
            }),
            prisma.userEquipment.findMany({
                where: { userId, equipped: true },
                include: { item: true },
            }),
            prisma.pvpProfile.findUnique({
                where: { userId },
                select: {
                    rankScore: true,
                },
            }),
        ]);

        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }

        // 2. Build Identity
        const archetype = user.archetype || Archetype.WARDEN;
        const path = ARCHETYPE_TO_PATH[archetype];
        const pathInfo = PATH_INFO[path];

        const identity: PlayerIdentity = {
            userId: user.id,
            archetype,
            archetypeName: pathInfo.name,
            level: titan?.level || user.level || 1,
            titanName: titan?.name || user.heroName || "Unnamed Titan",
        };

        // 3. Start with base modifiers
        const modifiers: PlayerModifiers = { ...DEFAULT_MODIFIERS };
        const activeBuffs: ActiveBuff[] = [];

        // 4. Apply Archetype Modifiers
        const archetypeModifiers = PATH_MODIFIERS[path];
        if (archetypeModifiers) {
            modifiers.attackPower *= archetypeModifiers.attackPower;
            modifiers.stamina *= archetypeModifiers.stamina;
            // Dodge isn't in our modifier system yet, but could be added

            activeBuffs.push({
                id: `archetype_${archetype}`,
                source: "ARCHETYPE",
                name: pathInfo.name,
                description: pathInfo.description,
                icon: pathInfo.icon,
                modifiers: {
                    attackPower: archetypeModifiers.attackPower,
                    stamina: archetypeModifiers.stamina,
                },
            });
        }

        // 5. Apply Skill Modifiers
        const unlockedSkillIds = unlockedSkills.map(s => s.skillId);
        for (const skillId of unlockedSkillIds) {
            const skillDef = getNodeById(skillId);
            if (skillDef?.effects) {
                const effects = skillDef.effects;

                // Map SkillEffect to PlayerModifiers
                if (effects.tpMultiplier) {
                    modifiers.xpGain *= effects.tpMultiplier;
                }
                if (effects.titanLoadMultiplier) {
                    modifiers.titanLoad *= effects.titanLoadMultiplier;
                }
                if (effects.recoveryRateMultiplier) {
                    modifiers.recoverySpeed *= effects.recoveryRateMultiplier;
                }
                if (effects.ksMultiplier) {
                    modifiers.goldGain *= effects.ksMultiplier; // KS maps to gold in this context
                }

                // Add as active buff for UI display
                activeBuffs.push({
                    id: `skill_${skillId}`,
                    source: "SKILL",
                    name: skillDef.title,
                    description: skillDef.description,
                    modifiers: {
                        xpGain: effects.tpMultiplier,
                        titanLoad: effects.titanLoadMultiplier,
                        recoverySpeed: effects.recoveryRateMultiplier,
                    },
                });
            }
        }

        // 6. Apply Oracle Decree
        let oracleDecreeType: "BUFF" | "DEBUFF" | "NEUTRAL" | undefined;
        if (titan?.dailyDecree) {
            const decree = titan.dailyDecree as any;
            oracleDecreeType = decree.type;

            if (decree.effect?.xpMultiplier) {
                modifiers.xpGain *= decree.effect.xpMultiplier;

                activeBuffs.push({
                    id: "oracle_decree",
                    source: "ORACLE",
                    name: decree.label || "Oracle Decree",
                    description: decree.message || "The Oracle has spoken.",
                    modifiers: {
                        xpGain: decree.effect.xpMultiplier,
                    },
                });
            }

            // Handle debuffs
            if (decree.type === "DEBUFF" && decree.effect?.xpMultiplier) {
                // Already applied above, but could add specific debuff handling
            }
        }

        // 7. Apply Equipment Modifiers
        let totalItemPower = 0;

        for (const equip of equippedItems) {
            const item = equip.item;
            totalItemPower += item.power || 0;

            // Special Item Effects (Hardcoded for v1 based on Seed Data)
            if (item.name === "Exo-Skeleton Legs") {
                modifiers.strengthXp *= 1.2; // "Enhance squat max" interpreted as Strength XP boost
                activeBuffs.push({
                    id: `item_${item.id}`,
                    source: "EQUIPMENT",
                    name: item.name,
                    description: "Squat Max +20% (XP Boost)",
                    modifiers: { strengthXp: 1.2 }
                });
            }

            if (item.name === "Protein Synthesizer") {
                modifiers.recoverySpeed *= 1.1;
                activeBuffs.push({
                    id: `item_${item.id}`,
                    source: "EQUIPMENT",
                    name: item.name,
                    description: "Optimized Recovery",
                    modifiers: { recoverySpeed: 1.1 }
                });
            }

            if (item.name === "Heart Rate Monitor") {
                modifiers.cardioXp *= 1.1; // "Advanced biometrics"
            }
        }

        // 8. Apply PvP Modifiers (Rank-based)
        if (pvpProfile) {
            const rank = pvpProfile.rankScore || 1000;

            // Tier 1: Gladiator (1500+)
            if (rank >= 1500) {
                modifiers.attackPower *= 1.05;
                modifiers.critChance += 0.02; // +2% Crit

                activeBuffs.push({
                    id: "pvp_gladiator",
                    source: "PVP",
                    name: "Gladiator's Spirit",
                    description: "Rank 1500+ Bonus (+5% DMG, +2% Crit)",
                    modifiers: { attackPower: 1.05, critChance: 0.02 }
                });
            }

            // Tier 2: High Warlord (2000+)
            if (rank >= 2000) {
                modifiers.stamina *= 1.1;
                modifiers.lootLuck *= 1.2;

                activeBuffs.push({
                    id: "pvp_warlord",
                    source: "PVP",
                    name: "High Warlord's Command",
                    description: "Rank 2000+ Bonus (+10% Stamina, +20% Luck)",
                    modifiers: { stamina: 1.1, lootLuck: 1.2 }
                });
            }
        }

        // 9. Calculate Combat Stats
        // Base damage = 10 + Strength + Total Item Power
        const baseDamage = 10 + (titan?.strength || 10) + totalItemPower;
        const baseDefense = 5 + (titan?.vitality || 10); // Could also add Armor Power here if Items had defense

        const combat: CombatStats = {
            effectiveAttack: Math.round(baseDamage * modifiers.attackPower),
            effectiveDefense: Math.round(baseDefense * modifiers.defense),
            damagePerVolume: 0.1 * modifiers.attackPower, // 0.1 damage per kg volume
            critMultiplier: 1.5 + (modifiers.critChance * 0.5), // Base 1.5x, scales with crit
        };

        // 9. Return unified context
        return {
            identity,
            modifiers,
            activeBuffs,
            combat,
            raw: {
                unlockedSkillIds,
                equippedItemIds: equippedItems.map(e => e.equipmentId),
                oracleDecreeType,
            },
        };
    }

    /**
     * Calculate XP reward with all modifiers applied.
     * @param baseXp The base XP before modifiers
     * @param context The player context (or fetches if not provided)
     * @param exerciseType Optional: "strength" or "cardio" for specific multipliers
     */
    static calculateXpReward(
        baseXp: number,
        context: PlayerContext,
        exerciseType?: "strength" | "cardio"
    ): { finalXp: number; appliedMultiplier: number; appliedBuffs: string[] } {
        let multiplier = context.modifiers.xpGain;
        const appliedBuffs: string[] = [];

        // Apply type-specific multiplier
        if (exerciseType === "strength") {
            multiplier *= context.modifiers.strengthXp;
        } else if (exerciseType === "cardio") {
            multiplier *= context.modifiers.cardioXp;
        }

        // Track which buffs contributed
        for (const buff of context.activeBuffs) {
            if (buff.modifiers.xpGain && buff.modifiers.xpGain !== 1.0) {
                appliedBuffs.push(buff.name);
            }
        }

        const finalXp = Math.round(baseXp * multiplier);

        return {
            finalXp,
            appliedMultiplier: multiplier,
            appliedBuffs,
        };
    }

    /**
     * Calculate combat damage with all modifiers applied.
     */
    static calculateDamage(
        volume: number,
        context: PlayerContext
    ): { damage: number; isCrit: boolean } {
        const baseDamage = volume * context.combat.damagePerVolume;
        const isCrit = Math.random() < context.modifiers.critChance;
        const damage = isCrit
            ? Math.round(baseDamage * context.combat.critMultiplier)
            : Math.round(baseDamage);

        return { damage, isCrit };
    }
}
