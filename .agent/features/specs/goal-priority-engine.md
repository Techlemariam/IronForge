# Goal-Priority Engine Specification
**Priority:** Critical | **Effort:** M | **ROI:** 5.2 | **Status:** Design
**Integrated with:** Oracle 3.0 (This engine provides the deterministic core for the AI Coach)

> **Analysts:** `/titan-coach` + `/game-designer` + `/analyst`
> **Philosophy:** "Oracle is the Voice, GPE is the Brain. Together they create the Synthetic Coach."

---

## 1. Executive Summary

The **Goal-Priority Engine (GPE)** is the deterministic training orchestration system that powers **The Oracle**. It allows the Oracle to provide guidance that is both narratively rich and scientifically absolute.

### The Symbiosis: Voice + Brain

| Aspect | The Oracle (Voice/NLU) | Goal-Priority Engine (Brain/Logic) |
|--------|------------------------|------------------------------------|
| **Role** | Narrative delivery, FAQ, Motivation | Periodization, Volume calc, Interference |
| **Logic** | LLM (Gemini 2.0 Flash/Pro) | Path-Agnostic Deterministic Algorithm |
| **Output** | "Your iron heart grows weary..." | `phase: DELOAD, cardioTss: 150` |
| **Value** | User engagement & Persona | Physical safety & Adaptation |

**The Result**: A coach that knows the math but speaks like a titan.

### Why Not AI?

| Aspect | AI (Oracle 3.0) | Algorithm (GPE) |
|--------|-----------------|-----------------|
| **Latency** | 1-3 seconds | < 50ms |
| **Cost** | $0.001-0.01/query | $0 |
| **Explainability** | "Trust me" | Full formula transparency |
| **Consistency** | Variable | Deterministic |
| **Offline** | ❌ | ✅ |
| **Testability** | Difficult | Unit test everything |

**AI keeps value for**: Conversational FAQ, plateau psychology, narrative flavor.
**AI removed from**: Core training logic, daily recommendations, phase transitions.

---

## 1.5 Path-Agnostic Design

The Goal-Priority Engine works for **all Training Paths**, not just Warden:

| Path | Example Goals | Phase Rotation |
|------|---------------|----------------|
| **Juggernaut** | Max Squat, Max Bench, Max Deadlift, Hypertrophy | SBD rotation by lift focus |
| **Pathfinder** | VO2max, FTP Bike, FTP Run, Ultra Distance | Cardio modality rotation |
| **Warden** | VO2max, FTP, Strength, Fitness | Cardio ↔ Strength rotation |

```typescript
// Path-specific goal pools
const GOAL_POOLS: Record<TrainingPath, TrainingGoal[]> = {
  JUGGERNAUT: ["SQUAT_1RM", "BENCH_1RM", "DEADLIFT_1RM", "WILKS", "HYPERTROPHY", "POWER"],
  PATHFINDER: ["VO2MAX", "FTP_BIKE", "FTP_RUN", "ENDURANCE", "SPRINT_POWER"],
  WARDEN: ["VO2MAX", "FTP_BIKE", "FTP_RUN", "STRENGTH", "HYPERTROPHY", "FITNESS", "BODY_COMP"],
};
```

The engine logic is the same – only the available goals and phase allocation differ per path.

### Goal Interference Matrix

| Goal A | Goal B | Interference | Resolution |
|--------|--------|--------------|------------|
| VO2max | Strength | 🔴 High | Block periodization |
| FTP (bike) | FTP (run) | 🟡 Medium | Skill transfer exists |
| Endurance | Hypertrophy | 🔴 High | Cannot peak simultaneously |
| Strength | Power | 🟢 Low | Sequential progression |
| Mobility | All | ✅ None | Always beneficial |

### Key Insight

> **You cannot maximize everything simultaneously. The engine's job is to rotate priorities intelligently while maintaining minimum effective volume (MEV) for non-focus goals.**

---

## 3. Core Data Model

### Goal Declaration

```typescript
// src/types/goals.ts
export type TrainingGoal =
  | "VO2MAX"        // Max aerobic capacity
  | "FTP_BIKE"      // Functional Threshold Power (cycling)
  | "FTP_RUN"       // vVO2max / running economy
  | "STRENGTH"      // 1RM on compound lifts (Wilks)
  | "HYPERTROPHY"   // Muscle mass (volume-driven)
  | "ENDURANCE"     // Long-distance capability
  | "FITNESS"       // Intervals.icu Fitness metric
  | "BODY_COMP";    // Weight management focus

export interface GoalPriority {
  goal: TrainingGoal;
  weight: number;           // 0.0 - 1.0, sum must equal 1.0
  currentValue?: number;    // Latest measurement
  targetValue?: number;     // User's target
  deadline?: Date;          // Optional peak date
}

export interface WardensManifest {
  userId: string;
  goals: GoalPriority[];    // Ordered by priority
  phase: MacroPhase;
  phaseStartDate: Date;
  phaseWeek: number;
  autoRotate: boolean;      // Let engine decide phase transitions
}

export type MacroPhase =
  | "CARDIO_BUILD"    // VO2max/FTP focus (MEV strength)
  | "STRENGTH_BUILD"  // Strength/Hypertrophy focus (MEV cardio)
  | "BALANCED"        // 50/50 maintenance
  | "PEAK"            // Competition prep (reduce volume, maintain intensity)
  | "DELOAD";         // Recovery week
```

### Phase Allocation Matrix

```typescript
// src/data/phase-allocation.ts
export const PHASE_ALLOCATION: Record<MacroPhase, Allocation> = {
  CARDIO_BUILD: {
    strength: 0.20,   // MEV only
    cardio: 0.70,     // MRV push
    mobility: 0.10,
    description: "Building aerobic engine. Strength maintenance only.",
  },
  STRENGTH_BUILD: {
    strength: 0.70,   // MRV push
    cardio: 0.20,     // MEV only (Zone 2 recovery)
    mobility: 0.10,
    description: "Building strength. Light cardio for recovery.",
  },
  BALANCED: {
    strength: 0.45,
    cardio: 0.45,
    mobility: 0.10,
    description: "Maintaining both systems. No peak adaptation.",
  },
  PEAK: {
    strength: 0.30,
    cardio: 0.50,
    mobility: 0.20,
    description: "Competition prep. Reduced volume, high intensity.",
  },
  DELOAD: {
    strength: 0.25,
    cardio: 0.25,
    mobility: 0.50,
    description: "Recovery week. Focus on mobility and light movement.",
  },
};
```

---

## 4. The Priority Engine Algorithm

### Phase Selection Logic

```typescript
// src/services/GoalPriorityEngine.ts
export class GoalPriorityEngine {

  /**
   * Determines optimal phase based on goal priorities and current state.
   */
  static selectPhase(
    manifest: WardensManifest,
    metrics: SystemMetrics
  ): MacroPhase {
    
    // 1. Safety Override - Always check first
    if (this.needsDeload(metrics)) return "DELOAD";
    
    // 2. Deadline Check - Peak if event within 2 weeks
    const upcomingDeadline = this.getUpcomingDeadline(manifest.goals);
    if (upcomingDeadline && upcomingDeadline.daysUntil <= 14) {
      return "PEAK";
    }
    
    // 3. Post-Deload - Always return to cardio (build base first)
    if (manifest.phase === "DELOAD" && metrics.tsb > 0) {
      return "CARDIO_BUILD";
    }
    
    // 4. Phase Rotation - Based on primary goal
    const primaryGoal = manifest.goals[0]?.goal;
    
    if (this.isCardioGoal(primaryGoal)) {
      return this.shouldTransition(manifest, metrics) 
        ? "STRENGTH_BUILD"  // Recovery rotation
        : "CARDIO_BUILD";
    }
    
    if (this.isStrengthGoal(primaryGoal)) {
      return this.shouldTransition(manifest, metrics)
        ? "CARDIO_BUILD"    // Recovery rotation
        : "STRENGTH_BUILD";
    }
    
    return "BALANCED";
  }

  /**
   * Hysteresis-based transition logic.
   * Requires 4+ weeks in phase AND progress stall.
   */
  static shouldTransition(
    manifest: WardensManifest,
    metrics: SystemMetrics
  ): boolean {
    if (manifest.phaseWeek < 4) return false; // Minimum phase duration
    if (metrics.consecutiveStalls >= 3) return true; // Plateau detected
    if (metrics.atl > metrics.ctl * 1.3) return true; // Overreaching
    return false;
  }

  static needsDeload(metrics: SystemMetrics): boolean {
    return (
      metrics.hrv < 40 ||
      metrics.tsb < -40 ||
      metrics.sleepScore < 30 ||
      metrics.acwr > 1.5
    );
  }

  static isCardioGoal(goal: TrainingGoal): boolean {
    return ["VO2MAX", "FTP_BIKE", "FTP_RUN", "ENDURANCE", "FITNESS"].includes(goal);
  }

  static isStrengthGoal(goal: TrainingGoal): boolean {
    return ["STRENGTH", "HYPERTROPHY", "BODY_COMP"].includes(goal);
  }
}
```

---

## 4.7. The Daily Tactical Engine (Readiness vs. Plan)

This layer converts the Macrocycle Roadmap into a specific daily recommendation by filtering the plan through real-time physiological constraints.

### 4.7.1. Daily Readiness Score (DRS)
The DRS determines the **Intensity Ceiling** for the next 24 hours. It is a weighted composite of Wellness (Sleep, HRV trend), Fatigue (ACWR), and CNS load.

| Score | CNS State | Action |
|-------|-----------|--------|
| **90-100** | Primed | Proceed with Plan (Full Intensity) |
| **70-89** | Stable | Proceed with Plan (Moderate intensity) |
| **50-69** | Fatigued | **Downgrade Intensity** (e.g., Threshold → Zone 2) |
| **< 50** | Suppressed | **Force Rest/リカバリー** |

### 4.7.2. Muscle Group Heatmap Integration
Tracks set volume per muscle group against its calculated Landmark (MEV/MAV/MRV). If the plan calls for Strength, the engine prioritizes the muscle group with the highest **Adaptation Gap** (MAV - Current).

### 4.7.3. CNS Fatigue Estimation
Categorizes recent activities to estimate CNS strain:
- **High Drain**: Sprints, Heavy Compound Lifts, VO2max Intervals.
- **Low Drain**: Zone 2 Cardio, Mobility flows, isolation work.

If `CNS_Load > Threshold`, the Tactical Engine overrides the Macrocycle to prioritize recovery-focused activities.

---

### Weekly Volume Calculator

```typescript
/**
 * Calculates concrete weekly targets based on phase and goals.
 */
static calculateWeeklyTargets(
  manifest: WardensManifest,
  phase: MacroPhase,
  metrics: SystemMetrics
): WeeklyTargets {
  
  const allocation = PHASE_ALLOCATION[phase];
  const baseHours = this.getBaseHours(metrics); // ~6-12h/week
  
  // Base allocation
  let strengthHours = baseHours * allocation.strength;
  let cardioHours = baseHours * allocation.cardio;
  let mobilityHours = baseHours * allocation.mobility;
  
  // Apply bio-modifiers
  const modifier = this.getBioModifier(metrics);
  strengthHours *= modifier;
  cardioHours *= modifier;
  
  // Convert to actionable targets
  return {
    strengthSets: Math.round(strengthHours * 12),  // ~12 sets/hour
    cardioTss: Math.round(cardioHours * 60),       // ~60 TSS/hour
    mobilitySets: Math.round(mobilityHours * 20),  // ~20 stretches/hour
    
    // Specific guidance
    strengthFocus: this.getStrengthFocus(manifest.goals),
    cardioFocus: this.getCardioFocus(manifest.goals),
    
    // Display
    summary: this.generateSummary(phase, manifest.goals),
  };
}

static getBioModifier(metrics: SystemMetrics): number {
  let mod = 1.0;
  
  if (metrics.sleepDebt > 5) mod *= 0.8;
  if (metrics.nutritionMode === "DEFICIT") mod *= 0.7;
  if (metrics.acwr > 1.3) mod *= 0.85;
  
  return Math.max(0.5, mod); // Never below 50%
}
```

---

## 4.8. WorkoutSelector Integration (Workout Library)

The `WORKOUT_LIBRARY` (~8500 **cardio** workouts in `src/data/workouts.ts`) is connected to the Tactical Engine via the **WorkoutSelector**.

> [!NOTE]
> `workouts.ts` currently only contains RUN/BIKE/SWIM cardio workouts. Strength workouts are dynamically generated from `exerciseDb.ts` + `muscleMap.ts`.

---

### Resource Budget Model (Pragmatic 7.5/10)

**Titan Coach Rating**: 7.5/10 — Balances simplicity with physiological accuracy.

```typescript
interface PragmaticResourceBudget {
  // === GLOBAL RESOURCES (Systemic) ===
  cns: number;           // 0-100: Central nervous system capacity
  metabolic: number;     // 0-100: Glycogen/ATP (cardio capacity)

  // === LOCAL RESOURCES (Per Muscle) ===
  heatmap: Record<MuscleGroup, {
    currentSets: number;  // Sets completed this week
    landmark: "MEV" | "MAV" | "MRV";  // Volume status
    recoveryETA?: number; // Hours until fresh (estimated)
  }>;
}
```

| Resource | Source | Purpose |
|----------|--------|---------|
| **CNS** | HRV + Sleep + RPE history | "Can you go hard today?" |
| **Metabolic** | TSS from intervals.icu | "How much cardio capacity remains?" |
| **Heatmap** | Hevy sets per muscle | "Which muscles are fresh?" |

**Budget Modifiers**:

| Metric | Effect | Data Source |
|--------|--------|-------------|
| DRS < 50 | -30% all | Composite readiness |
| Sleep Debt > 5h | -20% CNS | `wellness.sleepSecs` |
| ACWR > 1.3 | -15% all | Calculated from `activities` |
| HRV < 40 | Budget = 0 | `wellness.hrv` |
| Nutrition Deficit | -10% Muscular | User setting |

---

### 🔮 Intervals.icu Enhancement Roadmap

The current model can be evolved to **9/10** by integrating additional intervals.icu data:

| Data Field | Current Use | Future Enhancement |
|------------|-------------|-------------------|
| `wellness.hrv` | ✅ CNS budget calculation | HRV trend analysis (3-day rolling) |
| `wellness.readiness` | ✅ Body Battery proxy | Direct DRS input |
| `wellness.sleepSecs` | ✅ Sleep debt calc | Sleep debt acceleration model |
| `wellness.rampRate` | ❌ Unused | Auto-detect overtraining (>5 = warning) |
| `wellness.ctl` | ✅ Baseline fitness | Long-term fitness trend impact |
| `wellness.atl` | ✅ Acute fatigue | Short-term fatigue adjustment |
| `wellness.tsb` | ✅ Form calculation | Peak readiness window detection |
| `activities.zone_times` | ❌ Unused | **Zone 3 junk mile detection** |
| `activities.icu_intensity` | ❌ Unused | **Session RPE estimation** |
| `activities.icu_training_load` | ❌ Unused | **Per-session metabolic cost** |
| `athleteSettings.ftp` | ❌ Unused | Power zone calibration |
| `athleteSettings.run_ftp` | ❌ Unused | Run pace zone calibration |

#### Proposed Phase 2 Enhancements:

1. **Ramp Rate Warning**: If `wellness.rampRate > 5`, display:
   > ⚠️ Your training ramp is aggressive. Consider a mini-deload.

2. **Zone 3 Junk Mile Detection**: If `sum(zone_times[3]) / total_time > 0.3`:
   > 🟡 30%+ of your cardio is in Zone 3 (No Man's Land). Polarize harder!

3. **Hormonal Awareness** (Future): Infer stress from HRV variance + sleep pattern.

---

### Selection Algorithm

```typescript
static selectWorkout(
  manifest: WardensManifest,
  phase: MacroPhase,
  budget: PragmaticResourceBudget,
  preferences?: {
    maxDuration?: number;
    preferredTypes?: string[];
    availableEquipment?: string[]; // From The Armory
  },
  allowBudgetOverride?: boolean
): WorkoutDefinition[]
```

**Filtering Steps**:
1. **Phase Match**: `CARDIO_BUILD` → RUN/BIKE/SWIM; `STRENGTH_BUILD` → generate from heatmap.
2. **Budget Check**: Filter workouts with `resourceCost` <= remaining budget.
3. **Equipment Filter**: Match against user's `availableEquipment` from The Armory.
4. **Fit Score**: Rank by path alignment + heatmap gap coverage.

### Budget Override (User Choice)

If `allowBudgetOverride = true`, the user can select a workout exceeding budget. The UI will display:

> ⚠️ **CAUTION**: This workout exceeds your recovery budget. Proceeding may increase injury risk.

---


## 5. Goal-Specific Strategies

### VO2max Optimization

```typescript
const VO2MAX_STRATEGY = {
  primarySessions: [
    { type: "ZONE_2", duration: "60-90 min", frequency: 3 },
    { type: "VO2MAX_INTERVALS", duration: "4x4 min @95%", frequency: 2 },
  ],
  strengthRole: "Maintenance only (2x/week, compound lifts)",
  keyMetric: "Intervals.icu VO2max estimate",
  expectedGain: "+2-4 ml/kg/min per 8-week block",
};
```

### FTP Optimization

```typescript
const FTP_STRATEGY = {
  primarySessions: [
    { type: "SWEET_SPOT", duration: "2x20 min @88-94%", frequency: 2 },
    { type: "THRESHOLD", duration: "3x10 min @100%", frequency: 1 },
    { type: "ZONE_2", duration: "90+ min", frequency: 2 },
  ],
  strengthRole: "Leg strength 1x/week (squats, deadlifts)",
  keyMetric: "Intervals.icu mFTP",
  expectedGain: "+5-15W per 6-week block",
};
```

### Strength Optimization

```typescript
const STRENGTH_STRATEGY = {
  primarySessions: [
    { type: "COMPOUND", lifts: ["Squat", "Bench", "Deadlift"], frequency: 3 },
    { type: "ACCESSORY", focus: "Weak points", frequency: 2 },
  ],
  cardioRole: "Zone 2 only for recovery (2-3x30min)",
  keyMetric: "Wilks Score / e1RM",
  expectedGain: "+2.5-5% 1RM per 4-week block",
};
```

---

## 6. UI Integration

### Goal Declaration Screen

```
┌─────────────────────────────────────────────────────────────┐
│  ⚔️ WARDEN'S MANIFEST                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What drives your training? Drag to prioritize.            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. 🫀 VO2max         [████████░░] 52 → 58 ml/kg    │   │
│  │  2. 🚴 FTP (Bike)     [██████░░░░] 280 → 320 W     │   │
│  │  3. 💪 Strength       [████░░░░░░] 380 → 420 Wilks │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Current Phase: CARDIO_BUILD (Week 3/6)                    │
│  Next Rotation: ~3 weeks (or on plateau)                   │
│                                                             │
│  [ ] Auto-rotate phases based on progress                  │
│                                                             │
│  [Save Manifest]                                            │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Integration

```
┌─────────────────────────────────────────────────────────────┐
│  📊 GOAL PROGRESS                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  VO2max      52.3 → 58.0    ████████░░░░░░  +2.1 (+4%)     │
│  FTP (Bike)  280 → 320 W    ██████░░░░░░░░  +12W (+4%)     │
│  Strength    382 Wilks      ████░░░░░░░░░░  Maintaining    │
│                                                             │
│  Phase: CARDIO_BUILD        Week 3 of estimated 6          │
│  Focus: Zone 2 base building + 2x VO2max intervals         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Oracle Deprecation Path

### What Oracle Keeps

| Function | Stays | Reason |
|----------|-------|--------|
| Persona/Flavor text | ✅ | User engagement |
| Chat FAQ (Gemini) | ✅ | Convenience for questions |
| Daily Decree UI | ✅ | Renamed to "Daily Focus" |

### What Oracle Loses

| Function | Replaced By |
|----------|-------------|
| Phase selection | `GoalPriorityEngine.selectPhase()` |
| Volume targets | `GoalPriorityEngine.calculateWeeklyTargets()` |
| Workout recommendation | `WorkoutSelector` (rule-based) |
| Deload detection | `AutoSpecEngine.needsDeload()` |

### Migration

```typescript
// Before (Oracle 2.0)
const decree = await OracleService.generateDailyDecree(userId);

// After (GPE)
const manifest = await getWardensManifest(userId);
const phase = GoalPriorityEngine.selectPhase(manifest, metrics);
const targets = GoalPriorityEngine.calculateWeeklyTargets(manifest, phase, metrics);
const dailyFocus = formatDailyFocus(phase, targets, titanState);
```

---

## 8. Database Schema

```prisma
model WardensManifest {
  id            String        @id @default(cuid())
  userId        String        @unique
  goals         Json          // GoalPriority[]
  phase         MacroPhase    @default(BALANCED)
  phaseStartDate DateTime     @default(now())
  autoRotate    Boolean       @default(true)
  updatedAt     DateTime      @updatedAt
  
  user          User          @relation(fields: [userId], references: [id])
}

enum MacroPhase {
  CARDIO_BUILD
  STRENGTH_BUILD
  BALANCED
  PEAK
  DELOAD
}
```

---

## 9. Implementation Phases

### Phase 1: Goal Declaration (Week 1)
- [ ] Create `WardensManifest` schema
- [ ] Build goal selection UI
- [ ] Store user goal priorities

### Phase 2: Engine Core (Week 2)
- [ ] Implement `GoalPriorityEngine`
- [ ] Phase selection algorithm
- [ ] Volume target calculator

### Phase 3: Integration (Week 3)
- [ ] Replace Oracle daily decree logic
- [ ] Dashboard goal progress widget
- [ ] Phase transition notifications

### Phase 4: Polish (Week 4)
- [ ] Goal-specific strategy tips
- [ ] Progress trend charts
- [ ] Export training plan to Intervals.icu

---

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| Algorithm explainability | 100% (user can see why) |
| Phase transition accuracy | > 80% user agreement |
| Goal progress tracking | Weekly updates |
| Reduced AI API calls | -90% from Oracle 3.0 |
| User goal completion rate | > 60% within 12 weeks |

---

## 11. Related Specs

- [Training Path System](./training-path-system.md)
- [Power Rating System](./power-rating-system.md)
- [Neural Lattice (Skill Tree)](./neural-lattice-skilltree.md)
- [Oracle 3.0 (Deprecated)](./ai-training-coach.md)
