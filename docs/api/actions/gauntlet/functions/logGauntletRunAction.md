[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [actions/gauntlet](../README.md) / logGauntletRunAction

# Function: logGauntletRunAction()

> **logGauntletRunAction**(`result`): `Promise`\<\{ `rewards`: \{ `gold`: `number`; `kinetic`: `number`; `xp`: `number`; \}; `runId`: `string`; `success`: `boolean`; \}\>

Defined in: src/actions/gauntlet.ts:19

Logs a completed Gauntlet run, awards XP/Gold/Kinetic Energy based on performance.

## Parameters

### result

[`GauntletResult`](../interfaces/GauntletResult.md)

## Returns

`Promise`\<\{ `rewards`: \{ `gold`: `number`; `kinetic`: `number`; `xp`: `number`; \}; `runId`: `string`; `success`: `boolean`; \}\>
