'use server';

import { prisma } from '@/lib/prisma';
import { PocketCastsClient } from '@/services/pocketcasts';
import { createClient } from '@/utils/supabase/server';

export async function loginPocketCasts(email: string, password: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  try {
    const pcClient = new PocketCastsClient();
    const token = await pcClient.login(email, password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        pocketCastsToken: token,
        pocketCastsEnabled: true,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('[Podcast Login Error]:', error.message);
    return { success: false, error: error.message || 'Failed to log in to Pocket Casts' };
  }
}

export async function logoutPocketCasts() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        pocketCastsToken: null,
        pocketCastsEnabled: false,
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to disconnect' };
  }
}

async function getClient(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pocketCastsToken: true },
  });

  if (!user?.pocketCastsToken) {
    throw new Error('Pocket Casts not connected');
  }

  return new PocketCastsClient(user.pocketCastsToken);
}

export async function getPodcastData(type: string, uuid?: string, page = 1) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const client = await getClient(user.id);
    let data;

    switch (type) {
      case 'subscriptions':
        data = await client.getSubscriptions();
        break;
      case 'queue':
        data = await client.getQueue();
        break;
      case 'in-progress':
        data = await client.getInProgress();
        break;
      case 'episodes': {
        if (!uuid) throw new Error('Podcast UUID required');
        data = await client.getEpisodes(uuid, page);
        break;
      }
      default:
        return { success: false, error: 'Invalid type' };
    }

    return { success: true, data };
  } catch (error: any) {
    if (error.message?.includes('401')) {
      return { success: false, error: 'Token expired' };
    }
    return { success: false, error: error.message };
  }
}

export async function updatePodcastProgress(
  episodeId: string,
  podcastId: string,
  position: number,
  status: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const client = await getClient(user.id);
    await client.updateProgress(episodeId, podcastId, position, status);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
