
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function grantLifetime(email: string) {
    if (!email) {
        console.error("Please provide an email address.");
        process.exit(1);
    }

    console.log(`Searching for user with email: ${email}...`);

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        console.log(`Found user: ${user.id} (${user.email})`);
        console.log(`Current Tier: ${user.subscriptionTier}`);

        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                subscriptionTier: 'LIFETIME',
                subscriptionStatus: 'active',
                subscriptionExpiry: null, // Lifetime has no expiry
            },
        });

        console.log("------------------------------------------------");
        console.log(`✅ SUCCESS! User ${updatedUser.email} is now a LIFETIME member.`);
        console.log("------------------------------------------------");

    } catch (e) {
        console.error("Error updating user:", e);
    } finally {
        await prisma.$disconnect();
    }
}

const emailArg = process.argv[2];
grantLifetime(emailArg);
