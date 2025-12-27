[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/raid](../README.md) / RaidService

# Variable: RaidService

> `const` **RaidService**: `object`

Defined in: [src/services/raid.ts:7](https://github.com/Techlemariam/IronForge/blob/main/src/services/raid.ts#L7)

Raid Service for Multiplayer Sync

## Type Declaration

### broadcastBuff()

> **broadcastBuff**(`heroName`, `buffName`): `Promise`\<`void`\>

Broadcasts a "Buff" event when a player hits a PR or activates a skill.

#### Parameters

##### heroName

`string`

##### buffName

`string`

#### Returns

`Promise`\<`void`\>

### broadcastDamage()

> **broadcastDamage**(`heroName`, `damage`, `exerciseName`): `Promise`\<`void`\>

Broadcasts damage dealt to the active Raid Boss.

#### Parameters

##### heroName

`string`

##### damage

`number`

##### exerciseName

`string`

#### Returns

`Promise`\<`void`\>

### broadcastPresence()

> **broadcastPresence**(`heroName`, `x`, `y`): `Promise`\<`void`\>

Broadcasts cursor/presence position for Live Party View

#### Parameters

##### heroName

`string`

##### x

`number`

##### y

`number`

#### Returns

`Promise`\<`void`\>
