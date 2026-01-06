# Training Path System Specification
**Priority:** High | **Effort:** S | **ROI:** 4.8 | **Status:** Implemented (Needs Enhancement)

> **Analysts:** `/analyst` + `/game-designer` + `/titan-coach`
> **Collaborators:** `/architect`, `/coder`

---

## 1. Overview

The **Training Path System** is the core progression archetype selector in IronForge. Each path represents a distinct training philosophy that affects:

- **Combat modifiers** (attack power, stamina, dodge)
- **Power Rating weights** (strength vs cardio balance)
- **Volume targets** (MRV allocation)
- **Reward multipliers** (XP/Gold bonuses)
- **Skill Tree starting position**

---

## 2. Available Paths

### ⚔️ WARDEN (Hybrid)
| Aspect | Detail |
|--------|--------|
| **Philosophy** | Balance is mastery. The complete athlete. |
| **Training Split** | 50% Strength / 50% Cardio |
| **Primary Metric** | Composite Power Rating |
| **Volume Focus** | Equal MEV across all modalities |
| **Combat Style** | Balanced stats, versatile |
| **Authority** | Alex Viada (sub-4 mile + 700lb squat) |
| **Quote** | *"They said it was impossible. They were wrong."* |

### 🪨 JUGGERNAUT (Strength Specialist)
| Aspect | Detail |
|--------|--------|
| **Philosophy** | Pure force. The forge doesn't yield. |
| **Training Split** | 90% Strength / 10% Active Recovery |
| **Primary Metric** | Wilks Score |
| **Volume Focus** | MRV for major lifts (SBD + accessories) |
| **Combat Style** | High attack power, moderate stamina |
| **Authority** | Ed Coan, Ray Williams, Jim Wendler |
| **Quote** | *"The weight submits. Always."* |

### 🌲 PATHFINDER (Cardio Specialist)
| Aspect | Detail |
|--------|--------|
| **Philosophy** | Efficiency through endurance. The long road wins. |
| **Training Split** | 90% Cardio / 10% Strength Maintenance |
| **Primary Metric** | FTP W/kg or VO2max |
| **Volume Focus** | TSS targets, Zone 2 base building |
| **Combat Style** | High dodge, sustained stamina |
| **Authority** | Kipchoge, Pogačar, Frodeno |
| **Quote** | *"The Pathfinder moves not to escape, but to explore."* |

---

## 3. Type Definitions

```typescript
// src/types/training.ts
export type TrainingPath =
  | "JUGGERNAUT"  // Max strength (Powerlifting focus)
  | "PATHFINDER"  // VO2max/Endurance (Engine)
  | "WARDEN";     // Balanced (Hybrid)

export interface PathInfo {
  id: TrainingPath;
  name: string;
  description: string;
  icon: string;
  color: string;
  strengthLevel: VolumeLevel;
  cardioLevel: VolumeLevel;
}

export interface PathModifiers {
  attackPower: number;  // 1.0 = base, 1.2 = +20%
  stamina: number;
  dodge: number;
}
```

---

## 4. Path ↔ Archetype Mapping

The `GameContextService` maps Archetypes to Training Paths:

```typescript
// src/services/game/GameContextService.ts
const ARCHETYPE_TO_PATH: Record<Archetype, TrainingPath> = {
  JUGGERNAUT: "JUGGERNAUT",
  PATHFINDER: "PATHFINDER",
  WARDEN: "WARDEN",
};
```

| Archetype | Training Path | Power Weight |
|-----------|---------------|--------------|
| `JUGGERNAUT` | `JUGGERNAUT` | 90% STR / 10% Cardio |
| `PATHFINDER` | `PATHFINDER` | 10% STR / 90% Cardio |
| `WARDEN` | `WARDEN` | 50% STR / 50% Cardio |

---

## 5. Combat Modifiers by Path

```typescript
// src/services/trainingMemoryManager.ts
getCombatModifiers(path: TrainingPath): PathModifiers {
  const modifiers: Record<TrainingPath, PathModifiers> = {
    JUGGERNAUT: { attackPower: 1.3, stamina: 1.1, dodge: 0.9 },
    PATHFINDER: { attackPower: 0.9, stamina: 1.3, dodge: 1.2 },
    WARDEN: { attackPower: 1.1, stamina: 1.15, dodge: 1.05 },
  };
  return modifiers[path];
}
```

### Combat Balance Matrix

| Path | Attack | Stamina | Dodge | Total |
|------|--------|---------|-------|-------|
| JUGGERNAUT | +30% | +10% | -10% | 3.3 |
| PATHFINDER | -10% | +30% | +20% | 3.4 |
| WARDEN | +10% | +15% | +5% | 3.3 |

> **Design Note:** Total modifiers are balanced (~3.3) to ensure no path is objectively superior.

---

## 6. Volume Target System

Each path has different volume landmarks:

### Weekly MRV Targets

| Path | Strength Sets | Cardio TSS | Mobility |
|------|---------------|------------|----------|
| JUGGERNAUT | 25-30 | 100-150 | 15 min |
| PATHFINDER | 8-12 | 400-600 | 20 min |
| WARDEN | 15-20 | 250-350 | 15 min |

### Auto-Spec Engine Integration

The `AutoSpecEngine` adjusts based on path:

```typescript
// src/services/game/AutoSpecEngine.ts
calculateBuildTargets(
  metrics: SystemMetrics,
  macroCycle: MacroCycle,
  activePath: TrainingPath
): BuildVolumeTargets
```

---

## 7. Reward System (Soft-Lock)

Players receive bonuses for training within their path:

```typescript
export interface RewardConfig {
  withinPathMultiplier: number;    // e.g., 1.5 = +50% XP/Gold
  outsidePathDifficulty: number;   // e.g., 1.2 = 20% harder gates
}
```

### Path Alignment Bonus

| Training Type | Within Path | Outside Path |
|---------------|-------------|--------------|
| XP Earned | +50% | Base |
| Gold Earned | +50% | Base |
| Skill Gate | Standard | +20% harder |
| Quest Priority | High | Normal |

> **Philosophy:** We reward focus, not punish exploration.

---

## 8. Path Selection Flow

### Onboarding
1. User completes initial assessment
2. Oracle suggests path based on:
   - Existing data (Hevy/Intervals sync)
   - User statement of goals
   - Physical metrics (VO2max, Wilks)
3. User confirms or changes selection

### Path Switching
- Allowed once per **28 days** (moon cycle)
- XP/Gold preserved
- Skill tree nodes remain unlocked
- Power Rating recalculates with new weights

---

## 9. Integration Points

| Service | Usage |
|---------|-------|
| `TrainingContextService` | Weekly volume by path |
| `TrainingMemoryManager` | Combat modifiers, rewards |
| `PowerRatingService` | Weight distribution |
| `AutoSpecEngine` | Volume target calculation |
| `OracleService` | Path recommendation |
| `GameContextService` | Archetype mapping |
| `SkillTree.tsx` | Starting position, visual theme |

---

## 10. UI Representation

### Dashboard Header
```
┌─────────────────────────────────┐
│  🛡️ PATH: WARDEN                │
│  "The Complete Athlete"         │
│  STR ████████░░ 80%             │
│  CRD ██████░░░░ 60%             │
└─────────────────────────────────┘
```

### Path Selector (Settings)
- Visual cards for each path
- Current power rating preview
- "Locked for X days" indicator if recently switched

---

## 11. Enhancement Backlog

### Planned Improvements
- [ ] **Curious Warden Sub-Type** - Rotation bonus for variety training
- [ ] **Path Mastery Achievements** - Long-term path loyalty rewards
- [ ] **Seasonal Path Challenges** - Limited-time path-specific quests
- [ ] **Path Legends Leaderboard** - Top 100 per path

### Open Questions

| Question | Options | Recommendation |
|----------|---------|----------------|
| Allow multi-path? | No / "Secondary Path" | No - focus is the design |
| Path decay? | Reset if no training | No - too punishing |
| Path in PvP matchmaking? | Same path only / Mixed | Same path brackets |

---

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| Path distribution | 40% Warden / 35% Juggernaut / 25% Pathfinder |
| Path switch rate | < 10% per month |
| Path satisfaction | > 4/5 rating |
| Power Rating by path | Within 5% parity |

---

## 13. Related Specs

- [Archetype System](./archetype-system.md)
- [Power Rating System](./power-rating-system.md)
- [Neural Lattice (Skill Tree)](./neural-lattice-skilltree.md)
