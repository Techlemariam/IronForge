---
name: social-validation-loop
description: Guild mechanics, leaderboards, and social proof for community engagement
version: 1.0.0
category: behavioral-psychology
owner: "@game-designer"
platforms: ["windows", "linux", "macos"]
requires: ["gamification-engine", "hook-loop-designer"]
context:
  primarySources:
    - src/features/coop/
    - src/features/social/
  references:
    - docs/GAME_DESIGN.md
  patterns:
    - src/features/game/
rules:
  - "Social rewards amplify intrinsic motivation"
  - "Competition must be opt-in and fair"
  - "Celebrate others' wins to build community"
  - "Private progress for shy users"
edgeCases:
  - "Toxic competition"
  - "Leaderboard manipulation"
  - "Privacy concerns"
---

# 👥 Social Validation Loop

Harnesses social proof and tribal belonging to multiply engagement.

## Core Principle

> "We are wired to care what others think of us."
> — Humans, always

## IronForge Implementation

### 1. Guild System (Tribe)

```typescript
interface Guild {
  id: string;
  name: string;
  members: string[];
  weeklyGoal: number; // Collective workouts
  streak: number;
  
  // Raid mechanics
  currentRaid?: {
    bossHp: number;
    deadline: Date;
  };
}
```

**Guild Raids:**

- Boss HP = Sum of all members' weekly workout goals × 10
- Each workout = damage dealt
- Everyone must contribute or the raid fails
- **Social pressure**: "Your guild needs 3 more workouts to beat Iron Golem!"

### 2. Leaderboards (Hunt)

| Type | Visibility | Reset |
|:-----|:-----------|:------|
| **Global** | Top 100 | Monthly |
| **Friends** | Mutual follows | Weekly |
| **Guild** | Guild members | Weekly |
| **Personal Best** | Self only | Never |

**Anti-Toxicity:**

- Show "your rank" without full global visibility
- Celebrate improvements, not just wins
- "You beat 50% of players this week! 🎉"

### 3. Social Proof Triggers

| Trigger | Example |
|:--------|:--------|
| **Achievement** | "🏆 Alex earned 'Iron Will' - 30 day streak!" |
| **PR** | "💪 Alex hit a new squat PR: 140kg!" |
| **Comeback** | "🔥 Alex is back after 7 days. Welcome back!" |
| **Support** | "❤️ 5 friends cheered for your workout" |

### 4. Ghost Runs

Compete asynchronously:

- "Race against your friend's best 5K time"
- See their ghost avatar during your run
- Win = bragging rights notification to them

## Usage

```
@social Design onboarding for guild system
@social Create leaderboard that minimizes toxicity
@social Add "cheer" notification system
```

## Ethical Guardrails

✅ Privacy settings for all social features
✅ Opt-out of public leaderboards
✅ No shaming for inactivity
✅ Celebrate effort, not just results
