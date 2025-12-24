import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHevyTemplatesAction, getHevyRoutinesAction, getHevyWorkoutHistoryAction, saveWorkoutAction } from '../hevy';
import axios from 'axios';
import * as libHevy from '@/lib/hevy';
import prisma from '@/lib/prisma';

// Mock dependencies
vi.mock('axios');
vi.mock('@/lib/hevy', () => ({
    getHevyTemplates: vi.fn(),
}));
vi.mock('@/lib/prisma', () => ({
    default: {
        user: {
            update: vi.fn(),
        },
    },
}));
vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn(() => ({ data: { user: { id: 'test-user-id' } } })),
        },
    })),
}));

describe('Hevy Actions', () => {
    const apiKey = 'test-api-key';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getHevyTemplatesAction', () => {
        it('should throw error if apiKey is missing', async () => {
            await expect(getHevyTemplatesAction('')).rejects.toThrow("Hevy API Key is required.");
        });

        it('should return templates on success', async () => {
            const mockTemplates = [{ id: '1', title: 'Bench Press' }];
            vi.spyOn(libHevy, 'getHevyTemplates').mockResolvedValue(mockTemplates as any);

            const result = await getHevyTemplatesAction(apiKey);
            expect(result).toEqual({
                exercise_templates: mockTemplates,
                page: 1,
                total_pages: 1,
                total_records: 1
            });
        });

        it('should handle errors', async () => {
            vi.spyOn(libHevy, 'getHevyTemplates').mockRejectedValue(new Error('API Error'));
            await expect(getHevyTemplatesAction(apiKey)).rejects.toThrow("Failed to fetch Hevy templates: API Error");
        });
    });

    describe('getHevyRoutinesAction', () => {
        it('should fetch routines successfully', async () => {
            const mockResponse = { data: { page: 1, page_count: 1, routines: [] } };
            (axios.get as any).mockResolvedValue(mockResponse);

            const result = await getHevyRoutinesAction(apiKey);
            expect(result).toEqual(mockResponse.data);
            expect(axios.get).toHaveBeenCalledWith('https://api.hevyapp.com/v1/routines', {
                headers: { 'api-key': apiKey },
                params: { page: 1, pageSize: 10 }
            });
        });
    });

    describe('getHevyWorkoutHistoryAction', () => {
        it('should fetch workout history with pagination', async () => {
            const mockWorkouts = Array(5).fill({ id: 'workout-1' });
            (axios.get as any).mockResolvedValue({ status: 200, data: { workouts: mockWorkouts } });

            const result = await getHevyWorkoutHistoryAction(apiKey, 5);
            expect(result.workouts.length).toBe(5);
            expect(axios.get).toHaveBeenCalledTimes(1);
        });
    });

    describe('saveWorkoutAction', () => {
        it('should save workout and award energy', async () => {
            const payload = { workout: { exercises: [{ sets: [{ weight_kg: 100, reps: 10 }] }] } }; // 1000kg vol => 10 energy
            const mockHevyResponse = { data: {} };
            (axios.post as any).mockResolvedValue(mockHevyResponse);
            (prisma.user.update as any).mockResolvedValue({});

            const result = await saveWorkoutAction(apiKey, payload);

            expect(axios.post).toHaveBeenCalled();
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'test-user-id' },
                data: {
                    kineticEnergy: { increment: 10 },
                    totalExperience: { increment: 20 }
                }
            });
            expect(result.rewards).toEqual({ energy: 10 });
        });
    });
});
