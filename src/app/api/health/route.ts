import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assumed path based on architecture.md

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Check Database Connectivity
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json(
            {
                status: 'ok',
                timestamp: new Date().toISOString(),
                env: process.env.NODE_ENV,
                gitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
                database: 'connected',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Health Check Failed:', error);
        return NextResponse.json(
            {
                status: 'error',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
