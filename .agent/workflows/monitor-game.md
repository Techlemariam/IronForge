---
description: Game data integrity and balancing audit
---
# Game Monitoring Workflow

This workflow audits game mechanics data integrity, balancing constants, and logic gaps.

## 1. Loot Table Audit
Check drop rates and probability distributions in the loot system.

```bash
# Find probability/weight definitions
rg "probability|dropRate|weight|chance" src/services/game/LootSystem.ts
```

## 2. XP & Combat Balance
Identify XP multipliers and damage constants that affect progression.

```bash
# Find balance constants
rg "XP_|MULTIPLIER|BASE_|DAMAGE_|MODIFIER" src/services/game/

# Audit EffortCalculator thresholds
rg "threshold|intensity|zone" src/services/game/EffortCalculator.ts
```

## 3. Equipment Validation
Ensure equipment stats are within valid ranges.

```bash
# Find stat definitions
rg "stat|bonus|modifier|power" src/services/game/EquipmentService.ts
```

## 4. Chase Mode Thresholds
Audit pace and speed thresholds that control chase mode difficulty.

```bash
# Find speed/pace constants
rg "PACE|SPEED|DISTANCE|THRESHOLD" src/services/game/ChaseEngine.ts
```

## 5. Magic Number Scan
Find hardcoded numeric values that might indicate balancing parameters.

```bash
# Find 2+ digit numbers (potential magic numbers)
rg "\b\d{2,}\b" src/services/game/ --type ts
```

## 6. Game Logic TODOs
List unfinished game logic implementation.

```bash
rg "TODO|FIXME|HACK" src/services/game/ src/lib/game/
```
