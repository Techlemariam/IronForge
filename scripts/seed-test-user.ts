"use server";
/**
 * Script to seed the test user for E2E tests.
 * Run with: npx tsx scripts/seed-test-user.ts
 */
import { prisma } from "../src/lib/prisma";

async function main() {
    const testEmail = "alexander.teklemariam@gmail.com";
    // Use the actual Supabase Auth UID (found in Supabase Dashboard > Auth > Users)
    const testUserId = "d73e110f-67b5-4320-9fe8-e82b24c776f8";

    console.log(`🌱 Seeding test user: ${testEmail}`);

    // Delete old user if exists with wrong ID
    const existing = await prisma.user.findUnique({ where: { email: testEmail } });
    if (existing && existing.id !== testUserId) {
        console.log(`🗑️ Deleting old user with wrong ID: ${existing.id}`);
        await prisma.titan.deleteMany({ where: { userId: existing.id } });
        await prisma.user.delete({ where: { id: existing.id } });
    }

    // Upsert User with correct Supabase Auth UID
    const user = await prisma.user.upsert({
        where: { email: testEmail },
        update: {},
        create: {
            id: testUserId,
            email: testEmail,
            heroName: "E2E Test Hero",
            gold: 1000,
            level: 5,
            totalExperience: 5000,
            kineticEnergy: 100,
        },
    });

    console.log(`✅ User created/found: ${user.id}`);

    // Upsert Titan
    const titan = await prisma.titan.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            name: "Test Titan",
            strength: 10,
            endurance: 10,
            agility: 10,
            vitality: 10,
            willpower: 10,
            xp: 1000,
            level: 5,
        },
    });

    console.log(`✅ Titan created/found: ${titan.id}`);

    console.log("🎉 Test user seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
