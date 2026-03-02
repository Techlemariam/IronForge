"use server";

import { getSession } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const ALLOWED_CRON_PATHS = [
    "/api/cron/power-rating",
    "/api/cron/maintenance/weekly",
    "/api/cron/maintenance/daily",
    "/api/cron/territory-weekly",
    "/api/cron/generate-plans",
    "/api/cron/season-transition",
    "/api/cron/duel-scoring",
    "/api/cron/territory/income",
    "/api/cron/territory/settlement",
    "/api/cron/daily-oracle",
    "/api/cron/territory-resolution",
    "/api/cron/heartbeat",
    "/api/cron/phase-rotation"
];

/**
 * Server Action to trigger a cron job securely.
 * Authenticates the user session and checks for admin privileges before making the request.
 * Uses the server-side CRON_SECRET for authorization.
 */
export async function triggerCronAction(path: string) {
    try {
        // 1. Authentication Check
        const session = await getSession();
        if (!session?.user) {
            logger.warn({ path }, "Unauthorized attempt to trigger cron: No session");
            return { success: false, error: "Unauthorized" };
        }

        // 2. Authorization Check (Admin Only)
        // We check for LIFETIME subscription tier or specific email as a proxy for admin
        // since a dedicated 'admin' role isn't explicitly in the schema yet.
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { subscriptionTier: true, email: true }
        });

        const isAdmin = user?.subscriptionTier === "LIFETIME" ||
                        user?.email?.endsWith("@ironforge.rpg") ||
                        process.env.NODE_ENV === 'development';

        if (!isAdmin) {
            logger.warn({ userId: session.user.id, path }, "Forbidden attempt to trigger cron: Non-admin user");
            return { success: false, error: "Forbidden: Admin access required" };
        }

        // 3. SSRF Protection: Validate path
        if (!ALLOWED_CRON_PATHS.includes(path)) {
            logger.warn({ path, userId: session.user.id }, "SSRF Attempt: Blocked invalid cron path");
            return { success: false, error: "Invalid cron path" };
        }

        const secret = process.env.CRON_SECRET || "dev_secret";

        // 4. Secure URL Construction
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
        const host = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'localhost:3000';
        const baseUrl = host.includes('://') ? host : `${protocol}://${host}`;

        // Construct the URL using the URL object to prevent manipulation
        const url = new URL(path, baseUrl).toString();

        const res = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${secret}`,
            },
            cache: 'no-store'
        });

        if (res.ok) {
            const data = await res.json().catch(() => ({ success: true }));
            return { success: true, data };
        } else {
            const errorData = await res.json().catch(() => ({}));
            return {
                success: false,
                error: errorData.error || res.statusText,
                status: res.status
            };
        }
    } catch (error) {
        logger.error({ err: error, path }, "Error triggering cron via server action");
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
