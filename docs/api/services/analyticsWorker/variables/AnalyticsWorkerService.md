[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/analyticsWorker](../README.md) / AnalyticsWorkerService

# Variable: AnalyticsWorkerService

> `const` **AnalyticsWorkerService**: `object`

Defined in: [src/services/analyticsWorker.ts:77](https://github.com/Techlemariam/IronForge/blob/main/src/services/analyticsWorker.ts#L77)

## Type Declaration

### worker

> **worker**: `Worker` \| `null`

### computeAdvancedStats()

> **computeAdvancedStats**(`history`, `wellness`): `Promise`\<`any`\>

#### Parameters

##### history

`ExerciseLog`[]

##### wellness

`IntervalsWellness`

#### Returns

`Promise`\<`any`\>

### init()

> **init**(): `void`

#### Returns

`void`

### terminate()

> **terminate**(): `void`

#### Returns

`void`
