
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { followUser, unfollowUser, getLeaderboard, getSocialFeed } from '../social';
import prisma from '@/lib/prisma';

// Mocks
vi.mock('@/lib/prisma', () => ({
    default: {
        user: {
            findFirst: vi.fn(),
            findMany: vi.fn(),
        },
        follow: {
            create: vi.fn(),
            delete: vi.fn(),
            findMany: vi.fn(),
        },
        exerciseLog: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('social actions', () => {
    const mockUser = { id: 'user-123', heroName: 'Hero' };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('followUser', () => {
        it('should throw if unauthorized', async () => {
            (prisma.user.findFirst as any).mockResolvedValue(null);
            await expect(followUser('target-456')).rejects.toThrow('Unauthorized');
        });

        it('should create follow record', async () => {
            (prisma.user.findFirst as any).mockResolvedValue(mockUser);
            (prisma.follow.create as any).mockResolvedValue({});

            const result = await followUser('target-456');

            expect(prisma.follow.create).toHaveBeenCalledWith({
                data: { followerId: mockUser.id, followingId: 'target-456' }
            });
            expect(result).toEqual({ success: true });
        });
    });

    describe('unfollowUser', () => {
        it('should delete follow record', async () => {
            (prisma.user.findFirst as any).mockResolvedValue(mockUser);
            (prisma.follow.delete as any).mockResolvedValue({});

            const result = await unfollowUser('target-456');

            expect(prisma.follow.delete).toHaveBeenCalledWith({
                where: {
                    followerId_followingId: {
                        followerId: mockUser.id,
                        followingId: 'target-456'
                    }
                }
            });
            expect(result).toEqual({ success: true });
        });
    });

    describe('getLeaderboard', () => {
        it('GLOBAL: should return sorted users', async () => {
            const mockUsers = [{ id: 'u1', totalExperience: 100 }, { id: 'u2', totalExperience: 50 }];
            (prisma.user.findMany as any).mockResolvedValue(mockUsers);

            const result = await getLeaderboard('GLOBAL');
            expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
                orderBy: { totalExperience: 'desc' }
            }));
            expect(result).toEqual(mockUsers);
        });

        it('FRIENDS: should return friends + self sorted', async () => {
            (prisma.user.findFirst as any).mockResolvedValue({ ...mockUser, totalExperience: 50 });
            const mockFriends = [
                { following: { id: 'f1', totalExperience: 100 } },
                { following: { id: 'f2', totalExperience: 10 } }
            ];
            (prisma.follow.findMany as any).mockResolvedValue(mockFriends);

            const result = await getLeaderboard('FRIENDS');

            expect(result).toHaveLength(3);
            expect(result[0].id).toBe('f1'); // 100 XP
            expect(result[1].id).toBe('user-123'); // 50 XP
            expect(result[2].id).toBe('f2'); // 10 XP
        });
    });

    describe('getSocialFeed', () => {
        it('should return recent workouts from following', async () => {
            (prisma.user.findFirst as any).mockResolvedValue(mockUser);
            (prisma.follow.findMany as any).mockResolvedValue([{ followingId: 'f1' }]);

            const mockWorkouts = [
                { id: 'w1', userId: 'f1', date: new Date(), isEpic: true, user: { heroName: 'Friend' } }
            ];
            (prisma.exerciseLog.findMany as any).mockResolvedValue(mockWorkouts);

            const result = await getSocialFeed();

            expect(prisma.exerciseLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId: { in: ['f1', 'user-123'] }, isEpic: true }
            }));
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe('WORKOUT_PR');
        });
    });
});
