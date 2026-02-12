import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFactoryStatus } from '@/actions/factory';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        factoryStatus: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
    },
}));

describe('Factory Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getFactoryStatus', () => {
        it('should return status data when it exists', async () => {
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
            // First call returns empty
            (prisma.factoryStatus.findMany as any)
                .mockResolvedValueOnce([])
                // Second call (after seed) returns data
                .mockResolvedValueOnce([
                    { id: '1', station: 'design', health: 100, current: null, updatedAt: new Date() }
                ]);

            await getFactoryStatus();

            // Should have attempted to create 5 stations
            expect(prisma.factoryStatus.create).toHaveBeenCalledTimes(5);
            // Should have called findMany twice
            expect(prisma.factoryStatus.findMany).toHaveBeenCalledTimes(2);
        });

        it('should return empty array and log error on failure', async () => {
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
