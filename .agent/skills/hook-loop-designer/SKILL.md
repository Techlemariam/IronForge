---
name: hook-loop-designer
description: Designs engagement loops using Trigger → Action → Variable Reward → Investment
version: 1.0.0
category: behavioral-psychology
owner: "@game-designer"
platforms: ["windows", "linux", "macos"]
requires: ["gamification-engine"]
context:
  primarySources:
    - src/features/game/logic/
    - src/lib/notifications/
  references:
    - docs/GAME_DESIGN.md
  patterns:
    - src/features/training/
rules:
  - "Every user action should lead to variable reward"
  - "Investment phase must increase switching cost"
  - "External triggers must respect user attention"
  - "Internal triggers develop over time (habit formation)"
edgeCases:
  - "Notification fatigue"
  - "Reward inflation"
  - "Exploitation prevention"
---

# 🪝 Hook Loop Designer

Implements Nir Eyal's "Hooked" model for building habit-forming products.

## The Hook Model

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   TRIGGER ──► ACTION ──► VARIABLE ──► INVESTMENT
│      │                    REWARD          │     │
│      │                                    │     │
│      └────────────────────────────────────┘     │
│                    (Loop)                       │
└─────────────────────────────────────────────────┘
```

## IronForge Implementation

### 1. Triggers (Push the user to act)

| Type | Example |
|:-----|:--------|
| **External** | Push: "Din Titan har vilat i 48h. Kraft +15% redo." |
| **Internal** | Boredom → Open IronForge (habit) |

### 2. Action (Minimal friction)

- One-tap "Start Quest"
- Auto-load last routine
- "5 min Express Mode" for low motivation days

### 3. Variable Reward (Dopamine spike)

| Reward Type | Implementation |
|:------------|:---------------|
| **Tribe** | Leaderboard climb, Guild cheers |
| **Hunt** | Loot drops (rarity unknown until revealed) |
| **Self** | Personal Record, "New Max!" celebration |

### 4. Investment (Lock-in)

- Streak counter (losing it hurts)
- Gear that upgrades with use
- Data history ("You've logged 200 workouts here")

## Usage

```
@hook Design a hook loop for the "First Workout" experience
@hook Audit current onboarding for hook completeness
@hook Generate push notification schedule for week 1
```

## Metrics to Track

- **DAU/MAU Ratio**: Target > 0.4 (Instagram-level)
- **D1/D7/D30 Retention**: Measure after each hook change
- **Session Length**: Healthy = 15-45 min
