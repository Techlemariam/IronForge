import * as Sentry from "@sentry/nextjs";

export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        Sentry.init({
            dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

            // Server-side sampling - lower than client
            tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,

            // Profile slow server requests
            profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

            // Environment tagging
            environment: process.env.NODE_ENV,

            // Only enable in production or if explicitly enabled
            enabled:
                process.env.NODE_ENV === "production" ||
                !!process.env.NEXT_PUBLIC_SENTRY_DSN,
        });
    }

    if (process.env.NEXT_RUNTIME === "edge") {
        Sentry.init({
            dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

            // Edge runtime sampling
            tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,

            // Environment tagging
            environment: process.env.NODE_ENV,

            // Only enable in production or if explicitly enabled
            enabled:
                process.env.NODE_ENV === "production" ||
                !!process.env.NEXT_PUBLIC_SENTRY_DSN,
        });
    }
}

export const onRequestError = Sentry.captureRequestError;
