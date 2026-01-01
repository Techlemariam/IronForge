"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import {
  CombatState,
  CombatEngine,
  CombatAction,
} from "@/services/game/CombatEngine";
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

// Type for Prisma Monster with hp/level (client might be stale vs schema)
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

/**
 * Starts a boss fight or resumes an existing one if valid.
 */
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

  // 1. Check for existing active session
  const existingSession = await prisma.combatSession.findUnique({
    where: { userId: user.id },
  });

  if (existingSession && !existingSession.isVictory && !existingSession.isDefeat) {
    // Resume existing session if it matches the boss (or force resume whatever is there)
    // For now, let's auto-resume if it exists.
    // If the user wanted to start a NEW fight with a DIFFERENT boss, they should have fled/finished the previous one.
    // But we can implicitly restart if the bossId is different? 
    // Let's stick to: "Finish what you started" or explicit Flee.

    // However, if the session is expired (e.g. > 1 hour), we should nuke it.
    if (existingSession.expiresAt < new Date()) {
      await prisma.combatSession.delete({ where: { id: existingSession.id } });
    } else {
      // Fetch Boss details to return
      const dbBoss = await prisma.monster.findUnique({ where: { id: existingSession.bossId } });
      if (!dbBoss) return { success: false, message: "Boss data corrupted" };

      const resumedState: CombatState = {
        playerHp: existingSession.playerHp,
        playerMaxHp: existingSession.playerMaxHp,
        bossHp: existingSession.bossHp,
        bossMaxHp: existingSession.bossMaxHp,
        turnCount: existingSession.turnCount,
        logs: (existingSession.logs as string[]) || [], // Cast JSON array to string array
        isVictory: existingSession.isVictory,
        isDefeat: existingSession.isDefeat
      };

      return { success: true, state: resumedState, boss: dbBoss, message: "Resuming active combat..." };
    }
  }

  // 2. Fetch User Stats & Titan
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { titan: true },
  });

  if (!dbUser) return { success: false, message: "User not found" };

  if (!dbUser.titan) {
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

  // 3. Fetch Boss Stats
  let boss = (await prisma.monster.findUnique({
    where: { id: validatedBossId },
  })) as PrismaMonster | null;

  if (!boss) {
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

  // 4. Initialize State
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

  // 5. Persist Session to DB
  await prisma.combatSession.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      bossId: validatedBossId,
      bossHp: initialState.bossHp,
      bossMaxHp: initialState.bossMaxHp,
      playerHp: initialState.playerHp,
      playerMaxHp: initialState.playerMaxHp,
      turnCount: initialState.turnCount,
      logs: initialState.logs,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 Hour TTL
    },
    update: {
      bossId: validatedBossId,
      bossHp: initialState.bossHp,
      bossMaxHp: initialState.bossMaxHp,
      playerHp: initialState.playerHp,
      playerMaxHp: initialState.playerMaxHp,
      turnCount: initialState.turnCount,
      logs: initialState.logs,
      isVictory: false,
      isDefeat: false,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    }
  });

  return { success: true, state: initialState, boss };
}

export async function performCombatAction(
  action: CombatAction,
  clientState?: CombatState,
) {
  const { action: validatedAction } = PerformCombatActionInputSchema.parse({ action, clientState });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Unauthorized" };

  // 1. Load Session from DB
  const session = await prisma.combatSession.findUnique({
    where: { userId: user.id }
  });

  if (!session) {
    return { success: false, message: "Session expired or invalid" };
  }

  // Reconstruct CombatState from DB
  let currentState: CombatState = {
    playerHp: session.playerHp,
    playerMaxHp: session.playerMaxHp,
    bossHp: session.bossHp,
    bossMaxHp: session.bossMaxHp,
    turnCount: session.turnCount,
    logs: (session.logs as string[]) || [],
    isVictory: session.isVictory,
    isDefeat: session.isDefeat
  };

  // 2. Re-fetch context (Attributes)
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
    // Safe cast since we know the structure from the service, but ideally we validate
    const buff = dbUser.titan.currentBuff as unknown as BioBuff;
    if (buff && buff.effects) {
      const { attackMod = 1.0, defenseMod = 1.0 } = buff.effects;
      if (attackMod !== 1.0) {
        attributes.strength = Math.round(attributes.strength * attackMod);
        attributes.technique = Math.round(attributes.technique * attackMod);
        attributes.mental = Math.round(attributes.mental * attackMod);
      }
      if (defenseMod !== 1.0) {
        attributes.endurance = Math.round(attributes.endurance * defenseMod);
        attributes.recovery = Math.round(attributes.recovery * defenseMod);
        attributes.hypertrophy = Math.round(attributes.hypertrophy * defenseMod);
      }

      // Log the effect (only once per session technically, but for now every turn start check is fine or just rely on UI)
      // To avoid spamming logs, we skip adding it here, UI handles badges.
    }
  }

  // 3. Get Boss (Need details for damage calculation logic if it depends on stats)
  const dbBoss = (await prisma.monster.findUnique({
    where: { id: session.bossId },
  })) as PrismaMonster | null;
  if (!dbBoss) return { success: false, message: "Boss not found" };

  // Map to Monster
  const boss: Monster = {
    id: dbBoss.id,
    name: dbBoss.name,
    type: dbBoss.type as MonsterType,
    level: dbBoss.level,
    description: dbBoss.description,
    image: dbBoss.image || "",
    element: "Physical",
    hp: session.bossHp, // Use current HP from session
    maxHp: session.bossMaxHp,
    weakness: [],
    associatedExerciseIds: [],
  };

  // Logic to determine scaling based on implicit knowledge or saved field?
  // We didn't save 'tier' in CombatSession. 
  // We can infer it from (bossMaxHp / dbBoss.hp).
  // Or just rely on raw stats.
  const damageRatio = session.bossMaxHp / dbBoss.hp;

  // Temporary Boss Object for calculation
  const scaledBoss = {
    ...boss,
    level: Math.floor(boss.level * damageRatio),
  };

  // 4. Process Turn
  const result = CombatEngine.processTurn(
    currentState,
    validatedAction,
    attributes,
    scaledBoss as any,
  );

  // Sync damage to Titan DB (Real-time health updates)
  const damageTaken = currentState.playerHp - result.newState.playerHp;
  if (damageTaken > 0) {
    await modifyTitanHealthAction(
      user.id,
      -damageTaken,
      `Combat Damage (${session.bossId})`,
    );
  }

  // 5. Update Session in DB
  // If victory/defeat, we might keep it for a moment to show result, OR handle it immediately.
  // The UI needs to see the result. So we update it to 'isVictory' state.
  // We will delete it ONLY after the user clicks "Leave" or we can auto-archive.
  // Actually, better to keep it until next startBossFight overwrites it or explicit leave.

  await prisma.combatSession.update({
    where: { id: session.id },
    data: {
      playerHp: result.newState.playerHp,
      bossHp: result.newState.bossHp,
      turnCount: result.newState.turnCount,
      logs: result.newState.logs,
      isVictory: result.newState.isVictory,
      isDefeat: result.newState.isDefeat,
      updatedAt: new Date()
    }
  });

  // 6. Handle End Game Rewards
  let loot = null;
  let reward = null;

  if (result.newState.isVictory) {
    const lootRoll = await LootSystem.rollForLoot(user.id);
    loot = lootRoll;

    // XP/Gold
    let rewardMultiplier = 1.0;
    // rough inference
    if (damageRatio < 0.8) rewardMultiplier = 0.5; // Story
    if (damageRatio > 1.4) rewardMultiplier = 2.0; // Slayer

    const xp = Math.floor(dbBoss.level * 50 * rewardMultiplier);
    const gold = Math.floor(dbBoss.level * 25 * rewardMultiplier);

    reward = { xp, gold };

    // Award
    await awardTitanXpAction(user.id, xp, `Boss Defeated: ${dbBoss.name}`);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        gold: { increment: gold },
        kineticEnergy: { increment: 5 },
      },
    });

    // We do NOT delete the session here. We let the UI display the victory screen.
    // The session will be cleared/overwritten on next `startBossFight`.
    // Optionally, `revalidatePath` to update UI immediately
    revalidatePath("/armory");
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

  const session = await prisma.combatSession.findUnique({ where: { userId: user.id } });
  if (!session) return { success: false, message: "No active combat session" };

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

  // Delete session
  await prisma.combatSession.delete({
    where: { id: session.id }
  });

  return { success: true, goldSpent: goldCost };
}

export async function getActiveCombatSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Unauthorized" };

  const session = await prisma.combatSession.findUnique({
    where: { userId: user.id }
  });

  if (!session) return { success: false };

  // Fetch boss details to render the resume card
  const boss = await prisma.monster.findUnique({
    where: { id: session.bossId }
  });

  return { success: true, session, boss };
}
