# World Events Enhancement

## Overview

Dynamic world events triggered by global activity thresholds. When the community collectively hits training milestones, special events unlock with unique bosses, loot, and time-limited challenges.

## Metadata

- **Priority**: High
- **ROI**: 4.5
- **Effort**: S
- **GitHub Issue**: [#78](https://github.com/Techlemariam/IronForge/issues/78)

## User Stories

1. As a **Casual Titan**, I want to see global progress toward events so I feel part of a community.
2. As a **Hardcore Titan**, I want exclusive event loot that shows I participated.
3. As a **Guild Leader**, I want my guild to contribute to event unlocks for recognition.
4. As a **Returning Player**, I want to know what events I missed and when the next one is.

## Acceptance Criteria

- [ ] Global activity tracker (total XP earned across all players)
- [ ] Threshold-based event triggers (e.g., 1M XP unlocks boss)
- [ ] Event countdown/progress bar visible to all
- [ ] Limited-time event window (48-72 hours)
- [ ] Event participation rewards and leaderboard
- [ ] Event history log

## Technical Design

### Data Model

```prisma
model WorldEvent {
  id            String   @id @default(cuid())
  name          String
  description   String
  triggerType   String   // "xp_threshold", "workout_count", "scheduled"
  triggerValue  Int      // e.g., 1000000 XP
  currentValue  Int      @default(0)
  status        String   @default("pending") // "pending", "active", "ended"
  startsAt      DateTime?
  endsAt        DateTime?
  bossId        String?  // Special event boss
  rewardPool    Json     // Loot table for event
  createdAt     DateTime @default(now())
}

model EventParticipation {
  id          String   @id @default(cuid())
  eventId     String
  event       WorldEvent @relation(fields: [eventId], references: [id])
  titanId     String
  titan       Titan    @relation(fields: [titanId], references: [id])
  contribution Int     @default(0) // Player's XP during event
  claimed     Boolean  @default(false)
  
  @@unique([eventId, titanId])
}
```

### API Endpoints

| Method | Path | Description |
|:-------|:-----|:------------|
| GET | `/api/events/current` | Active or upcoming event |
| GET | `/api/events/history` | Past events |
| POST | `/api/events/[id]/contribute` | Record contribution (internal) |
| POST | `/api/events/[id]/claim-reward` | Claim participation reward |
| POST | `/api/cron/event-check` | Check thresholds, activate events |

### UI Components

| Component | Location | Description |
|:----------|:---------|:------------|
| WorldEventBanner | `src/components/events/WorldEventBanner.tsx` | Global progress bar |
| EventCountdown | `src/components/events/EventCountdown.tsx` | Time remaining |
| EventBossCard | `src/components/events/EventBossCard.tsx` | Special boss info |
| EventRewards | `src/components/events/EventRewards.tsx` | Claimable loot |

### State Management

- Real-time global counter via Supabase Realtime
- Event state cached with 1-minute TTL
- Participation tracked server-side on workout completion

## Dependencies

- [ ] XP calculation system (shipped)
- [ ] Boss system (shipped)
- [ ] Cron infrastructure (shipped)

## Out of Scope

- Guild-specific events (future)
- Real-time multiplayer raids
- Event creation UI (admin only)

## Open Questions

- [ ] Event frequency: Weekly or monthly?
- [ ] Threshold scaling: Fixed or based on active player count?
