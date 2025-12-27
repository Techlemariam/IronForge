'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function followUser(targetId: string) {
    // Mock user for now
    const sessionUser = await prisma.user.findFirst();
    if (!sessionUser) throw new Error("Unauthorized");

    await prisma.follow.create({
        data: {
            followerId: sessionUser.id,
            followingId: targetId
        }
    });

    revalidatePath('/dashboard');
    return { success: true };
}

export async function unfollowUser(targetId: string) {
    const sessionUser = await prisma.user.findFirst();
    if (!sessionUser) throw new Error("Unauthorized");

    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId: sessionUser.id,
                followingId: targetId
            }
        }
    });

    revalidatePath('/dashboard');
    return { success: true };
}

import { getLeaderboard as getUnifiedLeaderboard } from '@/lib/leaderboard';

// ...

export async function getLeaderboard(type: 'GLOBAL' | 'FRIENDS' = 'GLOBAL') {
    const sessionUser = await prisma.user.findFirst();

    // Global Leaderboard (By Level/XP)
    if (type === 'GLOBAL') {
        const users = await getUnifiedLeaderboard({
            scope: 'GLOBAL',
            type: 'XP',
            limit: 50
        });
        return users;
    }

    // Friends Leaderboard
    if (type === 'FRIENDS' && sessionUser) {
        const friends = await prisma.follow.findMany({
            where: { followerId: sessionUser.id },
            select: { followingId: true }
        });

        const friendIds = friends.map(f => f.followingId);
        friendIds.push(sessionUser.id); // Include self

        const leaderboard = await getUnifiedLeaderboard({
            scope: 'FRIENDS',
            type: 'XP',
            userIds: friendIds,
            limit: 50
        });

        return leaderboard;
    }

    return [];
}

export async function getSocialFeed(page: number = 1) {
    const sessionUser = await prisma.user.findFirst();
    if (!sessionUser) return [];

    const following = await prisma.follow.findMany({
        where: { followerId: sessionUser.id },
        select: { followingId: true }
    });

    const followingIds = following.map(f => f.followingId);
    followingIds.push(sessionUser.id); // Include self

    // Fetch recent logs (Workouts)
    const workouts = await prisma.exerciseLog.findMany({
        where: { userId: { in: followingIds }, isPersonalRecord: true },
        take: 20,
        orderBy: { date: 'desc' },
        include: { user: { select: { heroName: true, activeTitle: true } } }
    });

    return workouts.map(w => ({
        type: 'WORKOUT_PR',
        user: w.user,
        data: w,
        timestamp: w.date
    }));
}
