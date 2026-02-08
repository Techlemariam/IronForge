---
name: xp-calculator
description: Validates XP formulas for game balance
version: 1.0.0
category: analysis
owner: "@game-designer"
platforms: ["windows", "linux", "macos"]
requires: []
---

# ⚔️ XP Calculator

Validates XP formulas and progression balance.

## Execute

```powershell
pwsh .agent/skills/xp-calculator/scripts/validate.ps1
```

## Formulas Validated

| Formula | Source |
|:--------|:-------|
| Set XP | `logTitanSet` |
| Streak Multiplier | `streak.ts` |
| Bio Buffs | `bio-buffs.ts` |
| Level Curve | `progression.ts` |

## Expected Output

Balance report with XP curve analysis.
