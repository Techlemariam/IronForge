---
name: combat-balancer
description: Analyzes and balances game combat and economy
version: 1.0.0
category: domain
owner: "@game-designer"
platforms: ["windows", "linux", "macos"]
requires: ["xp-calculator", "balance-checker"]
context:
  primarySources:
    - src/lib/game/combat.ts
    - src/lib/game/loot.ts
    - src/lib/progression/xp.ts
  references:
    - docs/game-design.md
  patterns:
    - src/lib/game/
  exclude:
    - node_modules
rules:
  - "Boss HP scales with player average level"
  - "Loot drop rates follow rarity curve"
  - "XP rewards scale logarithmically"
  - "Gold inflation must stay under 5% per week"
edgeCases:
  - "Level 1 players fighting high-level content"
  - "Exploitable loot farming loops"
  - "XP overflow on extreme workouts"
---

# ⚔️ Combat Balancer

Analyzes and balances IronForge combat, loot, and economy systems.

## Context

| Source | Purpose |
|:-------|:--------|
| `src/lib/game/combat.ts` | Combat calculations |
| `src/lib/game/loot.ts` | Loot drop tables |
| `src/lib/progression/xp.ts` | XP formulas |
| `game-design.md` | Design documentation |

## When to Use

- After modifying combat formulas
- When adding new loot items
- During game balance reviews

## Execute

### Full Balance Report

```powershell
pwsh .agent/skills/combat-balancer/scripts/analyze.ps1
```

### Specific System

```powershell
pwsh .agent/skills/combat-balancer/scripts/analyze.ps1 -System "loot"
```

## Rules

1. **Boss HP Scaling** - HP = BaseHP *(1 + AveragePlayerLevel* 0.1)
2. **Loot Rarity** - Common 60%, Uncommon 25%, Rare 10%, Epic 4%, Legendary 1%
3. **XP Curve** - XP = BaseXP * log(SetCount + 1)
4. **Gold Cap** - Max 5% weekly inflation

## Metrics Analyzed

| Metric | Target | Warning |
|:-------|:------:|:-------:|
| Boss Kill Time | 2-5 min | >10 min |
| Loot/Hour | 5-10 items | <3 items |
| XP/Session | 500-2000 | >5000 |
| Gold/Week | +3-5% | >10% |

## Edge Cases

- **New players**: Starter zone balance
- **Loot loops**: Detect farmable exploits
- **XP overflow**: Cap extreme workouts
