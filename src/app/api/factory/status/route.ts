import { getFactoryStatus } from '@/actions/factory';
import { getErrorMessage } from '@/lib/error-message';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getFactoryStatus();
    return NextResponse.json({
      success: true,
      stations: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error) || 'Failed to fetch factory status',
      },
      { status: 500 }
    );
  }
}
