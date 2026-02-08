---
name: loss-aversion-engine
description: Implements loss aversion mechanics to increase user retention
version: 1.0.0
category: behavioral-psychology
owner: "@game-designer"
platforms: ["windows", "linux", "macos"]
requires: ["gamification-engine", "hook-loop-designer"]
context:
  primarySources:
    - src/features/game/logic/streaks.ts
    - src/features/game/logic/decay.ts
  references:
    - docs/GAME_DESIGN.md
  patterns:
    - src/features/training/
rules:
  - "Losses feel 2x stronger than equivalent gains (Kahneman)"
  - "Never make loss catastrophic (allow recovery)"
  - "Visualize potential loss BEFORE it happens"
  - "Offer 'save' mechanics (streak freeze, insurance)"
edgeCases:
  - "Users who feel punished may quit entirely"
  - "Cultural differences in loss perception"
  - "Balance between motivation and anxiety"
---

# 💔 Loss Aversion Engine

Harnesses the psychological principle that losing hurts more than winning feels good.

## Core Principle

> "The pain of losing $100 is twice as intense as the pleasure of gaining $100."
> — Daniel Kahneman, Nobel Prize Winner

## IronForge Mechanics

### 1. Streak System (The Chain)

```typescript
// Streak Decay Formula
const calculateStreakPenalty = (daysMissed: number, currentStreak: number) => {
  if (daysMissed === 0) return 0;
  if (daysMissed === 1) return currentStreak * 0.1; // -10%
  if (daysMissed === 2) return currentStreak * 0.25; // -25%
  return currentStreak; // Full reset after 3 days
};
```

**Visual Implementation:**

- Day 0: 🔥 Fire burns bright
- Day 1 missed: 🔥 Fire flickers (warning)
- Day 2 missed: 🕯️ Ember (critical)
- Day 3 missed: 💀 Extinguished (reset)

### 2. Gear Degradation

| Days Inactive | Effect |
|:--------------|:-------|
| 2 days | Armor gets dusty (visual) |
| 4 days | -5% stat bonus |
| 7 days | Equipment "rusts" (needs repair workout) |

### 3. Rank Decay

- Top 100 leaderboard positions decay 1 spot per day inactive
- Notification: "⚠️ Du har tappat 3 platser. 1 workout = återta allt."

### 4. Sunk Cost Amplification

Show users what they've built:

- "423 workouts logged. Don't break the journey."
- "You've earned 15,000 XP here. Keep growing."

## Recovery Mechanics (Prevent Rage Quit)

| Mechanic | Implementation |
|:---------|:---------------|
| **Streak Freeze** | 1 free per month, more purchasable |
| **Comeback Bonus** | +50% XP for first workout after break |
| **Amnesty Week** | After 30 days inactive, fresh start offer |

## Usage

```
@loss Calculate optimal streak decay curve
@loss Design "comeback" experience for lapsed user
@loss Audit current penalties for harshness
```

## Anti-Patterns to Avoid

❌ Permanent loss (users will quit)
❌ Hidden penalties (users feel cheated)
❌ No recovery path (hopelessness)
