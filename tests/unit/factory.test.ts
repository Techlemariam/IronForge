import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFactoryStatus } from '@/actions/factory';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        factoryStatus: {
            findMany: vi.fn(),
            upsert: vi.fn(),
        },
    },
}));

// Mock Supabase
vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}));

describe('Factory Actions', () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockSupabase = {
            auth: {
                getUser: vi.fn(),
            },
        };
        (createClient as any).mockResolvedValue(mockSupabase);
    });

    describe('getFactoryStatus', () => {
        it('should throw Unauthorized if no user', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

            await expect(getFactoryStatus()).rejects.toThrow('Unauthorized');
        });

        it('should return status data when it exists', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null });

            const mockData = [
                { id: '1', station: 'design', health: 100, current: null, updatedAt: new Date() },
            ];

            (prisma.factoryStatus.findMany as any).mockResolvedValue(mockData);

            const result = await getFactoryStatus();

            expect(result).toHaveLength(1);
            expect(result[0].station).toBe('design');
            expect(prisma.factoryStatus.findMany).toHaveBeenCalledTimes(1);
        });

        it('should seed data if empty', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null });

            // First call returns empty
            (prisma.factoryStatus.findMany as any)
                .mockResolvedValueOnce([])
                // Second call (after seed) returns data
                .mockResolvedValueOnce([
                    { id: '1', station: 'design', health: 100, current: null, updatedAt: new Date() }
                ]);

            await getFactoryStatus();

            // Should have attempted to seed 5 stations using upsert
            expect(prisma.factoryStatus.upsert).toHaveBeenCalledTimes(5);
            // Should have called findMany twice
            expect(prisma.factoryStatus.findMany).toHaveBeenCalledTimes(2);
        });

        it('should return empty array and log error on failure', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null });

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            (prisma.factoryStatus.findMany as any).mockRejectedValue(new Error('DB Error'));

            const result = await getFactoryStatus();

            expect(result).toEqual([]);
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to fetch factory status:',
                expect.any(Error)
            );
            consoleSpy.mockRestore();
        });
    });
});
