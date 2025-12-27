[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [actions/generatePlanAction](../README.md) / generateWeeklyPlanAction

# Function: generateWeeklyPlanAction()

> **generateWeeklyPlanAction**(): `Promise`\<\{ `error?`: `undefined`; `plan`: \{ `createdAt`: `string`; `days`: `object`[]; `id`: `string`; `weekStart`: `string`; \}; `success`: `boolean`; \} \| \{ `error`: `any`; `plan?`: `undefined`; `success`: `boolean`; \}\>

Defined in: [src/actions/generatePlanAction.ts:10](https://github.com/Techlemariam/IronForge/blob/main/src/actions/generatePlanAction.ts#L10)

Server Action to manually trigger weekly plan generation for the current user.

## Returns

`Promise`\<\{ `error?`: `undefined`; `plan`: \{ `createdAt`: `string`; `days`: `object`[]; `id`: `string`; `weekStart`: `string`; \}; `success`: `boolean`; \} \| \{ `error`: `any`; `plan?`: `undefined`; `success`: `boolean`; \}\>
