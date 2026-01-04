import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLeaderboard } from '@/lib/leaderboard';

// Mock Prisma
const mockFindMany = vi.fn();

vi.mock('@/lib/prisma', () => ({
    default: {
        user: {
            findMany: (...args: any[]) => mockFindMany(...args)
        }
    }
}));

describe('getLeaderboard', () => {
    beforeEach(() => {
        mockFindMany.mockReset();
    });

    it('should return mapped leaderboard entries', async () => {
        const mockUsers = [
            {
                id: 'u1',
                heroName: 'Hero A',
                city: 'Stockholm',
                level: 10,
                totalExperience: 5000,
                faction: 'HORDE',
                pvpProfile: { rankScore: 100, wins: 5, highestWilksScore: 300 },
                activeTitle: { name: 'Gladiator' },
                guild: { name: 'Iron Legion' }
            }
        ];
        mockFindMany.mockResolvedValue(mockUsers);

        const result = await getLeaderboard({
            scope: 'GLOBAL',
            type: 'PVP_RANK'
        });

        expect(result).toHaveLength(1);
        expect(result[0].heroName).toBe('Hero A');
        expect(result[0].rankScore).toBe(100);
        expect(result[0].title).toBe('Gladiator');
        expect(result[0].guildName).toBe('Iron Legion');
    });

    it('should apply city filter when scope is CITY', async () => {
        mockFindMany.mockResolvedValue([]);

        await getLeaderboard({
            scope: 'CITY',
            city: 'London',
            type: 'XP'
        });

        expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                city: { equals: 'London', mode: 'insensitive' }
            })
        }));
    });

    it('should order by totalExperience when type is XP', async () => {
        mockFindMany.mockResolvedValue([]);

        await getLeaderboard({
            scope: 'GLOBAL',
            type: 'XP'
        });

        expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
            orderBy: { totalExperience: 'desc' }
        }));
    });

    it('should order by rankScore when type is PVP_RANK', async () => {
        mockFindMany.mockResolvedValue([]);

        await getLeaderboard({
            scope: 'GLOBAL',
            type: 'PVP_RANK'
        });

        expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
            orderBy: { pvpProfile: { rankScore: 'desc' } }
        }));
    });
});
