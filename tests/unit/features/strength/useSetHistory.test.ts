import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock the server action at module level
vi.mock('@/features/strength/actions/history', async (importOriginal) => {
    return {
        getLastSetForExercise: vi.fn()
    };
});

import { useSetHistory } from '@/features/strength/hooks/useSetHistory';
import { getLastSetForExercise } from '@/features/strength/actions/history';

const mockGetLastSet = getLastSetForExercise as ReturnType<typeof vi.fn>;

describe('useSetHistory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns isLoading true initially', () => {
        mockGetLastSet.mockResolvedValue(null);

        const { result } = renderHook(() => useSetHistory('ex-123'));

        expect(result.current.isLoading).toBe(true);
        expect(result.current.history).toBeNull();
    });

    it('fetches and returns history data', async () => {
        const mockData = { weight: 80, reps: 8 };
        mockGetLastSet.mockResolvedValue(mockData);

        const { result } = renderHook(() => useSetHistory('ex-123', 'Squat'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.history).toEqual(mockData);
        expect(mockGetLastSet).toHaveBeenCalledWith('ex-123', 'Squat');
    });

    it('handles null response gracefully', async () => {
        mockGetLastSet.mockResolvedValue(null);

        const { result } = renderHook(() => useSetHistory('ex-123'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.history).toBeNull();
    });

    it('handles fetch error gracefully', async () => {
        mockGetLastSet.mockRejectedValue(new Error('Network Error'));

        const { result } = renderHook(() => useSetHistory('ex-123'));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.history).toBeNull();
    });

    it('skips fetch when exerciseId is empty', async () => {
        const { result } = renderHook(() => useSetHistory(''));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(mockGetLastSet).not.toHaveBeenCalled();
    });
});
