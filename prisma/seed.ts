
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting Seeding...')

    // --- 0. SEED REGIONS ---
    const regions = [
        {
            id: 'iron_forge',
            name: 'The Iron Forge',
            description: 'The starting grounds. Home of the novice titans.',
            levelReq: 1,
            coordX: 50,
            coordY: 80
        },
        {
            id: 'shadow_realms',
            name: 'Shadow Realms',
            description: 'A dark dimension where strength is tested.',
            levelReq: 10,
            coordX: 20,
            coordY: 40
        },
        {
            id: 'the_void',
            name: 'The Void',
            description: 'The end vs beginning. Only the elite survive.',
            levelReq: 20,
            coordX: 80,
            coordY: 20
        }
    ];

    for (const region of regions) {
        await prisma.worldRegion.upsert({
            where: { id: region.id },
            update: {
                name: region.name,
                description: region.description,
                levelReq: region.levelReq,
                coordX: region.coordX,
                coordY: region.coordY
            },
            create: region
        })
    }

    // --- 1. SEED MONSTERS ---
    const monsters = [
        {
            id: "monster_goblin_scout",
            name: "Goblin Scout",
            totalHp: BigInt(500),
            currentHp: BigInt(500),
            description: "A weak scout from the goblin tribes.",
            image: "/monsters/goblin.png",
            regionId: "iron_forge",
            levelReq: 1,
            rewards: ["xp:50", "gold:10"],
            isActive: true
        },
        {
            id: "monster_orc_warrior",
            name: "Orc Warrior",
            totalHp: BigInt(2000),
            currentHp: BigInt(2000),
            description: "A brute force of nature.",
            image: "/monsters/orc.png",
            regionId: "iron_forge",
            levelReq: 5,
            rewards: ["xp:200", "gold:50"],
            isActive: true
        },
        {
            id: "monster_void_walker",
            name: "Void Walker",
            totalHp: BigInt(10000),
            currentHp: BigInt(10000),
            description: "A creature born of pure darkness.",
            image: "/monsters/void.png",
            regionId: "the_void",
            levelReq: 15,
            rewards: ["xp:1000", "gold:250", "item:void_essence"],
            isActive: true
        }
    ]

    for (const monster of monsters) {
        await prisma.raidBoss.upsert({
            where: { id: monster.id },
            update: { regionId: monster.regionId, levelReq: monster.levelReq },
            create: monster
        })
    }

    // --- 2. SEED ACHIEVEMENTS (Logic-bound, but we can store definitions in code or a new table if we want. For now, we rely on code constants, but let's assume we might add an AchievementDefinition table later. Since it doesn't exist, we skip db seeding for it and rely on the Backend Service to check them.) ---

    console.log('✅ Seeding Complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
