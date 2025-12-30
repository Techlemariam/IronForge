"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TitanState, getAuthoritativeTitanState } from "./titan-state-schema";
import {
  recordTitanEvent,
  replayTitanEvents,
  getTitanEventHistory,
} from "./titan-event-sourcing";

// ============================================
// UNIFIED TITAN SOUL - STATE RECOVERY
// Rollback and recovery mechanisms
// ============================================

interface RecoveryCheckpoint {
  id: string;
  userId: string;
  state: TitanState;
  createdAt: Date;
  reason: string;
  version: number;
}

interface RecoveryResult {
  success: boolean;
  previousState?: TitanState;
  newState?: TitanState;
  message: string;
}

// In-memory checkpoint storage (in production: database table)
const checkpoints: RecoveryCheckpoint[] = [];

/**
 * Create a recovery checkpoint.
 */
export async function createRecoveryCheckpoint(
  userId: string,
  reason: string,
): Promise<RecoveryCheckpoint | null> {
  const state = await getAuthoritativeTitanState(userId);

  if (!state) {
    console.error("Cannot create checkpoint: no Titan state found");
    return null;
  }

  const checkpoint: RecoveryCheckpoint = {
    id: `chkpt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    state,
    createdAt: new Date(),
    reason,
    version: state.version,
  };

  checkpoints.push(checkpoint);

  // Keep only last 10 checkpoints per user
  const userCheckpoints = checkpoints.filter((c) => c.userId === userId);
  if (userCheckpoints.length > 10) {
    const oldest = userCheckpoints[0];
    const index = checkpoints.indexOf(oldest);
    if (index > -1) checkpoints.splice(index, 1);
  }

  console.log(`[RECOVERY] Checkpoint created for ${userId}: ${reason}`);
  await recordTitanEvent(userId, "STATE_RECOVERED", {
    action: "checkpoint_created",
    reason,
  });

  return checkpoint;
}

/**
 * Get available checkpoints for rollback.
 */
export async function getAvailableCheckpoints(
  userId: string,
): Promise<RecoveryCheckpoint[]> {
  return checkpoints
    .filter((c) => c.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Rollback to a specific checkpoint.
 */
export async function rollbackToCheckpoint(
  userId: string,
  checkpointId: string,
): Promise<RecoveryResult> {
  const checkpoint = checkpoints.find(
    (c) => c.id === checkpointId && c.userId === userId,
  );

  if (!checkpoint) {
    return { success: false, message: "Checkpoint not found" };
  }

  const currentState = await getAuthoritativeTitanState(userId);

  try {
    // Apply checkpoint state
    const state = checkpoint.state;

    await prisma.titan.update({
      where: { userId },
      data: {
        strength: state.stats.strength,
        vitality: state.stats.vitality,
        endurance: state.stats.endurance,
        agility: state.stats.agility,
        willpower: state.stats.willpower,
        currentHp: state.resources.hp,
        maxHp: state.resources.maxHp,
        currentEnergy: state.resources.energy,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        level: state.level,
        totalExperience: state.resources.xp,
        gold: state.economy.gold,
      },
    });

    await recordTitanEvent(userId, "STATE_RECOVERED", {
      action: "rollback",
      checkpointId,
      checkpointDate: checkpoint.createdAt.toISOString(),
    });

    revalidatePath("/dashboard");

    console.log(
      `[RECOVERY] Rolled back ${userId} to checkpoint ${checkpointId}`,
    );

    return {
      success: true,
      previousState: currentState || undefined,
      newState: state,
      message: `Rolled back to checkpoint from ${checkpoint.createdAt.toLocaleString()}`,
    };
  } catch (error) {
    console.error("Rollback failed:", error);
    return { success: false, message: "Rollback failed" };
  }
}

/**
 * Rollback to a specific event version (using event sourcing).
 */
export async function rollbackToVersion(
  userId: string,
  targetVersion: number,
): Promise<RecoveryResult> {
  try {
    const reconstructedState = await replayTitanEvents(userId, targetVersion);
    const currentState = await getAuthoritativeTitanState(userId);

    // Apply reconstructed state
    if (reconstructedState.stats) {
      const stats = reconstructedState.stats as Record<string, number>;
      await prisma.titan.update({
        where: { userId },
        data: {
          strength: stats.strength,
          vitality: stats.vitality,
          endurance: stats.endurance,
          agility: stats.agility,
          willpower: stats.willpower,
        },
      });
    }

    if (reconstructedState.level) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: reconstructedState.level as number },
      });
    }

    await recordTitanEvent(userId, "STATE_RECOVERED", {
      action: "version_rollback",
      targetVersion,
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      previousState: currentState || undefined,
      message: `Rolled back to version ${targetVersion}`,
    };
  } catch (error) {
    console.error("Version rollback failed:", error);
    return { success: false, message: "Version rollback failed" };
  }
}

/**
 * Recover from corruption by resetting to last known good state.
 */
export async function recoverFromCorruption(
  userId: string,
): Promise<RecoveryResult> {
  const available = await getAvailableCheckpoints(userId);

  if (available.length === 0) {
    // No checkpoints - reset to defaults
    console.log(
      `[RECOVERY] No checkpoints for ${userId}, resetting to defaults`,
    );

    try {
      await prisma.titan.update({
        where: { userId },
        data: {
          strength: 10,
          vitality: 10,
          endurance: 10,
          agility: 10,
          willpower: 10,
          currentHp: 100,
          maxHp: 100,
          currentEnergy: 100,
        },
      });

      await recordTitanEvent(userId, "STATE_RECOVERED", {
        action: "reset_to_defaults",
      });
      revalidatePath("/dashboard");

      return { success: true, message: "Reset to default state" };
    } catch (error) {
      return { success: false, message: "Recovery failed" };
    }
  }

  // Roll back to most recent checkpoint
  return rollbackToCheckpoint(userId, available[0].id);
}

/**
 * Validate current state integrity.
 */
export async function validateStateIntegrity(userId: string): Promise<{
  valid: boolean;
  issues: string[];
}> {
  const state = await getAuthoritativeTitanState(userId);
  const issues: string[] = [];

  if (!state) {
    return { valid: false, issues: ["No Titan state found"] };
  }

  // Check for invalid values
  if (state.level < 1) issues.push("Level below minimum");
  if (state.resources.hp < 0) issues.push("HP is negative");
  if (state.resources.hp > state.resources.maxHp) issues.push("HP exceeds max");
  if (state.economy.gold < 0) issues.push("Gold is negative");

  // Check stats
  for (const [stat, value] of Object.entries(state.stats)) {
    if (value < 1) issues.push(`${stat} is below minimum`);
    if (value > 9999) issues.push(`${stat} exceeds maximum`);
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Auto-heal detected integrity issues.
 */
export async function autoHealIntegrityIssues(
  userId: string,
): Promise<RecoveryResult> {
  const { valid, issues } = await validateStateIntegrity(userId);

  if (valid) {
    return { success: true, message: "No issues to heal" };
  }

  console.log(`[RECOVERY] Auto-healing ${issues.length} issues for ${userId}`);

  // Create checkpoint before healing
  await createRecoveryCheckpoint(userId, "pre-auto-heal");

  const state = await getAuthoritativeTitanState(userId);
  if (!state) return { success: false, message: "No state to heal" };

  // Fix issues
  const fixes: Record<string, unknown> = {};

  if (state.resources.hp < 0) fixes.currentHp = 0;
  if (state.resources.hp > state.resources.maxHp)
    fixes.currentHp = state.resources.maxHp;

  if (Object.keys(fixes).length > 0) {
    await prisma.titan.update({
      where: { userId },
      data: fixes as Record<string, number>,
    });
  }

  if (state.economy.gold < 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { gold: 0 },
    });
  }

  await recordTitanEvent(userId, "STATE_RECOVERED", {
    action: "auto_heal",
    issues,
  });
  revalidatePath("/dashboard");

  return { success: true, message: `Healed ${issues.length} issues` };
}
