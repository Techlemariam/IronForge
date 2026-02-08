---
name: variable-reward-system
description: Implements variable ratio reinforcement for maximum engagement
version: 1.0.0
category: behavioral-psychology
owner: "@game-designer"
platforms: ["windows", "linux", "macos"]
requires: ["gamification-engine"]
context:
  primarySources:
    - src/features/game/logic/loot.ts
    - src/utils/loot.ts
  references:
    - docs/GAME_DESIGN.md
  patterns:
    - src/features/game/components/LootCard.tsx
rules:
  - "Unpredictable rewards > predictable rewards"
  - "Near-miss mechanics increase retry behavior"
  - "Reveal anticipation is part of the reward"
  - "Balance drop rates to prevent frustration"
edgeCases:
  - "Reward inflation over time"
  - "Whale vs casual player balancing"
  - "Ethical considerations (gambling parallels)"
---

# 🎰 Variable Reward System

Implements variable ratio reinforcement - the most addictive reward schedule known to psychology.

## The Science

> "Variable ratio schedules produce the highest response rates and greatest resistance to extinction."
> — B.F. Skinner

**Why it works:**

- Predictable rewards = boredom
- Random rewards = constant anticipation
- The ANTICIPATION of reward releases more dopamine than the reward itself

## IronForge Implementation

### 1. Loot Drop System

```typescript
// Rarity Distribution (per workout)
const LOOT_TABLE = {
  common: 0.50,      // 50% - Small XP bonus
  uncommon: 0.30,    // 30% - Buff item
  rare: 0.15,        // 15% - Gear piece
  epic: 0.04,        // 4% - Special cosmetic
  legendary: 0.01,   // 1% - Unique item + title
};

// Near-miss mechanic
const showNearMiss = (actualRarity: string, roll: number) => {
  if (actualRarity === 'rare' && roll < 0.16) {
    return "SO CLOSE to Epic! 🔥 Try again tomorrow!";
  }
};
```

### 2. Mystery Box Reveal

**Sequence (maximize dopamine):**

1. Box appears (anticipation builds)
2. Box shakes (tension)
3. Glow color hints at rarity (hope)
4. REVEAL! (spike)
5. Celebration animation (reinforcement)

### 3. Reward Types (Eyal's Three)

| Type | Psychological Need | IronForge Example |
|:-----|:-------------------|:------------------|
| **Tribe** | Social connection | Guild rank, cheers, @mentions |
| **Hunt** | Resource acquisition | Loot, XP, currency |
| **Self** | Mastery, completion | PR badges, skill unlocks |

### 4. Jackpot Moments

Rare but memorable:

- **First Legendary Drop**: Confetti, sound, screenshot prompt
- **PR on Main Lift**: Camera shake, Titan roar, shareable card
- **Boss Kill**: Entire screen celebration

## Drop Rate Tuning

```
Session 1-10:   Boost rates +20% (hook phase)
Session 11-50:  Standard rates
Session 51+:    "Pity timer" - guaranteed rare every 10 sessions
```

## Usage

```
@reward Design loot table for "Daily Quest" completion
@reward Calculate pity timer for legendary drops
@reward Audit current reward variance
```

## Ethical Guardrails

✅ No real-money gambling
✅ Transparent drop rates (viewable in settings)
✅ Daily/weekly caps on reward variance
✅ Focus rewards on effort, not luck
