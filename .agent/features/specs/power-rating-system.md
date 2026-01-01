# Power Rating System
**Priority:** High | **Effort:** M | **ROI:** 4.5
**Type:** Enhancement to existing level/progression system

## Overview
Separate permanent Titan Level from dynamic Power Rating to reflect current fitness without punishing players who take breaks.

## Core Design

### Dual Metric System
| Metric | Behavior | Purpose |
|--------|----------|---------|
| **Titan Level** | Permanent, never decreases | Historical achievement |
| **Power Rating** | 70-100%, based on activity | Current fitness state |

## Hybrid Power Formula (NEW)

The Power Rating is a composite score combining **Strength** and **Cardio** metrics to create a single number reflecting overall athletic capability.

### Base Components

| Component | Source | Normalization | Weight |
|-----------|--------|---------------|--------|
| **Strength Index** | Wilks Score | 0-600 → 0-1000 | 50% (default) |
| **Cardio Index** | FTP (Cycling) OR vVO2max (Running) | W/kg → 0-1000 | 50% (default) |

> **Note:** User's `activePath` modifies weights (Strength main = 70/30, Cardio main = 30/70).

### Normalization Functions

```typescript
// Strength: Wilks Score normalization (300 = average, 500+ = elite)
const normalizeStrength = (wilks: number): number => {
  const floor = 200;
  const ceiling = 600;
  return Math.min(1000, Math.max(0, ((wilks - floor) / (ceiling - floor)) * 1000));
};

// Cardio: FTP W/kg normalization (2.5 = average, 5.0+ = elite)
const normalizeCardio = (wkg: number): number => {
  const floor = 1.5;
  const ceiling = 5.0;
  return Math.min(1000, Math.max(0, ((wkg - floor) / (ceiling - floor)) * 1000));
};

// Combined Power Rating
const calculatePowerRating = (
  strengthIndex: number,
  cardioIndex: number,
  path: 'STRENGTH_MAIN' | 'CARDIO_MAIN' | 'HYBRID_WARDEN'
): number => {
  const weights = {
    STRENGTH_MAIN: { str: 0.7, cardio: 0.3 },
    CARDIO_MAIN: { str: 0.3, cardio: 0.7 },
    HYBRID_WARDEN: { str: 0.5, cardio: 0.5 },
  };
  const w = weights[path];
  return Math.round(strengthIndex * w.str + cardioIndex * w.cardio);
};
```

### Example Ratings

| Profile | Wilks | FTP (W/kg) | Path | Power Rating |
|---------|-------|------------|------|--------------|
| Powerlifter | 450 | 2.0 | STRENGTH_MAIN | **729** |
| Cyclist | 250 | 4.5 | CARDIO_MAIN | **728** |
| Hybrid Athlete | 350 | 3.5 | HYBRID_WARDEN | **661** |

## Training Path & MRV Integration (NEW)

The Power Rating dynamically adjusts based on User's chosen **Training Path** and their adherence to **MRV (Maximum Recoverable Volume)** guidelines.

### Path-Specific Requirements

| Path | Strength Weight | Cardio Weight | Weekly MRV Requirement |
|------|-----------------|---------------|------------------------|
| **STRENGTH_MAIN** | 70% | 30% | ≥80% of optimal volume for 3+ muscle groups |
| **CARDIO_MAIN** | 30% | 70% | ≥3 cardio sessions (Zone 2-4) per week |
| **HYBRID_WARDEN** | 50% | 50% | ≥60% strength MRV + 2 cardio sessions |

### MRV Adherence Bonus

Players who consistently hit their MRV targets for their chosen path receive a **Power Multiplier**:

```typescript
const getMrvAdherenceBonus = (
  mrvAdherence: number, // 0.0 - 1.0 (% of optimal volume hit)
  cardioAdherence: number, // 0.0 - 1.0 (% of target sessions)
  path: TrainingPath
): number => {
  const weights = {
    STRENGTH_MAIN: { str: 0.8, cardio: 0.2 },
    CARDIO_MAIN: { str: 0.2, cardio: 0.8 },
    HYBRID_WARDEN: { str: 0.5, cardio: 0.5 },
  };
  const w = weights[path];
  const adherenceScore = mrvAdherence * w.str + cardioAdherence * w.cardio;
  
  // Bonus: 1.0 (no bonus) to 1.15 (+15% at perfect adherence)
  return 1.0 + (adherenceScore * 0.15);
};

// Final Power Rating with adherence
const finalPowerRating = basePowerRating * getMrvAdherenceBonus(...);
```

### Example with Adherence

| Player | Base Rating | MRV Adherence | Cardio Sessions | Bonus | **Final Rating** |
|--------|-------------|---------------|-----------------|-------|------------------|
| Consistent Lifter | 650 | 90% | 1/wk | 1.08 | **702** |
| Cardio + Lifts | 600 | 50% | 4/wk | 1.10 | **660** |
| Hybrid Master | 700 | 85% | 3/wk | 1.13 | **791** |

### Decay Curve (Exercise Science Based)
```typescript
const calculatePowerRating = (lastWorkoutDate: Date): number => {
  const daysSince = Math.floor((Date.now() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Grace period: no decay
  if (daysSince <= 14) return 1.0;
  
  // Gradual decay after grace period
  const decayDays = daysSince - 14;
  const decayRate = 0.005; // 0.5% per day
  const minPower = 0.70;   // Never below 70% (muscle memory)
  
  return Math.max(minPower, 1.0 - (decayDays * decayRate));
};
```

### Decay Timeline
| Days Inactive | Power Rating | Status |
|---------------|--------------|--------|
| 0-14 | 100% | "At Full Power" |
| 15-30 | 92-100% | "Slight Rust" |
| 31-60 | 77-92% | "Rusty" |
| 60-90 | 70-77% | "Dormant" |
| 90+ | 70% (floor) | "Slumbering Titan" |

## Comeback Mechanics

### XP Multiplier for Returning Players
```typescript
const getComebackMultiplier = (daysSinceReturn: number): number => {
  if (daysSinceReturn <= 7) return 2.0;   // "Muscle Memory Activated"
  if (daysSinceReturn <= 28) return 1.5;  // "Getting Back in Groove"
  return 1.0;                              // Normal
};
```

### Rapid Recovery
Power Rating recovers FASTER than it decays (mirrors real muscle memory):
- Each workout restores 5-10% Power Rating
- Full recovery in 1-2 weeks of consistent training

## Data Model

```prisma
model Titan {
  // Existing fields...
  
  // New fields
  powerRating     Float    @default(1.0)  // 0.70 - 1.0
  lastWorkoutAt   DateTime?
  comebackBonus   DateTime? // When comeback bonus started
}
```

## UI Display

### Header Format
```
┌─────────────────────────────────┐
│  ⚔️ TITAN LEVEL 47              │
│  Power: ████████▒▒ 82%          │
│  "Your Titan stirs..."          │
└─────────────────────────────────┘
```

### Status Messages
| Power Range | Message | Tone |
|-------------|---------|------|
| 95-100% | "At Peak Power" | Triumphant |
| 80-94% | "Ready for Battle" | Normal |
| 70-79% | "Your Titan Stirs, Awaiting Your Return" | Welcoming |
| Returning | "Muscle Memory Activated! 2x XP" | Exciting |

## Effect on Gameplay

### Power Rating Modifies:
- Combat damage: ×Power Rating
- Combat defense: ×Power Rating
- XP gains: ×Power Rating (minimum 1.0)
- BUT: Level requirements unchanged

### Power Rating Does NOT Affect:
- Titan Level (permanent)
- Unlocked skills/abilities
- Achievement history
- Equipment ownership

## Integration Points

| File | Changes |
|------|---------|
| `titan.ts` | Add `updatePowerRating()` |
| `training.ts` | Update power on workout complete |
| `TitanCard.tsx` | Display power rating bar |
| `combat.ts` | Apply power modifier to stats |
| Cron job | Daily power decay calculation |

## Thematic Framing

### Messaging Guidelines
| ❌ Avoid | ✅ Use Instead |
|----------|---------------|
| "You lost levels" | "Your Titan slumbers" |
| "Penalty" | "Awaiting your return" |
| "Inactive" | "Resting" |
| "Decay" | "The forge grows cold" |

### Welcome Back Narrative
> *"The Titan within you never truly slept. It was waiting—remembering every weight you've ever lifted. Now, it awakens with renewed hunger."*

## Success Metrics
- Returning player 7-day retention > 60%
- Negative feedback on "level loss" → 0%
- Comeback bonus engagement rate
