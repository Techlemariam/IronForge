# Subsystem Vision: MicroForge

MicroForge is the daily execution and task orchestration layer of IronForge. It translates high-level decisions from the Oracle into concrete, actionable daily missions or workouts.

---

## 1. Role
MicroForge serves as the daily workout delivery interface and user engagement loop. It packages the physical objectives as game quests.

---

## 2. User-Facing Behavior
* On opening the dashboard, users see their active "Daily Quest" (e.g. "Complete 4 sets of Squats to damage the Faction Boss").
* An interactive set logger allows quick input of sets, reps, and RPE weight targets.
* Displays motivational hints, haptic cues, and instant combat damage previews on set completion.

---

## 3. Input & Output Specification

### Inputs
* **Daily Verdict & Load Targets:** From the Oracle.
* **Active User Routine:** Selected strength program or cardiorespiratory plan.
* **RPG Context:** Active quest requirements or raid status.

### Outputs
* **Missions / Daily Quests:** Displayed workout structures with target ranges.
* **Active Workout Session:** Formatted set inputs for direct logger consumption.
* **Completed Workout Log:** Machine-readable data package dispatched to Activity Arbiter.

---

## 4. Lifecycle & Iteration Plan

### MVP
* Render routine templates and log sets manually.
* Interactive onboarding tour and first-time prompts.
* Basic haptic support for resting timers.

### Future Version
* Proactive set recommendations based on live performance (auto-regulating reps/weights between sets).
* Co-op routine sharing and concurrent live training feeds.

---

## 5. Non-Goals
* Managing long-term physiological target load trends (this is owned by the Oracle).
* Syncing external workout payloads directly from APIs (delegated to Activity Arbiter).

---
*Related Issues & Trackers: #348, #349, #350, #351, #352, #353, #354, #355.*
