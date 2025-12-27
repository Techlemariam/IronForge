[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [actions/combat](../README.md) / startBossFight

# Function: startBossFight()

> **startBossFight**(`bossId`, `tier`): `Promise`\<\{ `boss?`: `undefined`; `message`: `string`; `state?`: `undefined`; `success`: `boolean`; \} \| \{ `boss`: `PrismaMonster`; `message?`: `undefined`; `state`: `CombatState`; `success`: `boolean`; \}\>

Defined in: [src/actions/combat.ts:32](https://github.com/Techlemariam/IronForge/blob/main/src/actions/combat.ts#L32)

## Parameters

### bossId

`string`

### tier

`"STORY"` | `"HEROIC"` | `"TITAN_SLAYER"`

## Returns

`Promise`\<\{ `boss?`: `undefined`; `message`: `string`; `state?`: `undefined`; `success`: `boolean`; \} \| \{ `boss`: `PrismaMonster`; `message?`: `undefined`; `state`: `CombatState`; `success`: `boolean`; \}\>
