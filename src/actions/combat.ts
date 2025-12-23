'use server'

import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { CombatState, CombatEngine, CombatAction } from '@/services/game/CombatEngine';
// import { MONSTERS } from '@/data/bestiary'; // Removing static import as we use DB
import { calculateTitanAttributes } from '@/utils';
import { Monster } from '@/types';
import { LootSystem } from '@/services/game/LootSystem';
import { revalidatePath } from 'next/cache';

// Simple in-memory cache for MVP combat sessions (Not persist across server restarts)
// In prod, use Redis or DB table `CombatSession`
const ACTIVE_SESSIONS: Record<string, { state: CombatState; bossId: string; userId: string }> = {};

export async function startBossFight(bossId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    // 1. Fetch User Stats (Attributes) to determine Max HP
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { achievements: true, skills: true }
    });

    if (!dbUser) return { success: false, message: 'User not found' };

    // Calculate Attributes to derive HP
    // Note: We need unlocked IDs.
    const unlockedIds = new Set<string>();
    dbUser.achievements.forEach(ua => unlockedIds.add(ua.achievementId));
    // Use empty wellness/logs for base stats if needed, or fetch them. 
    // For combat, let's assume "Rested" state or just base attributes from achievements/skills.
    // Ideally we pass real wellness, but for now let's approximate or fetch.
    const purchasedSkillIds = dbUser.skills.map(s => s.skillId);

    // We can't easily get wellness here without importing intervals client which might be slow.
    // Let's use stored user stats if available or re-calc. 
    // `calculateTitanAttributes` needs wellness. Let's pass null and accept base stats.
    const attributes = calculateTitanAttributes(unlockedIds, null, purchasedSkillIds, []);

    // Player Max HP = Endurance * 10 + Strength * 5
    const playerMaxHp = (attributes.endurance * 10) + (attributes.strength * 5) + (dbUser.level * 20);

    // 2. Fetch Boss Stats
    // Hardcoded lookup for MVP from static data or DB
    // Assuming MONSTERS is available or we fetch from DB Monster table created in previous step
    // Let's try to fetch from DB first
    let boss = await prisma.monster.findUnique({ where: { id: bossId } });

    // Fallback to static if not in DB (or if we prefer static data for now)
    if (!boss) {
        // Fallback or error
        return { success: false, message: 'Boss not found' };
    }

    // 3. Initialize State
    const initialState: CombatState = {
        playerHp: playerMaxHp,
        playerMaxHp: playerMaxHp,
        bossHp: boss.hp,
        bossMaxHp: boss.hp,
        turnCount: 1,
        logs: [`Encounter started: ${boss.name} (Lvl ${boss.level})`],
        isVictory: false,
        isDefeat: false
    };

    // Store Session
    ACTIVE_SESSIONS[user.id] = { state: initialState, bossId, userId: user.id };

    return { success: true, state: initialState, boss };
}

export async function performCombatAction(action: CombatAction, clientState?: CombatState) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    const session = ACTIVE_SESSIONS[user.id];

    // Security Check: Ensure server session exists
    if (!session) {
        return { success: false, message: 'Session expired or invalid' };
    }

    // 1. Re-fetch context (Attributes)
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { achievements: true, skills: true }
    });

    if (!dbUser) return { success: false, message: 'User not found' };

    const unlockedIds = new Set<string>();
    dbUser.achievements.forEach(ua => unlockedIds.add(ua.achievementId));
    const purchasedSkillIds = dbUser.skills.map(s => s.skillId);
    const attributes = calculateTitanAttributes(unlockedIds, null, purchasedSkillIds, []);

    // 2. Get Boss
    // Since we stored bossId, fetch it again. 
    // We create a "Monster" object compatible with CombatEngine
    const dbBoss = await prisma.monster.findUnique({ where: { id: session.bossId } });
    if (!dbBoss) return { success: false, message: 'Boss not found' };
    // Map Prisma Monster to Type Monster if needed, mostly same fields
    // Ensure all required fields are present for CombatEngine: name, level, maxHp
    const boss: Monster = {
        id: dbBoss.id,
        name: dbBoss.name,
        type: dbBoss.type as any,
        level: dbBoss.level,
        description: dbBoss.description,
        image: dbBoss.image || '',
        hp: dbBoss.hp,
        maxHp: dbBoss.hp,
        weakness: [], // dbBoss.weakness not in Prisma model? Check schema. Assumed empty for now.
        associatedExerciseIds: []
    };

    // 3. Process Turn
    const result = CombatEngine.processTurn(session.state, action, attributes, boss);

    // Update Session
    session.state = result.newState;

    // 4. Handle End Game
    let loot = null;
    let reward = null;

    if (result.newState.isVictory) {
        // Drop Loot!
        // We use the LootSystem from previous task
        // We need 'activityData' from a real workout usually, here we mock it or base on Boss difficulty

        // Bonus chance for boss kill?
        const lootRoll = await LootSystem.rollForLoot(user.id);
        loot = lootRoll;

        // Award XP / Gold
        const xpReward = boss.level * 50;
        const goldReward = boss.level * 25;

        await prisma.user.update({
            where: { id: user.id },
            data: {
                totalExperience: { increment: xpReward },
                gold: { increment: goldReward },
                // Maybe increment 'boss_kills' stat/achievement
            }
        });

        reward = { xp: xpReward, gold: goldReward };

        delete ACTIVE_SESSIONS[user.id]; // Clear session
        revalidatePath('/armory'); // Update inventory
    } else if (result.newState.isDefeat) {
        delete ACTIVE_SESSIONS[user.id]; // Clear session
    }

    return {
        success: true,
        newState: result.newState,
        turnResult: result,
        loot,
        reward
    };
}
