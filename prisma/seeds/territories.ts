import { prisma } from "../../src/lib/prisma";

/**
 * Seed initial territories for the Guild Territories feature
 */
export async function seedTerritories() {
    const territories = [
        // Iron Peaks (Training Grounds - XP bonuses)
        {
            name: "Summit Arena",
            region: "Iron Peaks",
            type: "TRAINING_GROUNDS" as const,
            bonuses: { xpBonus: 0.05 },
            coordX: 20,
            coordY: 15,
        },
        {
            name: "Titan's Training Hall",
            region: "Iron Peaks",
            type: "TRAINING_GROUNDS" as const,
            bonuses: { xpBonus: 0.08 },
            coordX: 25,
            coordY: 20,
        },
        {
            name: "Forge Grounds",
            region: "Iron Peaks",
            type: "FORTRESS" as const,
            bonuses: { defenseBonus: 0.05, xpBonus: 0.02 },
            coordX: 30,
            coordY: 10,
        },

        // Golden Wastes (Resource Nodes - Gold bonuses)
        {
            name: "Gold Quarry",
            region: "Golden Wastes",
            type: "RESOURCE_NODE" as const,
            bonuses: { goldBonus: 0.1 },
            coordX: 50,
            coordY: 40,
        },
        {
            name: "Merchant's Crossing",
            region: "Golden Wastes",
            type: "RESOURCE_NODE" as const,
            bonuses: { goldBonus: 0.08 },
            coordX: 55,
            coordY: 45,
        },
        {
            name: "Oasis Outpost",
            region: "Golden Wastes",
            type: "TRAINING_GROUNDS" as const,
            bonuses: { xpBonus: 0.03, goldBonus: 0.03 },
            coordX: 60,
            coordY: 35,
        },

        // Frozen Wastes (Mixed)
        {
            name: "Frostborn Keep",
            region: "Frozen Wastes",
            type: "FORTRESS" as const,
            bonuses: { defenseBonus: 0.1 },
            coordX: 75,
            coordY: 20,
        },
        {
            name: "Ice Cavern Mines",
            region: "Frozen Wastes",
            type: "RESOURCE_NODE" as const,
            bonuses: { goldBonus: 0.06 },
            coordX: 80,
            coordY: 25,
        },

        // Shadowlands (High-risk, high-reward)
        {
            name: "Shadow Coliseum",
            region: "Shadowlands",
            type: "TRAINING_GROUNDS" as const,
            bonuses: { xpBonus: 0.12 },
            coordX: 40,
            coordY: 70,
        },
        {
            name: "Dark Treasury",
            region: "Shadowlands",
            type: "RESOURCE_NODE" as const,
            bonuses: { goldBonus: 0.15 },
            coordX: 45,
            coordY: 75,
        },

        // Emerald Highlands (Balanced)
        {
            name: "Evergreen Training Grounds",
            region: "Emerald Highlands",
            type: "TRAINING_GROUNDS" as const,
            bonuses: { xpBonus: 0.05 },
            coordX: 15,
            coordY: 55,
        },
        {
            name: "Highland Fortress",
            region: "Emerald Highlands",
            type: "FORTRESS" as const,
            bonuses: { defenseBonus: 0.07, xpBonus: 0.02 },
            coordX: 20,
            coordY: 60,
        },
    ];

    console.log("Seeding territories...");

    for (const territory of territories) {
        await prisma.territory.upsert({
            where: {
                id: `territory_${territory.name.toLowerCase().replace(/\s+/g, "_")}`,
            },
            update: territory,
            create: {
                id: `territory_${territory.name.toLowerCase().replace(/\s+/g, "_")}`,
                ...territory,
            },
        });
    }

    console.log(`Seeded ${territories.length} territories`);
}

// Allow running directly
// ESM compatible main check
import { fileURLToPath } from 'url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    seedTerritories()
        .then(async () => {
            await prisma.$disconnect();
        })
        .catch(async (e) => {
            console.error(e);
            await prisma.$disconnect();
            process.exit(1);
        });
}
