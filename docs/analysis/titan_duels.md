# Titan vs Titan Duels Analysis

> Asynkrona 7-dagars dueller mellan Titans baserat på träningsprestation.

## Koncept

Utmana en vän eller random spelare. Under 7 dagar samlas poäng baserat på träning. Vinnaren får XP, Gold, och Rank Score.

## Platform Matrix

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ✅ | ⚠️ | ❌ |
| **Layout** | Full duel card + history | Compact card | Score ticker | N/A |
| **Input** | Click challenge | Tap/swipe | View only | N/A |
| **Offline?** | No | Cached scores | No | N/A |
| **Priority** | P0 | P0 | P2 | N/A |

**Notes:**
- Mobil: Push notification vid duel invite, snabb accept/decline
- TV Mode: "⚔️ Duel: You 1,250 vs 890" som ambient ticker
- Desktop: Full head-to-head comparison med grafer

## Duel Flow

```
Day 0: Challenge Sent
       ↓
Day 0-1: Opponent Accepts/Declines (24h window)
       ↓
Day 1-7: Competition Period (7 days)
       ↓
Day 8: Results Calculated
       ↓
       Winner receives rewards
       Loser receives consolation XP
```

## Scoring System

```typescript
interface DuelScore {
  workoutCount: number;      // +50 per workout
  totalVolume: number;       // kg lifted / 100
  totalTSS: number;          // Cardio load * 2
  prCount: number;           // +200 per PR
  streakMaintained: boolean; // +100 bonus
  perfectWeek: boolean;      // All 7 days active = +500
}

duelScore = (
  workoutCount * 50 +
  totalVolume / 100 +
  totalTSS * 2 +
  prCount * 200 +
  (streakMaintained ? 100 : 0) +
  (perfectWeek ? 500 : 0)
);
```

## Elo-Based Matchmaking

```typescript
// K-factor varies by experience
const K = duelsPlayed < 10 ? 40 : duelsPlayed < 30 ? 20 : 10;

// Expected score
const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));

// New Elo after match
const newElo = currentElo + K * (actualScore - expectedScore);
// actualScore: 1 for win, 0.5 for tie, 0 for loss
```

## Database Schema

```prisma
model DuelChallenge {
  id              String   @id @default(cuid())
  challengerId    String
  defenderId      String
  status          String   // PENDING, ACTIVE, COMPLETED, DECLINED, EXPIRED
  startDate       DateTime?
  endDate         DateTime?
  challengerScore Int      @default(0)
  defenderScore   Int      @default(0)
  winnerId        String?
  createdAt       DateTime @default(now())
  
  challenger      User     @relation("DuelChallenger", fields: [challengerId], references: [id])
  defender        User     @relation("DuelDefender", fields: [defenderId], references: [id])
  winner          User?    @relation("DuelWinner", fields: [winnerId], references: [id])
}

// Add to PvpProfile
model PvpProfile {
  // ... existing fields
  duelElo         Int      @default(1200)
  duelsWon        Int      @default(0)
  duelsLost       Int      @default(0)
  weeklyDuels     Int      @default(0)  // Max 3/week
  lastDuelReset   DateTime @default(now())
}
```

## Limits

| Rule | Value |
|:-----|:------|
| Duels per week | 3 |
| Accept window | 24h |
| Duel duration | 7 days |
| Min level to duel | 5 |
| Rematch cooldown | 14 days |

## Rewards

| Result | Rewards |
|:-------|:--------|
| **Win** | +100 XP, +50 Gold, +25 Rank Score |
| **Lose** | +25 XP, +10 Gold, -10 Rank Score |
| **Tie** | +50 XP, +25 Gold |

## UI Mockup

```
┌─────────────────────────────────────────┐
│  ⚔️ ACTIVE DUEL vs @IronMaiden          │
│  Time remaining: 3d 14h                  │
├─────────────────────────────────────────┤
│  YOU          vs          THEM          │
│  ████████░░  1,250    ░░░░░░░░░░  890   │
│  5 workouts           3 workouts        │
│  2 PRs                0 PRs             │
├─────────────────────────────────────────┤
│  [View Details]  [Send Taunt 💬]        │
└─────────────────────────────────────────┘
```

## Implementation Steps

1. Add `DuelChallenge` model to Prisma
2. Extend `PvpProfile` with Elo and duel counters
3. Create `duelService.ts` with challenge/accept/score logic
4. Add `DuelCard.tsx` UI component
5. Daily cron to update scores and finalize expired duels
