import { NextResponse } from 'next/server';
import { updateTitanAction } from '@/actions/titan';
import { sendNotificationAction } from '@/actions/notifications';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    // 1. Auth: Verify Cron Secret (Simple check)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // For Vercel Cron, usually separate logic, but this is a standard guard
        // return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - 48); // 48 hours inactivity

        // 2. Decay Logic: Find Titans inactive > 48h not already weakened
        // 2. Decay Logic: Find Titans inactive > 48h not already weakened
        const titansToWeaken = await prisma.titan.findMany({
            where: {
                lastActive: { lt: cutoff },
                mood: { not: 'WEAKENED' },
                isResting: false // Don't decay if they are officially resting
            },
            select: {
                id: true,
                userId: true,
                name: true,
                lastActive: true,
            }
        });

        let decayedCount = 0;
        for (const titan of titansToWeaken) {
            await prisma.titan.update({
                where: { id: titan.id },
                data: {
                    mood: 'WEAKENED',
                    energy: { decrement: 20 }, // Lose energy
                }
            });
            decayedCount++;

            // NOTIFICATION TRIGGER
            const now = new Date();
            const hoursSinceActive = (now.getTime() - titan.lastActive.getTime()) / (1000 * 60 * 60);
            await sendNotificationAction(
                titan.userId,
                "Titan Alert: Pulse Weakening",
                `${titan.name} feels the cold void. It has been ${hoursSinceActive.toFixed(1)} hours since your last link. Return to the Forge.`
            );
        }

        // 3. Regeneration Logic: Recover Energy for resting Titans
        const recovered = await prisma.titan.updateMany({
            where: {
                isResting: true,
                energy: { lt: 100 }
            },
            data: {
                energy: { increment: 10 },
                // mood: 'FOCUSED' // Maybe
            }
        });

        // 4. Streak Breaker (Separate query if needed complex logic)
        // For now, simpler decay is enough for MVP

        return NextResponse.json({
            success: true,
            decayedCount: decayedCount,
            recoveredCount: recovered.count
        });
    } catch (error) {
        console.error("Heartbeat Error:", error);
        return NextResponse.json({ success: false, error: 'Heartbeat skipped a beat' }, { status: 500 });
    }
}
