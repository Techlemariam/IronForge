# Subsystem Vision: Activity Arbiter

The Activity Arbiter is the verification and auditing layer of IronForge. It is responsible for cross-referencing completed exercises against external trackers to validate training consistency.

---

## 1. Role
The Activity Arbiter ensures integrity within the gamification loop. It verifies that RPG rewards, quest progression, and PvP outcomes are based on actual physical activities.

---

## 2. In-App vs. External Synced Activities
The Arbiter processes two kinds of activity sources:
1. **In-App Sessions:** Workouts executed directly within the MicroForge interface, immediately verified via manual set logging.
2. **External Synced Activities:** Cardiovascular or strength sessions synced from external platforms:
   * **Intervals.icu / Garmin:** Raw FIT file metrics, heart rate zones, power outputs, and pacing.
   * **Hevy / Strava:** Structured sets and reps or GPS-tracked runs.
   * **Zwift:** Virtual cycling mileage and wattage logs.
   * **Manual Input:** Self-reported workouts (requires manual confirmation or secondary verification).

---

## 3. Conceptual Pass-Matching Logic
To prevent cheating and ensure data consistency, the Arbiter uses a matching engine:
* **Time Windows:** Matches sessions within a ±60 minute window of scheduled quests.
* **Volume/Intensity Filters:** Cross-checks logged strength sets or cardio duration against incoming external tracker payloads.
* **Fuzzy Parsing:** Resolves exercise naming mismatches (e.g. mapping Garmin's "Barbell Bench Press" to in-app "Bench Press").

---

## 4. Input & Output Specification

### Inputs
* **Completed MicroForge Session:** Expected sets/reps or target duration.
* **Webhook payloads:** Garmin, Intervals.icu, Strava, Hevy API data.

### Outputs
* **Verification Status:** Enum (`VERIFIED`, `REJECTED`, `PENDING_REVIEW`).
* **Verified Volume/Intensity Package:** Used to trigger RPG rewards.

---

## 5. Lifecycle & Iteration Plan

### MVP
* Rule-based comparison matching simple start-time windows and duration metrics from Strava and Hevy syncs.
* Basic duplicate detection.

### Future Version
* Multi-source consensus matching (e.g., combining Garmin HR data with Hevy sets to form a single verified session).
* Machine-learning detection of anomalies or synthetic activity uploads.

---

## 6. Non-Goals
* Displaying live workout statistics during training sessions (delegated to MicroForge).
* Initiating direct connections to physical workout devices.

---
*Related Issues & Trackers: #355, #358, #370, #382.*
