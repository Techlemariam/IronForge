import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("Neither DIRECT_URL nor DATABASE_URL is defined");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding Territories...');

    const territories = [
        {
            name: 'Iron Forge',
            region: 'Central',
            type: 'Industrial',
            coordX: 0,
            coordY: 0,
            bonuses: { xp: 10, gold: 5 },
        },
        {
            name: 'Shadow Basin',
            region: 'South',
            type: 'Darkness',
            coordX: -10,
            coordY: -15,
            bonuses: { xp: 10, kinetic: 5 },
        },
        {
            name: 'Azure Peak',
            region: 'North',
            type: 'Highland',
            coordX: 15,
            coordY: 20,
            bonuses: { xp: 10, recovery: 5 },
        },
    ];

    for (const t of territories) {
        await prisma.territory.upsert({
            where: { name: t.name },
            update: {},
            create: {
                name: t.name,
                region: t.region,
                type: t.type,
                coordX: t.coordX,
                coordY: t.coordY,
                bonuses: t.bonuses,
            },
        });
        console.log(`✅ Territory ${t.name} seeded.`);
    }

    console.log('✨ Seed complete.');
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
