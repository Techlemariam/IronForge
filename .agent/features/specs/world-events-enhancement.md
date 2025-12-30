# World Events Enhancement
**Priority:** High | **Effort:** S | **ROI:** 4.5
**Type:** Enhancement to existing `seasonal-events.ts`

## Overview
Enhance the existing seasonal events system with real-time community goals and progress tracking.

## Current State
- `src/actions/seasonal-events.ts` - Basic seasonal event framework
- Static events with fixed challenges
- No real-time progress tracking

## Enhancement Scope

### 1. Community Goals
Server-wide objectives that all players contribute to.

```typescript
interface CommunityGoal {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  metric: 'totalVolume' | 'totalWorkouts' | 'totalPRs' | 'bossesDefeated';
  rewardTiers: GoalTier[];
  startsAt: Date;
  endsAt: Date;
}

interface GoalTier {
  threshold: number; // Percentage of goal
  reward: Reward;
  unlocked: boolean;
}
```

### 2. Real-Time Counter
```typescript
// Increment community progress (called after relevant actions)
async function incrementCommunityGoal(
  goalId: string,
  increment: number,
  userId: string
): Promise<void> {
  // Update in Redis for real-time
  await redis.incrby(`goal:${goalId}:progress`, increment);
  
  // Track user contribution
  await redis.zincrby(`goal:${goalId}:contributors`, increment, userId);
  
  // Persist to DB periodically (every 5 min)
  // Check tier thresholds and unlock rewards
}
```

### 3. Leaderboard Integration
Top contributors visible during event.

## Data Model Additions

```prisma
model CommunityGoal {
  id           String   @id @default(cuid())
  eventId      String
  name         String
  description  String
  metric       String
  targetValue  Int
  currentValue Int      @default(0)
  rewardTiers  Json
  startsAt     DateTime
  endsAt       DateTime
  
  event        SeasonalEvent @relation(fields: [eventId], references: [id])
  contributions GoalContribution[]
}

model GoalContribution {
  id          String   @id @default(cuid())
  goalId      String
  userId      String
  amount      Int
  contributedAt DateTime @default(now())
  
  goal        CommunityGoal @relation(fields: [goalId], references: [id])
  user        User          @relation(fields: [userId], references: [id])
  
  @@index([goalId, userId])
}
```

## API Additions

### Enhance `src/actions/seasonal-events.ts`
```typescript
// Get active community goals
getCommunityGoalsAction(): Promise<CommunityGoal[]>

// Get goal progress and user contribution
getGoalProgressAction(goalId: string, userId: string): Promise<{
  goal: CommunityGoal;
  userContribution: number;
  userRank: number;
}>

// Get top contributors
getGoalLeaderboardAction(goalId: string, limit: number): Promise<Contributor[]>

// Contribute to goal (called internally)
contributeToGoalAction(goalId: string, userId: string, amount: number): Promise<void>
```

## UI Components

### `src/components/CommunityGoalBanner.tsx`
- Goal name and description
- Progress bar with percentage
- Time remaining
- Tier milestones
- User contribution stat

### `src/components/GoalContributors.tsx`
- Top 10 contributors
- User's rank if not in top 10
- Total participants count

## Example Community Goals

### Winter Event Goals
| Goal | Target | Tiers |
|------|--------|-------|
| **Lift the Frost** | 10M kg total volume | 25%: Snow Crate, 50%: Frost Title, 100%: Ice Armor Set |
| **Slay the Winter King** | 1000 boss kills | 50%: XP Boost, 100%: Crown Cosmetic |
| **Iron March** | 50K workouts | 33%: 500 Gold, 66%: Rare Crate, 100%: Limited Mount |

## Real-Time Updates

### WebSocket/Supabase Realtime
```typescript
// Subscribe to goal updates
const channel = supabase
  .channel('community_goals')
  .on('broadcast', { event: 'goal_update' }, (payload) => {
    updateGoalProgress(payload.goalId, payload.newValue);
  })
  .subscribe();
```

## Integration Points
- `training.ts`: Contribute volume after workout
- `combat.ts`: Contribute boss kills
- `challenges.ts`: Contribute workout completions
- Cron: Sync Redis → Postgres every 5 min

## Success Metrics
- Participation rate > 60%
- Average contribution per user
- Goal completion rate
- Event retention vs. non-event
