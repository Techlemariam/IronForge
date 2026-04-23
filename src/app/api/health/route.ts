import { logger, logError } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check DB Connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      { status: 'ok', timestamp: new Date().toISOString(), db: 'connected' },
      { status: 200 }
    );
  } catch (error) {
    logError('Health check failed', error);
    return NextResponse.json({ status: 'error', message: 'Database unreachable' }, { status: 503 });
  }
}
