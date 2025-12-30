"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TitanState, getAuthoritativeTitanState } from "./titan-state-schema";

// ============================================
// UNIFIED TITAN SOUL - SYNC SERVICE
// Real-time state synchronization across devices
// ============================================

interface SyncResult {
  success: boolean;
  state: TitanState | null;
  version: number;
  conflicts?: SyncConflict[];
  lastSyncedAt: Date;
}

interface SyncConflict {
  field: string;
  serverValue: unknown;
  clientValue: unknown;
  resolution: "SERVER_WINS" | "CLIENT_WINS" | "MERGED";
}

interface SyncRequest {
  userId: string;
  deviceId: string;
  clientVersion: number;
  clientState: Partial<TitanState>;
  lastSyncedAt: Date;
}

// In-memory version cache (in production: Redis)
const versionCache = new Map<string, number>();

/**
 * Get current server version for a Titan.
 */
export async function getTitanVersion(userId: string): Promise<number> {
  return versionCache.get(userId) || 1;
}

/**
 * Increment and get new version.
 */
function incrementVersion(userId: string): number {
  const current = versionCache.get(userId) || 1;
  const next = current + 1;
  versionCache.set(userId, next);
  return next;
}

/**
 * Pull latest Titan state from server.
 */
export async function pullTitanState(
  userId: string,
  clientVersion?: number,
): Promise<SyncResult> {
  try {
    const serverVersion = await getTitanVersion(userId);

    // Client is up to date
    if (clientVersion && clientVersion >= serverVersion) {
      return {
        success: true,
        state: null,
        version: serverVersion,
        lastSyncedAt: new Date(),
      };
    }

    // Fetch fresh state
    const state = await getAuthoritativeTitanState(userId);

    return {
      success: true,
      state,
      version: serverVersion,
      lastSyncedAt: new Date(),
    };
  } catch (error) {
    console.error("Pull sync failed:", error);
    return {
      success: false,
      state: null,
      version: 0,
      lastSyncedAt: new Date(),
    };
  }
}

/**
 * Push client changes to server.
 */
export async function pushTitanState(
  request: SyncRequest,
): Promise<SyncResult> {
  const { userId, deviceId, clientVersion, clientState, lastSyncedAt } =
    request;

  try {
    const serverVersion = await getTitanVersion(userId);

    // Check for version conflict
    if (clientVersion < serverVersion) {
      // Conflict detected - need to merge
      const serverState = await getAuthoritativeTitanState(userId);
      const conflicts = detectConflicts(serverState, clientState);

      if (conflicts.length > 0) {
        // Resolve conflicts (server wins by default for critical stats)
        const resolved = resolveConflicts(serverState, clientState, conflicts);
        await applyStateChanges(userId, resolved);
      }

      return {
        success: true,
        state: await getAuthoritativeTitanState(userId),
        version: incrementVersion(userId),
        conflicts,
        lastSyncedAt: new Date(),
      };
    }

    // No conflict - apply changes directly
    await applyStateChanges(userId, clientState);
    const newVersion = incrementVersion(userId);

    console.log(
      `Sync complete for ${userId} from device ${deviceId}, version ${newVersion}`,
    );
    revalidatePath("/dashboard");

    return {
      success: true,
      state: await getAuthoritativeTitanState(userId),
      version: newVersion,
      lastSyncedAt: new Date(),
    };
  } catch (error) {
    console.error("Push sync failed:", error);
    return {
      success: false,
      state: null,
      version: 0,
      lastSyncedAt: new Date(),
    };
  }
}

/**
 * Detect conflicts between server and client state.
 */
function detectConflicts(
  serverState: TitanState | null,
  clientState: Partial<TitanState>,
): SyncConflict[] {
  const conflicts: SyncConflict[] = [];

  if (!serverState) return conflicts;

  // Check critical fields for conflicts
  const criticalFields = ["level", "stats", "resources", "economy"];

  for (const field of criticalFields) {
    const serverVal = (serverState as Record<string, unknown>)[field];
    const clientVal = (clientState as Record<string, unknown>)[field];

    if (
      clientVal !== undefined &&
      JSON.stringify(serverVal) !== JSON.stringify(clientVal)
    ) {
      conflicts.push({
        field,
        serverValue: serverVal,
        clientValue: clientVal,
        resolution: "SERVER_WINS",
      });
    }
  }

  return conflicts;
}

/**
 * Resolve conflicts with merge strategy.
 */
function resolveConflicts(
  serverState: TitanState | null,
  clientState: Partial<TitanState>,
  conflicts: SyncConflict[],
): Partial<TitanState> {
  const resolved = { ...clientState };

  for (const conflict of conflicts) {
    // Server wins for economy to prevent exploits
    if (conflict.field === "economy") {
      (resolved as Record<string, unknown>)[conflict.field] =
        conflict.serverValue;
      conflict.resolution = "SERVER_WINS";
    }
    // Merge stats - take higher values
    else if (conflict.field === "stats" && serverState) {
      const serverStats = serverState.stats;
      const clientStats = (clientState as Record<string, unknown>)
        .stats as typeof serverStats;
      if (clientStats) {
        (resolved as Record<string, unknown>).stats = {
          strength: Math.max(serverStats.strength, clientStats.strength || 0),
          vitality: Math.max(serverStats.vitality, clientStats.vitality || 0),
          endurance: Math.max(
            serverStats.endurance,
            clientStats.endurance || 0,
          ),
          agility: Math.max(serverStats.agility, clientStats.agility || 0),
          willpower: Math.max(
            serverStats.willpower,
            clientStats.willpower || 0,
          ),
          intelligence: Math.max(
            serverStats.intelligence,
            clientStats.intelligence || 0,
          ),
        };
        conflict.resolution = "MERGED";
      }
    }
  }

  return resolved;
}

/**
 * Apply state changes to database.
 */
async function applyStateChanges(
  userId: string,
  changes: Partial<TitanState>,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { titan: true },
  });

  if (!user || !user.titan) return;

  // Apply updates
  if (changes.stats) {
    await prisma.titan.update({
      where: { userId },
      data: {
        strength: changes.stats.strength,
        vitality: changes.stats.vitality,
        endurance: changes.stats.endurance,
        agility: changes.stats.agility,
        willpower: changes.stats.willpower,
      },
    });
  }

  if (changes.resources) {
    await prisma.titan.update({
      where: { userId },
      data: {
        currentHp: changes.resources.hp,
        maxHp: changes.resources.maxHp,
        currentEnergy: changes.resources.energy,
      },
    });
  }

  if (changes.economy) {
    await prisma.user.update({
      where: { id: userId },
      data: { gold: changes.economy.gold },
    });
  }
}
