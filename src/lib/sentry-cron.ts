import { NextResponse } from "next/server";
import { captureCheckIn } from "@sentry/nextjs";
import { SentryMonitorOptions } from "@/types";

type RouteHandler = (request: Request) => Promise<NextResponse>;

/**
 * Wraps a Next.js Route Handler with Sentry Cron Monitoring.
 * Automatically sends:
 * 1. Check-in "in_progress" start event
 * 2. Check-in "ok" on success
 * 3. Check-in "error" on failure
 * 
 * @param handler The standard Next.js route handler function
 * @param options Sentry monitor configuration
 */
export function withCronMonitor(
    handler: RouteHandler,
    options: SentryMonitorOptions
): RouteHandler {
    return async (request: Request) => {
        const { slug } = options;
        const monitorSlug = slug;

        // 1. Send "In Progress" Check-In
        const checkInId = captureCheckIn(
            {
                monitorSlug,
                status: "in_progress",
            },
        );

        try {
            // 2. Execute Handler
            const response = await handler(request);

            // Check for non-200 responses which might imply logical failure
            if (!response.ok) {
                captureCheckIn({
                    monitorSlug,
                    status: "error",
                    checkInId,
                });
                return response;
            }

            // 3. Send "Success" Check-In
            captureCheckIn({
                monitorSlug,
                status: "ok",
                checkInId,
            });

            return response;

        } catch (error) {
            // 4. Send "Error" Check-In and rethrow
            captureCheckIn({
                monitorSlug,
                status: "error",
                checkInId,
            });
            throw error;
        }
    };
}
