'use server';

import { getSession } from '@/lib/auth';
import { GarminService, type GarminWellnessData } from '@/services/bio/GarminService';

export async function getGarminWellnessAction(): Promise<GarminWellnessData | null> {
  try {
    const session = await getSession();
    if (!session?.user) return null;

    return await GarminService.getTitanWellness(session.user.id);
  } catch (error) {
    console.error('Error in getGarminWellnessAction:', error);
    return null;
  }
}
