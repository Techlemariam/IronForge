'use server';

import { TerritoryService } from '@/services/game/TerritoryService';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// --- Schemas ---

const claimTerritorySchema = z.object({
  guildId: z.string(),
  territoryId: z.string(),
  userId: z.string(),
});

const contestTerritorySchema = z.object({
  attackerId: z.string(),
  territoryId: z.string(),
  userId: z.string(),
});

// --- Actions ---

/**
 * Fetch all territories (Zones) with contest data.
 */
export async function getTerritoriesAction() {
  try {
    const data = await TerritoryService.getMapData();
    return { success: true, data };
  } catch (error: any) {
    console.error('[TerritoryActions] getTerritories error:', error.message);
    return { success: false, error: 'Failed to fetch territories' };
  }
}

/**
 * Get solo territory app data (Tiles, Stats, Home Zone).
 */
export async function getTerritoryAppDataAction() {
  try {
    const { getSession } = await import('@/lib/auth');
    const session = await getSession();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const data = await TerritoryService.getSoloMapData(session.user.id);
    return { success: true, data };
  } catch (error: any) {
    console.error('[TerritoryActions] getTerritoryAppData error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Claim an unclaimed territory (Zone).
 */
export async function claimTerritoryAction(guildId: string, territoryId: string, userId: string) {
  const parsed = claimTerritorySchema.safeParse({ guildId, territoryId, userId });
  if (!parsed.success) {
    return { success: false, error: 'Invalid input' };
  }

  try {
    const data = await TerritoryService.claimTerritory(guildId, territoryId, userId);
    revalidatePath('/citadel');
    revalidatePath('/dashboard');
    return { success: true, data };
  } catch (error: any) {
    console.error('[TerritoryActions] claimTerritory error:', error.message);
    return { success: false, error: error.message || 'Failed to claim territory' };
  }
}

/**
 * Initiate a contest for an owned territory (Zone).
 */
export async function contestTerritoryAction(
  attackerId: string,
  territoryId: string,
  userId: string
) {
  const parsed = contestTerritorySchema.safeParse({ attackerId, territoryId, userId });
  if (!parsed.success) {
    return { success: false, error: 'Invalid input' };
  }

  try {
    const data = await TerritoryService.contestTerritory(attackerId, territoryId, userId);
    revalidatePath('/citadel');
    revalidatePath('/dashboard');
    return { success: true, data };
  } catch (error: any) {
    console.error('[TerritoryActions] contestTerritory error:', error.message);
    return { success: false, error: error.message || 'Failed to initiate contest' };
  }
}

/**
 * Manual trigger for contest resolution (admin only).
 */
export async function resolveExpiredContestsAction() {
  try {
    await TerritoryService.resolveExpiredContests();
    revalidatePath('/citadel');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('[TerritoryActions] resolveExpiredContests error:', error.message);
    return { success: false, error: 'Failed to resolve contests' };
  }
}
