# 🎮 Domain: GAME (Game Mechanics & Design)

**Owner:** @game-designer, @titan-coach
**Focus:** Progression systems, combat, economy, and gamification loops.

## 🏗️ Core Systems

### 1. Titan (Character) System
- **Paths:** Warden (Tank/Str), Pathfinder (Rogue/Agi), Juggernaut (Hybrid).
- **Levels:** XP-driven, tied to real workout data.
- **State:** Server-authoritative (`Unified Titan Soul`), event-sourced.
- **Key Files:** `src/services/titan-*.ts`, `src/features/titan/`

### 2. Combat System
- **PvE:** Boss fights with elemental variants, multiple difficulty tiers, dungeon floors.
- **Damage:** Derived from workout metrics (volume, intensity, consistency).
- **Combo System:** Chained exercises increase multiplier.
- **Key Files:** `src/features/combat/`

### 3. Progression & Economy
- **XP:** Base 500 + multipliers (streaks, bio, buffs). Stack risk identified.
- **Gold:** Earned via workouts, streak bonuses.
- **Loot:** Drop rates with rarity tiers (Common → Artifact). Rates need audit.
- **Shop:** Buy/sell items. Inventory uses mock data (DB schema blocker).
- **Prestige:** Reset for permanent bonuses.
- **Key Files:** `src/services/progression.ts`, `src/services/loot.ts`

### 4. Skill Tree (Neural Lattice)
- **Structure:** PoE-inspired non-linear skill tree.
- **Currencies:** Talent Points (TP) from action, Kinetic Shards (KS) from recovery.
- **Keystones:** High-impact nodes with trade-offs and physical prerequisites.
- **Build Presets:** Save/load configurations.
- **Key Files:** `src/features/game/`

### 5. Social/Competitive (PARKED for solo)
- **PvP Duels, Guild System, Leaderboards, Territory Conquest, Arena Seasons**
- Status: Shipped but zero value for solo user — development FROZEN.
- Code stays, UI de-emphasized.

## 🎯 Solo-First Priority (AuDHD-Optimized)

For Alex as sole user, the game mechanics that matter:

| System | Why | Priority |
|:---|:---|:---|
| **Oracle/Coach** | External structure + decision offloading | 🔴 Critical |
| **Streaks** | Routine reinforcement | 🔴 Critical |
| **XP/Levels** | Predictable progress dopamine | 🔴 Critical |
| **Combat vs AI** | Engagement through narrative | 🟡 High |
| **Achievements** | Predictable reward structure | 🟡 High |
| **Loot Drops** | Variable reward dopamine | 🟡 High |
| **Skill Tree** | Systems-thinking satisfaction (Autism) | 🟡 High |
| **PvP/Guilds** | No opponents — frozen | ⚪ Parked |

## 💡 Insights & Decisions

- **XP Multiplier stacking** may produce absurd leveling. Needs cap audit.
- **Boss HP scaling** is purely level-derived — not combat-tested for fairness.
- **Loot drop rates** are hardcoded rarity weights — need balancing pass.
- **Inventory system** uses mock data due to missing DB schema for stackable items.
- **"Good Enough" Rewards** are missing — system only celebrates PRs, not consistency.
