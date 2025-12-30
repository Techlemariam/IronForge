# Oracle 3.0 Enhancement
**Priority:** High | **Effort:** M (reduced from XL) | **ROI:** 4.8
**Type:** Enhancement to existing `oracle.ts`, `oracle-seed.ts`, `gemini.ts`

## Overview
Evolve The Oracle from rule-based recommendations to a conversational AI coach, leveraging existing Gemini integration.

## Current State (Oracle 2.0)
- `src/services/oracle.ts` - Daily decree generation
- `src/actions/oracle-seed.ts` - Context aggregation
- `src/services/gemini.ts` - Already has `generateOracleAdvice()`
- `src/components/OracleChat.tsx` - Basic chat UI exists
- `src/components/OracleCard.tsx` - Decree display

## Enhancement Scope

### 1. Chat Memory (New)
Store conversation history for context.

```typescript
// Add to oracle-seed.ts
interface OracleConversation {
  userId: string;
  messages: { role: 'user' | 'oracle'; content: string; timestamp: Date }[];
  summary?: string; // For long conversations
}
```

### 2. Enhanced Prompts (Improve gemini.ts)
```typescript
const ORACLE_SYSTEM_PROMPT = `
You are The Iron Oracle of IronForge, a mystical coach who speaks with 
ancient wisdom but uses modern sports science.

You have access to:
- User's training history and PRs
- Wellness data (HRV, sleep, resting HR)
- Titan stats and level
- Current streak and overtraining status

Respond in character: wise, motivating, fantasy-themed but scientifically grounded.
Keep responses under 100 words unless asked for details.
`;
```

### 3. Improved Data Integration
Feed more context to Gemini from existing sources.

```typescript
// Enhance buildOracleContext in oracle-seed.ts
const context = {
  ...existingContext,
  recentWorkouts: last5Workouts,
  prHistory: recentPRs,
  favoriteExercises: topExercisesByVolume,
  goals: userGoals, // New: from settings
};
```

### 4. Quick Actions (New UI)
Pre-built question buttons in OracleChat.

```typescript
const QUICK_ACTIONS = [
  "What should I train today?",
  "Am I overtraining?",
  "How can I break my bench plateau?",
  "Suggest a deload week",
];
```

## Files to Modify

| File | Changes |
|------|---------|
| `oracle-seed.ts` | Add `getOracleChatAction()`, enhance context |
| `gemini.ts` | Improve prompts, add memory |
| `OracleChat.tsx` | Add quick actions, improve UX |
| `OracleCard.tsx` | Link to chat |

## New API Actions

```typescript
// oracle-seed.ts additions
chatWithOracleAction(
  userId: string,
  message: string
): Promise<{ response: string; insights?: OracleInsight[] }>

getOracleConversationAction(
  userId: string,
  limit: number
): Promise<OracleMessage[]>

clearOracleHistoryAction(userId: string): Promise<void>
```

## Cost Management
- Use existing Gemini API (already configured)
- Cache common responses
- Rate limit: 20 queries/day for free, unlimited for premium
- Use Gemini Flash for simple queries, Pro for complex

## No External Dependencies
Unlike original spec, this uses **existing Gemini integration** - no new APIs needed!

## Migration Path
1. Phase 1: Add chat memory + better prompts
2. Phase 2: Quick actions UI
3. Phase 3: Premium tier for advanced features

## Success Metrics
- Chat usage per user
- Response satisfaction (thumbs up/down)
- Recommendation follow-through
