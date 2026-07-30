# IronForge Product Architecture Overview

<!-- markdownlint-disable MD013 -->

This document serves as the canonical entry point and blueprint for the system architecture of **IronForge**. It outlines the core subsystems, their runtime execution loop, and the governance model that balances recovery coaching with gamified progression.

---

## 1. High-Level Architectural Blueprint

IronForge operates as a layered, state-driven platform with five core subsystems interacting in a continuous feedback loop:

```text
                  ┌─────────────────────────────────────┐
                  │          Advisors Input             │
                  │  (Muscle Volume, HRV, Fatigue, etc) │
                  └──────────────────┬──────────────────┘
                                     │ (Raw Metrics)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │             THE ORACLE              │  ◄── [Safety Constraints]
                  │       (Decision / Guidance)         │
                  └──────────────────┬──────────────────┘
                                     │ (Target Load Target)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │             MICROFORGE              │
                  │       (Execution / Workout Plan)    │
                  └──────────────────┬──────────────────┘
                                     │ (Prescribed Action)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │          ACTIVITY ARBITER           │
                  │     (Verification / Alignment)      │
                  └──────────────────┬──────────────────┘
                                     │ (Verified Activity)
                                     ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │                        PROGRESSION TIERS                        │
  ├──────────────────────────────────┬──────────────────────────────┤
  │         DOCTRINE ENGINE          │      COMBAT RESOLUTION       │
  │     (Philosophy / Profiles)      │  (PvE Bosses, PvP leagues)   │
  └──────────────────────────────────┴──────────────────────────────┘
```text
---

## 2. Core Architectural Layers

### A. The Oracle (Decision Layer)

* **Product Idea:** The automated coach that decides what should happen today. It weighs physiological variables to output a target recovery state and recommended training load.
* **Behavior Model:** Continuous ingestion of health indicators. When an overtraining threat is detected, it imposes absolute locks or debuffs.
* **Data Needed:** HRV, resting heart rate, sleep quality scores, muscle soreness ratings, historical training logs.
* **MVP:** Recovery scoring base using simple, rule-based multipliers (Ref: #361, #366).
* **Future Version:** AI-driven recovery forecasting modulated by multi-week adaptive volume landmarks.

### B. MicroForge (Daily Execution Loop)

* **Product Idea:** Translates the Oracle's abstract decisions into highly custom, executable daily missions or workouts.
* **Behavior Model:** Converts load targets into direct sets, reps, and cardiovascular durations. It acts as the interactive logger for in-app sessions.
* **Data Needed:** Routine structures, previous exercise performance, current target workout time window.
* **MVP:** Simple routine logging and manual set tracking (Ref: #348).
* **Future Version:** Dynamic mid-workout adjustments using RPE targets and fatigue spikes.

### C. Activity Arbiter (Verification Layer)

* **Product Idea:** The independent auditor that verifies what *actually* happened by matching in-app workouts against external tracker syncs.
* **Behavior Model:** Ingests external activity feeds and uses fuzzy matching algorithms to verify set completion, duration, and heart rate thresholds.
* **Data Needed:** Inbound webhook payloads from Garmin, Strava, Hevy, or Zwift.
* **MVP:** Manual check-in and basic Garmin/Hevy file ingestion (Ref: #355).
* **Future Version:** Fully automated multisource activity reconciliation with real-time feedback loops.

### D. Doctrine Engine (Philosophy & Profiles)

* **Product Idea:** Customizes the Oracle's risk-tolerance and coaching style to match the athlete's personality (e.g. Sustainable vs. Hero).
* **Behavior Model:** Applies different scoring multipliers and safety guards based on the player's selected training philosophy.
* **Data Needed:** Doctrine profiles, selected risk tier, athlete specialization (e.g., Powerlifting vs. Marathon).
* **MVP:** Basic static multipliers for volume calculation.
* **Future Version:** Dynamic coaching style shifts based on active user stress profiles.

### E. Combat Resolution (RPG Effect Layer)

* **Product Idea:** Integrates gamification, PvE boss mechanics, and async PvP duels with real workout outcomes.
* **Behavior Model:** Translates verified training volume into combat damage, status buffs, gold, and XP.
* **Data Needed:** Character level, inventory stats, active boss HP, PvP challenger details.
* **MVP:** Turn-based boss fights and gold shop system (Ref: #365, #367, #368).
* **Future Version:** Live Co-op dungeons, active leagues, bracket-based tournaments, and element-specific combat systems.

---

## 3. Critical Safety Guardrails

* **Absolute Recovery Primacy:** RPG progression mechanics, item shops, combat buffs, and leaderboard incentives **MUST NOT** override Oracle or recovery constraints.
* **Fatigue Debuffs:** If the Oracle indicates severe fatigue, character power ratings are reduced, and certain high-tier dungeons remain locked to protect the athlete from injury.
* **Ethics of Hard Safety:** Training load targets cannot be raised solely to gain combat advantages.

---
*Related Trackers & Epics: #355, #365, #366, #367, #368, #369, #370, #379.*
