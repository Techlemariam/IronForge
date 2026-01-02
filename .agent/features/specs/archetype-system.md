# Archetype System Specification
**Priority:** High | **Effort:** M | **ROI:** 4.5 | **Status:** Design Complete

## Overview
IronForge introduces a **Class System** (Archetypes) to accommodate different training profiles while maintaining the aspirational Hybrid goal.

---

## 1. Core Classes

### 🪨 Juggernaut (Strength Specialist)
| Aspect | Detail |
|--------|--------|
| **Focus** | Powerlifting, Bodybuilding, Strongman |
| **Power Rating** | 90% Strength / 10% Work Capacity |
| **Primary Metric** | Wilks Score (normalized 0-1000) |
| **Secondary Metric** | Work Capacity (`kJ/min` from Garmin) |
| **Authority Figures** | Ray Williams, Ed Coan, Jim Wendler |
| **Quote** | *"The Juggernaut does not chase the weight. The weight submits."* |

### 🌲 Pathfinder (Cardio Specialist)
| Aspect | Detail |
|--------|--------|
| **Focus** | Running, Cycling, Triathlon |
| **Power Rating** | 90% Cardio / 10% Strength Endurance |
| **Primary Metric** | FTP W/kg OR VO2max (from Intervals.icu) |
| **Secondary Metric** | Multi-Modal Strength Index (pushups, pullups) |
| **Authority Figures** | Kipchoge, Pogačar, Frodeno, Maffetone |
| **Quote** | *"The Pathfinder moves not to escape, but to explore."* |

### ⚔️ Warden (Hybrid)
| Aspect | Detail |
|--------|--------|
| **Focus** | Powerlifting + Cardio, Variety Training |
| **Power Rating** | 50% Strength / 50% Cardio |
| **Bonus** | Synergy Badge (visual) if both indices > 400 |
| **Authority Figures** | Alex Viada (sub-4 mile + 700lb squat) |
| **Quote** | *"They said it was impossible. They were wrong."* |

#### Sub-Type: The Curious Warden 🧭
For athletes who train for **variety and exploration** rather than single-sport excellence.

| Mechanic | Effect |
|----------|--------|
| **Rotation Bonus** | +10% XP when training 3+ modalities in one week |
| **"Surprise Me" Oracle** | Suggests session based on what you haven't done recently |
| **Equipment Factions** | Barbell, Kettlebell, Machines, Bodyweight = mini-achievement tracks |

**Supported Modalities:**
- Barbell (Hevy) → Strength Index
- Kettlebell (Hevy) → "Utility" SkillTree
- Freak Athlete / KOT (Manual) → "Prehab" Achievements
- Cycling (Intervals.icu) → Cardio Index
- Running (Intervals/Strava) → Cardio Index

---

## 2. Data Sources

| Metric | Source | API Field |
|--------|--------|-----------|
| Wilks Score | Hevy → PvpProfile | `pvpProfile.highestWilksScore` |
| FTP (Cycling) | Intervals.icu | `athleteSettings.ftp` |
| Run FTP | Intervals.icu | `athleteSettings.run_ftp` |
| VO2max | Garmin → Intervals | `wellness.vo2max` ✅ Already available |
| Work Capacity | Garmin → Intervals | `activity.icu_work_kj` / moving_time |

---

## 3. Market Strategy

### Target Distribution
| Class | % of Users | Monetization |
|-------|------------|--------------|
| **Warden** | 40% | Highest Premium conversion (AI Coach upsell) |
| **Juggernaut** | 35% | Guild engagement, Volume Analytics |
| **Pathfinder** | 25% | Virality via Strava, Chase Mode |

### Competitive Position
IronForge uniquely occupies the **"Gamified Hybrid"** quadrant – no competitor combines deep gamification with multi-sport support.

---

## 4. Specialist Retention

### Principles
1. **Class-Specific Leaderboards** – Specialists can be #1 in their domain
2. **Exclusive Titles** – "The Unmovable", "The Tireless"
3. **No Forced Migration** – Hevy integration stays forever

### Hevy → IronLogger Migration
| Phase | Approach |
|-------|----------|
| **Phase 1** | Hevy is not the enemy – sync-only |
| **Phase 2** | IronLogger as optional (+10% XP bonus) |
| **Phase 3** | IronLogger as Premium Lane with deeper features |

### Messaging Guidelines
| ❌ Avoid | ✅ Use |
|----------|--------|
| "You need cardio to be complete" | "You are a Legend in your class" |
| "Stop using Hevy" | "IronLogger gives more XP, but Hevy syncs fine" |

---

## 5. Implementation

### Schema Changes
```prisma
enum Archetype {
  JUGGERNAUT
  PATHFINDER
  WARDEN
}

model User {
  archetype Archetype @default(WARDEN)
}
```

### PowerRating Refactor
```typescript
const weights = {
  JUGGERNAUT: { strength: 0.9, cardio: 0.1 },
  PATHFINDER: { strength: 0.1, cardio: 0.9 },
  WARDEN: { strength: 0.5, cardio: 0.5 },
};
```

### Integration Points
| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `Archetype` enum and field |
| `src/lib/powerRating.ts` | Refactor weights by archetype |
| `src/actions/duel.ts` | Class-based matchmaking |
| `src/app/leaderboard/page.tsx` | Class-specific tabs |

---

## 6. Open Decisions

| Question | Options | Recommendation |
|----------|---------|----------------|
| Synergy Multiplier | Numeric (1.1x) vs Badge | Badge (avoids inflation) |
| Archetype Selection | Manual vs Auto-detect | Manual at onboarding, auto-suggest |
| Zero Data Fallback | VO2max + Steps vs Onboarding Test | VO2max + Steps (lower friction) |

---

## 7. Success Metrics
- Specialist churn rate < 10% (vs baseline)
- 30-day retention by class parity (within 5%)
- Hevy → IronLogger migration > 20% by 6 months
