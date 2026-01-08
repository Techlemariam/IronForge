/**
 * @fileoverview DuelRewardsService - Handles dynamic reward calculation for PvP
 */

import { GameContextService } from "../game/GameContextService";

export interface DuelRewardResult {
    xp: number;
    gold: number;
    kineticEnergy: number;
    bonuses: string[];
}

export class DuelRewardsService {
    /**
     * Calculates XP, Gold, and KE rewards for a duel result using PlayerContext modifiers
     */
    static async calculateRewards(
        userId: string,
        isWinner: boolean,
        totalScore: number,
        opponentScore: number
    ): Promise<DuelRewardResult> {
        const context = await GameContextService.getPlayerContext(userId);
        const bonuses: string[] = [];

        // --- Base Values ---
        let baseXp = isWinner ? 100 : 30;
        let baseGold = isWinner ? 50 : 15;
        let baseKe = isWinner ? 25 : 5;

        // --- Performance Modifiers ---

        // 1. Score Bonus (+5 XP per 100 score/damage)
        const scoreBonus = Math.floor(totalScore / 100) * 5;
        if (scoreBonus > 0) {
            baseXp += scoreBonus;
            bonuses.push(`Performance Bonus +${scoreBonus} XP`);
        }

        // 2. Close Match Bonus (+20% XP/Gold if margin < 10%)
        const margin = Math.abs(totalScore - opponentScore);
        const maxScore = Math.max(totalScore, opponentScore, 1); // Avoid div by zero
        const pctDiff = margin / maxScore;

        let closeMatchMult = 1.0;
        if (pctDiff < 0.1) {
            closeMatchMult = 1.2;
            bonuses.push("Close Match +20%");
        }

        // --- Context Modifiers ---

        // XP Gain Modifier (Archetype, Skills, Oracle)
        const xpMult = context.modifiers.xpGain * closeMatchMult;
        const finalXp = Math.round(baseXp * xpMult);

        if (context.modifiers.xpGain > 1.0) {
            bonuses.push(`XP Boost x${context.modifiers.xpGain.toFixed(2)}`);
        }

        // Gold Gain Modifier (Equipment, PvP Rank)
        const goldMult = context.modifiers.goldGain * closeMatchMult;
        const finalGold = Math.round(baseGold * goldMult);

        if (context.modifiers.goldGain > 1.0) {
            bonuses.push(`Gold Rush x${context.modifiers.goldGain.toFixed(2)}`);
        }

        // Loot Luck - Chance to double Kinetic Energy reward
        let finalKe = baseKe;

        // Normalize luck: 1.0 = base, 1.5 = 50% extra chance
        // Let's say every 1.0 of Loot Luck adds 5% Crit Chance for Rewards
        // Actually, let's use Luck as a multiplier for chance to crit rewards
        const luckChance = (context.modifiers.lootLuck - 1.0) * 0.5 + 0.05; // Base 5% + (Luck-1)*50%

        // Cap chance at 50%
        const roll = Math.random();
        if (roll < Math.min(luckChance, 0.5)) {
            finalKe *= 2;
            bonuses.push("Lucky Loot! (2x KE)");
        }

        return {
            xp: finalXp,
            gold: finalGold,
            kineticEnergy: finalKe,
            bonuses
        };
    }

    /**
     * Calculates rewards for a draw scenario - both participants get small participation rewards
     */
    static async calculateDrawRewards(
        userId: string,
        totalScore: number
    ): Promise<DuelRewardResult> {
        const context = await GameContextService.getPlayerContext(userId);
        const bonuses: string[] = ["Draw - Mutual Respect"];

        // Base draw rewards (between win and loss)
        let baseXp = 50;
        let baseGold = 25;
        let baseKe = 10;

        // Score bonus still applies
        const scoreBonus = Math.floor(totalScore / 100) * 3;
        if (scoreBonus > 0) {
            baseXp += scoreBonus;
            bonuses.push(`Effort Bonus +${scoreBonus} XP`);
        }

        // Apply context modifiers
        const finalXp = Math.round(baseXp * context.modifiers.xpGain);
        const finalGold = Math.round(baseGold * context.modifiers.goldGain);

        return {
            xp: finalXp,
            gold: finalGold,
            kineticEnergy: baseKe,
            bonuses
        };
    }
}
