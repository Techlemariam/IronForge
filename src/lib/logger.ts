import pino from 'pino';
import { getLoggerContext } from './logger-context';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Structured Logger
 * Provides consistent, level-based logging for the application.
 * In production, it outputs raw JSON for log aggregators (e.g., Sentry, Coolify).
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  browser: {
    asObject: true,
  },
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
  },
  redact: [
    'req.headers.authorization', 
    'password', 
    'token', 
    'apiKey', 
    'secret', 
    '*.password', 
    '*.token'
  ],
  mixin() {
    const context = getLoggerContext();
    return context ? context : {};
  }
});

/**
 * Helper for error logging with metadata and proper error serialization.
 */
export const logError = (msg: string, error: unknown, context?: Record<string, unknown>) => {
  const errPayload = error instanceof Error 
    ? { message: error.message, stack: error.stack, name: error.name } 
    : error;
    
  logger.error({ err: errPayload, ...context }, msg);
};
