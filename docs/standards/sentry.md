# Sentry Implementation Standards

These guidelines define how to implement Sentry tracing, logging, and exception catching in IronForge.

## 1. Exception Catching
Use `Sentry.captureException(error)` in try-catch blocks or where exceptions are expected but handled.

```typescript
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error);
  // handle error
}
```

## 2. Tracing (Spans)
Create spans for meaningful actions (button clicks, API calls).

### Component Actions
```typescript
function TestComponent() {
  const handleClick = () => {
    Sentry.startSpan({ op: "ui.click", name: "Button Click" }, (span) => {
        span.setAttribute("config", "value");
        doSomething();
    });
  };
}
```

### API Calls
```typescript
async function fetchUserData(userId) {
  return Sentry.startSpan({ op: "http.client", name: `GET /api/users/${userId}` }, async () => {
      const response = await fetch(`/api/users/${userId}`);
      return await response.json();
  });
}
```

## 3. Logging
Use `import * as Sentry from "@sentry/nextjs"`.
Enable logging in `Sentry.init` with `enableLogs: true`.

### Structured Logs
Use `logger` for structured logging (if available via integration) or standard Sentry methods.

```typescript
// If using Sentry logger integration (hypothetical based on provided rules)
logger.info("Updated profile", { profileId: 345 });
```

## 4. Configuration Locations
- **Client:** `src/instrumentation-client.ts` (or `sentry.client.config.ts`)
- **Server:** `src/instrumentation.ts` (or `sentry.server.config.ts`)
- **Edge:** `sentry.edge.config.ts`

**Baseline Config:**
```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enableLogs: true,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
});
```
