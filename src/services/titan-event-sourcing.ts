"use server";

import { prisma } from "@/lib/prisma";

// ============================================
// UNIFIED TITAN SOUL - EVENT SOURCING
// Immutable event log for all state changes
// ============================================

type TitanEventType =
  | "XP_GAINED"
  | "LEVEL_UP"
  | "STAT_CHANGED"
  | "RESOURCE_CHANGED"
  | "GOLD_EARNED"
  | "GOLD_SPENT"
  | "ITEM_EQUIPPED"
  | "ITEM_UNEQUIPPED"
  | "BUFF_APPLIED"
  | "BUFF_EXPIRED"
  | "COMBAT_STARTED"
  | "COMBAT_ENDED"
  | "DUNGEON_CLEARED"
  | "ACHIEVEMENT_UNLOCKED"
  | "QUEST_COMPLETED"
  | "SYNC_CONFLICT"
  | "STATE_RECOVERED";

interface TitanEvent {
  id: string;
  userId: string;
  eventType: TitanEventType;
  payload: Record<string, unknown>;
  previousValue?: unknown;
  newValue?: unknown;
  source: string;
  timestamp: Date;
  version: number;
  deviceId?: string;
}

// In-memory event store (in production: append-only DB table)
const eventStore: TitanEvent[] = [];

/**
 * Record a new Titan event.
 */
export async function recordTitanEvent(
  userId: string,
  eventType: TitanEventType,
  payload: Record<string, unknown>,
  options?: {
    previousValue?: unknown;
    newValue?: unknown;
    source?: string;
    deviceId?: string;
  },
): Promise<TitanEvent> {
  const event: TitanEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    eventType,
    payload,
    previousValue: options?.previousValue,
    newValue: options?.newValue,
    source: options?.source || "SYSTEM",
    timestamp: new Date(),
    version: eventStore.filter((e) => e.userId === userId).length + 1,
    deviceId: options?.deviceId,
  };

  eventStore.push(event);
  console.log(`[EVENT] ${eventType} for ${userId}: ${JSON.stringify(payload)}`);

  return event;
}

/**
 * Get event history for a Titan.
 */
export async function getTitanEventHistory(
  userId: string,
  options?: {
    limit?: number;
    eventTypes?: TitanEventType[];
    since?: Date;
  },
): Promise<TitanEvent[]> {
  let events = eventStore.filter((e) => e.userId === userId);

  if (options?.eventTypes) {
    events = events.filter((e) => options.eventTypes!.includes(e.eventType));
  }

  if (options?.since) {
    events = events.filter((e) => e.timestamp >= options.since!);
  }

  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (options?.limit) {
    events = events.slice(0, options.limit);
  }

  return events;
}

/**
 * Replay events to reconstruct state at a point in time.
 */
export async function replayTitanEvents(
  userId: string,
  upToVersion: number,
): Promise<Record<string, unknown>> {
  const events = eventStore
    .filter((e) => e.userId === userId && e.version <= upToVersion)
    .sort((a, b) => a.version - b.version);

  const state: Record<string, unknown> = {
    level: 1,
    xp: 0,
    stats: {
      strength: 10,
      vitality: 10,
      endurance: 10,
      agility: 10,
      willpower: 10,
    },
    resources: { hp: 100, currentEnergy: 100 },
    economy: { gold: 0 },
  };

  for (const event of events) {
    switch (event.eventType) {
      case "XP_GAINED":
        state.xp = (state.xp as number) + (event.payload.amount as number);
        break;
      case "LEVEL_UP":
        state.level = event.newValue as number;
        break;
      case "STAT_CHANGED":
        const stats = state.stats as Record<string, number>;
        const statChange = event.payload as Record<string, number>;
        for (const [key, value] of Object.entries(statChange)) {
          if (stats[key] !== undefined) stats[key] += value;
        }
        break;
      case "GOLD_EARNED":
        (state.economy as Record<string, number>).gold += event.payload
          .amount as number;
        break;
      case "GOLD_SPENT":
        (state.economy as Record<string, number>).gold -= event.payload
          .amount as number;
        break;
    }
  }

  return state;
}

/**
 * Get events for audit/debugging.
 */
export async function getEventAuditLog(
  userId: string,
  limit: number = 100,
): Promise<
  Array<{
    time: string;
    event: string;
    details: string;
  }>
> {
  const events = await getTitanEventHistory(userId, { limit });

  return events.map((e) => ({
    time: e.timestamp.toISOString(),
    event: e.eventType,
    details: JSON.stringify(e.payload),
  }));
}

/**
 * Check for suspicious activity patterns.
 */
export async function detectAnomalies(
  userId: string,
): Promise<{ suspicious: boolean; reasons: string[] }> {
  const recentEvents = await getTitanEventHistory(userId, { limit: 50 });
  const reasons: string[] = [];

  // Check for impossible XP gains
  const xpEvents = recentEvents.filter((e) => e.eventType === "XP_GAINED");
  const totalXpLast5Min = xpEvents
    .filter((e) => e.timestamp.getTime() > Date.now() - 5 * 60 * 1000)
    .reduce((sum, e) => sum + (e.payload.amount as number), 0);

  if (totalXpLast5Min > 10000) {
    reasons.push(`Abnormal XP gain: ${totalXpLast5Min} XP in 5 minutes`);
  }

  // Check for rapid gold changes
  const goldEvents = recentEvents.filter(
    (e) => e.eventType === "GOLD_EARNED" || e.eventType === "GOLD_SPENT",
  );
  if (goldEvents.length > 20) {
    reasons.push("High frequency of economy events");
  }

  return { suspicious: reasons.length > 0, reasons };
}
