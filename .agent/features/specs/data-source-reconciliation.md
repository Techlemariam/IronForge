# Data Source Reconciliation Specification

**Status:** Draft | **Priority:** Critical | **Owner:** `/architect`

---

## 1. Overview

IronForge ingests data from multiple sources. This document defines the **System of Record (SoR)** for each data type to prevent conflicts, duplicates, and ensure XP/budget integrity.

---

## 2. Source Authority Matrix

| Data Type | Realtime Input | Persistent Storage | System of Record |
|-----------|----------------|--------------------|------------------|
| **Cardio** | `CardioStudio.tsx` (Web BLE) | Garmin → Intervals.icu | **Intervals.icu** |
| **Strength** | `IronMines.tsx` | IronForge PostgreSQL | **IronForge** |
| **Mobility (ATG)** | *New: MobilityStudio* | IronForge PostgreSQL | **IronForge** |
| **Wellness** | — | Garmin → Intervals.icu | **Intervals.icu** |

> **Decision:** Hevy is **not** a supported source. Strength training must be logged in IronForge to earn XP and affect the Muscle Heatmap.

---

## 3. Data Flow Diagrams

### Cardio (Intervals.icu SoR)

```
[Kickr/H10] --BLE--> [CardioStudio] --display only-->
[Garmin Watch] --FIT--> [Garmin Connect] --> [Intervals.icu] --> [IronForge API]
```

### Strength (IronForge SoR)

```
[User] --> [IronMines.tsx] --> [logSetAction] --> [PostgreSQL]
                                     |
                                     v
                          [WeaknessAuditor] --> [GPE Budget]
```

### Mobility (IronForge SoR)

```
[User] --> [MobilityStudio.tsx] --> [logMobilityAction] --> [PostgreSQL]
                                            |
                                            v
                                  [MobilityAuditor] --> [Passive Layer XP]
```

---

## 4. Conflict Resolution Rules

| Scenario | Resolution |
|----------|------------|
| User logs strength in IronForge AND Hevy | **Ignore Hevy**. IronForge-only policy. |
| User forgets to log strength | GPE has no data. Prompt: "Quick Log" notification next day. |
| Intervals.icu returns RPE for cardio | Use Intervals value (external authority). |
| User enters per-set RPE in IronMines | Use IronForge value. Calculate session sRPE locally. |

---

## 5. Null Handling (Fallback Policy)

| Field | Source | Fallback if NULL |
|-------|--------|------------------|
| `wellness.hrv` | Intervals | Use 7-day rolling average. If no history, skip HRV-based modifiers. |
| `wellness.menstrualPhase` | Intervals | Feature disabled (opt-in only). |
| `activity.icu_hr_zone_times` | Intervals | Feature disabled for non-cardio users. |
| `strength.kg_lifted` | IronForge | 0 (no XP for unmeasured lifts). |

---

## 6. Migration Notes

### Hevy Removal

- [ ] Remove `getHevyWorkouts()` calls from `auditorOrchestrator.ts`
- [ ] Replace with `getIronForgeStrengthLogs()` action
- [ ] Delete `src/lib/hevy.ts` (or deprecate)
- [ ] Update `hevyAdapter.ts` if needed for legacy import

### Mobility Addition

- [ ] Create `MobilityLog` schema (Prisma)
- [ ] Create `logMobilityAction` server action
- [ ] Create `MobilityStudio.tsx` component
- [ ] Integrate with Passive Layer XP (Bronze/Silver/Gold)

---

## 7. Related Specs

- [Goal Priority Engine](./goal-priority-engine.md)
- [Training Path System](./training-path-system.md)
- [Iron Logger Vision](../docs/specs/iron_logger_vision.md)
