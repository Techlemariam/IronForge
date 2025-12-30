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

## Power Rating Mechanics

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
