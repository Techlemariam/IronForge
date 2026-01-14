import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
    try {
        // Check DB Connectivity
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json(
            { status: "ok", timestamp: new Date().toISOString(), db: "connected" },
            { status: 200 }
        );
    } catch (error) {
        logger.error({ err: error }, "Health check failed");
        return NextResponse.json(
            { status: "error", message: "Database unreachable" },
            { status: 503 }
        );
    }
}
