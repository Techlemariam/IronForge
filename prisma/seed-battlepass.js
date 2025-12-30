
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Battle Pass Season 1...');

    // 1. Create Season
    const season = await prisma.battlePassSeason.upsert({
        where: { code: 'SEASON_1' },
        update: {},
        create: {
            name: 'Season 1: Genesis',
            code: 'SEASON_1',
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
            isActive: true,
        },
    });

    console.log('Season created:', season.id);

    // 2. Create Tiers (1-10)
    for (let i = 1; i <= 10; i++) {
        const requiredXp = i * 100; // 100, 200, 300...

        // Example rewards
        const freeRewardData = i % 2 !== 0 ? { type: 'GOLD', amount: 100 } : null; // Odd levels get free gold
        const premiumRewardData = { type: 'GOLD', amount: 500 }; // Every level premium gets 500 gold

        await prisma.battlePassTier.upsert({
            where: {
                seasonId_tierLevel: {
                    seasonId: season.id,
                    tierLevel: i,
                },
            },
            update: {},
            create: {
                seasonId: season.id,
                tierLevel: i,
                requiredXp,
                freeRewardData: freeRewardData || undefined,
                premiumRewardData,
            },
        });
    }

    console.log('Tiers seeded.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
