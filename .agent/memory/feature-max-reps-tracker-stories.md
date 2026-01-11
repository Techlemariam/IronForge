# Max Reps Tracker - User Stories & Analysis

> **Feature ID:** max-reps-tracker  
> **Date:** 2026-01-10  
> **Status:** Discovery Complete  
> **Analyst:** /analyst

---

## 🎯 Feature Summary

**What:** Universal PR tracking for all exercises - shows max reps achieved at each weight before starting a set, with celebration animations on new PRs.

**Why:**

- Provides concrete progression visibility for high-rep/bodyweight exercises
- Motivation boost through visible "number to beat"
- Gamification of accessory work that often lacks progression metrics

**Who Benefits:**

- Athletes doing bodyweight/accessory work (GHD, pull-ups, dips)
- TV Mode users who want glanceable targets
- All users tracking strength progression

---

## 📱 Platform Matrix

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ⚠️ | ✅ | ✅ | ✅ |
| **Layout** | PR badge in exercise table | PR chip above log form | Giant "BEAT: 23" center | Phone=input, TV=display |
| **Input** | Click to log | Touch (tap to log reps) | Auto-display | Touch → Cast |
| **Offline?** | No | ✅ IndexedDB cache | No | WebSocket relay |
| **Priority** | P1 | **P0** | **P0** | P1 |

### Platform-Specific UX

**Mobile (P0):**

```
┌─────────────────────────┐
│ GHD Back Extension      │
│ ┌─────────────────────┐ │
│ │ 🏆 Your Best: 23    │ │
│ └─────────────────────┘ │
│                         │
│ Reps: [    27    ] ☑️ Failure │
│                         │
│ [LOG SET]               │
└─────────────────────────┘
```

**TV Mode (P0):**

```
┌──────────────────────────────────────────────┐
│                                              │
│              GHD BACK EXTENSION              │
│                                              │
│              ┌─────────────────┐             │
│              │   BEAT: 23      │             │
│              └─────────────────┘             │
│                                              │
│            Logged via Companion              │
└──────────────────────────────────────────────┘

          ↓ After new PR logged

┌──────────────────────────────────────────────┐
│                                              │
│               🎉 NEW PR! 🎉                  │
│                                              │
│              ┌─────────────────┐             │
│              │       27        │             │
│              └─────────────────┘             │
│                   +4 reps!                   │
│                                              │
│             +50 XP  •  🏆 Achievement        │
└──────────────────────────────────────────────┘
```

**Companion (P1):**

- Phone logs reps → WebSocket → TV displays result
- Haptic feedback on PR achievement

---

## 👤 User Stories

### Epic: Max Reps Tracking

#### US-1: View Exercise PR Before Set

**As a** strength athlete  
**I want to** see my max reps record for an exercise before I start  
**So that** I have a concrete goal to beat

**Acceptance Criteria:**

- [ ] PR is displayed prominently before logging
- [ ] PR is weight-specific (e.g., "23 reps @ bodyweight" vs "12 reps @ 10kg")
- [ ] Works offline (cached in IndexedDB)
- [ ] Updates immediately after logging new PR

---

#### US-2: Mark Set as "To Failure"

**As a** user doing AMRAP sets  
**I want to** mark a set as "to failure"  
**So that** the system knows this was a max effort attempt

**Acceptance Criteria:**

- [ ] Toggle/checkbox for "To Failure" on set logging
- [ ] Visual indicator on logged sets that were to failure
- [ ] Failure sets are prioritized in PR calculations

---

#### US-3: TV Mode PR Display

**As a** user in TV Mode  
**I want to** see my PR in large, glanceable text  
**So that** I can see my target from across the room

**Acceptance Criteria:**

- [ ] Giant "BEAT: XX" display center screen
- [ ] Auto-updates when companion logs a set
- [ ] Celebration animation on new PR (confetti, sound effect)
- [ ] Shows "+N reps!" delta when new PR achieved

---

#### US-4: Companion Mode Integration

**As a** user with phone + TV setup  
**I want to** log reps on my phone and see results on TV  
**So that** I get the best of both worlds

**Acceptance Criteria:**

- [ ] Phone sends log data via WebSocket
- [ ] TV receives and displays PR comparison
- [ ] TV shows celebration if new PR
- [ ] Phone gets haptic feedback on PR

---

#### US-5: PR History & Analytics

**As a** user tracking long-term progress  
**I want to** see my PR history over time  
**So that** I can visualize my progression

**Acceptance Criteria:**

- [ ] Graph showing max reps over time per exercise
- [ ] Filter by weight (bodyweight vs weighted)
- [ ] Export capability

---

## 🔧 Technical Analysis

### Data Model Changes

**Option A: Computed from existing `sets` JSON** (Recommended)

```sql
-- No schema change needed
-- Query: SELECT MAX(reps) FROM ExerciseLog WHERE exerciseId = ? AND weight = ?
```

**Option B: Add explicit `maxReps` cache field**

```prisma
model ExerciseLog {
  // ...existing fields
  toFailure Boolean @default(false)  // NEW: marks AMRAP sets
}

model ExerciseRecord {  // NEW MODEL
  id          String @id @default(cuid())
  userId      String
  exerciseId  String
  weight      Float?   // null = bodyweight
  maxReps     Int
  achievedAt  DateTime
  
  @@unique([userId, exerciseId, weight])
}
```

### Recommendation: Hybrid Approach

1. Add `toFailure` boolean to set logging (stored in `sets` JSON)
2. Use computed query for PR (no new table needed initially)
3. Cache PR in IndexedDB for offline/fast access
4. Optionally add `ExerciseRecord` table later for analytics

### Service Layer

```typescript
// src/services/game/MaxRepsService.ts
interface MaxRepsService {
  getMaxReps(userId: string, exerciseId: string, weight?: number): Promise<number | null>;
  checkForPR(userId: string, exerciseId: string, reps: number, weight?: number): Promise<boolean>;
  getExercisePRHistory(userId: string, exerciseId: string): Promise<PRHistoryEntry[]>;
}
```

### UI Components

| Component | Location | Purpose |
|:----------|:---------|:--------|
| `PRBadge` | `src/components/ui/PRBadge.tsx` | Reusable PR display chip |
| `FailureToggle` | `src/components/ui/FailureToggle.tsx` | To-failure checkbox |
| `TvPRDisplay` | `src/features/tv/TvPRDisplay.tsx` | Giant TV Mode PR view |
| `PRCelebration` | `src/components/ui/PRCelebration.tsx` | Confetti + animation |

---

## ✅ Definition of Done

- [ ] PR displayed before logging (Mobile + Desktop)
- [ ] "To Failure" toggle functional
- [ ] TV Mode giant PR display
- [ ] PR celebration animation (all platforms)
- [ ] Companion WebSocket integration
- [ ] Offline support (Mobile)
- [ ] Unit tests for MaxRepsService
- [ ] E2E test for PR flow

---

## 📊 Effort Breakdown

| Task | Effort | Priority |
|:-----|:-------|:---------|
| MaxRepsService + query | S | P0 |
| PRBadge component | XS | P0 |
| FailureToggle in SetLogForm | XS | P0 |
| TvPRDisplay component | S | P0 |
| PRCelebration animation | M | P0 |
| Companion WebSocket events | S | P1 |
| IndexedDB caching | S | P0 |
| PR History graph | M | P2 |

**Total Estimate:** L (4-8h)

---

## 🔗 Integration Point: Iron Mines

> **This feature integrates into the existing Iron Mines (Strength Logging) flow.**

### Files to Modify

| File | Change |
|:-----|:-------|
| `src/features/strength/StrengthLog.tsx` | Add PRBadge above set list |
| `src/features/strength/SetRow.tsx` | Add "To Failure" toggle |
| `src/features/strength/hooks/useSetLogging.ts` | Add PR fetching/checking |
| `src/features/tv/TvStrengthHub.tsx` | Add TvPRDisplay component |

### Dependencies

- `docs/PLATFORM_MATRIX.md` - Platform design guidelines
- `src/features/strength/hooks/useSetLogging.ts` - Existing set logging
- `src/services/storage.ts` - IndexedDB implementation
- `src/features/tv/` - TV Mode components

---

## ⏭️ Next Steps

1. **Architect** creates `implementation_plan.md`
2. Gate: User approval
3. Implementation with parallel unit tests
