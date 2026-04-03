/**
 * Jules Session Schema — Zod validation for active.json
 *
 * Usage:
 *   import { julesActiveFileSchema, type JulesSession } from '.agent/jules/jules-session.schema';
 *   const parsed = julesActiveFileSchema.parse(JSON.parse(fileContents));
 */

import { z } from 'zod';

// ─── Session Status ──────────────────────────────────────────────────────────
export const julesSessionStatusSchema = z.enum([
    'dispatched',
    'in_progress',
    'awaiting_review',
    'completed',
    'failed',
    'stale',
]);

// ─── Dispatch Source ─────────────────────────────────────────────────────────
export const julesDispatchSourceSchema = z.enum([
    'handoff',
    'dispatch',
    'night-shift',
    'n8n',
    'github-action',
]);

// ─── Task Source ─────────────────────────────────────────────────────────────
export const julesTaskSourceSchema = z.enum([
    'debt',
    'sprint',
    'roadmap',
    'custom',
]);

// ─── Single Session ──────────────────────────────────────────────────────────
export const julesSessionSchema = z.object({
    id: z.string().min(1, 'Session ID is required'),
    taskId: z.string().min(1, 'Task ID is required'),
    taskSource: julesTaskSourceSchema,
    taskTitle: z.string().optional(),
    branch: z.string().startsWith('jules/', 'Branch must start with jules/'),
    status: julesSessionStatusSchema,
    dispatchedAt: z.string().datetime(),
    dispatchedBy: julesDispatchSourceSchema,
    completedAt: z.string().datetime().nullable().default(null),
    prUrl: z.string().url().nullable().default(null),
    prNumber: z.number().int().positive().nullable().default(null),
    filesModified: z.array(z.string()).default([]),
    retryCount: z.number().int().min(0).max(3).default(0),
    lastError: z.string().nullable().default(null),
    metadata: z.record(z.unknown()).default({}),
});

// ─── Active File Root ────────────────────────────────────────────────────────
export const julesActiveFileSchema = z.object({
    version: z.literal('1.0.0'),
    lastUpdated: z.string().datetime().nullable().default(null),
    sessions: z.array(julesSessionSchema).default([]),
});

// ─── Type Exports ────────────────────────────────────────────────────────────
export type JulesSessionStatus = z.infer<typeof julesSessionStatusSchema>;
export type JulesDispatchSource = z.infer<typeof julesDispatchSourceSchema>;
export type JulesTaskSource = z.infer<typeof julesTaskSourceSchema>;
export type JulesSession = z.infer<typeof julesSessionSchema>;
export type JulesActiveFile = z.infer<typeof julesActiveFileSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Create a new session entry with defaults */
export function createSession(
    params: Pick<JulesSession, 'id' | 'taskId' | 'taskSource' | 'branch' | 'dispatchedBy'> &
        Partial<JulesSession>,
): JulesSession {
    return julesSessionSchema.parse({
        status: 'dispatched',
        dispatchedAt: new Date().toISOString(),
        ...params,
    });
}

/** Check if a session is terminal (completed or failed) */
export function isTerminal(session: JulesSession): boolean {
    return session.status === 'completed' || session.status === 'failed';
}

/** Check if a session is stale (dispatched > 2 hours ago, still not completed) */
export function isStale(session: JulesSession, maxAgeMs = 2 * 60 * 60 * 1000): boolean {
    if (isTerminal(session)) return false;
    const age = Date.now() - new Date(session.dispatchedAt).getTime();
    return age > maxAgeMs;
}
