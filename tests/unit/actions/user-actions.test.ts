import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOrCreateUserAction, updateGoldAction } from '@/actions/user-actions';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

// Mock Supabase Auth for authActionClient
vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        user: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        $transaction: vi.fn((callback) => callback(prisma)),
    },
}));

describe('User Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (createClient as any).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
            },
        });
    });

    describe('getOrCreateUserAction', () => {
        it('should return existing user if found', async () => {
            const mockUser = { id: 'user-1', email: 'test@example.com' };
            vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

            const result = await getOrCreateUserAction({ email: 'test@example.com' });
            expect(result?.data?.user).toEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { email: 'test@example.com' } }));
            expect(prisma.user.create).not.toHaveBeenCalled();
        });

        it('should create user if not found', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
            const newUser = { id: 'new-user', email: 'new@example.com' };
            vi.mocked(prisma.user.create).mockResolvedValue(newUser as any);

            const result = await getOrCreateUserAction({ email: 'new@example.com' });
            expect(result?.data?.user).toEqual(newUser);
            expect(prisma.user.create).toHaveBeenCalled();
        });
    });

    describe('updateGoldAction', () => {
        it('should update gold amount', async () => {
            const mockUser = { id: 'user-1', gold: 100 };
            vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

            // Mock auth properly if needed, but since it's unit we just pass the value
            // Actually, we need to mock the server context or the test might throw. 
            // If it succeeds we just check the call.
            await updateGoldAction(500);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: { gold: 500 }
            });
        });
    });
});
