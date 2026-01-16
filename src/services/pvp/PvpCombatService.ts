/**
 * @fileoverview PvpCombatService - Handles Titan vs Titan combat logic
 */

import { GameContextService } from "../game/GameContextService";

export interface DuelTurnResult {
    attackerId: string;
    defenderId: string;
    damageDealt: number;
    isCrit: boolean;
    message: string;
}

export class PvpCombatService {
    /**
     * Calculates the outcome of a single combat interaction (Attacker hits Defender)
     */
    static async calculateAttack(attackerId: string, defenderId: string): Promise<DuelTurnResult> {
        const [attackerContext, defenderContext] = await Promise.all([
            GameContextService.getPlayerContext(attackerId),
            GameContextService.getPlayerContext(defenderId),
        ]);

        // 1. Calculate Raw Damage based on Attacker's Stats
        // Formula: Effective Attack * Random Variance (0.9 - 1.1)
        const variance = 0.9 + Math.random() * 0.2;
        const rawDamage = attackerContext.combat.effectiveAttack * variance;

        // 2. Check for Crit
        const isCrit = Math.random() < attackerContext.modifiers.critChance;
        const critMultiplier = isCrit ? attackerContext.combat.critMultiplier : 1.0;

        // 3. Calculate Mitigation based on Defender's Stats
        // Simple armor reduction: Damage = Damage * (100 / (100 + Defense))
        // This is a standard MMO formula where defense has diminishing returns
        const defense = defenderContext.combat.effectiveDefense;
        const mitigation = 100 / (100 + defense);

        // 4. Final Damage
        let finalDamage = Math.round(rawDamage * critMultiplier * mitigation);
        finalDamage = Math.max(1, finalDamage); // Minimum 1 damage

        // 5. Construct Flavor Message
        let message = `${attackerContext.identity.titanName} attacks ${defenderContext.identity.titanName} for ${finalDamage} damage!`;
        if (isCrit) {
            message = `CRITICAL HIT! ${attackerContext.identity.titanName} creates a sonic boom, dealing ${finalDamage} damage!`;
        }

        // PvP Specific interaction (e.g. Archetype advantages) could go here
        // rock-paper-scissors logic for archetypes?

        return {
            attackerId,
            defenderId,
            damageDealt: finalDamage,
            isCrit,
            message,
        };
    }

    /**
     * Simulate a full round (both attack each other)
     */
    static async simulateRound(user1Id: string, user2Id: string): Promise<DuelTurnResult[]> {
        const attack1 = await this.calculateAttack(user1Id, user2Id);
        const attack2 = await this.calculateAttack(user2Id, user1Id);
        return [attack1, attack2];
    }
}
