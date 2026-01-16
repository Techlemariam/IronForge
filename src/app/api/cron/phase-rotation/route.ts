import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WardensService } from '@/services/WardensService';


export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export async function GET(req: NextRequest) {
    // 1. Verify Authentication (Cron Secret)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 2. Fetch all manifests with autoRotate = true
        // In production, we would use cursor-based pagination to handle thousands of users.
        // For now, assuming manageable user base < 1000 for single run.
        const manifests = await prisma.wardensManifest.findMany({
            where: { autoRotate: true },
        });

        const report = {
            processed: 0,
            rotated: 0,
            errors: 0,
        };

        const now = new Date();

        for (const record of manifests) {
            report.processed++;

            try {
                const manifest = await WardensService.getManifest(record.userId);
                if (!manifest) continue;

                // Check Phase Duration
                // Assuming Standard Phase is 4 weeks. 
                // Logic: if current date > phaseStartDate + 28 days -> Check transition
                const daysInPhase = (now.getTime() - manifest.phaseStartDate.getTime()) / (1000 * 3600 * 24);
                const weeksInPhase = Math.floor(daysInPhase / 7);

                // Update Phase Week
                const currentStoredWeek = manifest.phaseWeek;
                const calculatedWeek = weeksInPhase + 1;

                if (calculatedWeek > currentStoredWeek) {
                    // Just increment week
                    await WardensService.updatePhase(record.userId, manifest.phase, calculatedWeek);
                }

                // Logic for Phase Rotation (End of Block)
                // Usually handled by GoalPriorityEngine.selectPhase logic looking for stalls or schedule
                // But here we might force a rotation if 4 weeks passed.
                // For Gap Resolution, let's implement simple Week Increment.
                // Full rotation logic typically requires Wellness Data which we don't have here efficiently.
                // So we strictly maintain the "Phase Clock".

            } catch (e) {
                console.error(`Failed to rotate user ${record.userId}`, e);
                report.errors++;
            }
        }

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error('Cron job failed', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
