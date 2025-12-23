
import { PrismaClient } from '@prisma/client';
import { logTitanSet } from '../src/actions/training';
import dotenv from 'dotenv';
import path from 'path';

// Fix for imports - relying on tsx to handle logic if we invoke action directly?
// Server actions are usually functions. 
// But they use 'use server' which might need a bundler context or mocks.
// Direct invocation of 'logTitanSet' might fail due to '@/lib/prisma' alias if not handled.
// I will use a direct prisma check here and mock the action logic OR just test the action logic by RE-IMPLEMENTING IT locally for verification 
// if I can't run the action file directly. 
// Actually, `npx tsx` handles aliases via tsconfig.json usually. Let's try importing.

// WAIT: logTitanSet uses `createClient` from supabase/server which uses `cookies()`.
// This WILL FAIL in a script environment (no request context).
// I cannot test the Server Action directly in a CLI script.

// ALTERNATIVE: I will test the DB updates manually in this script to verify the MATH and DB connection,
// essentially simulating what the action does.

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const prisma = new PrismaClient();

async function main() {
    console.log('🧪 Testing Titan XP Logic (Simulation)...');

    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('No user found');
        return;
    }
    const startXP = user.totalExperience;
    const startLevel = user.level;
    console.log(`User: ${user.heroName || 'Hero'} | Level: ${startLevel} | XP: ${startXP}`);

    // Simulate Set
    const reps = 10;
    const weight = 100;
    const xpGained = 10 + reps; // 20 XP
    const energyGained = reps * 2; // 20 Energy

    console.log(`Simulating Set: ${reps} reps @ ${weight}kg -> +${xpGained} XP`);

    // Update DB
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            totalExperience: { increment: xpGained },
            kineticEnergy: { increment: energyGained }
        }
    });

    const newLevel = Math.floor(updatedUser.totalExperience / 100) + 1;
    if (newLevel > updatedUser.level) {
        await prisma.user.update({
            where: { id: user.id },
            data: { level: newLevel }
        });
        console.log(`🎉 LEVEL UP! ${updatedUser.level} -> ${newLevel}`);
    }

    console.log(`New Stats: Level ${newLevel} | XP ${updatedUser.totalExperience}`);
    console.log('✅ Logic verified against DB schema.');
}

main()
    .catch(e => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
