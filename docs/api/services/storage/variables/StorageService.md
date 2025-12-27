[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/storage](../README.md) / StorageService

# Variable: StorageService

> `const` **StorageService**: `object`

Defined in: [src/services/storage.ts:23](https://github.com/Techlemariam/IronForge/blob/main/src/services/storage.ts#L23)

## Type Declaration

### db

> **db**: `IDBDatabase` \| `null`

### clearActiveSession()

> **clearActiveSession**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### ensureInit()

> **ensureInit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### getActiveSession()

> **getActiveSession**(): `Promise`\<[`ActiveSessionState`](../interfaces/ActiveSessionState.md) \| `null`\>

#### Returns

`Promise`\<[`ActiveSessionState`](../interfaces/ActiveSessionState.md) \| `null`\>

### getGold()

> **getGold**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

### getGrimoireEntries()

> **getGrimoireEntries**(): `Promise`\<`GrimoireEntry`[]\>

#### Returns

`Promise`\<`GrimoireEntry`[]\>

### getHistory()

> **getHistory**(): `Promise`\<`ExerciseLog`[]\>

#### Returns

`Promise`\<`ExerciseLog`[]\>

### getHyperProPriority()

> **getHyperProPriority**(): `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

### getLatestAuditorReport()

> **getLatestAuditorReport**(): `Promise`\<`any`\>

#### Returns

`Promise`\<`any`\>

### getMeditationHistory()

> **getMeditationHistory**(): `Promise`\<`MeditationLog`[]\>

#### Returns

`Promise`\<`MeditationLog`[]\>

### getOwnedEquipment()

> **getOwnedEquipment**(): `Promise`\<`any`[] \| `null`\>

#### Returns

`Promise`\<`any`[] \| `null`\>

### getState()

> **getState**\<`T`\>(`key`): `Promise`\<`T` \| `null`\>

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`"gold"` | `"achievements"` | `"equipment"` | `"skills"` | `"skills_v2"` | `"settings"` | `"inventory"` | `"unlocked_monsters"`

#### Returns

`Promise`\<`T` \| `null`\>

### getUnlockedMonsters()

> **getUnlockedMonsters**(): `Promise`\<`string`[]\>

#### Returns

`Promise`\<`string`[]\>

### init()

> **init**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### migrateFromLocalStorage()

> **migrateFromLocalStorage**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### saveActiveSession()

> **saveActiveSession**(`state`): `Promise`\<`void`\>

#### Parameters

##### state

[`ActiveSessionState`](../interfaces/ActiveSessionState.md)

#### Returns

`Promise`\<`void`\>

### saveAuditorReport()

> **saveAuditorReport**(`report`): `Promise`\<`void`\>

#### Parameters

##### report

`any`

#### Returns

`Promise`\<`void`\>

### saveGold()

> **saveGold**(`amount`): `Promise`\<`void`\>

#### Parameters

##### amount

`number`

#### Returns

`Promise`\<`void`\>

### saveGrimoireEntry()

> **saveGrimoireEntry**(`entry`): `Promise`\<`void`\>

#### Parameters

##### entry

`GrimoireEntry`

#### Returns

`Promise`\<`void`\>

### saveHyperProPriority()

> **saveHyperProPriority**(`enabled`): `Promise`\<`void`\>

#### Parameters

##### enabled

`boolean`

#### Returns

`Promise`\<`void`\>

### saveLog()

> **saveLog**(`log`): `Promise`\<`void`\>

#### Parameters

##### log

`ExerciseLog`

#### Returns

`Promise`\<`void`\>

### saveMeditation()

> **saveMeditation**(`log`): `Promise`\<`void`\>

#### Parameters

##### log

`MeditationLog`

#### Returns

`Promise`\<`void`\>

### saveOwnedEquipment()

> **saveOwnedEquipment**(`equipment`): `Promise`\<`void`\>

#### Parameters

##### equipment

`any`[]

#### Returns

`Promise`\<`void`\>

### saveState()

> **saveState**(`key`, `data`): `Promise`\<`void`\>

#### Parameters

##### key

`"gold"` | `"achievements"` | `"equipment"` | `"skills"` | `"skills_v2"` | `"settings"` | `"inventory"` | `"unlocked_monsters"`

##### data

`any`

#### Returns

`Promise`\<`void`\>

### syncToServer()

> **syncToServer**(`endpoint`, `action`, `payload`): `Promise`\<`void`\>

#### Parameters

##### endpoint

`string`

##### action

`string`

##### payload

`any`

#### Returns

`Promise`\<`void`\>

### unlockMonster()

> **unlockMonster**(`monsterId`): `Promise`\<`void`\>

#### Parameters

##### monsterId

`string`

#### Returns

`Promise`\<`void`\>
