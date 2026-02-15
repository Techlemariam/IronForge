import { NextResponse } from 'next/server';
import { BioPulseService } from '@/services/game/BioPulseService';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    if (!secret || authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { userId, type, data } = body;

        if (!userId || !type || !data) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let result;
        if (type === 'WORKOUT') {
            result = await BioPulseService.handleWorkoutPulse(userId, data);
        } else if (type === 'WELLNESS') {
            result = await BioPulseService.handleWellnessPulse(userId, data);
        } else {
            return NextResponse.json({ error: 'Invalid pulse type' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            pulse: type,
            details: result
        });
    } catch (error) {
        logger.error({ err: error }, 'API Error in /api/game/bio-pulse');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
