import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Health Check Endpoint
 * Used for monitoring system health and database connectivity.
 */
export async function GET() {
    const startTime = Date.now();

    try {
        // 1. Check Database Connectivity
        // We use a simple query to verify the connection
        await prisma.$queryRaw`SELECT 1`;

        const duration = Date.now() - startTime;

        return NextResponse.json(
            {
                status: "ok",
                timestamp: new Date().toISOString(),
                database: "connected",
                latency: `${duration} ms`,
                environment: process.env.NODE_ENV,
            },
            { status: 200 }
        );
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error("Health check error:", error);

        return NextResponse.json(
            {
                status: "error",
                timestamp: new Date().toISOString(),
                database: "disconnected",
                error: error instanceof Error ? error.message : "Unknown error",
                latency: `${duration} ms`,
            },
            { status: 503 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
