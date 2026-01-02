/**
 * @fileoverview DuelRewardsService Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DuelRewardsService } from "../DuelRewardsService";
import { GameContextService } from "../../game/GameContextService";
import { PlayerContext } from "@/types/game";

// Mock GameContextService
vi.mock("../../game/GameContextService", () => ({
    GameContextService: {
        getPlayerContext: vi.fn(),
    },
}));

describe("DuelRewardsService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockBaseContext: Partial<PlayerContext> = {
        identity: { userId: "user-1", titanName: "Hero", archetype: "WARDEN", level: 10, archetypeName: "Warden" },
        modifiers: {
            xpGain: 1.0,
            goldGain: 1.0,
            lootLuck: 1.0,
            // ... others needed for type if strict, but mock handles it
        } as any
    };

    it("should calculate base rewards for a winner", async () => {
        // Arrange
        vi.mocked(GameContextService.getPlayerContext).mockResolvedValue(mockBaseContext as PlayerContext);

        // Act
        // Score 500 = +25 XP Bonus
        const result = await DuelRewardsService.calculateRewards("user-1", true, 500, 200);

        // Assert
        // Base Winner: 100 XP
        // Perf Bonus: 5 * (500/100) = 25 XP
        // Total: 125 XP
        expect(result.xp).toBe(125);
        expect(result.gold).toBe(50); // Base winner gold
    });

    it("should apply Close Match bonus (+20%)", async () => {
        // Arrange
        vi.mocked(GameContextService.getPlayerContext).mockResolvedValue(mockBaseContext as PlayerContext);

        // Act
        // 500 vs 480 is within 10%
        const result = await DuelRewardsService.calculateRewards("user-1", true, 500, 480);

        // Assert
        // Base Winner: 100 XP
        // Perf Bonus: 25 XP
        // Subtotal: 125 XP
        // Close Match Bonus: 125 * 1.2 = 150
        expect(result.xp).toBe(150);
        expect(result.bonuses).toContain("Close Match +20%");
    });

    it("should apply context modifiers (XP Boost & Gold Rush)", async () => {
        // Arrange
        const boostedContext = {
            ...mockBaseContext,
            modifiers: {
                ...mockBaseContext.modifiers,
                xpGain: 1.5, // +50% XP
                goldGain: 2.0 // +100% Gold
            }
        };
        vi.mocked(GameContextService.getPlayerContext).mockResolvedValue(boostedContext as any);

        // Act
        const result = await DuelRewardsService.calculateRewards("user-1", false, 100, 500);

        // Assert
        // Base Loser: 30 XP, 15 Gold
        // Perf Bonus: 5 XP (100 score)
        // Subtotal: 35 XP, 15 Gold

        // Multipliers
        // XP: 35 * 1.5 = 52.5 -> 53
        // Gold: 15 * 2.0 = 30

        expect(result.xp).toBe(53); // Rounding
        expect(result.gold).toBe(30);
        expect(result.bonuses).toContain("XP Boost x1.50");
        expect(result.bonuses).toContain("Gold Rush x2.00");
    });

    it("should trigger Lucky Loot with high Loot Luck", async () => {
        // Arrange
        const luckyContext = {
            ...mockBaseContext,
            modifiers: { lootLuck: 5.0 } // Insanely high luck to force proc in mock if possible, or we mock random
        };
        vi.mocked(GameContextService.getPlayerContext).mockResolvedValue(luckyContext as any);

        // Mock Math.random to ensure proc
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.01);

        // Act
        const result = await DuelRewardsService.calculateRewards("user-1", true, 1000, 500);

        // Assert
        // Base KE: 25
        // Doubled: 50
        expect(result.kineticEnergy).toBe(50);
        expect(result.bonuses).toContain("Lucky Loot! (2x KE)");

        randomSpy.mockRestore();
    });
});
