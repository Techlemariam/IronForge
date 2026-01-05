import { PrismaClient, type _ChallengeType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to DB...");
        const count = await prisma.challenge.count();
        console.log("Existing Challenges:", count);

        if (count === 0) {
            console.log("Seeding Challenges...");
            const start = new Date();
            const end = new Date();
            end.setDate(end.getDate() + 7);

            await prisma.challenge.create({
                data: {
                    code: 'WEEKLY_VOL_1',
                    title: 'Heavy Lifter',
                    description: 'Accumulate 50,000 kg volume this week',
                    type: 'WEEKLY',
                    startDate: start,
                    endDate: end,
                    criteria: { metric: 'volume_kg', target: 50000, unit: 'kg' },
                    rewards: { xp: 500, gold: 100, kinetic: 50 }
                }
            });
            console.log("Seeded WEEKLY_VOL_1");
        }

        const challenges = await prisma.challenge.findMany();
        console.log("All Challenges:", JSON.stringify(challenges, null, 2));

    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
