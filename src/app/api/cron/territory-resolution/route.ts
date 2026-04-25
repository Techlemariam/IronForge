import { TerritoryResolutionService } from '@/services/game/TerritoryResolutionService';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Simple auth check for CRON_SECRET if available
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await TerritoryResolutionService.resolveWeeklyCycle();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Cron: Territory Resolution Failed:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
