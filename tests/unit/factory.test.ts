import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFactoryStatus } from '@/actions/factory';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

describe('Factory Actions', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getFactoryStatus', () => {
        it('should return status data even if unauthenticated', async () => {
            const mockSupabase = await createClient();
            vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null } as any);

            // Mock data
            const mockData = [
                { id: '1', station: 'design', health: 100, current: null, updatedAt: new Date() },
            ];
            vi.mocked(prisma.factoryStatus.findMany).mockResolvedValue(mockData as any);

            const result = await getFactoryStatus();

            expect(result).toHaveLength(1);
            expect(prisma.factoryStatus.findMany).toHaveBeenCalled();
        });

        it('should return status data when it exists', async () => {
            const mockSupabase = await createClient();
            vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
                data: { session: { user: { id: 'test-user', email: 'test@ironforge.rpg' } } },
                error: null
            } as any);

            const mockData = [
                { id: '1', station: 'design', health: 100, current: null, updatedAt: new Date() },
            ];

            vi.mocked(prisma.factoryStatus.findMany).mockResolvedValue(mockData as any);

            const result = await getFactoryStatus();

            expect(result).toHaveLength(1);
            expect(result[0].station).toBe('design');
            expect(prisma.factoryStatus.findMany).toHaveBeenCalledTimes(1);
        });

        it('should seed data if empty', async () => {
            const mockSupabase = await createClient();
            vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
                data: { session: { user: { id: 'test-user', email: 'test@ironforge.rpg' } } },
                error: null
            } as any);

            // Mock findMany to return empty array initially to trigger seeding
            vi.mocked(prisma.factoryStatus.findMany).mockResolvedValueOnce([]);

            // Mock upsert to return data
            vi.mocked(prisma.factoryStatus.upsert).mockResolvedValue({
                id: '1', station: 'any', health: 100, current: null, updatedAt: new Date()
            } as any);

            await getFactoryStatus();

            // Should have attempted to seed 18 stations (Gemini Brotherhood roster)
            expect(prisma.factoryStatus.upsert).toHaveBeenCalledTimes(18);
            // Should have called findMany once
            expect(prisma.factoryStatus.findMany).toHaveBeenCalledTimes(1);
        });

        it('should return empty array and log error on failure', async () => {
            const mockSupabase = await createClient();
            vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
                data: { session: { user: { id: 'test-user', email: 'test@ironforge.rpg' } } },
                error: null
            } as any);

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            vi.mocked(prisma.factoryStatus.findMany).mockRejectedValue(new Error('DB Error'));

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
