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

    // Update the main E2E test user to have completed onboarding
    // This prevents the FirstLoginQuest overlay from blocking tests
    const testUserEmail = process.env.TEST_USER_EMAIL || 'alexander.teklemariam@gmail.com';
    await prisma.user.updateMany({
        where: { email: testUserEmail },
        data: { hasCompletedOnboarding: true }
    });
    console.log(`✅ Updated ${testUserEmail} with hasCompletedOnboarding: true`)

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
