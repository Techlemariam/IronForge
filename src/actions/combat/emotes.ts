'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { SubscriptionTier } from '@prisma/client';

// ============================================
// Types
// ============================================

export interface BattleEmoteWithUnlock {
    id: string;
    name: string;
    category: string;
    gifPath: string;
    unlockLevel: number;
    isPremium: boolean;
    seasonCode: string | null;
    isUnlocked: boolean;
}

// ============================================
// Actions
// ============================================

/**
 * Get all available emotes for the current user
 * Checks level requirements and premium status
 */
export async function getAvailableEmotesAction(): Promise<{
    success: boolean;
    data?: BattleEmoteWithUnlock[];
    error?: string;
}> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                level: true,
                subscriptionTier: true,
                userBattlePasses: {
                    where: { hasPremium: true },
                    select: { season: { select: { code: true } } },
                },
            },
        });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const allEmotes = await prisma.battleEmote.findMany({
            orderBy: [{ category: 'asc' }, { unlockLevel: 'asc' }],
        });

        const hasPremium =
            user.subscriptionTier === SubscriptionTier.PRO ||
            user.subscriptionTier === SubscriptionTier.LIFETIME;

        const unlockedSeasons = user.userBattlePasses.map((bp) => bp.season.code);

        const emotesWithUnlock: BattleEmoteWithUnlock[] = allEmotes.map((emote) => {
            let isUnlocked = user.level >= emote.unlockLevel;

            if (emote.isPremium && !hasPremium) {
                isUnlocked = false;
            }

            if (emote.seasonCode && !unlockedSeasons.includes(emote.seasonCode)) {
                isUnlocked = false;
            }

            return {
                ...emote,
                isUnlocked,
            };
        });

        return { success: true, data: emotesWithUnlock };
    } catch (error) {
        console.error('Failed to get emotes:', error);
        return { success: false, error: 'Failed to load emotes' };
    }
}

/**
 * Send an emote during an active PvP match
 */
export async function sendBattleEmoteAction(
    matchId: string,
    emoteId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        // Verify match exists and user is a participant
        const match = await prisma.pvpMatch.findUnique({
            where: { id: matchId },
            select: { player1Id: true, player2Id: true },
        });

        if (!match) {
            return { success: false, error: 'Match not found' };
        }

        const isParticipant =
            match.player1Id === session.user.id ||
            match.player2Id === session.user.id;

        if (!isParticipant) {
            return { success: false, error: 'Not a participant in this match' };
        }

        // Verify emote exists and is unlocked
        const emoteResult = await getAvailableEmotesAction();
        if (!emoteResult.success || !emoteResult.data) {
            return { success: false, error: 'Failed to verify emote' };
        }

        const emote = emoteResult.data.find((e) => e.id === emoteId);
        if (!emote) {
            return { success: false, error: 'Emote not found' };
        }

        if (!emote.isUnlocked) {
            return { success: false, error: 'Emote is locked' };
        }

        // Log the emote
        await prisma.pvpEmoteLog.create({
            data: {
                matchId,
                senderId: session.user.id,
                emoteId,
            },
        });

        // TODO: Broadcast to opponent via Supabase Realtime
        // This would be handled by a separate real-time subscription

        return { success: true };
    } catch (error) {
        console.error('Failed to send emote:', error);
        return { success: false, error: 'Failed to send emote' };
    }
}

/**
 * Get emote history for a match (for replays)
 */
export async function getMatchEmoteHistoryAction(matchId: string): Promise<{
    success: boolean;
    data?: Array<{
        senderId: string;
        emote: { name: string; gifPath: string };
        createdAt: Date;
    }>;
    error?: string;
}> {
    try {
        const logs = await prisma.pvpEmoteLog.findMany({
            where: { matchId },
            orderBy: { createdAt: 'asc' },
            select: {
                senderId: true,
                createdAt: true,
                emote: {
                    select: { name: true, gifPath: true },
                },
            },
        });

        return { success: true, data: logs };
    } catch (error) {
        console.error('Failed to get emote history:', error);
        return { success: false, error: 'Failed to load emote history' };
    }
}
