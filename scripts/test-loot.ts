
import 'tsconfig-paths/register';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { LootSystem } from '@/services/game/LootSystem';
import prisma from '@/lib/prisma';

async function main() {
    console.log('🧪 Testing Loot System Logic...');

    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('No user found');
        return;
    }
    console.log(`Target User: ${user.id} (${user.email})`);

    console.log('--- Testing LootSystem.rollForLoot ---');

    const result = await LootSystem.rollForLoot(user.id);
    if (result) {
        console.log(`✅ Roll Successful. Loot obtained: ${result.name} (${result.rarity})`);
    } else {
        console.log('❌ No loot obtained or user already has all items.');
    }
}

main()
    .catch(e => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
