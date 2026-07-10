# Subsystem Vision: Combat Resolution

The Combat Resolution engine handles all RPG mechanics, PvE boss encounters, and PvP duels in IronForge by translating verified physical activities into game outcomes.

---

## 1. Downstream-Only Game Effects
The core tenet of IronForge game design is that **gameplay effects are strictly downstream of training guidance**:
* Game states, duels, or boss quests **MUST NOT** dictate physical training targets.
* Players work out according to the recommendations of the Oracle and their chosen routine, and the completed volume is then translated into game progress.
* This prevents users from overtraining just to win a game duel.

---

## 2. PvE Boss, Dungeon & Loot Concepts
* **Raid Bosses:** Community or solo targets with massive HP pools. Workouts deal damage equivalent to verified set volume or cardio energy expenditure.
* **Dungeons:** Progression zones with specific entry thresholds (e.g. Zone 2 Cardio required to unlock "Cardio Dungeon Floor 1").
* **Loot Tables:** Gear drops upon completing milestones or defeating bosses, granting cosmetic modifiers or resource multipliers (Ref: #365).

---

## 3. PvP Async Duels, Leagues & Tournaments
* **Async Duels:** Two athletes challenge each other. The winner is resolved after a set tracking window (e.g. 7 days) based on consistency and training target execution.
* **Leagues:** Ranked ladders where players earn titles based on weekly consistency scores.
* **Tournaments:** Bracket-based powerlifting or fitness challenges.

---

## 4. Doctrine-Normalized Scoring
To ensure fair play across different athletic specializations and age groups:
* **Suffering is Not a Metric:** The engine does not reward "raw suffering" or reckless training volumes. A player training at their own appropriate workload gets a high score.
* **Normalization Formula:** Scores are evaluated against personal baselines and active Doctrine settings (e.g., comparing completed volume vs. Oracle recommendations, rather than raw volume).

---

## 5. Safety Guardrails
* **XP Cap:** Daily maximum caps on earned experience and resource generation to discourage obsessive behaviors.
* **Fatigue Debuffs:** If the athlete's recovery status drops, their character suffers a fatigue debuff in-game, reducing combat damage or locking them out of PvP matchups.

---

## 6. Lifecycle & Iteration Plan

### MVP
* Turn-based boss fights matching manual log volume.
* Basic item store and gold multipliers.

### Future Version
* Fully animated combat replays.
* Latency-optimized multiplayer sessions via Partykit rooms.

---
*Related Issues & Trackers: #384, #387.*
