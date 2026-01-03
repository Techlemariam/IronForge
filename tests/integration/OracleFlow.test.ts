import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/cron/maintenance/daily/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { OracleService } from '@/services/oracle';
import { NotificationService } from '@/services/notifications';

// Mock Services
vi.mock('@/services/oracle', () => ({
    OracleService: { generateDailyDecree: vi.fn() }
}));

vi.mock('@/services/game/TerritoryService', () => ({
    distributeDailyIncome: vi.fn()
}));

vi.mock('@/services/notifications', () => ({
    NotificationService: { create: vi.fn() }
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => {
    const mockTitan = {
        findMany: vi.fn(),
        update: vi.fn()
    };
    return {
        default: {
            titan: mockTitan
        }
    };
});

// Mock Next Cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));

describe('Oracle Flow Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.CRON_SECRET = 'test-secret';
    });

    it('should query only PREMIUM users', async () => {
        (prisma.titan.findMany as any).mockResolvedValue([]);

        const req = new NextRequest('http://localhost/api/cron', {
            headers: { authorization: `Bearer test-secret` }
        });

        await GET(req);

        expect(prisma.titan.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                user: { subscriptionTier: { not: 'FREE' } }
            })
        }));
    });

    it('should send notification when Oracle requests it', async () => {
        // Mock DB returning 1 premium titan
        (prisma.titan.findMany as any).mockResolvedValue([{ userId: 'u1' }]);

        // Mock Oracle returning HIGH urgency decree
        (OracleService.generateDailyDecree as any).mockResolvedValue({
            type: 'DEBUFF',
            code: 'INJURY_PRESERVATION',
            label: 'Preserve',
            description: 'Rest now.',
            actions: { notifyUser: true, urgency: 'HIGH' }
        });

        const req = new NextRequest('http://localhost/api/cron', {
            headers: { authorization: `Bearer test-secret` }
        });

        await GET(req);

        // Verify Notification Service was called
        expect(NotificationService.create).toHaveBeenCalledWith({
            userId: 'u1',
            type: 'ORACLE_DECREE',
            message: 'Preserve: Rest now.'
        });

        // Verify Titan was updated
        expect(prisma.titan.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { userId: 'u1' }
        }));
    });
});
