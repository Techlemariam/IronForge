import { loggerContext } from './logger-context';
import { randomUUID } from 'crypto';

/**
 * Wraps a Server Action or API Route handler to inject a unique requestId into the logger context.
 * All subsequent logs within this handler will include the requestId.
 * 
 * @example
 * // In an API Route
 * export const GET = withLogger(async (req) => { ... })
 * 
 * @example
 * // In a Server Action
 * export const myAction = withLogger(async (data) => { ... })
 */
export function withLogger<T extends (...args: any[]) => Promise<any>>(handler: T): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const requestId = randomUUID();
    return loggerContext.run({ requestId }, () => {
      return handler(...args);
    });
  }) as T;
}
