# Neural Lattice (Skill Tree) Specification
**Priority:** High | **Effort:** M | **ROI:** 4.7 | **Status:** Implemented (Needs Enhancement)

> **Analysts:** `/game-designer` + `/titan-coach`
> **Collaborators:** `/architect`, `/ui-ux`, `/coder`

---

## 1. Overview

The **Neural Lattice** is IronForge's Path of Exile-inspired passive skill tree. Unlike traditional linear skill progressions, the Neural Lattice creates meaningful build choices that reward specialization while enabling hybrid experimentation.

### Design Goals
1. **Meaningful Choices** - No "right answer", builds reflect training philosophy
2. **Physical Prerequisites** - Nodes unlock via real-world achievements
3. **Visual Spectacle** - The tree itself should feel like an achievement
4. **Keystone Tradeoffs** - Powerful bonuses come with drawbacks

---

## 2. Node Architecture

### Node Tiers

| Tier | Size | Cost | Quantity | Purpose |
|------|------|------|----------|---------|
| **Minor** | 50px | 1 TP | Many | Small stat bonuses |
| **Notable** | 70px | 3-5 TP | Medium | Meaningful bonuses + flavor |
| **Keystone** | 100px | 10+ TP | 5-7 | Build-defining, mutual exclusivity |

### Type Definitions

```typescript
// src/types/skills.ts
export type NodeTier = "minor" | "notable" | "keystone";
export type SkillPath = "juggernaut" | "pathfinder" | "warden" | "titan" | "sage";

export enum SkillStatus {
  LOCKED = "LOCKED",
  UNLOCKED = "UNLOCKED",
  MASTERED = "MASTERED",
}

export interface SkillNodeV2 {
  id: string;
  title: string;
  description: string;
  
  tier: NodeTier;
  path: SkillPath;
  category: SkillCategory;
  
  parents: string[];
  unlockLogic: "AND" | "OR";
  position: { x: number; y: number };
  
  effects?: SkillEffect;
  effectConditions?: EffectCondition;
  drawbacks?: SkillDrawback;
  drawbackConditions?: DrawbackCondition;
  
  currency: "talent_point" | "kinetic_shard";
  cost: number;
  requirements: SkillRequirement[];
  
  excludes?: string[];           // Keystone exclusivity
  gateRequirement?: number;      // Min notables before purchase
}
```

---

## 3. Currency System

### Talent Points (TP)
| Source | Amount | Frequency |
|--------|--------|-----------|
| Workout Completion | 1-5 TP | Per workout |
| Daily Quest | 2 TP | Daily |
| Achievement | 5-20 TP | One-time |
| Level Up | 3 TP | Per level |
| Battle Pass Tier | 2 TP | Per tier |

### Kinetic Shards (KS)
| Source | Amount | Frequency |
|--------|--------|-----------|
| Rest Day Passive | 1-2 KS | Per rest day |
| Recovery Mastery | 5 KS | Weekly streak |
| Sleep Score 85+ | 1 KS | Per night |
| Skill Refund | Partial | On refund |

> **Design Philosophy:** TP rewards action, KS rewards recovery.

---

## 4. Effect System

### Positive Effects (SkillEffect)

```typescript
export interface SkillEffect {
  // Multipliers (1.0 = base, 1.5 = +50%)
  tpMultiplier?: number;
  ksMultiplier?: number;
  titanLoadMultiplier?: number;
  recoveryRateMultiplier?: number;
  
  // Passive income
  passiveTpPerDay?: number;
  passiveKsPerDay?: number;
  
  // Flat bonuses
  flatTpBonus?: number;
  flatKsBonus?: number;
  flatTitanLoad?: number;
  
  // Feature unlocks
  unlocksBrickWorkouts?: boolean;
  unlocksVikingPress?: boolean;
  unlocksPumpIndicator?: boolean;
  unlocksAutoDeload?: boolean;
}
```

### Drawback Effects (Keystones Only)

```typescript
export interface SkillDrawback {
  tpMultiplier?: number;         // 0.5 = -50% TP
  ksMultiplier?: number;
  titanLoadMultiplier?: number;
  recoveryRateMultiplier?: number;
}
```

### Conditional Triggers

```typescript
export interface EffectCondition {
  minReps?: number;              // Hypertrophy: 8-15 reps
  maxReps?: number;
  minSessionDurationMins?: number;
  requiresHybridSession?: boolean;
  minBodyBattery?: number;
  minSleepScore?: number;
  minVO2max?: number;
  requiredZone?: 1 | 2 | 3 | 4 | 5;
}
```

---

## 5. Example Keystones

### 🪨 Iron Discipline (Juggernaut)
| Aspect | Detail |
|--------|--------|
| **Bonus** | +50% Titan Load from compound lifts |
| **Condition** | Only activates on sets of 1-5 reps |
| **Drawback** | -20% TP from cardio sessions |
| **Excludes** | "Engine Room", "Hybrid Mastery" |

### 🌲 Engine Room (Pathfinder)
| Aspect | Detail |
|--------|--------|
| **Bonus** | +30% recovery rate, +2 passive KS/day |
| **Condition** | Requires 3+ Zone 2 sessions/week |
| **Drawback** | -30% TP from strength sessions |
| **Excludes** | "Iron Discipline", "Hybrid Mastery" |

### ⚔️ Hybrid Mastery (Warden)
| Aspect | Detail |
|--------|--------|
| **Bonus** | Synergy Badge visible, +10% all multipliers |
| **Condition** | Both Strength Index and Cardio Index > 400 |
| **Drawback** | No specialization bonuses |
| **Excludes** | "Iron Discipline", "Engine Room" |

### 🧘 Sage's Rest (Recovery)
| Aspect | Detail |
|--------|--------|
| **Bonus** | +100% passive TP on rest days |
| **Condition** | Body Battery > 70 at session end |
| **Drawback** | -50% TP from consecutive training days (3+) |
| **Excludes** | "Relentless Drive" |

### 🔥 Relentless Drive (Grind)
| Aspect | Detail |
|--------|--------|
| **Bonus** | +25% TP on 4th+ consecutive training day |
| **Condition** | Streak >= 4 days |
| **Drawback** | -50% passive KS income |
| **Excludes** | "Sage's Rest" |

---

## 6. Physical Requirements

Nodes have real-world prerequisites beyond parent nodes:

```typescript
export type SkillRequirementType =
  | "achievement_count"    // N total achievements
  | "vo2max_value"         // VO2max >= X
  | "1rm_weight"           // 1RM >= X kg on exercise
  | "rep_count"            // Total reps on exercise
  | "session_count"        // Sessions completed
  | "rest_day_count"       // Rest days taken
  | "sleep_score_streak"   // Days with sleep > X
  | "brick_workout_count"; // Brick workouts done
```

### Example Requirements

| Node | Requirement |
|------|-------------|
| "Endurance Base" | VO2max >= 40 |
| "Iron Foundation" | Deadlift 1RM >= 100kg |
| "Recovery Master" | Sleep Score >= 80 for 7 days |
| "Hybrid Scholar" | 10 Brick Workouts completed |

---

## 7. Visual Design

### Layout Principles
1. **Radial Spread** - Paths fan out from center
2. **Color Coding** - Each path has distinct hue
3. **Connection Lines** - Animated flow between nodes
4. **Glow Effects** - Unlocked nodes pulse softly

### Path Colors

| Path | Primary | Secondary |
|------|---------|-----------|
| Juggernaut | `#DC2626` (Red) | `#7F1D1D` |
| Pathfinder | `#16A34A` (Green) | `#14532D` |
| Warden | `#2563EB` (Blue) | `#1E3A8A` |
| Titan | `#9333EA` (Purple) | `#581C87` |
| Sage | `#EAB308` (Gold) | `#713F12` |

### Node States

| State | Visual |
|-------|--------|
| Locked | Grayscale, 50% opacity |
| Available | Full color, pulsing border |
| Unlocked | Full color, checkmark |
| Mastered | Full color, star icon |
| Keystone Active | Large glow, crown icon |

---

## 8. Calculated Effects (Runtime)

```typescript
// Aggregated from all unlocked skills
export interface CalculatedEffects {
  tpMultiplier: number;           // Product of all multipliers
  ksMultiplier: number;
  titanLoadMultiplier: number;
  recoveryRateMultiplier: number;
  
  passiveTpPerDay: number;        // Sum of all passives
  passiveKsPerDay: number;
  
  flatTpBonus: number;
  flatKsBonus: number;
  flatTitanLoad: number;
  
  features: {
    brickWorkouts: boolean;
    vikingPress: boolean;
    pumpIndicator: boolean;
    autoDeload: boolean;
  };
  
  activeKeystoneId: string | null;
}
```

---

## 9. UI Components

### Main Tree View
- **Technology:** ReactFlow with custom node renderer
- **Controls:** Pan, Zoom, Filter by path
- **Info Panel:** Selected node details, cost, requirements

### Node Component

```tsx
// src/features/game/components/SkillTree.tsx
const CustomSkillNode = ({ data, selected }: NodeProps<CustomNodeData>) => {
  const { node, status, isAffordable, tier, isActiveKeystone } = data;
  
  // Tier-based sizing
  const size = TIER_SIZE[tier]; // minor: 50, notable: 70, keystone: 100
  
  // Status-based styling
  const baseClass = status === "LOCKED" ? "opacity-50 grayscale" :
                    status === "MASTERED" ? "ring-2 ring-yellow-400" :
                    "ring-2 ring-white/50";
  
  return (
    <motion.div className={baseClass} style={{ width: size, height: size }}>
      {/* Node content */}
    </motion.div>
  );
};
```

### Skill Context

```typescript
// src/context/SkillContext.tsx
const { 
  skillNodes,           // All defined nodes
  unlockedSkills,       // User's unlocked nodes
  purchaseSkill,        // (nodeId) => void
  refundSkill,          // (nodeId) => void
  calculateEffects,     // () => CalculatedEffects
  canAfford,            // (nodeId) => boolean
  meetsRequirements,    // (nodeId) => boolean
} = useSkills();
```

---

## 10. Persistence

### Database Schema

```prisma
model UserSkill {
  id            String    @id @default(cuid())
  userId        String
  skillId       String    // References SkillNodeV2.id
  unlockedAt    DateTime  @default(now())
  masteredAt    DateTime?
  
  user          User      @relation(fields: [userId], references: [id])
  
  @@unique([userId, skillId])
  @@index([userId])
}

model User {
  // Existing fields...
  talentPoints    Int       @default(0)
  kineticShards   Int       @default(0)
  activeKeystone  String?   // Current keystone ID
}
```

---

## 11. Adaptive Cost System

Costs scale based on skills already owned:

```typescript
// src/utils/root_utils.ts
export function calculateAdaptiveCost(
  baseCost: number,
  unlockedCount: number
): number {
  // Mild scaling: +5% per owned skill, capped at 2x
  const multiplier = Math.min(2.0, 1 + (unlockedCount * 0.05));
  return Math.floor(baseCost * multiplier);
}
```

---

## 12. Integration Points

| Service | Usage |
|---------|-------|
| `SkillContext` | UI state, purchase/refund |
| `ProgressionService` | TP/KS income calculation |
| `TrainingMemoryManager` | Apply effect modifiers |
| `CombatService` | Apply titan load modifiers |
| `OracleService` | Recommend skills based on path |
| `PowerRatingService` | Skill bonuses affect rating |

---

## 13. Enhancement Backlog

### Planned Improvements
- [ ] **Skill Tree Builder** - Share builds with URL
- [ ] **Meta Builds** - Community-voted popular configurations
- [ ] **Seasonal Reset** - Optional prestige for bonus currency
- [ ] **Spectator Mode** - View friends' skill trees
- [ ] **Path Masteries** - Complete all nodes in a path for title

### Open Questions

| Question | Options | Recommendation |
|----------|---------|----------------|
| Refund penalty? | No / 20% loss | 20% KS loss (prevents flip-flopping) |
| Node count target | 50 / 100 / 150 | 80-100 (enough depth, not overwhelming) |
| Prestige system? | Full reset / Partial | Partial (keep keystones) |
| Mobile UX | Same tree / Simplified | Simplified list view option |

---

## 14. Success Metrics

| Metric | Target |
|--------|--------|
| Avg skills unlocked at Level 20 | 25-35 |
| Keystone selection diversity | < 40% single choice |
| Build variety (unique combos) | > 100 active builds |
| Skill tree session time | 3-5 min average |
| Refund rate | < 15% of purchases |

---

## 15. Related Specs

- [Training Path System](./training-path-system.md)
- [Power Rating System](./power-rating-system.md)
- [Archetype System](./archetype-system.md)
- [Battle Pass](./battle-pass.md)
