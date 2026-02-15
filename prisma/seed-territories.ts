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
    console.log('🌱 Seeding Territories (Robust Mode)...');

    const territories = [
        {
            name: 'Iron Forge',
            region: 'Central',
            type: 'FORTRESS',
            coordX: 0,
            coordY: 0,
            bonuses: { xp: 10, gold: 5 },
        },
        {
            name: 'Shadow Basin',
            region: 'South',
            type: 'RESOURCE_NODE',
            coordX: -10,
            coordY: -15,
            bonuses: { xp: 10, kinetic: 5 },
        },
        {
            name: 'Azure Peak',
            region: 'North',
            type: 'TRAINING_GROUNDS',
            coordX: 15,
            coordY: 20,
            bonuses: { xp: 10, recovery: 5 },
        },
    ];

    for (const t of territories) {
        const existing = await prisma.territory.findFirst({
            where: { name: t.name }
        });

        if (existing) {
            await prisma.territory.update({
                where: { id: existing.id },
                data: {
                    region: t.region,
                    type: t.type as any,
                    coordX: t.coordX,
                    coordY: t.coordY,
                    bonuses: t.bonuses,
                }
            });
            console.log(`✅ Territory ${t.name} updated.`);
        } else {
            await prisma.territory.create({
                data: {
                    name: t.name,
                    region: t.region,
                    type: t.type as any,
                    coordX: t.coordX,
                    coordY: t.coordY,
                    bonuses: t.bonuses,
                },
            });
            console.log(`✅ Territory ${t.name} created.`);
        }
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
