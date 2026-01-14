import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/health/route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Mock Prisma
vi.mock('@/lib/prisma', () => {
    const mockPrisma = {
        $queryRaw: vi.fn(),
    };
    return {
        __esModule: true,
        default: mockPrisma,
        prisma: mockPrisma,
    };
});

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
        expect(json.db).toBe('connected');
        expect(json).toHaveProperty('timestamp');
    });

    it('should return 503 when database is disconnected', async () => {
        // Mock failed DB query
        (prisma.$queryRaw as any).mockRejectedValue(new Error('DB Connection Failed'));

        const response = await GET();
        const json = await response.json();

        expect(response.status).toBe(503);
        expect(json.status).toBe('error');
        expect(json.message).toBe('Database unreachable');
    });
});
