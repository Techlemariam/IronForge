# Guild Territories
**Priority:** High | **Effort:** L | **ROI:** 4.6

## Overview
A world map system where guilds compete to control territories, earning passive bonuses and engaging in territory wars.

## Core Mechanics

### World Map
- **Regions:** 7 continents with 5-10 zones each
- **Zone Types:** Training Grounds, Resource Nodes, Fortresses
- **Control:** Guild with most weekly activity claims zone

### Territory Benefits
| Control Level | Bonus |
|---------------|-------|
| 1 Zone | +2% Gold for guild members |
| 3 Zones | +5% XP for guild members |
| 5 Zones | Unique guild title |
| Region Control | +10% all bonuses + cosmetic banner |

### Claiming Mechanics
```typescript
interface TerritoryClaimRules {
  claimWindow: 'weekly';       // Every Sunday
  activityMetric: 'totalVolume' | 'workoutCount' | 'xpEarned';
  tiebreaker: 'averagePerMember';
  minimumMembers: 3;
  contestCost: 1000; // Guild gold to contest
}
```

## Data Model

```prisma
model Territory {
  id          String   @id @default(cuid())
  name        String
  region      String
  type        TerritoryType
  bonuses     Json
  controlledBy String?
  controlledAt DateTime?
  
  guild       Guild?   @relation(fields: [controlledBy], references: [id])
  history     TerritoryHistory[]
}

model TerritoryHistory {
  id          String   @id @default(cuid())
  territoryId String
  guildId     String
  claimedAt   DateTime
  lostAt      DateTime?
  weekNumber  Int
  
  territory   Territory @relation(fields: [territoryId], references: [id])
}
```

## API Actions

### `src/actions/territories.ts`
```typescript
// Get world map with all territories
getWorldMapAction(): Promise<WorldMap>

// Get territory details
getTerritoryDetailsAction(territoryId: string): Promise<Territory>

// Get guild's controlled territories
getGuildTerritoriesAction(guildId: string): Promise<Territory[]>

// Contest a territory
contestTerritoryAction(guildId: string, territoryId: string): Promise<ContestResult>

// Process weekly territory claims (cron job)
processWeeklyClaimsAction(): Promise<ClaimResults>
```

## UI Components

### `src/components/WorldMap.tsx`
- Interactive SVG/Canvas map
- Color-coded by controlling guild
- Hover for territory info
- Click for details modal

### `src/components/TerritoryCard.tsx`
- Territory name and type icon
- Current controller
- Activity leaderboard
- Contest button (if applicable)

## Territory Types

### 1. Training Grounds
- **Bonus:** +X% XP for specific exercise type
- **Examples:** "Iron Peaks" (+10% compound lift XP)

### 2. Resource Nodes
- **Bonus:** +X% Gold/Materials generation
- **Examples:** "Gold Quarry" (+15% gold)

### 3. Fortresses
- **Bonus:** Guild-wide defensive buffs
- **Examples:** "Titan's Keep" (+5% all defenses)

## Weekly Cycle
1. **Monday-Saturday:** Activity accumulation
2. **Sunday 00:00 UTC:** Claims processed
3. **Sunday 00:01 UTC:** New week begins

## War Mechanics (Future Enhancement)
- Direct guild-vs-guild territory battles
- Stake territories in PvP matches
- Alliance formations

## Integration Points
- `guild-creation.ts`: Link territories to guild
- `training.ts`: Track activity per territory
- Cron job: Weekly claim processing
- `notification-preferences.ts`: Territory alerts

## Success Metrics
- Guild engagement increase > 20%
- Weekly active guilds > 50%
- Territory contests per week > 10
