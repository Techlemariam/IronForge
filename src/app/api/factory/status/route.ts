import { NextResponse } from 'next/server';
import { getFactoryStatus } from '@/actions/factory';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const stats = await getFactoryStatus();
        return NextResponse.json({
            success: true,
            stations: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch factory status'
        }, { status: 500 });
    }
}
