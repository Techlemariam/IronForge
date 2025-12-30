# Adaptive Volume Landmarks Analysis

> Hur MEV/MRV kan anpassas dynamiskt baserat på användarens träningsrespons och återhämtningsstatus.

## Bakgrund

Renaissance Periodization (RP) definierar volym-landmarks som statiska värden. IronForge kan göra dessa adaptiva.

## Platform Matrix

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ✅ | ❌ | ❌ |
| **Layout** | Full graph + sliders | Compact gauge | N/A | N/A |
| **Input** | Adjust coefficients | View only | N/A | N/A |
| **Offline?** | Cached values | Cached values | N/A | N/A |
| **Priority** | P0 | P1 | N/A | N/A |

**Notes:**
- Desktop: Full dashboard för att se och justera volymparametrar
- Mobil: "Chest: 8/12 sets (67% of MRV)" som compact gauge
- TV Mode: Inte relevant (inte under cardio)

## Problem

Mike Israetel's RP-standards (MEV/MAV/MRV) är **populationsgenomsnitt**. Din verkliga MEV kan vara 8 sets medan standarden säger 10.

## Lösning: 4-nivåers adaptiv modell

### Nivå 1: Naiv Skalning (MVP)
```typescript
// Alla landmarks skalas med samma koefficient
const coeff = 0.9;
personalMEV = standardMEV * coeff;
personalMRV = standardMRV * coeff;
```
- **Effort:** S
- **Data:** 8 veckors träningshistorik
- **Begränsning:** Ignorerar att MRV beror på recovery, inte stimulus

---

### Nivå 2: Dual-Coefficient Model
Separera *stimulus-response* från *recovery-capacity*:

```typescript
interface PersonalVolumeLandmarks {
  stimulusCoeff: number;  // Hur bra muskeln växer → MEV
  recoveryCoeff: number;  // Hur snabbt du återhämtar → MRV
}

personalMEV = standardMEV * stimulusCoeff;
personalMRV = standardMRV * recoveryCoeff;
```
- **Effort:** M
- **Data:** 12+ veckor + styrkeprogressionsdata

---

### Nivå 3: Per-Muscle Adaptation
Varje muskelgrupp har **egen** responshistorik:

```typescript
interface MuscleAdaptiveProfile {
  muscleGroup: string;
  observedMEV: number | null;
  observedMRV: number | null;
  confidence: number;  // 0-1 baserat på datapunkter
}
```

**Inlärningslogik:**
- MEV: Om e1RM ökar vid volym X → MEV ≤ X
- MRV: Om HRV sjunker eller soreness > 3 → MRV ~ X

- **Effort:** L
- **Data:** 16+ veckor + subjektiv feedback + HRV

---

### Nivå 4: Recovery-State Modulated MRV
MRV varierar **dagligen** baserat på:

| Faktor | Effekt på MRV |
|:-------|:--------------|
| Sömn < 6h | × 0.7 |
| HRV < baseline | × 0.85 |
| Stress (subjektiv) | × 0.9 |
| Deload week | × 1.2 |
| Peak form (TSB > 20) | × 1.15 |

```typescript
dailyMRV = baseMRV * sleepMod * hrvMod * stressMod * formMod;
```
- **Effort:** XL
- **Integration:** Oracle System + Wellness Data

---

## Implementation Roadmap

| Nivå | Version | Prerequisite |
|:-----|:--------|:-------------|
| 1 | v1.5 | Enhanced Volume Calculator |
| 2 | v2.0 | Strength progression tracking |
| 3 | v2.5 | User feedback system |
| 4 | v3.0 | Full Oracle + Wellness integration |
