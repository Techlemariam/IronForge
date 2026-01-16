# Guild Territories

## Overview

Allow guilds to claim, defend, and contest map territories for exclusive resource bonuses and bragging rights. Territories refresh weekly with a contest cycle.

## Metadata

- **Priority**: High
- **ROI**: 4.6
- **Effort**: L
- **GitHub Issue**: [#75](https://github.com/Techlemariam/IronForge/issues/75)

## User Stories

1. As a **Guild Leader**, I want to claim an unclaimed territory so that my guild gains its resource bonus.
2. As a **Guild Member**, I want to see which territories my guild controls so that I know our current power.
3. As a **Hardcore Titan**, I want to contest an enemy territory so that we can take it from a rival guild.
4. As a **Casual Titan**, I want to contribute to territory defense passively through my workouts.
5. As a **Coach**, I want to see territory bonuses so I can motivate my athletes to train harder.

## Acceptance Criteria

- [ ] Map view shows all territories with ownership colors
- [ ] Guild leaders can initiate territory claims
- [ ] Weekly contest cycle runs automatically (Sunday reset)
- [ ] Territory bonuses apply to all guild members
- [ ] Notifications for territory gained/lost
- [ ] Leaderboard of guilds by territory count

## Technical Design

### Data Model

```prisma
model Territory {
  id          String   @id @default(cuid())
  name        String   @unique
  region      String   // e.g., "Nordic", "Americas", "Asia"
  bonusType   String   // "xp", "gold", "loot"
  bonusValue  Float    @default(1.1) // 10% bonus
  ownerId     String?  // Guild ID
  owner       Guild?   @relation(fields: [ownerId], references: [id])
  contestedBy String?  // Challenging Guild ID
  claimedAt   DateTime?
  createdAt   DateTime @default(now())
}

model TerritoryContest {
  id            String   @id @default(cuid())
  territoryId   String
  territory     Territory @relation(fields: [territoryId], references: [id])
  attackerId    String   // Guild initiating contest
  defenderId    String   // Current owner
  attackerScore Int      @default(0)
  defenderScore Int      @default(0)
  startsAt      DateTime
  endsAt        DateTime
  status        String   @default("active") // "active", "resolved"
  winnerId      String?
}
```

### API Endpoints

| Method | Path | Description |
|:-------|:-----|:------------|
| GET | `/api/territories` | List all territories with ownership |
| POST | `/api/territories/[id]/claim` | Claim unclaimed territory |
| POST | `/api/territories/[id]/contest` | Initiate contest against owner |
| GET | `/api/territories/contests` | List active contests |
| POST | `/api/cron/territory-weekly` | Weekly resolution cron |

### UI Components

| Component | Location | Description |
|:----------|:---------|:------------|
| TerritoryMap | `src/components/guild/TerritoryMap.tsx` | Interactive map with territory tiles |
| TerritoryCard | `src/components/guild/TerritoryCard.tsx` | Single territory details |
| ContestProgress | `src/components/guild/ContestProgress.tsx` | Live contest score bar |
| TerritoryLeaderboard | `src/components/guild/TerritoryLeaderboard.tsx` | Guild ranking by territories |

### State Management

- Server-authoritative: All territory state in DB
- Real-time updates via Supabase Realtime for contest scores
- Client caches territory list, invalidates on contest resolution

## Dependencies

- [ ] Guild system must be complete (already shipped)
- [ ] Cron job infrastructure (already exists)

## Out of Scope

- Individual player territories (guild-only)
- Real-time PvP battles for territories
- Territory trading between guilds

## Open Questions

- [ ] How many territories total? (Suggestion: 20-30)
- [ ] Should territory bonuses stack? (Suggestion: Cap at 3 territories)
