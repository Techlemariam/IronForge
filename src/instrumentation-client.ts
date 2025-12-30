import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Adjust sample rate in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Capture unhandled promise rejections
    integrations: [
        Sentry.captureConsoleIntegration({ levels: ["error"] }),
    ],

    // Filter out common noise
    ignoreErrors: [
        // Browser extensions
        /^chrome-extension:\/\//,
        // Network errors that are expected
        /^Network Error$/,
        /^Failed to fetch$/,
        // User navigation
        /^ResizeObserver loop/,
    ],

    // Environment tagging
    environment: process.env.NODE_ENV,

    // Only enable in production or if explicitly enabled
    enabled: process.env.NODE_ENV === "production" || !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
