'use server'

import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export type RegionId = 'iron_forge' | 'shadow_realms' | 'the_void';

export interface WorldRegion {
    id: RegionId;
    name: string;
    description: string;
    levelReq: number;
    coordinates: { x: number; y: number }; // For map placement (0-100 scale)
    isUnlocked: boolean;
}

export async function getWorldStateAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { level: true, heroName: true }
    });

    if (!dbUser) return null;

    const allRegions = await prisma.worldRegion.findMany();

    const regionsWithState: WorldRegion[] = allRegions.map((region: any) => {
        const isUnlocked = dbUser.level >= region.levelReq;
        const isObscured = dbUser.level < region.levelReq - 5; // e.g. Lvl 1 user vs Lvl 10 region = 1 < 5? No. Lvl 20 = 1 < 15? Yes.

        return {
            id: region.id as RegionId,
            name: isObscured ? '???' : region.name,
            description: isObscured ? 'Too dangerous to perceive.' : region.description,
            levelReq: region.levelReq,
            coordinates: { x: region.coordX, y: region.coordY },
            isUnlocked
        }
    });

    return {
        regions: regionsWithState,
        userLevel: dbUser.level
    };
}

export async function getRegionBossAction(regionId: string) {
    // Find the boss with the lowest levelReq that is still higher than dynamic scaling? 
    // Or just the "Primary" boss.
    // For now: Find the first active boss in the region.
    const boss = await prisma.raidBoss.findFirst({
        where: {
            regionId: regionId,
            isActive: true
        },
        orderBy: {
            levelReq: 'asc' // Start with the easiest
        }
    });

    return boss;
}

export async function getBestiaryAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { monsters: [] };

    // 1. Get all base monsters (RaidBosses)
    const allMonsters = await prisma.raidBoss.findMany({
        where: { isActive: true },
        select: {
            id: true,
            name: true,
            description: true,
            image: true,
            regionId: true,
            levelReq: true,
            rewards: true
        }
    });

    // 2. Get user specific unlocks/kills
    const userUnlocks = await prisma.unlockedMonster.findMany({
        where: { userId: user.id }
    });

    // 3. Merge
    const bestiary = allMonsters.map((monster: any) => {
        const unlock = userUnlocks.find((u: any) => u.monsterId === monster.id);
        const isDiscovered = !!unlock; // Or logic: userLevel >= monster.levelReq? 
        // Let's say you see silhouettes if level is high enough, but details if killed/unlocked.

        return {
            ...monster,
            isDiscovered,
            kills: unlock?.kills || 0,
            unlockedAt: unlock?.unlockedAt || null
        };
    });

    return { monsters: bestiary };
}
