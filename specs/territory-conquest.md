# 🗺️ Territory Conquest - Game Design Document

> **Version:** 1.0 | **Status:** Design Review | **Owner:** Game Designer

## 📋 Executive Summary

Territory Conquest är ett GPS-baserat utomhusläge där löpare erövrar och försvarar geografiska tiles. Spelet belönar regelbunden löpning och utforskning utan tidsstress.

---

## 🎮 Core Gameplay Loop

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   1. SPRING                                                 │
│      └─→ GPS trackar din rutt                               │
│                                                             │
│   2. ERÖVRA                                                 │
│      └─→ Tiles du passerar får +control                     │
│                                                             │
│   3. FÖRSVARA                                               │
│      └─→ Andra löpare kan ta dina tiles                     │
│                                                             │
│   4. SETTLEMENT (söndag)                                    │
│      └─→ Tiles med >50% control = din inkomst              │
│                                                             │
│   5. PASSIV INKOMST                                         │
│      └─→ Ägda tiles → Gold/XP varje dag                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 Tile System

### Specifikationer

| Parameter | Värde | Motivering |
|:---|:---|:---|
| **Tile-storlek** | 200m × 200m | Balans mellan granularitet och GPS-precision |
| **Index-system** | H3 hexagoner (resolution 8) | Industristandard, bra för adjacency |
| **Max tiles/session** | Obegränsat | Belöna långa löprundor |

### Tile States

```
NEUTRAL   → Ingen äger (grå)
CONTESTED → Pågående kamp (gul)  
OWNED     → Du kontrollerar (grön)
HOSTILE   → Rival kontrollerar (röd)
HOME      → Din skyddade zon (blå)
```

---

## ⚔️ Control Point System

### Gaining Control

| Action | Base Points | Effort Bonus | Total |
|:---|:---|:---|:---|
| Passera tile (1:a/dag) | +10 | +0 till +10 | +10-20 |
| Passera tile (2:a/dag) | +5 | +0 till +5 | +5-10 |
| Passera tile (3:e+/dag) | +2 | +0 till +2 | +2-4 |
| Expansion (ny adjacent tile) | +10 | +5 bonus | +15-25 |

### Losing Control

| Event | Points Lost |
|:---|:---|
| Rival passerar din tile | -10 (du), +10 (rival) |
| Ingen besöker på 7 dagar | -5/dag decay |
| **Daily loss cap** | **Max -50/tile/dag** |

### Ownership Threshold

```
Control ≥ 50% → Du äger tile vid settlement
Control < 50% → Rival äger ELLER neutral
```

---

## ⚡ Unified Effort System

### Effort Score (0-100)

Normaliserad ansträngning oavsett metric-källa:

| Zone | Effort Score | HR (% max) | Power (% FTP) | Pace |
|:---|:---|:---|:---|:---|
| Recovery | 20 | <60% | <56% | >7:00/km |
| Endurance | 40 | 60-70% | 56-76% | 6:00-7:00/km |
| Tempo | 60 | 70-80% | 76-90% | 5:00-6:00/km |
| Threshold | 80 | 80-90% | 90-105% | 4:30-5:00/km |
| VO2max | 100 | >90% | >105% | <4:30/km |

### Effort → Territory Bonus

| Effort Score | Control Bonus | Design Rationale |
|:---|:---|:---|
| 0-30 | +0 | Walking, stillastående |
| 31-50 | +5 | Easy run (sustainable) |
| 51-70 | +8 | Tempo (quality work) |
| **71-90** | **+10** | **Threshold = max belöning** |
| 91-100 | +8 | VO2max (diminishing returns) |

### Metric Priority

```
1. Running Power (Stryd/Garmin) → Best for hills
2. Heart Rate → Universal fallback
3. Pace → Only if no other data
```

---

## 🏠 Home Zone Protection

### Definition
- **Radie:** 500m från registrerad hemadress
- **Tiles:** Alla tiles inom radien

### Bonusar

| Benefit | Value |
|:---|:---|
| Control gain | +50% |
| Control loss | Immune (kan ej förloras) |
| Passive income | +25% |

---

## 📅 Weekly Settlement

### Timing
- **Varje söndag 23:59 lokal tid**
- Server beräknar alla tiles och fastställer ägare

### Process

```
FOR each tile:
  IF player_control >= 50%:
    owner = player
    add to passive_income_pool
  ELSE IF rival_control >= 50%:
    owner = rival
  ELSE:
    owner = null (contested)
```

### Notifications

```
📊 Weekly Territory Report

🟢 Tiles owned: 47 (+3)
🟡 Contested: 5
🔴 Lost to rivals: 2

💰 Weekly income: +235 Gold, +470 XP
```

---

## 💰 Passive Income

### Formula

```typescript
dailyGold = ownedTiles * 0.5 * (1 + adjacencyBonus)
dailyXP = ownedTiles * 1.0 * (1 + adjacencyBonus)

// Adjacency bonus: +2% per connected tile (max +50%)
adjacencyBonus = min(0.50, connectedTiles * 0.02)
```

### Example

```
47 tiles, 30 connected:
adjacencyBonus = 30 * 0.02 = 0.60 → capped at 0.50

Daily Gold = 47 * 0.5 * 1.5 = 35.25 → 35
Daily XP = 47 * 1.0 * 1.5 = 70.5 → 70
```

---

## 🏆 Milestones & Achievements

| Milestone | Tiles | Reward |
|:---|:---|:---|
| First Steps | 1 | Tutorial badge |
| Explorer | 10 | "Explorer" title |
| Pathfinder | 25 | +5% passive income |
| Conqueror | 50 | Map cosmetic unlock |
| Warlord | 100 | "Warlord of [City]" title |
| Emperor | 200 | Legendary achievement |
| Defending Champion | 50 tiles held 4 weeks | Unique avatar frame |

---

## 🛡️ Anti-Abuse Measures

| Abuse | Countermeasure |
|:---|:---|
| Driving to capture | Speed filter: max 25 km/h |
| GPS spoofing | Accuracy requirement: <50m |
| Tile camping (same route) | Diminishing returns per tile/dag |
| Alt-account boosting | Same device detection |

---

## 📡 Data Flow (Hybrid Mode)

### Primary: Intervals.icu Sync (Default)

```
Garmin Watch → Garmin Connect → Intervals.icu → IronForge Webhook
                                                      ↓
                                              Parse GPS Track
                                                      ↓
                                              Extract Tiles
                                                      ↓
                                              Update Control Points
                                                      ↓
                                              Push Notification
```

**Trigger:** Intervals.icu webhook on new activity  
**Latency:** ~5-15 min after workout ends  
**User Action:** None required

### Secondary: Live Mode (Opt-in)

```
┌─────────────────────────────────────┐
│ 🗺️ IronForge Live Territory        │
│                                     │
│   📍 Your position (GPS)            │
│   🟢 Tile captured! +15             │
│   🟡 Entering contested zone...     │
│                                     │
└─────────────────────────────────────┘
```

**Trigger:** User opens Territory mode in app  
**Battery:** High (GPS continuous)  
**User Action:** Explicit opt-in

---

## 📱 UI Overview

### Map View

```
┌─────────────────────────────────┐
│ 🗺️ Your Territory              │
│ ┌───────────────────────────┐  │
│ │ 🟢🟢🟡🔴⬜⬜             │  │
│ │ 🟢🏠🟢🟡🔴⬜             │  │
│ │ 🟢🟢🟢🟢🟡⬜             │  │
│ └───────────────────────────┘  │
│                                 │
│ Owned: 47 | Contested: 5       │
│ Weekly Income: 35g/day         │
└─────────────────────────────────┘
```

### Post-Run Summary

```
┌─────────────────────────────────┐
│ 🏃 Run Complete!                │
│                                 │
│ Distance: 5.2 km                │
│ Avg Effort: 72 (Threshold)      │
│                                 │
│ 🗺️ Territory Update:           │
│ • +3 new tiles conquered        │
│ • +2 tiles reinforced           │
│ • 1 tile contested by @RunnerX  │
│                                 │
│ Total Control: +45 points       │
└─────────────────────────────────┘
```

---

## ✅ Additional Decisions (Confirmed)

| Question | Decision |
|:---|:---|
| **Leaderboards** | Både per-stad OCH globalt |
| **Guild Territories** | Ja, guilds kan poola territory |
| **Seasons/Reset** | Permanent ägande (ingen reset) |
| **Anonymitet** | Visa rivalens namn |

---

## ✅ Design Decisions (Confirmed)

- [x] 200m tiles (H3 resolution 8)
- [x] Weekly settlement (söndag)
- [x] Unified Effort System (Power prioriterad)
- [x] Home Zone protection (500m, immune)
- [x] Daily loss cap (-50/tile)
- [x] Threshold effort = max bonus
- [x] Årstidsoberoende (hela året)
- [x] Hybrid Data Flow: Intervals.icu sync (default) + Live mode (opt-in)
- [x] Dual Leaderboards: Per-stad + Globalt
- [x] Guild Territory Pooling: Aktiverat
- [x] Permanent Ownership: Ingen seasonal reset
- [x] Rival Visibility: Visa användarnamn

---

*Document created: 2025-12-31 | Game Domain Session*
