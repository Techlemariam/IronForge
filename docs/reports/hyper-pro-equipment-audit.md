# Hyper Pro Equipment Mapping Audit

This audit evaluates the current mapping configuration for the Freak Athlete Hyper Pro training station in IronForge to support first-class integration with the exercise resolver and routine planning algorithms.

**Audit Date:** 2026-07-11
**Status:** Complete

---

## 1. Mapped Hyper Pro Exercises
The following exercises are currently configured as Hyper Pro compatible in `src/data/equipmentDb.ts`:

| Exercise Name | Required Types | Hyper Pro Configuration Mode |
|---|---|---|
| **Push Up** | Bodyweight | Flat/Incline (Bench) |
| **Dips** | Bodyweight | Dip Station |
| **45° Back Extension** | Machine | 45° Extension (Glute Bias) |
| **90° Back Extension** | Machine | 90° Extension |
| **Goblet Squat** | Dumbbell / Kettlebell | Slant Board Squat |
| **Bulgarian Split Squat** | Dumbbell / Bodyweight | Split Squat Stand |
| **Leg Extension** | Machine | Leg Extension Attachment |
| **Sissy Squat** | Bodyweight | Sissy Squat Station |
| **Reverse Nordic** | Bodyweight | Floor/Pad |
| **KOT Squat** | Bodyweight | Slant Board |
| **Nordic Curl** | Bodyweight | Nordic Station |
| **Glute Ham Raise** | Bodyweight | GHD |
| **Hamstring Curl (Lying)** | Machine | Leg Curl Attachment |
| **Reverse Hyper** | Machine | Reverse Hyper Attachment |
| **GHD Sit-Up** | Bodyweight | GHD |
| **Dragon Flag** | Bodyweight | Bench Handle |
| **Decline Sit Up** | Bodyweight | Decline Bench |

---

## 2. Duplicate Key Conflict Detected
* **Conflict:** The key `'45° Back Extension'` is defined twice in the Map constructor at lines 62 and 175 of [equipmentDb.ts](file:///c:/Users/alexa/Workspaces/IronForge/src/data/equipmentDb.ts).
* **Impact:** In JavaScript/TypeScript Map constructors, duplicate keys overwrite previous values. The second entry (`45° Extension (Glute Bias)`) overwrites the first entry (`45° Extension`), rendering the plain version un-addressable in the mapping database.
* **Remedy:** Differentiate the keys (e.g. `'45° Back Extension (Back Bias)'` and `'45° Back Extension (Glute Bias)'`) or unify them under a single configuration mode mapping.

---

## 3. Missing Obvious Hyper Pro Movements
The Hyper Pro 10-in-1 supports several target setups not represented in the database:
1. **Calf Raises / Tibialis Raises:** Using the Slant Board attachment.
2. **Preacher Curls:** Using the bench in the preacher curl setup.
3. **QL Side Bends:** Supported in the 45° extension configuration.
4. **Hip Thrusts / Glute Bridges:** Supported when the bench is flat.

---

## 4. Integration with Planning Code
* The boolean toggle `prioritizeHyperPro` is defined in `AppSettings` (Ref: `src/types/index.ts`).
* The helper function `canPerformExercise` in [equipmentDb.ts](file:///c:/Users/alexa/Workspaces/IronForge/src/data/equipmentDb.ts) correctly implements a check for `prioritizeHyperPro` and `HYPER_PRO` ownership.
* **Gap:** The actual exercise resolver and the Oracle weekly planner do not fully utilize the `prioritizeHyperPro` parameter yet when selecting exercises for a daily routine.

---
*Related Issues & Trackers: #390, #391, #392, #393.*
