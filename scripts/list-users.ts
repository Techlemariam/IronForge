
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                heroName: true,
                subscriptionTier: true
            }
        });

        console.log(`Found ${users.length} users:`);
        users.forEach(u => console.log(`- ${u.email || 'No Email'} (ID: ${u.id}, Hero: ${u.heroName}) [${u.subscriptionTier}]`));

    } catch (e) {
        console.error("Error listing users:", e);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
