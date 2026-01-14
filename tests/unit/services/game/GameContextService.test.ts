/**
 * @fileoverview GameContextService Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameContextService } from "@/services/game/GameContextService";
import { Archetype } from "@prisma/client";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
    default: {
        user: {
            findUnique: vi.fn(),
        },
        titan: {
            findUnique: vi.fn(),
        },
        userSkill: {
            findMany: vi.fn(),
        },
        userEquipment: {
            findMany: vi.fn(),
        },
        pvpProfile: {
            findUnique: vi.fn(),
        },
    },
}));

import prisma from "@/lib/prisma";

describe("GameContextService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getPlayerContext", () => {
        it("should return base modifiers for a user with no skills or buffs", async () => {
            // Arrange
            const mockUser = {
                id: "user-123",
                archetype: Archetype.WARDEN,
                level: 5,
                heroName: "TestHero",
            };

            vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
            vi.mocked(prisma.titan.findUnique).mockResolvedValue(null);
            vi.mocked(prisma.userSkill.findMany).mockResolvedValue([]);
            vi.mocked(prisma.userEquipment.findMany).mockResolvedValue([]);

            // Act
            const context = await GameContextService.getPlayerContext("user-123");

            // Assert
            expect(context.identity.archetype).toBe(Archetype.WARDEN);
            expect(context.identity.archetypeName).toBe("The Hybrid Warden");
            expect(context.modifiers.xpGain).toBeCloseTo(1.0, 2);
            expect(context.activeBuffs.length).toBeGreaterThan(0); // Archetype buff
        });

        it("should apply Juggernaut archetype modifiers (+20% attack power)", async () => {
            // Arrange
            const mockUser = {
                id: "user-456",
                archetype: Archetype.JUGGERNAUT,
                level: 10,
                heroName: "JuggernautPlayer",
            };

            vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
            vi.mocked(prisma.titan.findUnique).mockResolvedValue(null);
            vi.mocked(prisma.userSkill.findMany).mockResolvedValue([]);
            vi.mocked(prisma.userEquipment.findMany).mockResolvedValue([]);

            // Act
            const context = await GameContextService.getPlayerContext("user-456");

            // Assert
            expect(context.identity.archetype).toBe(Archetype.JUGGERNAUT);
            expect(context.modifiers.attackPower).toBeCloseTo(1.2, 2); // +20%
            expect(context.modifiers.stamina).toBeCloseTo(0.9, 2); // -10%
        });

        it("should apply Pathfinder archetype modifiers (+30% stamina)", async () => {
            // Arrange
            const mockUser = {
                id: "user-789",
                archetype: Archetype.PATHFINDER,
                level: 8,
                heroName: "PathfinderPlayer",
            };

            vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
            vi.mocked(prisma.titan.findUnique).mockResolvedValue(null);
            vi.mocked(prisma.userSkill.findMany).mockResolvedValue([]);
            vi.mocked(prisma.userEquipment.findMany).mockResolvedValue([]);

            // Act
            const context = await GameContextService.getPlayerContext("user-789");

            // Assert
            expect(context.identity.archetype).toBe(Archetype.PATHFINDER);
            expect(context.modifiers.stamina).toBeCloseTo(1.3, 2); // +30%
            expect(context.modifiers.attackPower).toBeCloseTo(0.9, 2); // -10%
        });
        it("should apply Equipment modifiers (Power + Special Effects)", async () => {
            // Arrange
            const mockUser = {
                id: "user-equip",
                archetype: Archetype.JUGGERNAUT,
                level: 10,
                heroName: "EquippedHero",
            };

            const mockEquipment = [
                {
                    equipmentId: "item-1",
                    equipped: true,
                    item: {
                        id: "item-1",
                        name: "Exo-Skeleton Legs",
                        power: 100,
                        description: "Legs go brrr",
                    }
                },
                {
                    equipmentId: "item-2",
                    equipped: true,
                    item: {
                        id: "item-2",
                        name: "Iron Dumbbell",
                        power: 10,
                        description: "Heavy thing",
                    }
                }
            ];

            vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
            vi.mocked(prisma.titan.findUnique).mockResolvedValue({ strength: 20, vitality: 20 } as any);
            vi.mocked(prisma.userSkill.findMany).mockResolvedValue([]);
            vi.mocked(prisma.userEquipment.findMany).mockResolvedValue(mockEquipment as any);

            // Act
            const context = await GameContextService.getPlayerContext("user-equip");

            // Assert
            // 1. Check Identity
            expect(context.identity.archetype).toBe(Archetype.JUGGERNAUT);

            // 2. Check Modifiers (Exo-Skeleton Legs give +20% Strength XP)
            expect(context.modifiers.strengthXp).toBeCloseTo(1.2, 2);

            // 3. Check Buffs
            const legBuff = context.activeBuffs.find(b => b.name === "Exo-Skeleton Legs");
            expect(legBuff).toBeDefined();
            expect(legBuff?.source).toBe("EQUIPMENT");

            // 4. Check Combat Stats
            // Base Damage = 10 + Strength(20) + Items(110) = 140
            // Juggernaut Attack Multiplier = 1.2
            // Effective Attack = 140 * 1.2 = 168
            expect(context.combat.effectiveAttack).toBe(168);
        });
    });

    it("should apply PvP Gladiator modifiers (Rank 1500+)", async () => {
        // Arrange
        const mockUser = { id: "user-pvp", archetype: Archetype.JUGGERNAUT };
        const mockPvp = { rankScore: 1600 }; // Gladiator

        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
        vi.mocked(prisma.titan.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.userSkill.findMany).mockResolvedValue([]);
        vi.mocked(prisma.userEquipment.findMany).mockResolvedValue([]);
        vi.mocked(prisma.pvpProfile.findUnique).mockResolvedValue(mockPvp as any);

        // Act
        const context = await GameContextService.getPlayerContext("user-pvp");

        // Assert
        // Juggernaut (1.2) * Gladiator (1.05) = 1.26
        expect(context.modifiers.attackPower).toBeCloseTo(1.26, 2);
        // Base 0.05 + Gladiator 0.02 = 0.07
        expect(context.modifiers.critChance).toBeCloseTo(0.07, 2);

        const buff = context.activeBuffs.find(b => b.id === "pvp_gladiator");
        expect(buff).toBeDefined();
        expect(buff?.source).toBe("PVP");
    });
});

describe("calculateXpReward", () => {
    it("should apply unified XP multiplier from context", () => {
        // Arrange
        const mockContext = {
            identity: {
                userId: "test",
                archetype: Archetype.WARDEN,
                archetypeName: "The Hybrid Warden",
                level: 5,
                titanName: "Test",
            },
            modifiers: {
                xpGain: 1.5, // +50% from buffs
                strengthXp: 1.0,
                cardioXp: 1.0,
                goldGain: 1.0,
                lootLuck: 1.0,
                titanLoad: 1.0,
                mrvScale: 1.0,
                recoverySpeed: 1.0,
                attackPower: 1.0,
                defense: 1.0,
                critChance: 0.05,
                stamina: 1.0,
            },
            activeBuffs: [
                {
                    id: "oracle_buff",
                    source: "ORACLE" as const,
                    name: "Oracle Blessing",
                    description: "XP blessing",
                    modifiers: { xpGain: 1.5 },
                },
            ],
            combat: {
                effectiveAttack: 10,
                effectiveDefense: 5,
                damagePerVolume: 0.1,
                critMultiplier: 1.5,
            },
            raw: {
                unlockedSkillIds: [],
                equippedItemIds: [],
            },
        };

        // Act
        const result = GameContextService.calculateXpReward(100, mockContext as any);

        // Assert
        expect(result.finalXp).toBe(150); // 100 * 1.5
        expect(result.appliedMultiplier).toBe(1.5);
        expect(result.appliedBuffs).toContain("Oracle Blessing");
    });
});

