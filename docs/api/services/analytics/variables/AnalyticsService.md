[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/analytics](../README.md) / AnalyticsService

# Variable: AnalyticsService

> `const` **AnalyticsService**: `object`

Defined in: [src/services/analytics.ts:8](https://github.com/Techlemariam/IronForge/blob/main/src/services/analytics.ts#L8)

The Ultrathink Analytics Engine
Processes biometrics and log data to generate predictive insights.

## Type Declaration

### auditWeakness()

> **auditWeakness**: (`strengthLogs`, `currentWellness`) => `WeaknessAudit`

Analyzes recent strength logs against cardio trends to find bottlenecks.
Returns a "Weakness Audit".

#### Parameters

##### strengthLogs

`ExerciseLog`[]

##### currentWellness

`IntervalsWellness`

#### Returns

`WeaknessAudit`

### calculateTitanLoad()

> **calculateTitanLoad**: (`volumeLoad`, `avgIntensityPct`, `durationMinutes`) => `TitanLoadCalculation`

Calculates "Titan Load" (Strength-based TSS) and contrasts it with HR-based TSS.
Standard HR TSS often underestimates heavy lifting (low HR, high CNS load).

#### Parameters

##### volumeLoad

`number`

##### avgIntensityPct

`number`

##### durationMinutes

`number`

#### Returns

`TitanLoadCalculation`

### calculateTSBForecast()

> **calculateTSBForecast**: (`startWellness`, `plannedDailyLoad`) => `TSBForecast`[]

Generates a 7-day TSB (Form) forecast based on current state and planned future loads.
Uses a Banister Impulse Response model.

#### Parameters

##### startWellness

`IntervalsWellness`

Current wellness snapshot (CTL/ATL start point)

##### plannedDailyLoad

`number`[] = `[]`

Array of predicted TSS for the next 7 days (index 0 = today)

#### Returns

`TSBForecast`[]

### calculateTTB()

> **calculateTTB**: (`history`, `activities`, `wellness`) => `TTBIndices`

Calculates Total Training Balance (TTB) Indices.
This drives The Oracle 2.0 Logic.

#### Parameters

##### history

`ExerciseLog`[]

##### activities

`IntervalsActivity`[]

##### wellness

`IntervalsWellness`

#### Returns

`TTBIndices`

### getMockHistory()

> **getMockHistory**: () => `ExerciseLog`[]

Generates mock history data for the demo since we don't have a real DB.

#### Returns

`ExerciseLog`[]
