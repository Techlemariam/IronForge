# Cardio PvP Duels Specification

**Status:** Pending Review | **Priority:** Medium | **Effort:** M-L

## Overview
PvP duels for cardio activities (running + cycling) using indoor trainers (Wahoo Kickr, Titan T73 löpband).

---

## Duel Types

### 🚴 Cycling (Kickr)

| Duel | Metric | Duration Options | W/kg Tiers |
|:-----|:-------|:-----------------|:-----------|
| **Distance Race** | Longest km | 5 / 10 / 15 / 30 min | 2.0 / 2.5 / 3.0 / 3.5 |
| **Speed Demon** | Fastest time | 5 / 10 / 20 / 40 km | Same |
| **Elevation Grind** | Most elevation | 10 / 20 / 30 min | Same |

**ERG Mode Fairness:**
```
Target Watts = W/kg tier × user weight
Example: 2.5 W/kg × 80kg = 200W target
→ Equal relative effort = equal virtual speed
```

### 🏃 Running (Treadmill)

| Duel | Metric | Duration Options |
|:-----|:-------|:-----------------|
| **Distance Race** | Longest km | 5 / 10 / 15 / 30 min |
| **Speed Demon** | Fastest time | 1 / 3 / 5 / 10 km |

**No weight normalization** - pure distance/time competition.

---

## Rules

| Rule | Value |
|:-----|:------|
| Indoor only | ✅ No mixed indoor/outdoor |
| Minimum speed | Running: 4 km/h, Cycling: 15 km/h |
| Pause limit | Max 30s total pause time |
| Data source | Web Bluetooth (CardioStudio) |

---

## Technical Requirements

- [x] Titan Duel Infrastructure
- [x] CardioStudio Web Bluetooth
- [x] Wahoo Kickr FTMS
- [ ] Duel type: `cardio_distance` / `cardio_speed` / `cardio_elevation`
- [ ] W/kg tier selector in duel creation UI
- [ ] Treadmill RSC integration (Titan T73)

---

## XP Rewards

```
Base XP = duration_min × 10
Win bonus = +50%
Cap = 500 XP/duel
```
