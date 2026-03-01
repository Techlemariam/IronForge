import prisma from "@/lib/prisma";
import { ProgressionService } from "./progression";
import { getGuildTerritoryBonusesAction } from "@/actions/systems/territories";

export type LootDrop = {
    type: "GOLD" | "ENERGY" | "ITEM" | "NOTHING";
    amount?: number;
    itemRarity?: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
    message: string;
};

// Variable Reward Loot Table probabilities
const LOOT_TABLE = [
    { weight: 50, type: "GOLD", amount: [50, 200] },
    { weight: 20, type: "ENERGY", amount: [10, 50] },
    { weight: 15, type: "ITEM", rarity: "COMMON" },
    { weight: 5, type: "ITEM", rarity: "UNCOMMON" },
    { weight: 2, type: "ITEM", rarity: "RARE" },
    { weight: 0.5, type: "ITEM", rarity: "EPIC" },
    { weight: 0.1, type: "ITEM", rarity: "LEGENDARY" },
    { weight: 7.4, type: "NOTHING" }, // 7.4% chance of nothing
];

export const LootService = {
    /**
     * Rolls on the drop table and awards the user
     */
    async rollWorkoutLoot(userId: string): Promise<LootDrop> {
        const totalWeight = LOOT_TABLE.reduce((sum, item) => sum + item.weight, 0);
        let randomNum = Math.random() * totalWeight;

        let selectedLoot = LOOT_TABLE[0];
        for (const loot of LOOT_TABLE) {
            if (randomNum < loot.weight) {
                selectedLoot = loot;
                break;
            }
            randomNum -= loot.weight;
        }

        if (selectedLoot.type === "NOTHING") {
            return { type: "NOTHING", message: "No extra loot this time." };
        }

        if (selectedLoot.type === "GOLD" && selectedLoot.amount) {
            let amount = Math.floor(
                Math.random() * (selectedLoot.amount[1] - selectedLoot.amount[0] + 1) +
                selectedLoot.amount[0]
            );

            // Apply Guild Territory Bonus
            try {
                const user = await prisma.user.findUnique({ where: { id: userId }, select: { guildId: true } });
                if (user?.guildId) {
                    const bonuses = await getGuildTerritoryBonusesAction(user.guildId);
                    if (bonuses.goldBonus > 0) {
                        amount = Math.floor(amount * (1 + bonuses.goldBonus));
                    }
                }
            } catch (e) {
                console.error("Failed to apply guild gold bonus:", e);
            }

            await ProgressionService.awardGold(userId, amount);
            return { type: "GOLD", amount, message: `Found ${amount} Gold!` };
        }

        if (selectedLoot.type === "ENERGY" && selectedLoot.amount) {
            const amount = Math.floor(
                Math.random() * (selectedLoot.amount[1] - selectedLoot.amount[0] + 1) +
                selectedLoot.amount[0]
            );
            await prisma.titan.update({
                where: { userId },
                data: { currentEnergy: { increment: amount } },
            });
            return { type: "ENERGY", amount, message: `Recovered ${amount} Energy!` };
        }

        if (selectedLoot.type === "ITEM" && selectedLoot.rarity) {
            // Find a random item of this rarity
            const possibleItems = await prisma.item.findMany({
                where: { rarity: selectedLoot.rarity },
            });

            if (possibleItems.length > 0) {
                const item =
                    possibleItems[Math.floor(Math.random() * possibleItems.length)];

                await prisma.userEquipment.upsert({
                    where: { userId_equipmentId: { userId, equipmentId: item.id } },
                    create: { userId, equipmentId: item.id, isOwned: true },
                    update: {},
                });

                return {
                    type: "ITEM",
                    itemRarity: selectedLoot.rarity as any,
                    message: `Looted a ${selectedLoot.rarity} Item: ${item.name}!`,
                };
            } else {
                // Fallback if no item of rarity exists
                return { type: "NOTHING", message: "No extra loot this time." };
            }
        }

        return { type: "NOTHING", message: "No extra loot this time." };
    },
};
