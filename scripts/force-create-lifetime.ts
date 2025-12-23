
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function forceCreateLifetime(id: string, email: string) {
    if (!id || !email) {
        console.error("Usage: npx tsx scripts/force-create-lifetime.ts <UUID> <EMAIL>");
        process.exit(1);
    }

    console.log(`Force-creating/updating user:`);
    console.log(`ID: ${id}`);
    console.log(`Email: ${email}`);

    try {
        const user = await prisma.user.upsert({
            where: { id: id },
            update: {
                subscriptionTier: 'LIFETIME',
                subscriptionStatus: 'active',
                subscriptionExpiry: null,
            },
            create: {
                id: id,
                email: email,
                heroName: email.split('@')[0], // Default hero name
                subscriptionTier: 'LIFETIME',
                subscriptionStatus: 'active',
                subscriptionExpiry: null,
                updatedAt: new Date(),
            },
        });

        console.log("------------------------------------------------");
        console.log(`✅ SUCCESS! User ${user.email} (ID: ${user.id}) is now a LIFETIME member.`);
        console.log("------------------------------------------------");

    } catch (e) {
        console.error("Error creating/updating user:", e);
    } finally {
        await prisma.$disconnect();
    }
}

const idArg = process.argv[2];
const emailArg = process.argv[3];
forceCreateLifetime(idArg, emailArg);
