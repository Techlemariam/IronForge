# Arena PvP Seasons
**Priority:** High | **Effort:** M | **ROI:** 4.7
**Type:** Enhancement to existing Arena system

## Overview
Add competitive ranked seasons with ELO matchmaking to the existing Arena/Duel system.

## Current State
- `ArenaClient.tsx` - Basic arena UI
- `CombatArena.tsx` - Combat mechanics
- `GauntletArena.tsx` - PvE gauntlet
- `duel.ts` - Basic duel actions

## Enhancement Scope

### 1. ELO Rating System
```typescript
interface PlayerRating {
  rating: number;        // Starting: 1200
  peakRating: number;
  wins: number;
  losses: number;
  streak: number;
  rank: RankTier;
}

type RankTier = 
  | 'BRONZE'    // 0-1199
  | 'SILVER'    // 1200-1499
  | 'GOLD'      // 1500-1799
  | 'PLATINUM'  // 1800-2099
  | 'DIAMOND'   // 2100-2399
  | 'CHAMPION'  // 2400+
  | 'LEGEND';   // Top 100

// K-factor based on rating
const getKFactor = (rating: number): number => {
  if (rating < 1600) return 32;
  if (rating < 2000) return 24;
  return 16;
};

// ELO calculation
const calculateEloChange = (
  winnerRating: number,
  loserRating: number
): { winnerGain: number; loserLoss: number } => {
  const expectedWin = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const k = getKFactor(winnerRating);
  const change = Math.round(k * (1 - expectedWin));
  return { winnerGain: change, loserLoss: change };
};
```

### 2. Seasonal Structure
- **Duration:** 4 weeks per season
- **Reset:** Soft reset (rating compressed toward 1200)
- **Rewards:** Based on peak rating achieved

### 3. Matchmaking Queue
```typescript
interface MatchmakingConfig {
  initialRange: 100;      // ±100 rating
  rangeExpansion: 50;     // Expand every 30s
  maxRange: 500;          // Maximum difference
  queueTimeout: 180;      // 3 minutes
}
```

## Data Model

```prisma
model PvpRating {
  id          String   @id @default(cuid())
  userId      String   @unique
  seasonId    String
  rating      Int      @default(1200)
  peakRating  Int      @default(1200)
  wins        Int      @default(0)
  losses      Int      @default(0)
  winStreak   Int      @default(0)
  rank        String   @default("BRONZE")
  
  user        User     @relation(fields: [userId], references: [id])
  season      PvpSeason @relation(fields: [seasonId], references: [id])
  
  @@index([rating])
  @@index([seasonId, rating])
}

model PvpSeason {
  id          String   @id @default(cuid())
  name        String
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean  @default(false)
  rewards     Json
  
  ratings     PvpRating[]
}

model PvpMatch {
  id          String   @id @default(cuid())
  seasonId    String
  player1Id   String
  player2Id   String
  winnerId    String?
  player1Rating Int
  player2Rating Int
  ratingChange Int
  duration    Int      // seconds
  createdAt   DateTime @default(now())
}
```

## API Actions

### `src/actions/pvp-ranked.ts`
```typescript
// Join matchmaking queue
joinRankedQueueAction(userId: string): Promise<QueueResult>

// Leave queue
leaveRankedQueueAction(userId: string): Promise<void>

// Get current rating and rank
getRatingAction(userId: string): Promise<PlayerRating>

// Get season leaderboard
getSeasonLeaderboardAction(limit: number): Promise<LeaderboardEntry[]>

// Get match history
getMatchHistoryAction(userId: string, limit: number): Promise<PvpMatch[]>

// Process match result (internal)
processMatchResultAction(matchId: string, winnerId: string): Promise<void>
```

## UI Enhancements

### `src/components/RankedLobby.tsx`
- Current rating and rank badge
- Queue button with timer
- Matchmaking animation
- Recent opponents list

### `src/components/RankBadge.tsx`
- Tier icon (Bronze → Legend)
- Rating number
- Win/Loss record
- Current streak

### `src/components/SeasonRewards.tsx`
- Rank thresholds
- Reward preview per tier
- Days remaining
- Current standing

## Season Rewards

| Rank | Rewards |
|------|---------|
| Bronze | 500 Gold + Bronze Frame |
| Silver | 1000 Gold + Silver Frame |
| Gold | 2000 Gold + Gold Frame + Title |
| Platinum | 3000 Gold + Plat Frame + Weapon Skin |
| Diamond | 5000 Gold + Diamond Frame + Full Set |
| Champion | 10000 Gold + Animated Frame + Mount |
| Legend | All above + Unique Title + Trophy |

## Anti-Abuse
- Minimum 10 matches for rewards
- Win trading detection (same opponent >3x)
- AFK detection (no actions for 60s, accounts for weight changes/setup)
- Rating floor per tier (can't drop below tier minimum)

## Integration Points
- `duel.ts`: Extend for ranked mode
- `combat.ts`: Use existing combat system
- `leaderboards.ts`: Add ranked leaderboard
- `achievements.ts`: Add ranked achievements

## Success Metrics
- Daily ranked matches > 100
- Average queue time < 60s
- Rating distribution bell curve
