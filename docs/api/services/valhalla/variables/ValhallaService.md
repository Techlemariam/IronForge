[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/valhalla](../README.md) / ValhallaService

# Variable: ValhallaService

> `const` **ValhallaService**: `object`

Defined in: [src/services/valhalla.ts:10](https://github.com/Techlemariam/IronForge/blob/main/src/services/valhalla.ts#L10)

VALHALLA SERVICE (PRODUCTION)
Interfaces with Supabase to provide true cloud persistence.

## Type Declaration

### bindSoul()

> **bindSoul**: (`heroName`) => `Promise`\<\{ `id`: `string`; `success`: `boolean`; \}\>

"Bind Soul" - Register/Login via Supabase Auth (Anonymous or Magic Link)
For MVP 10/10, we upsert into a 'profiles' table.

#### Parameters

##### heroName

`string`

#### Returns

`Promise`\<\{ `id`: `string`; `success`: `boolean`; \}\>

### consultStones()

> **consultStones**: (`heroName`) => `Promise`\<`ValhallaPayload` \| `null`\>

"Consult Stones" - Check if data exists in cloud

#### Parameters

##### heroName

`string`

#### Returns

`Promise`\<`ValhallaPayload` \| `null`\>

### engraveRecords()

> **engraveRecords**: (`payload`) => `Promise`\<`ValhallaSyncResult`\>

"Engrave Records" - Sync Data to Cloud

#### Parameters

##### payload

`ValhallaPayload`

#### Returns

`Promise`\<`ValhallaSyncResult`\>
