import { PrismaClient } from '@prisma/client';
import { Pool as PgPool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
}

const pool = new PgPool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter: adapter as any });

async function main() {
    console.log('🌱 Seeding Monsters...');

    const monsters = [
        {
            id: 'monster_goblin_king',
            name: 'The Goblin King',
            title: 'Ruler of the Rusted Throne',
            description: 'A grotesque, powerful goblin king sitting on a throne of rusted iron and bone.',
            type: 'Goblinoid',
            difficulty: 'HARD',
            level: 10,
            hp: 5000,
            image: '/assets/game/bosses/goblin_king.png',
            stats: {
                strength: 40,
                vitality: 50,
                endurance: 30,
                agility: 20,
                willpower: 25
            }
        },
        {
            id: 'monster_iron_golem',
            name: 'Iron Golem',
            title: 'Guardian of the Forge',
            description: 'A massive construct of enchanted iron, built to protect the sacred forge.',
            type: 'Construct',
            difficulty: 'MEDIUM',
            level: 5,
            hp: 2000,
            image: '/assets/game/bosses/iron_golem.png',
            stats: {
                strength: 60,
                vitality: 80,
                endurance: 40,
                agility: 5,
                willpower: 10
            }
        }
    ];

    for (const monster of monsters) {
        await prisma.monster.upsert({
            where: { id: monster.id },
            update: monster,
            create: monster,
        });
    }

    console.log('✅ Monsters Seeded!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
