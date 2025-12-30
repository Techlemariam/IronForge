"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import {
  CombatState,
  CombatEngine,
  CombatAction,
} from "@/services/game/CombatEngine";
// import { MONSTERS } from '@/data/bestiary'; // Removing static import as we use DB
import { calculateTitanAttributes } from "@/utils";
import { Monster } from "@/types";
import { LootSystem } from "@/services/game/LootSystem";
import { revalidatePath } from "next/cache";
import {
  StartBossFightSchema,
  PerformCombatActionInputSchema,
} from "@/types/schemas";
import { modifyTitanHealthAction, awardTitanXpAction } from "@/actions/titan";
import { BioBuff } from "@/features/bio/BioBuffService";

// Type for Prisma Monster with hp/level (schema has these but client may be stale)
type PrismaMonster = {
  id: string;
  name: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  level: number;
  hp: number;
  weakness: string | null;
  stats: unknown;
  image: string | null;
};

// Simple in-memory cache for MVP combat sessions (Not persist across server restarts)
// In prod, use Redis or DB table `CombatSession`
const ACTIVE_SESSIONS: Record<
  string,
  { state: CombatState; bossId: string; userId: string; tier: string }
> = {};

export async function startBossFight(
  bossId: string,
  tier: "STORY" | "HEROIC" | "TITAN_SLAYER" = "HEROIC",
) {
  const { bossId: validatedBossId, tier: validatedTier } =
    StartBossFightSchema.parse({ bossId, tier });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Unauthorized" };

  // 1. Fetch User Stats & Titan
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { achievements: true, skills: true, titan: true },
  });

  if (!dbUser) return { success: false, message: "User not found" };

  // Calculate Attributes to derive Max HP (if we want to update Max HP dynamically)
  // Or trust Titan.maxHp if we have a mechanism to update it on level up/equip.
  // For now, let's use the DB Titan's current HP as the source of truth for "Health entering combat".

  if (!dbUser.titan) {
    // Should have ensured titan exists, but handle gracefully
    return {
      success: false,
      message: "Titan Soul not found. Visit Citadel first.",
    };
  }

  const currentHp = dbUser.titan.currentHp;
  const maxHp = dbUser.titan.maxHp;

  // Safety: If dead, can't fight
  if (dbUser.titan.isInjured || currentHp <= 0) {
    return { success: false, message: "Titan is too injured to fight." };
  }

  // Bio-Buff Check: Exhaustion
  if (dbUser.titan.currentBuff) {
    const buff = dbUser.titan.currentBuff as unknown as BioBuff;
    if (buff.effects && buff.effects.canFight === false) {
      return {
        success: false,
        message: "Titan is exhausted. Rest is required.",
      };
    }
  }

  // 2. Fetch Boss Stats
  // Hardcoded lookup for MVP from static data or DB
  // Assuming MONSTERS is available or we fetch from DB Monster table created in previous step
  // Let's try to fetch from DB first
  let boss = (await prisma.monster.findUnique({
    where: { id: validatedBossId },
  })) as PrismaMonster | null;

  // Fallback to static if not in DB (or if we prefer static data for now)
  if (!boss) {
    // Fallback or error
    return { success: false, message: "Boss not found" };
  }

  // Apply Tier Scaling
  let hpMultiplier = 1.0;

  if (validatedTier === "STORY") {
    hpMultiplier = 0.7;
  } else if (validatedTier === "TITAN_SLAYER") {
    hpMultiplier = 1.5;
  }

  const scaledBossHp = Math.floor(boss.hp * hpMultiplier);

  // 3. Initialize State
  const initialState: CombatState = {
    playerHp: currentHp,
    playerMaxHp: maxHp,
    bossHp: scaledBossHp,
    bossMaxHp: scaledBossHp,
    turnCount: 1,
    logs: [`Encounter started: ${boss.name} (${validatedTier} Mode)`],
    isVictory: false,
    isDefeat: false,
  };

  // Store Session
  ACTIVE_SESSIONS[user.id] = {
    state: initialState,
    bossId: validatedBossId,
    userId: user.id,
    tier: validatedTier,
  };

  return { success: true, state: initialState, boss };
}

export async function performCombatAction(
  action: CombatAction,
  clientState?: CombatState,
) {
  const { action: validatedAction, clientState: validatedClientState } =
    PerformCombatActionInputSchema.parse({ action, clientState });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Unauthorized" };

  const session = ACTIVE_SESSIONS[user.id];

  // Security Check: Ensure server session exists
  if (!session) {
    return { success: false, message: "Session expired or invalid" };
  }

  // 1. Re-fetch context (Attributes)
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { achievements: true, skills: true, titan: true },
  });

  if (!dbUser) return { success: false, message: "User not found" };

  const unlockedIds = new Set<string>();
  dbUser.achievements.forEach((ua) => unlockedIds.add(ua.achievementId));
  const purchasedSkillIds = dbUser.skills.map((s) => s.skillId);
  const attributes = calculateTitanAttributes(
    unlockedIds,
    null,
    new Set(purchasedSkillIds),
    [],
  );

  // Apply Mood Modifiers
  if (dbUser.titan) {
    const mood = dbUser.titan.mood || "NEUTRAL";
    let moodMod = 1.0;
    if (mood === "HAPPY") moodMod = 1.1;
    if (mood === "WEAKENED") moodMod = 0.8;

    if (moodMod !== 1.0) {
      attributes.strength = Math.round(attributes.strength * moodMod);
      attributes.endurance = Math.round(attributes.endurance * moodMod);
      attributes.technique = Math.round(attributes.technique * moodMod);
    }
  }

  // Bio-Combat Buff System
  if (dbUser.titan && dbUser.titan.currentBuff) {
    const buff = dbUser.titan.currentBuff as unknown as BioBuff;

    // Check expiration (optional, if we strictly enforce time)
    // const isExpired = dbUser.titan.buffExpiresAt && new Date(dbUser.titan.buffExpiresAt) < new Date();

    if (buff.effects) {
      const { attackMod = 1.0, defenseMod = 1.0 } = buff.effects;

      // Apply Attack Modifiers (Strength/Technique/Mental)
      if (attackMod !== 1.0) {
        attributes.strength = Math.round(attributes.strength * attackMod);
        attributes.technique = Math.round(attributes.technique * attackMod);
        attributes.mental = Math.round(attributes.mental * attackMod);
      }

      // Apply Defense Modifiers (Endurance/Recovery/Hypertrophy)
      if (defenseMod !== 1.0) {
        attributes.endurance = Math.round(attributes.endurance * defenseMod);
        attributes.recovery = Math.round(attributes.recovery * defenseMod);
        attributes.hypertrophy = Math.round(
          attributes.hypertrophy * defenseMod,
        );
      }

      // Log the effect
      if (session.state.logs.length > 0) {
        const lastLog = session.state.logs[session.state.logs.length - 1];
        const buffLog = `✨ Active Buff: ${buff.name} (${buff.tier})`;
        const debuffLog = `⚠️ Active Debuff: ${buff.name} (${buff.tier})`;
        const logMsg = buff.tier === "DEBUFF" ? debuffLog : buffLog;

        if (!lastLog.includes(buff.name)) {
          session.state.logs.push(logMsg);
        }
      }
    }
  }

  // 2. Get Boss
  // Since we stored bossId, fetch it again.
  // We create a "Monster" object compatible with CombatEngine
  const dbBoss = (await prisma.monster.findUnique({
    where: { id: session.bossId },
  })) as PrismaMonster | null;
  if (!dbBoss) return { success: false, message: "Boss not found" };
  // Map Prisma Monster to Type Monster if needed, mostly same fields
  // Ensure all required fields are present for CombatEngine: name, level, maxHp
  const boss: Monster = {
    id: dbBoss.id,
    name: dbBoss.name,
    type: dbBoss.type as any,
    level: dbBoss.level,
    description: dbBoss.description,
    image: dbBoss.image || "",
    element: "Physical", // Default if DB doesn't have it yet, or map if added to Prisma
    hp: dbBoss.hp,
    maxHp: dbBoss.hp,
    weakness: [], // dbBoss.weakness not in Prisma model? Check schema. Assumed empty for now.
    associatedExerciseIds: [],
  };

  // Apply Tier Damage Scaling to Boss Logic?
  // The CombatEngine needs to know about scaling damage.
  // We can either pass a scaled boss object or modifying CombatEngine.
  // Let's modify the boss object we pass to CombatEngine.

  const tier = session.tier || "HEROIC";
  let damageMultiplier = 1.0;
  if (tier === "STORY") damageMultiplier = 0.7;
  if (tier === "TITAN_SLAYER") damageMultiplier = 1.3;

  // Temporary Boss Object for calculation
  // We only need to adjust power if CombatEngine uses level or stats.
  // CombatEngine uses: `boss.level * 15 + (boss.maxHp / 100)`
  // We can simulate this by adjusting level relative to tier.

  const scaledBoss = {
    ...boss,
    level: Math.floor(boss.level * damageMultiplier),
  };

  // 3. Process Turn
  const result = CombatEngine.processTurn(
    session.state,
    validatedAction,
    attributes,
    scaledBoss as any,
  );

  // Sync damage to Titan DB
  const damageTaken = session.state.playerHp - result.newState.playerHp;
  if (damageTaken > 0) {
    // Await this to ensure state consistency, though it adds latency.
    // For turn-based, latency is acceptable (200ms).
    await modifyTitanHealthAction(
      user.id,
      -damageTaken,
      `Combat Damage (${session.bossId})`,
    );
  }

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
    // loot = await LootSystem.generateLoot(boss.id, user.id);
    const lootRoll = await LootSystem.rollForLoot(user.id);
    loot = lootRoll;

    // Award XP/Gold
    // Tier Scaling for Rewards
    let rewardMultiplier = 1.0;
    if (tier === "STORY") rewardMultiplier = 0.5;
    if (tier === "TITAN_SLAYER") rewardMultiplier = 2.0;

    const xp = Math.floor(boss.level * 50 * rewardMultiplier);
    const gold = Math.floor(boss.level * 25 * rewardMultiplier);

    reward = { xp, gold };

    reward = { xp, gold };

    // 1. Award XP to Titan (Authoritative Leveling)
    await awardTitanXpAction(user.id, xp, `Boss Defeated: ${boss.name}`);

    // 2. Award Gold (User Economy) & Kinetic Energy
    // TODO: Move Gold/Energy to Titan or specialized Wallet model eventually
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // totalExperience: { increment: xp }, // Deprecated in favor of Titan XP
        gold: { increment: gold },
        kineticEnergy: { increment: 5 },
      },
    });

    delete ACTIVE_SESSIONS[user.id]; // Clear session
    revalidatePath("/armory"); // Update inventory
  } else if (result.newState.isDefeat) {
    delete ACTIVE_SESSIONS[user.id]; // Clear session
  }

  return {
    success: true,
    newState: result.newState,
    turnResult: result,
    loot,
    reward,
  };
}

export async function fleeFromCombat(goldCost: number = 50) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Not authenticated" };

  const session = ACTIVE_SESSIONS[user.id];
  if (!session) return { success: false, message: "No active combat session" };

  // Fetch user to check gold
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return { success: false, message: "User not found" };

  if (dbUser.gold < goldCost) {
    return {
      success: false,
      message: `Not enough gold (need ${goldCost}, have ${dbUser.gold})`,
    };
  }

  // Deduct gold
  await prisma.user.update({
    where: { id: user.id },
    data: { gold: { decrement: goldCost } },
  });

  // Clear combat session
  delete ACTIVE_SESSIONS[user.id];

  return { success: true, goldSpent: goldCost };
}
