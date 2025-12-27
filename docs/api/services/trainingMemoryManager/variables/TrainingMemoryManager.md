[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/trainingMemoryManager](../README.md) / TrainingMemoryManager

# Variable: TrainingMemoryManager

> `const` **TrainingMemoryManager**: `object`

Defined in: [src/services/trainingMemoryManager.ts:35](https://github.com/Techlemariam/IronForge/blob/main/src/services/trainingMemoryManager.ts#L35)

Training Memory Manager Service

## Type Declaration

### calculateDebuffs()

> **calculateDebuffs**(`sleepScore`, `hrv`): `CapacityModifier`[]

Calculate capacity modifiers based on external factors.
Returns debuffs that reduce total training capacity.

#### Parameters

##### sleepScore

`number`

##### hrv

`number`

#### Returns

`CapacityModifier`[]

### canAllocateHighIntensity()

> **canAllocateHighIntensity**(`activities`, `capacityModifiers`): `boolean`

Check if user has capacity for high-intensity work (Zone 5 / heavy lifting).
Uses a safety margin to account for life factors (parenting, stress, etc.)

#### Parameters

##### activities

`TrainingActivity`[]

##### capacityModifiers

`CapacityModifier`[] = `[]`

#### Returns

`boolean`

### evaluateTransition()

> **evaluateTransition**(`metrics`, `currentCycle`): `object`

Evaluate whether a macro-cycle transition should occur.
Uses TSB, CTL, and strength progress to determine optimal phase.

#### Parameters

##### metrics

`SystemMetrics`

##### currentCycle

`MacroCycle`

#### Returns

`object`

##### reason

> **reason**: `string`

##### recommendedCycle

> **recommendedCycle**: `MacroCycle`

##### shouldTransition

> **shouldTransition**: `boolean`

### getAdjustedLandmarks()

> **getAdjustedLandmarks**(`muscleGroup`, `path`): `VolumeLandmarks`

Get adjusted landmarks for a specific muscle group based on the active path.
Applies path-specific multipliers to the baseline RP landmarks.

#### Parameters

##### muscleGroup

`MuscleGroup`

##### path

`TrainingPath`

#### Returns

`VolumeLandmarks`

### getCombatModifiers()

> **getCombatModifiers**(`path`): `PathModifiers`

Get combat modifiers for a given path.

#### Parameters

##### path

`TrainingPath`

#### Returns

`PathModifiers`

### getDifficultyMultiplier()

> **getDifficultyMultiplier**(`questPath`, `userPath`): `number`

Get difficulty multiplier for off-path content.

#### Parameters

##### questPath

`TrainingPath` | `null`

##### userPath

`TrainingPath`

#### Returns

`number`

### getLayerBonuses()

> **getLayerBonuses**(`mobilityLevel`, `recoveryLevel`): `object`

Get combined layer bonuses for a user.

#### Parameters

##### mobilityLevel

`LayerLevel`

##### recoveryLevel

`LayerLevel`

#### Returns

`object`

##### injuryRisk

> **injuryRisk**: `number`

##### recoveryBoost

> **recoveryBoost**: `number`

##### romBonus

> **romBonus**: `number`

### getRewardMultiplier()

> **getRewardMultiplier**(`questPath`, `userPath`): `number`

Get reward multiplier for soft-lock system.
Quests matching user's path get bonus rewards.

#### Parameters

##### questPath

`TrainingPath` | `null`

##### userPath

`TrainingPath`

#### Returns

`number`

### getSystemLoad()

> **getSystemLoad**(`activities`, `activePath`): `number`

Calculate total system load from all active training activities.
Returns a percentage (0-100+) of total recovery capacity used.
Path-aware: Adjusts thresholds based on interference effects.

#### Parameters

##### activities

`TrainingActivity`[]

##### activePath

`TrainingPath` = `'HYBRID_WARDEN'`

#### Returns

`number`

### shouldEnterSurvivalMode()

> **shouldEnterSurvivalMode**(`metrics`, `path`): `boolean`

Determine if user should be in "Survival Mode" (minimum volume across all activities).
Triggered by critical recovery status.
Path-aware: Engine path allows deeper TSB floor.

#### Parameters

##### metrics

`SystemMetrics`

##### path

`TrainingPath` = `'HYBRID_WARDEN'`

#### Returns

`boolean`
