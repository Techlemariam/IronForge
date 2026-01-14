import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/health/route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        $queryRaw: vi.fn(),
    },
}));

describe('GET /api/health', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 200 OK when database is connected', async () => {
        // Mock successful DB query
        (prisma.$queryRaw as any).mockResolvedValue([1]);

        const response = await GET();
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.status).toBe('ok');
        expect(json.database).toBe('connected');
        expect(json).toHaveProperty('timestamp');
        expect(json).toHaveProperty('env');
        expect(json).toHaveProperty('gitSha');
    });

    it('should return 500 when database is disconnected', async () => {
        // Mock failed DB query
        (prisma.$queryRaw as any).mockRejectedValue(new Error('DB Connection Failed'));

        const response = await GET();
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.status).toBe('error');
        expect(json.database).toBe('disconnected');
        expect(json.error).toBe('DB Connection Failed');
    });
});
