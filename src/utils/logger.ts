import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Structured Logger
 * Provides consistent, level-based logging for the application.
 * In development, it uses pino-pretty for better readability.
 * In production, it outputs raw JSON for log aggregators (e.g., Sentry, Vercel).
 */
export const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    browser: {
        asObject: true,
    },
    transport: isDevelopment
        ? {
            target: "pino-pretty",
            options: {
                colorize: true,
                ignore: "pid,hostname",
                translateTime: "HH:MM:ss Z",
            },
        }
        : undefined,
});

// Helper for error logging with metadata
export const logError = (message: string, error: unknown, metadata: object = {}) => {
    logger.error(
        {
            err: error instanceof Error ? { message: error.message, stack: error.stack } : error,
            ...metadata,
        },
        message
    );
};

export default logger;
