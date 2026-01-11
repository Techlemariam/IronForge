import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';

// Import functions under test (mocks already applied globally)
import { getLastSetForExercise, getExerciseHistory } from '@/features/strength/actions/history';

// Access mocked prisma functions
const mockFindFirstLog = prisma.exerciseLog.findFirst as ReturnType<typeof vi.fn>;
const mockFindManyLog = prisma.exerciseLog.findMany as ReturnType<typeof vi.fn>;
const mockFindFirstEx = prisma.exercise.findFirst as ReturnType<typeof vi.fn>;

describe('getLastSetForExercise', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns null when exerciseId is short and no exerciseName', async () => {
        const result = await getLastSetForExercise('short');
        expect(result).toBeNull();
    });

    it('returns last set data when found by ID', async () => {
        mockFindFirstLog.mockResolvedValueOnce({
            id: 'ex-123',
            sets: [
                { weight: 50, reps: 8, rpe: 7, order: 1 },
                { weight: 60, reps: 6, rpe: 8, order: 2 }
            ]
        });

        const result = await getLastSetForExercise('valid-long-exercise-id');

        expect(result).toEqual({ weight: 60, reps: 6, rpe: 8 });
        expect(mockFindFirstLog).toHaveBeenCalledTimes(1);
    });

    it('falls back to exerciseName when ID query returns empty', async () => {
        // First call (ID) returns null
        mockFindFirstLog.mockResolvedValueOnce(null);

        // Second call (Exercise Name lookup)
        mockFindFirstEx.mockResolvedValueOnce({
            id: 'ex-456',
            name: 'Bench Press'
        });

        // Third call (Log by lookup ID)
        mockFindFirstLog.mockResolvedValueOnce({
            id: 'log-456',
            sets: [{ weight: 100, reps: 5, rpe: 9, order: 1 }]
        });

        const result = await getLastSetForExercise('valid-long-exercise-id', 'Bench Press');

        expect(result).toEqual({ weight: 100, reps: 5, rpe: 9 });
        expect(mockFindFirstLog).toHaveBeenCalledTimes(2);
        expect(mockFindFirstEx).toHaveBeenCalledTimes(1);
    });

    it('returns null on prisma error', async () => {
        mockFindFirstLog.mockRejectedValueOnce(new Error('DB Error'));

        const result = await getLastSetForExercise('valid-long-exercise-id');
        expect(result).toBeNull();
    });
});

describe('getExerciseHistory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns formatted history with e1rm calculations', async () => {
        mockFindManyLog.mockResolvedValueOnce([
            {
                id: '1',
                date: new Date('2026-01-05'),
                sets: [
                    { weight: 100, reps: 5 },
                    { weight: 100, reps: 3 }
                ]
            },
            {
                id: '2',
                date: new Date('2026-01-10'),
                sets: [
                    { weight: 110, reps: 5 }
                ]
            }
        ]);

        const result = await getExerciseHistory('valid-long-exercise-id');

        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty('date', '2026-01-05');
        expect(result[0]).toHaveProperty('e1rm');
        expect(result[0]).toHaveProperty('volume');
        expect(result[1].date).toBe('2026-01-10');
    });

    it('handles missing completedAt gracefully', async () => {
        // Note: ExerciseLog uses 'date' not 'completedAt'
        mockFindManyLog.mockResolvedValueOnce([
            {
                id: '1',
                date: new Date('2026-01-01'),
                sets: [{ weight: 80, reps: 10 }]
            }
        ]);

        const result = await getExerciseHistory('valid-long-exercise-id');
        expect(result[0].date).toBe('2026-01-01');
    });

    it('returns empty array on error', async () => {
        mockFindManyLog.mockRejectedValueOnce(new Error('DB Error'));

        const result = await getExerciseHistory('valid-long-exercise-id');
        expect(result).toEqual([]);
    });
});
