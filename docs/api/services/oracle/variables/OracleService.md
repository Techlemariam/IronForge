[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/oracle](../README.md) / OracleService

# Variable: OracleService

> `const` **OracleService**: `object`

Defined in: [src/services/oracle.ts:19](https://github.com/Techlemariam/IronForge/blob/main/src/services/oracle.ts#L19)

The Oracle
An adaptive coaching engine that prescribes the next action based on physiological state and progression goals.
Now Path-aware: recommendations are filtered/prioritized based on user's active training path.

## Type Declaration

### consult()

> **consult**: (`wellness`, `ttb`, `events`, `auditReport?`, `titanAnalysis?`, `recoveryAnalysis?`, `activePath`, `weeklyMastery?`) => `Promise`\<`OracleRecommendation`\>

#### Parameters

##### wellness

`IntervalsWellness`

##### ttb

`TTBIndices`

##### events

`IntervalsEvent`[] = `[]`

##### auditReport?

`AuditReport` | `null`

##### titanAnalysis?

`TitanLoadCalculation` | `null`

##### recoveryAnalysis?

\{ `reason`: `string`; `state`: `string`; \} | `null`

##### activePath?

`TrainingPath` = `'HYBRID_WARDEN'`

##### weeklyMastery?

`WeeklyMastery`

#### Returns

`Promise`\<`OracleRecommendation`\>

### generateWeekPlan()

> **generateWeekPlan**: (`context`) => `Promise`\<\{ `createdAt`: `string`; `days`: `object`[]; `id`: `string`; `weekStart`: `string`; \}\>

Generates a full 7-day training plan based on current context.
Uses consult() iteratively with day-specific adjustments.

#### Parameters

##### context

###### activePath

`TrainingPath`

###### auditReport?

`AuditReport` \| `null`

###### inAppLogs?

`InAppWorkoutLog`[]

###### ttb

`TTBIndices`

###### weeklyMastery?

`WeeklyMastery`

###### wellness

`IntervalsWellness`

#### Returns

`Promise`\<\{ `createdAt`: `string`; `days`: `object`[]; `id`: `string`; `weekStart`: `string`; \}\>

### getExercisesForMuscle()

> **getExercisesForMuscle**: (`muscleGroup`) => `Promise`\<`string`[]\>

#### Parameters

##### muscleGroup

`string`

#### Returns

`Promise`\<`string`[]\>
