# Arena PvP Seasons

## Overview

Implement ranked competitive seasons with decay logic, tier rewards, and seasonal resets. Players compete in ranked matches to climb the ladder and earn exclusive rewards.

## Metadata

- **Priority**: High
- **ROI**: 4.0
- **Effort**: M
- **GitHub Issue**: [#77](https://github.com/Techlemariam/IronForge/issues/77)

## User Stories

1. As a **Hardcore Titan**, I want to compete in ranked seasons so that I can prove I'm the best.
2. As a **Casual Titan**, I want to see my season rank so I know where I stand.
3. As a **Guild Leader**, I want to see my guild's average rank for bragging rights.
4. As a **Returning Player**, I want to understand rank decay so I know I need to stay active.
5. As a **Top Player**, I want exclusive seasonal rewards to show off my achievements.

## Acceptance Criteria

- [ ] Seasons last 3 months with defined start/end dates
- [ ] Rank tiers: Bronze → Silver → Gold → Platinum → Diamond → Warlord
- [ ] Rank decay after 7 days of inactivity (loses 1 tier per week)
- [ ] End-of-season rewards based on peak rank
- [ ] Seasonal leaderboard with top 100 display
- [ ] Match history shows season context

## Technical Design

### Data Model

```prisma
model Season {
  id        String   @id @default(cuid())
  name      String   // "Season 1: Iron Dawn"
  startDate DateTime
  endDate   DateTime
  status    String   @default("upcoming") // "upcoming", "active", "ended"
  createdAt DateTime @default(now())
}

model SeasonRank {
  id           String   @id @default(cuid())
  seasonId     String
  season       Season   @relation(fields: [seasonId], references: [id])
  titanId      String
  titan        Titan    @relation(fields: [titanId], references: [id])
  currentTier  String   @default("Bronze") // tier name
  currentRating Int     @default(1000) // ELO-like
  peakTier     String   @default("Bronze")
  peakRating   Int      @default(1000)
  wins         Int      @default(0)
  losses       Int      @default(0)
  lastMatchAt  DateTime?
  updatedAt    DateTime @updatedAt
  
  @@unique([seasonId, titanId])
}

model SeasonReward {
  id          String   @id @default(cuid())
  seasonId    String
  tierRequired String  // Minimum tier to claim
  rewardType  String   // "title", "cosmetic", "gold", "item"
  rewardValue String   // JSON or ID reference
}
```

### API Endpoints

| Method | Path | Description |
|:-------|:-----|:------------|
| GET | `/api/seasons/current` | Get active season info |
| GET | `/api/seasons/[id]/leaderboard` | Top 100 for season |
| GET | `/api/titans/[id]/season-rank` | Player's current rank |
| POST | `/api/cron/season-decay` | Daily decay check |
| POST | `/api/cron/season-end` | End-of-season reward distribution |

### UI Components

| Component | Location | Description |
|:----------|:---------|:------------|
| SeasonBanner | `src/components/pvp/SeasonBanner.tsx` | Current season countdown/info |
| RankBadge | `src/components/pvp/RankBadge.tsx` | Visual tier badge |
| SeasonLeaderboard | `src/components/pvp/SeasonLeaderboard.tsx` | Top 100 list |
| DecayWarning | `src/components/pvp/DecayWarning.tsx` | Inactivity alert |
| SeasonRewards | `src/components/pvp/SeasonRewards.tsx` | Claimable rewards UI |

### State Management

- Season data cached client-side with 1-hour TTL
- Rank updates in real-time after matches
- Leaderboard uses SWR with 5-minute revalidation

## Dependencies

- [ ] PvP matching system (already shipped)
- [ ] Titan profile system (already shipped)

## Out of Scope

- Cross-season statistics (future feature)
- Team/Guild ranked mode
- Placement matches (start at Bronze)

## Open Questions

- [ ] Season length: 3 months or 2 months?
- [ ] Decay rate: 1 tier/week or rating-based?
