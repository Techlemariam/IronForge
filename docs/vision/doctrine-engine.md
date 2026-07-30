# Subsystem Vision: Doctrine Engine

<!-- markdownlint-disable MD013 -->

The Doctrine Engine manages coaching philosophy and risk alignment within IronForge. It tailors the Oracle's guidance algorithms to fit the individual athlete's mindset and athletic specialization.

---

## 1. Core Athlete Doctrines

Different athletes have different psychological and physiological tolerances. The Doctrine Engine implements four primary modes:

* **Sustainable Doctrine (Longevity First):** Prioritizes injury prevention, joint longevity, and consistent habits. Tolerates low risk.
* **Performance Doctrine (Balanced Progression):** Standard athletic training mode. Focuses on progress using structured periodization guidelines.
* **Hero Doctrine (High Intensity):** For experienced lifters. Allows higher training volumes and pushes closer to failure, with shorter recovery windows.
* **Coach Doctrine (Manual Guidance):** The user or an external coach overrides the Oracle's recommendations entirely.

---

## 2. Risk Tolerance Scale

Doctrines are mapped to a numeric **Risk Tolerance Scale (1 to 5)**:

1. **Minimal (1):** Immediate load reduction on minor sleep or HRV drops.
2. **Conservative (2):** Standard longevity-focused training filters.
3. **Moderate (3):** Accommodates planned fatigue and overloading.
4. **Aggressive (4):** Pushes limits; overrides standard fatigue locks unless chronic overtraining is detected.
5. **Absolute (5):** Reserved for peak tournament preparation (Coach override).

---

## 3. Powerlifter Adaptations

A key concern for powerlifters and elite strength athletes is feeling "artificially limited" or forced to rest by generic fitness algorithms when preparing for a maximum effort lift.

* **Overriding Rest Blocks:** The Doctrine Engine ensures that high-experience athletes can override recommended rest prompts if their training program calls for a heavy single or testing day.
* **Accommodating Planned Fatigue:** Recognizes that strength accumulation requires phases of high stress (overreaching) followed by tapering, preventing premature rest locks during loading cycles.

---

## 4. Shaping Oracle Behavior

The active Doctrine modifies the calculations of the Oracle decision loop:

* **Volume Thresholds:** Sustainable doctrine applies a $0.85\times$ penalty to maximum set volume targets, while Hero doctrine allows $1.15\times$ expansion.
* **HRV Sensitivity:** Risk levels dictate how heavily a drop in HRV affects the recovery rating.

---

## 5. Safety Boundaries

* **Absolute Hard Limits:** No Doctrine (even Hero or Coach override) can bypass critical safety blocks when severe health metrics (e.g. extreme resting heart rate spikes or verified injury markers) are detected.
* **Ethics of Overriding:** Bypassing recovery blocks requires explicit manual user confirmation and log recording.

---

## 6. Lifecycle & Iteration Plan

### MVP

* Static risk multipliers adjusting volume limits.
* Core selection of the four basic doctrines.

### Future Version

* Dynamic doctrine transitions (e.g. automatic taper phase shifts before an external event).
* Granular configuration profiles for specific athletic programs.

---
*Related Issues & Trackers: #383, #386.*
