# 🏗️ Build vs Buy: Internal Workout Logger vs Hevy

## 🎯 The Dilemma
Should IronForge build its own workout logging system ("Build") or continue relying on Hevy ("Buy/Integrate")?

## 📊 Comparison Matrix

| Feature | 🏋️ Hevy (Current) | 🏰 IronForge Native (Proposed) |
| :--- | :--- | :--- |
| **Data Ownership** | Hevy owns data (API access) | **100% Owned** (Postgres) |
| **User Experience** | World-class Native App (iOS/Android) | **PWA Web Interface** (Good, but not native) |
| **Dev Effort** | Low (Maintenance of API) | **High** (UI, State, Offline Mode) |
| **Gamification** | Loose (Sync after workout) | **Tight** (Real-time XP/Boss Damage during set) |
| **Offline Mode** | Native support | Requires robust Service Worker/Local Storage |
| **Exercise DB** | Huge, curated library | Manual entry (We start empty) |

## 🛠 Option A: The "Iron Logger" (Build)
*Building a full replacement.*

### ✅ Pros
1.  **Direct Gamification:** "Complete Set" button can instantly deal damage to a boss.
2.  **Zero Dependencies:** No API limits, no external subscriptions.
3.  **Custom Metrics:** Track specific things Hevy doesn't (e.g. "Mental Focus", "Breathwork").

### ⚠️ Cons
1.  **The "UI Grind":** Building a friction-free logger is *hard*. Inputs, timers, plate calculators, easy editing.
2.  **Database Entry:** We need to seed 100+ exercises or enter them manually.
3.  **Mobile Feel:** A PWA is never as snappy as a native iOS app for quick inputs in a gym.

### 📋 Estimated MVP Scope (2-3 Sprints)
1.  **Exercise Database UI:** Search/Create exercises.
2.  **Active Session UI:** The "Logger" view (Sets, Reps, RPE, Rest Timer).
3.  **History/Progress:** Charts and logs.
4.  **Templates:** Create/Edit routines.

---

## 🤝 Option B: The "Hybrid Commander" (Keep Hevy)
*IronForge as the "Gamification Layer", Hevy as the "Input Layer".*

### ✅ Pros
1.  **Low Friction:** Hevy is already excellent at logging.
2.  **Focus:** We focus on *Gamifying* the data (Boss Battles, Quests), not building input forms.
3.  **Speed:** We can build features *now*, not after 3 weeks of building UI.

### ⚠️ Cons
1.  **Sync Lag:** Rewards come *after* the workout.
2.  **Dependency:** If Hevy API changes, we break.

---

## 💡 Recommendation: "The Progressive Overload"
**Don't delete Hevy yet.**

1.  **Phase 1 (Now):** Keep Hevy. Enhance the *Import* to be smoother.
2.  **Phase 2 (Experiment):** Build a simple **"Iron Logger"** for *specific* workouts (e.g. "Titan Calisthenics" home workouts) where you are at your computer/tablet.
    *   *Why?* It tests the waters. If you like logging in IronForge, we expand it.
3.  **Phase 3 (Migration):** If Phase 2 succeeds, we migrate fully.

### 🧠 Strategic Question
**"Do you want to code input forms, or do you want to code game mechanics?"**
If time is your most scarce resource, building a logger is a "time sink" with high risk of being worse than Hevy UX-wise.
