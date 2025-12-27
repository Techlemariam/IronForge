[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/integration](../README.md) / IntegrationService

# Variable: IntegrationService

> `const` **IntegrationService**: `object`

Defined in: [src/services/integration.ts:5](https://github.com/Techlemariam/IronForge/blob/main/src/services/integration.ts#L5)

## Type Declaration

### detectSessionType()

> **detectSessionType**: (`session`) => `"STRENGTH"` \| `"CARDIO"`

Determines if a session is primarily Cardio (Intervals) or Strength (Hevy)

#### Parameters

##### session

`Session`

#### Returns

`"STRENGTH"` \| `"CARDIO"`

### uploadToHevy()

> **uploadToHevy**(`session`, `settings`): `Promise`\<`boolean`\>

Uploads the completed session to Hevy (Simulated / API Structure).

#### Parameters

##### session

`Session`

##### settings

`AppSettings`

#### Returns

`Promise`\<`boolean`\>

### uploadToIntervals()

> **uploadToIntervals**(`session`, `settings`): `Promise`\<`boolean`\>

Uploads the completed session to Intervals.icu as a structured workout.

#### Parameters

##### session

`Session`

##### settings

`AppSettings`

#### Returns

`Promise`\<`boolean`\>
