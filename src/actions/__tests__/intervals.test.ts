import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWellnessAction, getActivitiesAction } from '../intervals';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { getWellness, getActivities } from '@/lib/intervals';

// Mock Supabase
vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

// Mock Intervals Lib
vi.mock('@/lib/intervals', () => ({
    getWellness: vi.fn(),
    getActivities: vi.fn(),
    getEvents: vi.fn(),
    getAthleteSettings: vi.fn(),
}));

describe('Intervals Actions', () => {
    const mockUser = {
        intervalsApiKey: 'api-key',
        intervalsAthleteId: 'athlete-id'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (createClient as any).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
            },
        });
    });

    describe('getWellnessAction', () => {
        it('should return mapped wellness data on success', async () => {
            (prisma.user.findUnique as any).mockResolvedValue(mockUser);
            (getWellness as any).mockResolvedValue({
                id: 'w-1',
                hrv: 50,
                readiness: 80, // Maps to bodyBattery
                sleepScore: 90
            });

            const result = await getWellnessAction('2025-01-01');

            expect(getWellness).toHaveBeenCalledWith('2025-01-01', 'api-key', 'athlete-id');
            expect(result.bodyBattery).toBe(80);
            expect(result.hrv).toBe(50);
        });

        it('should return empty object on error', async () => {
            (prisma.user.findUnique as any).mockResolvedValue(mockUser);
            (getWellness as any).mockRejectedValue(new Error('API Error'));

            const result = await getWellnessAction('2025-01-01');
            expect(result).toEqual({});
        });

        it('should return empty object if user not connected', async () => {
            (prisma.user.findUnique as any).mockResolvedValue({}); // No api key

            const result = await getWellnessAction('2025-01-01');
            expect(result).toEqual({});
        });
    });

    describe('getActivitiesAction', () => {
        it('should return activities', async () => {
            (prisma.user.findUnique as any).mockResolvedValue(mockUser);
            const mockActivities = [{ id: 'a1', type: 'Ride' }];
            (getActivities as any).mockResolvedValue(mockActivities);

            const result = await getActivitiesAction('2025-01-01', '2025-01-02');
            expect(result).toEqual(mockActivities);
        });
    });
});
