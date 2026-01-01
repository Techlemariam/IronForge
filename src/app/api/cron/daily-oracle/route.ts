import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OracleService } from "@/services/oracle";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60s for processing multiple users

/**
 * Daily Oracle Cron Job
 * Runs at 06:00 UTC to generate proactive decrees for all active Titans.
 * Schedule: "0 6 * * *" (configured in vercel.json)
 */
export async function GET(request: NextRequest) {
    // 1. Authorization Check
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // 2. Get all users with active Titans
        const titans = await prisma.titan.findMany({
            where: { isInjured: false },
            select: { userId: true, name: true },
        });

        console.log(`[Oracle Cron] Processing ${titans.length} Titans...`);

        let processed = 0;
        let decreesIssued = 0;
        const errors: string[] = [];

        // 3. Process each Titan
        for (const titan of titans) {
            try {
                const decree = await OracleService.generateDailyDecree(titan.userId);

                // Only store meaningful decrees (BUFF or DEBUFF, not NEUTRAL)
                if (decree.type !== "NEUTRAL") {
                    // Update Titan's current buff
                    await prisma.titan.update({
                        where: { userId: titan.userId },
                        data: {
                            currentBuff: decree as any, // Store decree as JSON
                            buffExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h TTL
                        },
                    });

                    // Log decree to OracleMessage for history
                    await prisma.oracleMessage.create({
                        data: {
                            userId: titan.userId,
                            role: "assistant",
                            content: `[${decree.type}] ${decree.label}: ${decree.description}`,
                        },
                    });



                    decreesIssued++;
                }

                processed++;
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                errors.push(`User ${titan.userId}: ${errorMsg}`);
                console.error(`[Oracle Cron] Error for ${titan.userId}:`, err);
            }
        }

        // 4. Revalidate relevant paths
        revalidatePath("/dashboard");
        revalidatePath("/citadel");

        return NextResponse.json({
            success: true,
            processed,
            decreesIssued,
            errors: errors.length > 0 ? errors : undefined,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Oracle Cron] Critical Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
