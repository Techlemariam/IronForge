/**
 * @fileoverview PvpCombatService Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { PvpCombatService } from "@/services/pvp/PvpCombatService";
import { GameContextService } from "@/services/game/GameContextService";
import { PlayerContext, DEFAULT_MODIFIERS } from "@/types/game";

// Mock GameContextService
// Mock GameContextService via spyOn
// No module mock needed for static class methods

describe("PvpCombatService", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(GameContextService, "getPlayerContext");
    });

    describe("calculateAttack", () => {
        it("should calculate damage based on attacker attack and defender defense", async () => {
            // Arrange
            const mockAttacker: Partial<PlayerContext> = {
                identity: { userId: "p1", titanName: "Attacker", archetype: "JUGGERNAUT", level: 10, archetypeName: "Juggernaut" },
                combat: {
                    effectiveAttack: 100, // High Attack
                    effectiveDefense: 10,
                    damagePerVolume: 1,
                    critMultiplier: 2.0
                },
                modifiers: { ...DEFAULT_MODIFIERS, critChance: 0 } // No crit for stable test
            };

            const mockDefender: Partial<PlayerContext> = {
                identity: { userId: "p2", titanName: "Defender", archetype: "WARDEN", level: 10, archetypeName: "Warden" },
                combat: {
                    effectiveAttack: 50,
                    effectiveDefense: 100, // High Defense
                    damagePerVolume: 1,
                    critMultiplier: 1.5
                },
                modifiers: { ...DEFAULT_MODIFIERS, critChance: 0 }
            };

            vi.mocked(GameContextService.getPlayerContext)
                .mockResolvedValueOnce(mockAttacker as PlayerContext)
                .mockResolvedValueOnce(mockDefender as PlayerContext);

            // Act
            const result = await PvpCombatService.calculateAttack("p1", "p2");

            // Assert
            // Formula: Damage = Attack * Variance * (100 / (100 + Defense))
            // Min Damage = 100 * 0.9 * (100/200) = 45
            // Max Damage = 100 * 1.1 * (100/200) = 55
            expect(result.damageDealt).toBeGreaterThanOrEqual(45);
            expect(result.damageDealt).toBeLessThanOrEqual(55);
            expect(result.attackerId).toBe("p1");
            expect(result.message).toContain("Attacker attacks Defender");
        });

        it("should apply critical hits", async () => {
            // Arrange
            const mockAttacker: Partial<PlayerContext> = {
                identity: { userId: "p1", titanName: "CritMaster", archetype: "PATHFINDER", level: 10, archetypeName: "Pathfinder" },
                combat: { effectiveAttack: 100, effectiveDefense: 0, damagePerVolume: 1, critMultiplier: 2.0 },
                modifiers: { ...DEFAULT_MODIFIERS, critChance: 1.0 } // 100% Crit Chance
            };

            const mockDefender: Partial<PlayerContext> = {
                identity: { userId: "p2", titanName: "Dummy", archetype: "WARDEN", level: 1, archetypeName: "Warden" },
                combat: { effectiveAttack: 0, effectiveDefense: 0, damagePerVolume: 0, critMultiplier: 0 },
                modifiers: { ...DEFAULT_MODIFIERS, critChance: 0 }
            };

            vi.mocked(GameContextService.getPlayerContext)
                .mockResolvedValueOnce(mockAttacker as PlayerContext)
                .mockResolvedValueOnce(mockDefender as PlayerContext);

            // Act
            const result = await PvpCombatService.calculateAttack("p1", "p2");

            // Assert
            // Damage = 100 * [0.9-1.1] * 2.0 (Crit) * 1.0 (No defense)
            // Range: 180 - 220
            expect(result.isCrit).toBe(true);
            expect(result.damageDealt).toBeGreaterThanOrEqual(180);
            expect(result.message).toContain("CRITICAL HIT");
        });
    });
});
