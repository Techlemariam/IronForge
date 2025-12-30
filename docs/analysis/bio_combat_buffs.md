# Bio→Combat Buff System Analysis

> Hur wellness-data (HRV, sömn, readiness) påverkar Titan's combat stats.

## Koncept

Din verkliga återhämtningsstatus ger buffs/debuffs till din Titan i strid. Sov bra → starkare Titan.

## Platform Matrix

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ✅ | ✅ | ⚠️ |
| **Layout** | Full buff card | Badge + tap for details | Edge glow color | Badge on phone |
| **Input** | Hover for details | Tap | Visual only | View |
| **Offline?** | Cached buff | Cached buff | Cached buff | Relay |
| **Priority** | P0 | P0 | P0 | P1 |

**Notes:**
- TV Mode: Edge glow = grön (buffed), röd (debuffed), amber (neutral)
- Mobil: Prominent badge i header med current buff
- Companion: Visa buff-status på mobilen när TV visar workout

## Data Sources

| Source | Metric | How |
|:-------|:-------|:----|
| Intervals.icu | HRV, Resting HR, Readiness | API sync |
| Garmin | Body Battery, Sleep Score | Via Intervals |
| Manual | Subjective wellness (1-5) | Daily check-in |

## Buff/Debuff Tiers

```typescript
type BuffTier = 'LEGENDARY' | 'EPIC' | 'RARE' | 'COMMON' | 'DEBUFF';

interface BioBuff {
  tier: BuffTier;
  name: string;
  description: string;
  effects: {
    attackMod?: number;    // Multiplier (1.0 = no change)
    defenseMod?: number;
    critChance?: number;   // Additive bonus
    xpMod?: number;
  };
}
```

## Buff Mapping

| Condition | Buff Name | Effect |
|:----------|:----------|:-------|
| Sleep ≥ 90, HRV ≥ baseline+20% | **Iron Constitution** (Legendary) | ATK +20%, Crit +10% |
| Sleep ≥ 80, HRV ≥ baseline | **Well Rested** (Epic) | ATK +15%, XP +10% |
| Sleep ≥ 70, HRV ≥ baseline-10% | **Fresh** (Rare) | ATK +10% |
| Sleep ≥ 60 | **Stable** (Common) | No change |
| Sleep < 60 OR HRV < baseline-20% | **Fatigued** (Debuff) | ATK -10%, DEF -10% |
| Sleep < 40 OR RHR > baseline+15% | **Exhausted** (Debuff) | ATK -25%, no combat |

## HRV Baseline Calculation

```typescript
// Rolling 7-day average for baseline
const calculateHrvBaseline = async (userId: string): Promise<number> => {
  const last7Days = await getWellnessHistory(userId, 7);
  const hrvValues = last7Days.map(d => d.hrv).filter(Boolean);
  return hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length;
};

// Current deviation
const deviation = ((todayHrv - baseline) / baseline) * 100;
```

## Integration with Oracle

```typescript
// In OracleService.determineDecree()
const bioBuff = calculateBioBuff(wellness, hrvBaseline);

return {
  type: bioBuff.tier === 'DEBUFF' ? 'DEBUFF' : 'BUFF',
  label: bioBuff.name,
  description: bioBuff.description,
  effect: {
    attackMod: bioBuff.effects.attackMod,
    defenseMod: bioBuff.effects.defenseMod,
    xpMultiplier: bioBuff.effects.xpMod,
  }
};
```

## Database Storage

```prisma
// Add to User or Titan
model Titan {
  // ... existing
  currentBuff      String?  // JSON: BioBuff
  buffExpiresAt    DateTime?
  hrvBaseline      Float?
  lastWellnessSync DateTime?
}
```

## Combat Application

```typescript
// In CombatService.calculateDamage()
const baseDamage = weapon.damage * playerStats.attack;
const buffedDamage = baseDamage * (titan.currentBuff?.effects.attackMod ?? 1.0);
const critRoll = Math.random() < (baseCritChance + (buff?.effects.critChance ?? 0));
```

## UI Display

```
┌───────────────────────────────────────┐
│  🌟 IRON CONSTITUTION (Legendary)     │
│  ────────────────────────────────     │
│  Sleep: 92/100  ⭐⭐⭐⭐⭐              │
│  HRV: +24% above baseline             │
│  ────────────────────────────────     │
│  ⚔️ Attack +20%                        │
│  🎯 Crit Chance +10%                   │
│  ────────────────────────────────     │
│  Valid until next wellness sync       │
└───────────────────────────────────────┘
```

## Implementation Steps

1. Add `hrvBaseline`, `currentBuff` fields to Titan model
2. Create `bioBuffService.ts` with buff calculation logic
3. Integrate with `OracleService.generateDailyDecree()`
4. Apply buffs in `CombatService.calculateDamage()`
5. Create `BioBuffBadge.tsx` UI component
6. Display in Dashboard and Combat Arena
