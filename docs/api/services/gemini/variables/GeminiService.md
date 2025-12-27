[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/gemini](../README.md) / GeminiService

# Variable: GeminiService

> `const` **GeminiService**: `object`

Defined in: [src/services/gemini.ts:8](https://github.com/Techlemariam/IronForge/blob/main/src/services/gemini.ts#L8)

## Type Declaration

### consultSpiritGuide()

> **consultSpiritGuide**(`wellness`, `ttb`, `recentPrs`): `Promise`\<`Session` \| `null`\>

#### Parameters

##### wellness

`IntervalsWellness`

##### ttb

`TTBIndices`

##### recentPrs

`string`[]

#### Returns

`Promise`\<`Session` \| `null`\>

### generateOracleAdvice()

> **generateOracleAdvice**(`context`): `Promise`\<`string`\>

#### Parameters

##### context

###### data?

`any`

###### priority

`string`

###### trigger

`string`

###### wellness

`IntervalsWellness`

#### Returns

`Promise`\<`string`\>

### generateWeeklyPlanAI()

> **generateWeeklyPlanAI**(`userProfile`, `context`): `Promise`\<`any`\>

Generates a full 7-day training plan based on user constraints and physiology.

#### Parameters

##### userProfile

###### equipment

`string`[]

###### heroName

`string`

###### injuries

`string`[]

###### level

`number`

###### trainingPath

`string`

##### context

###### daysPerWeek

`number`

###### intent

`string`

###### ttb

`TTBIndices`

###### wellness

`IntervalsWellness`

#### Returns

`Promise`\<`any`\>
