---
name: gamification-engine
description: Utilities for achievements, leveling, streaks, and leaderboards
version: 1.0.0
category: game-design
owner: "@game-designer"
platforms: ["windows", "linux", "macos"]
requires: ["supabase-inspector"]
context:
  primarySources:
    - src/features/game/
  references:
    - src/lib/gamification/
  patterns:
    - src/features/game/logic/
rules:
  - "Ensure progress calculation is atomic/transactional"
  - "Prevent exploitation (XP farming)"
  - "Scale difficulty curves logarithmically or linearly"
edgeCases:
  - "Offline progression syncing"
  - "Timezone issues for streaks"
---

# 🎮 Gamification Engine

A suite of tools to implement hook-based game mechanics in your app.

## Capabilities

- **XP Calculator**: Balances leveling curves
- **Achievement System**: Scaffolds triggers and rewards
- **Streak Manager**: Logic for daily/weekly consistency
- **Leaderboard Generator**: Redis/SQL efficient ranking queries

## Usage

```powershell
# Generate XP curve
@game Calculate XP for levels 1-50 with moderate difficulty

# Scaffold Achievement
@game Create an achievement for "First Workout Logged"
```

## Integration

- **`game-designer` workflow**: Primary tool for mechanics
- **`analyst` agent**: Validates user engagement loops
