import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: [
    Sentry.replayIntegration(),
    Sentry.captureConsoleIntegration({ levels: ["error"] }),
  ],

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  enableLogs: true,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  sendDefaultPii: true,

  ignoreErrors: [
      /^chrome-extension:\/\//,
      /^Network Error$/,
      /^Failed to fetch$/,
      /^ResizeObserver loop/,
  ],

  environment: process.env.NODE_ENV,

  enabled: process.env.NODE_ENV === "production" || !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
