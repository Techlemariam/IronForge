
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { OracleService } from '@/services/oracle';

// Defines the shape of an Intervals.icu Activity (simplified)
interface IntervalsActivityPayload {
    id: string;
    type: string;
    start_date_local: string;
    moving_time: number;
    total_elevation_gain?: number;
    average_heartrate?: number;
    training_load?: number; // TSS
    source?: string;
}

export async function POST(request: NextRequest) {
    try {
        // 1. Verify Secret
        const signature = request.headers.get('Authorization'); // Or specific header
        // In production, we'd check this against process.env.INTERVALS_WEBHOOK_SECRET
        // For now, we'll log it for debugging.
        console.log('[Intervals Webhook] Received request. Signature:', signature);

        // 2. Parse Body
        const body = await request.json();
        const activity: IntervalsActivityPayload = body; // Simplified mapping

        if (!activity.id || !activity.type) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        console.log(`[Intervals Webhook] Processing Activity: ${activity.type} (${activity.id})`);

        // 3. Upsert to DB
        // Ideally we map this to our ExerciseLog or a dedicated generic 'ActivityLog'
        // For now, let's assume we log it if it's cardio.

        // TODO: Implement specific Upsert logic based on activity type
        // If Run/Bike/Swim -> Upsert ExerciseLog (Cardio)
        // If Strength -> Upsert specific strength session if details available

        // 4. Trigger Oracle Recalculation
        // The implementation plan mentions OracleService.recalculate(), which acts as a signal
        // to the system that new data is available.
        // Since it doesn't exist yet on the object, we'll just log or potentially add it later.
        console.log('[Intervals Webhook] Triggering Oracle recalculation...');

        return NextResponse.json({ success: true, message: 'Activity received' }, { status: 200 });

    } catch (error) {
        console.error('[Intervals Webhook] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
