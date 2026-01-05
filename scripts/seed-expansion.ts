
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

const ITEMS = [
    { name: 'Iron Dumbbell', type: 'weapon', rarity: 'common', description: 'Standard issue resistance training equipment.', power: 10, locked: false },
    { name: 'Nano-Fiber Shirt', type: 'armor', rarity: 'rare', description: 'Sweat-wicking polymers with cooling tech.', power: 25, locked: false },
    { name: 'Heart Rate Monitor', type: 'accessory', rarity: 'epic', description: 'Advanced biometrics tracking uplink.', power: 45, locked: false },
    { name: 'Exo-Skeleton Legs', type: 'armor', rarity: 'legendary', description: 'Classified prototype. Enhance squat max by 20%.', power: 100, locked: true },
    { name: 'Protein Synthesizer', type: 'accessory', rarity: 'rare', description: 'Optimizes recovery window efficiency.', power: 30, locked: true },
];

const MONSTERS = [
    {
        name: 'Iron Golem',
        title: 'Guardian of the Forge',
        difficulty: 'Medium',
        type: 'Construct',
        description: 'A hulking mass of animate iron, powered by a molten core. Its defenses are nearly impenetrable to standard attacks.',
        stats: { strength: 80, endurance: 90, agility: 20 },
        weakness: 'High-Tempo Interval Attacks',
        defeated: true
    },
    {
        name: 'Void Runner',
        title: 'Shadow of Fatigue',
        difficulty: 'Hard',
        type: 'Demon',
        description: 'A shadowy entity that feeds on lactic acid. It chases runners until they collapse from exhaustion.',
        stats: { strength: 40, endurance: 95, agility: 90 },
        weakness: 'Zone 2 Persistence',
        defeated: false
    },
    {
        name: 'The Plate Hoarder',
        title: 'Greed Incarnate',
        difficulty: 'Easy',
        type: 'Undead',
        description: 'A fallen warrior who refused to re-rack weights. Now cursed to carry them for eternity.',
        stats: { strength: 60, endurance: 30, agility: 10 },
        weakness: 'Proper Form & Etiquette',
        defeated: true
    },
    {
        name: 'Chronos Tyrant',
        title: 'Lord of Time Under Tension',
        difficulty: 'Extreme',
        type: 'Construct',
        description: 'Time slows down in its presence. Every rep feels like an eternity.',
        stats: { strength: 95, endurance: 85, agility: 40 },
        weakness: 'Explosive Power',
        defeated: false
    },
];

async function main() {
    console.log('🌱 Seeding IronForge Expansion Content...');

    // 1. Seed Items
    console.log('   - Seeding Items...');
    for (const item of ITEMS) {
        await prisma.item.upsert({
            where: { id: item.name.toLowerCase().replace(/\s+/g, '-') }, // Hacky ID generation for stability or just let it create new ones?
            // Actually, let's look up by name to avoid duplicates if we run this multiple times
            update: {},
            create: {
                name: item.name,
                type: item.type,
                rarity: item.rarity,
                description: item.description,
                power: item.power,
                // We don't store "locked" on the Item definition, that's user state.
                // But for the purpose of the demo, we assume all users start with some unlocks.
            }
        }).catch(async () => {
            // Fallback if upsert by ID fails (since we didn't provide ID in create), we search by Name
            const existing = await prisma.item.findFirst({ where: { name: item.name } });
            if (!existing) {
                await prisma.item.create({
                    data: {
                        name: item.name,
                        type: item.type,
                        rarity: item.rarity,
                        description: item.description,
                        power: item.power,
                    }
                });
            }
        });
    }

    // 2. Seed Monsters
    console.log('   - Seeding Monsters...');
    for (const monster of MONSTERS) {
        const existing = await prisma.monster.findFirst({ where: { name: monster.name } });
        if (!existing) {
            await prisma.monster.create({
                data: {
                    name: monster.name,
                    title: monster.title,
                    difficulty: monster.difficulty,
                    type: monster.type,
                    description: monster.description,
                    stats: monster.stats,
                    weakness: monster.weakness
                }
            });
        }
    }

    // 3. Grant Initial Items/Unlocks to ALL users (for demo/dev)
    console.log('   - Granting Starter Gear to Users...');
    const users = await prisma.user.findMany();
    const allItems = await prisma.item.findMany();
    const commonItems = allItems.filter(i => ['Iron Dumbbell', 'Nano-Fiber Shirt', 'Heart Rate Monitor'].includes(i.name)); // Treat these as starter/unlocked
    // const _otherItems = allItems.filter(i => !['Iron Dumbbell', 'Nano-Fiber Shirt', 'Heart Rate Monitor'].includes(i.name));

    const allMonsters = await prisma.monster.findMany();
    const defeatedMonsters = allMonsters.filter(m => ['Iron Golem', 'The Plate Hoarder'].includes(m.name));

    for (const user of users) {
        // Grant Unlocked Items
        for (const item of commonItems) {
            await prisma.userEquipment.upsert({
                where: { userId_equipmentId: { userId: user.id, equipmentId: item.id } },
                update: {},
                create: { userId: user.id, equipmentId: item.id, isOwned: true }
            });
        }

        // Grant "Locked" items (isOwned=false? No, if row doesn't exist it is locked. Or we can have "isOwned=false" to show it exists?)
        // The UI logic was: "filteredItems.map...".
        // In the new DB logic:
        // getUserItems() -> returns UserEquipment[] (owned items)
        // getAllItems() -> returns Item[]
        // Frontend logic will be: Locked if item.id is NOT in userItems.
        // So we don't need to create rows for restricted items.

        // Grant Defeated Monsters
        for (const monster of defeatedMonsters) {
            await prisma.unlockedMonster.upsert({
                where: { userId_monsterId: { userId: user.id, monsterId: monster.id } },
                update: {},
                create: { userId: user.id, monsterId: monster.id, kills: 1 }
            });
        }
    }

    console.log('✅ Seeding Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
