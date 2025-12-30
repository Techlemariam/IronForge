# Battle Pass System
**Priority:** Critical | **Effort:** M | **ROI:** 5.0

## Overview
A seasonal progression system with free and premium tiers that rewards consistent training with exclusive rewards.

## Core Mechanics

### Season Structure
- **Duration:** 12 weeks per season
- **Levels:** 100 tiers
- **XP Sources:** Workouts, quests, challenges, achievements

### Tier Types
1. **Free Track** - Available to all users
   - Basic rewards every 5 levels
   - Currency, XP boosts, common cosmetics
   
2. **Premium Track** - One-time purchase per season
   - Rewards at every level
   - Exclusive cosmetics, equipment, titles
   - Bonus currency multiplier

### Progression Formula
```typescript
const tierXpRequired = (tier: number) => {
  const base = 1000;
  const scaling = 1.05;
  return Math.floor(base * Math.pow(scaling, tier - 1));
};
```

## Data Model

```prisma
model BattlePass {
  id          String   @id @default(cuid())
  seasonId    String
  userId      String
  tier        Int      @default(0)
  xp          Int      @default(0)
  isPremium   Boolean  @default(false)
  claimedTiers Int[]   @default([])
  createdAt   DateTime @default(now())
  
  user   User   @relation(fields: [userId], references: [id])
  season Season @relation(fields: [seasonId], references: [id])
  
  @@unique([seasonId, userId])
}

model Season {
  id        String   @id @default(cuid())
  name      String
  startDate DateTime
  endDate   DateTime
  rewards   Json     // Array of tier rewards
  isActive  Boolean  @default(false)
}
```

## API Actions

### `src/actions/battle-pass.ts`
```typescript
// Get current season and user progress
getSeasonProgressAction(userId: string): Promise<BattlePassProgress>

// Award XP to battle pass
awardBattlePassXpAction(userId: string, xp: number, source: string): Promise<void>

// Claim tier reward
claimTierRewardAction(userId: string, tier: number): Promise<ClaimResult>

// Upgrade to premium
upgradeToPremiumAction(userId: string): Promise<UpgradeResult>
```

## UI Components

### `src/components/BattlePassTrack.tsx`
- Horizontal scrollable track showing all tiers
- Current tier highlighted
- Free/Premium rewards shown stacked
- Claim button for unlocked tiers

### `src/components/BattlePassHeader.tsx`
- Season name and time remaining
- Current tier and XP progress bar
- Premium upgrade CTA

## Rewards Design

### Free Track Examples (every 5 levels)
| Tier | Reward |
|------|--------|
| 5 | 500 Gold |
| 10 | XP Boost (2hr) |
| 25 | Common Title: "Consistent" |
| 50 | Rare Crate |
| 100 | Legendary Title: "Season Champion" |

### Premium Track Examples (every level)
| Tier | Reward |
|------|--------|
| 1 | Premium Avatar Frame |
| 10 | Exclusive Weapon Skin |
| 25 | +5% Gold Multiplier (permanent) |
| 50 | Legendary Equipment Set |
| 100 | Mythic Title + Unique Aura |

## Anti-Grind Safeguards
- Daily XP cap: 5000 XP
- Rest day bonus: +20% XP next workout
- Weekly recovery bonus: Complete rest = 1 free tier

## Integration Points
- `training.ts`: Award XP after workout
- `challenges.ts`: Award XP for challenge completion
- `achievements.ts`: Award XP for unlocks
- `daily-quests.ts`: Award XP for daily completion

## Success Metrics
- Premium conversion rate > 5%
- Average session increase > 10%
- 30-day retention increase > 15%
