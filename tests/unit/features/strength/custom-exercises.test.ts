import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase (HOISTED)
vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(async () => ({
        auth: {
            getUser: vi.fn(async () => ({
                data: { user: { id: 'test_user_123' } },
                error: null
            }))
        }
    }))
}));

import { prisma } from '@/lib/prisma';
import { createCustomExercise, getCustomExercises } from '@/features/strength/actions/custom-exercises';

// Access mocked prisma functions
const mockCreate = prisma.exercise.create as ReturnType<typeof vi.fn>;
const mockFindMany = prisma.exercise.findMany as ReturnType<typeof vi.fn>;

describe('createCustomExercise', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates exercise successfully', async () => {
        const mockExercise = {
            id: 'custom_123456',
            name: 'Plate Pinch',
            muscleGroup: 'Forearms',
            equipment: 'Plate',
            secondaryMuscles: []
        };
        mockCreate.mockResolvedValueOnce(mockExercise);

        const result = await createCustomExercise({
            name: 'Plate Pinch',
            muscle: 'Forearms',
            equipment: 'Plate'
        });

        expect(result).toHaveProperty('name', 'Plate Pinch');
        expect(result).toHaveProperty('isCustom', true);
    });

    it('returns fallback object on DB error', async () => {
        mockCreate.mockRejectedValueOnce(new Error('DB Error'));

        const result = await createCustomExercise({
            name: 'Fallback Exercise',
            muscle: 'Back',
            equipment: 'Cable'
        });

        expect(result).toHaveProperty('name', 'Fallback Exercise');
        expect(result).toHaveProperty('isCustom', true);
        expect(result.id).toMatch(/^custom_/);
    });
});

describe('getCustomExercises', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns custom exercises with prefix filter', async () => {
        const mockExercises = [
            { id: 'custom_1', name: 'Exercise A', muscleGroup: 'Chest' },
            { id: 'custom_2', name: 'Exercise B', muscleGroup: 'Back' }
        ];
        mockFindMany.mockResolvedValueOnce(mockExercises);

        const result = await getCustomExercises();

        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty('isCustom', true);
    });

    it('returns empty array on error', async () => {
        mockFindMany.mockRejectedValueOnce(new Error('DB Error'));

        const result = await getCustomExercises();
        expect(result).toEqual([]);
    });
});
