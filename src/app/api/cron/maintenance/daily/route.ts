import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OracleService } from "@/services/oracle";
import { distributeDailyIncome } from "@/services/game/TerritoryService";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // 2 minutes for daily maintenance

/**
 * DAILY MAINTENANCE CRON
 * - Daily Oracle Decrees
 * - Territory Income Distribution
 */
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const report: any = {
        timestamp: new Date().toISOString(),
        tasks: {}
    };

    // 1. Daily Oracle
    try {
        const titans = await prisma.titan.findMany({
            where: { isInjured: false },
            select: { userId: true, name: true },
        });

        let decreesIssued = 0;
        for (const titan of titans) {
            try {
                const decree = await OracleService.generateDailyDecree(titan.userId);
                if (decree.type !== "NEUTRAL") {
                    await prisma.titan.update({
                        where: { userId: titan.userId },
                        data: {
                            currentBuff: decree as any,
                            buffExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        },
                    });
                    decreesIssued++;
                }
            } catch (e) {
                console.error(`Oracle failed for ${titan.userId}`, e);
            }
        }
        report.tasks.oracle = { success: true, processed: titans.length, decreesIssued };
    } catch (e) {
        report.tasks.oracle = { success: false, error: String(e) };
    }

    // 2. Territory Income
    try {
        await distributeDailyIncome();
        report.tasks.territoryIncome = { success: true };
    } catch (e) {
        report.tasks.territoryIncome = { success: false, error: String(e) };
    }

    revalidatePath("/dashboard");

    return NextResponse.json(report);
}
