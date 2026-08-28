# Subsystem Vision: The Oracle

<!-- markdownlint-disable MD013 -->

The Oracle is the primary decision-making and physiological analysis engine of IronForge. It is responsible for assessing user fatigue and determining daily exercise guidance.

---

## 1. Role

The Oracle plays the role of an automated, bio-informed head coach. It prevents injury, tracks overall fitness fatigue balance (TSB), and dictates recommended daily loads.

---

## 2. User-Facing Behavior

* Every morning, the user receives their "Daily Oracle Verdict" (e.g. TRAIN, REST, or LIGHT).
* If fatigue is high, the Oracle locks intense training modes and triggers warning screens in the UI.
* The coaching tone shifts dynamically based on user preferences (e.g. strict "Commander" vs. supportive "Companion").

---

## 3. Input & Output Specification

### Inputs

* **Heart Rate Variability (HRV):** Taken via Oura/Garmin sync.
* **Resting Heart Rate (RHR):** Overnight average.
* **Sleep Quality:** Score (0-100) and duration.
* **Previous Training Load:** Acute-to-Chronic Workload Ratio (ACWR).
* **Subjective Soreness:** 1-5 rating logged by user.

### Outputs

* **Daily Verdict:** Enum (`TRAIN`, `REST`, `LIGHT`).
* **Recommended Volume Target:** RPE-adjusted target sets.
* **Fatigue Scale:** Numeric representation of overall systemic stress.

---

## 4. Lifecycle & Iteration Plan

### MVP

* Implements simple thresholds based on sleep and HRV.
* Manual recovery log checks.
* RPE-weighted load estimation using a single coefficient scaling algorithm.

### Future Version

* Integration of machine learning models for individualized stress-tolerance predictions.
* Automatic adjustment of dynamic Volume Landmarks (MRV, MAV) across individual muscle groups.

---

## 5. Non-Goals

* Medical diagnosis: The Oracle provides fitness guidance, not medical evaluations.
* Real-time heart rate monitoring during workouts (delegated to individual devices and the Activity Arbiter).

---
*Related Issues & Trackers: #356, #357, #359, #361, #362, #366.*
