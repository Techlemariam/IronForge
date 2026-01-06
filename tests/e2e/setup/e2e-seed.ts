
import { PrismaClient, Faction, Archetype } from '@prisma/client';
import { Pool as PgPool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma 7 requires explicit adapter configuration
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
const pool = new PgPool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting E2E Database Seeding...');

    // 1. Seed Battle Pass Season
    const seasonCode = 'SEASON_1';
    console.log(`Checking Battle Pass Season: ${seasonCode}`);

    const season = await prisma.battlePassSeason.upsert({
        where: { code: seasonCode },
        update: {},
        create: {
            name: 'Season 1: Genesis',
            code: seasonCode,
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
            isActive: true,
            tiers: {
                create: Array.from({ length: 50 }).map((_, i) => ({
                    tierLevel: i + 1,
                    requiredXp: (i + 1) * 1000,
                    freeRewardData: { type: 'GOLD', amount: 100 },
                    premiumRewardData: { type: 'ITEM', itemId: `reward-${i + 1}` }
                }))
            }
        }
    });
    console.log(`✅ Battle Pass Season ensured: ${season.id}`);

    // 2. Seed Mock Opponents for Duels
    // Create a few users with Titans of different levels
    const opponents = [
        { email: 'opponent1@ironforge.gg', name: 'Iron Breaker', level: 5, power: 500 },
        { email: 'opponent2@ironforge.gg', name: 'Steel Viper', level: 10, power: 1200 },
        { email: 'opponent3@ironforge.gg', name: 'Shadow Walker', level: 15, power: 1800 }
    ];

    for (const opp of opponents) {
        const user = await prisma.user.upsert({
            where: { email: opp.email },
            update: {
                titan: {
                    update: {
                        level: opp.level,
                        powerRating: opp.power,
                        currentHp: 100,
                        maxHp: 100,
                        strength: 10 + opp.level,
                        endurance: 10 + opp.level
                    }
                }
            },
            create: {
                email: opp.email,
                heroName: opp.name,
                level: opp.level,
                faction: Faction.HORDE,
                archetype: Archetype.JUGGERNAUT,
                titan: {
                    create: {
                        name: `${opp.name}'s Titan`,
                        level: opp.level,
                        powerRating: opp.power,
                        strength: 10 + opp.level,
                        endurance: 10 + opp.level
                    }
                }
            }
        });
        console.log(`✅ Ensured opponent: ${opp.name} (Lvl ${opp.level}) - ID: ${user.id}`);
    }

    console.log('🌱 Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
