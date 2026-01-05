import 'dotenv/config'
import { prisma } from "../lib/prisma"

async function main() {
    console.log('🌱 Seeding E2E Targets...')

    // Create a few mock users with Titans
    const mockUsers = [
        {
            id: 'e2e-opponent-1',
            heroName: 'Doomslayer',
            email: 'doom@example.com',
            level: 10,
            faction: 'HORDE' as const,
            titan: {
                create: {
                    name: 'Doomslayer',
                    powerRating: 50,
                }
            }
        },
        {
            id: 'e2e-opponent-2',
            heroName: 'Iron Maiden',
            email: 'maiden@example.com',
            level: 15,
            faction: 'ALLIANCE' as const,
            titan: {
                create: {
                    name: 'Iron Maiden',
                    powerRating: 80,
                }
            }
        }
    ]

    for (const u of mockUsers) {
        await prisma.user.upsert({
            where: { id: u.id },
            update: {},
            create: {
                ...u,
                titan: u.titan
            }
        })
    }

    // Create common exercises for strength logging
    const exercises = [
        { id: 'ex-squat', name: 'Barbell Squat', muscleGroup: 'Quads', equipment: 'Barbell' },
        { id: 'ex-bench', name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
        { id: 'ex-deadlift', name: 'Deadlift', muscleGroup: 'Back', equipment: 'Barbell' }
    ]

    for (const ex of exercises) {
        await prisma.exercise.upsert({
            where: { id: ex.id },
            update: {},
            create: ex
        })
    }

    // Seed Active Battle Pass Season
    const activeSeason = await prisma.battlePassSeason.upsert({
        where: { code: 'SEASON_1_E2E' },
        update: { isActive: true },
        create: {
            code: 'SEASON_1_E2E',
            name: 'Season 1: Awakening',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            isActive: true,
            tiers: {
                create: Array.from({ length: 10 }).map((_, i) => ({
                    tierLevel: i + 1,
                    requiredXp: (i + 1) * 1000,
                    freeRewardData: i % 2 === 0 ? { type: 'GOLD', amount: 100 } : undefined,
                    premiumRewardData: { type: 'GOLD', amount: 500 }
                }))
            }
        }
    });
    console.log(`✅ Seeded Battle Pass Season: ${activeSeason.name}`);

    // Update the main E2E test user to have completed onboarding
    // This prevents the FirstLoginQuest overlay from blocking tests
    const testUserEmail = process.env.TEST_USER_EMAIL || 'alexander.teklemariam@gmail.com';
    const testUser = await prisma.user.findFirst({
        where: { email: testUserEmail },
    });

    if (testUser) {
        await prisma.user.update({
            where: { id: testUser.id },
            data: { hasCompletedOnboarding: true }
        });

        // Ensure test user has a Titan with a valid power rating for matchmaking
        await prisma.titan.upsert({
            where: { userId: testUser.id },
            update: { powerRating: 60 },
            create: {
                userId: testUser.id,
                name: testUser.heroName || 'Test Titan',
                powerRating: 60, // Within range of seeded opponents (50, 80)
            }
        });
        console.log(`✅ Updated ${testUserEmail} with hasCompletedOnboarding: true and Titan powerRating: 60`);
    } else {
        console.log(`⚠️ Test user ${testUserEmail} not found - skipping onboarding update`);
    }

    console.log('✅ E2E Seeding Complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
