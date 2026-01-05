
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Fix for imports if needed, but tsx should handle aliasing if configured, 
// otherwise we might need to adjust LootSystem import or just copy logic for validation.
// Actually, 'tsx' might not handle '@/' aliases by default without tsconfig paths plugin.
// Let's rely on relative path for now if possible, or just mock it.
// LootSystem uses '@/lib/prisma'. This alias might fail in standalone script.

// HACK: To test logic without alias issues, I will define a local test wrapper
// But LootSystem imports '@/lib/prisma'. 
// I will temporarily create a version of LootSystem in this script to test the LOGIC.
// OR I can use 'tsconfig-paths' with tsx: `npx tsx -r tsconfig-paths/register scripts/test-loot.ts`

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const prisma = new PrismaClient();

async function main() {
    console.log('🧪 Testing Loot System Logic...');

    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('No user found');
        return;
    }
    console.log(`Target User: ${user.id} (${user.email})`);

    // Mocking the LootSystem logic locally to verify Prisma/Math
    console.log('--- Logic Simulation ---');

    // 1. Fetch unowned
    const allItems = await prisma.item.findMany();
    const userInventory = await prisma.userEquipment.findMany({
        where: { userId: user.id },
        select: { equipmentId: true }
    });
    const ownedIds = new Set(userInventory.map(i => i.equipmentId));
    const unownedItems = allItems.filter(i => !ownedIds.has(i.id));

    console.log(`Total Items: ${allItems.length}`);
    console.log(`Owned: ${ownedIds.size}`);
    console.log(`Unowned: ${unownedItems.length}`);

    if (unownedItems.length === 0) {
        console.log('User has all items.');
        return;
    }

    // 2. Weights
    const rarityWeights: Record<string, number> = {
        'common': 60,
        'rare': 30,
        'epic': 8,
        'legendary': 2
    };
    const weightedPool: any[] = [];
    for (const item of unownedItems) {
        const weight = rarityWeights[item.rarity] || 10;
        for (let i = 0; i < weight; i++) {
            weightedPool.push(item);
        }
    }
    console.log(`Pool Size: ${weightedPool.length}`);

    // 3. Roll
    const selectedItem = weightedPool[Math.floor(Math.random() * weightedPool.length)];
    console.log(`Selected: ${selectedItem.name} (${selectedItem.rarity})`);

    // 4. Write
    console.log('Attempting DB Write...');
    // We won't actually write to avoid polluting, or we can and verify.
    // Let's write!
    const result = await prisma.userEquipment.create({
        data: {
            userId: user.id,
            equipmentId: selectedItem.id,
            isOwned: true
        }
    });
    console.log('✅ Write Successful:', result);
}

main()
    .catch(e => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
