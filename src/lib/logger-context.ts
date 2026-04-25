import { AsyncLocalStorage } from 'node:async_hooks';

export type LoggerContextType = {
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
};

export const loggerContext = new AsyncLocalStorage<LoggerContextType>();

/**
 * Runs a callback within a logger context, automatically attaching context fields
 * to all logs generated within the callback execution scope.
 */
export function runWithLoggerContext<R>(context: LoggerContextType, callback: () => R): R {
  return loggerContext.run(context, callback);
}

/**
 * Retrieves the current logger context.
 */
export function getLoggerContext(): LoggerContextType | undefined {
  return loggerContext.getStore();
}
