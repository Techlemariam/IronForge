[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [actions/combat](../README.md) / performCombatAction

# Function: performCombatAction()

> **performCombatAction**(`action`, `clientState?`): `Promise`\<\{ `loot?`: `undefined`; `message`: `string`; `newState?`: `undefined`; `reward?`: `undefined`; `success`: `boolean`; `turnResult?`: `undefined`; \} \| \{ `loot`: `any`; `message?`: `undefined`; `newState`: `CombatState`; `reward`: \{ `gold`: `number`; `xp`: `number`; \} \| `null`; `success`: `boolean`; `turnResult`: `TurnResult`; \}\>

Defined in: [src/actions/combat.ts:105](https://github.com/Techlemariam/IronForge/blob/main/src/actions/combat.ts#L105)

## Parameters

### action

`CombatAction`

### clientState?

`CombatState`

## Returns

`Promise`\<\{ `loot?`: `undefined`; `message`: `string`; `newState?`: `undefined`; `reward?`: `undefined`; `success`: `boolean`; `turnResult?`: `undefined`; \} \| \{ `loot`: `any`; `message?`: `undefined`; `newState`: `CombatState`; `reward`: \{ `gold`: `number`; `xp`: `number`; \} \| `null`; `success`: `boolean`; `turnResult`: `TurnResult`; \}\>
