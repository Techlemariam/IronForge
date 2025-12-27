[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/iot](../README.md) / IoTService

# Variable: IoTService

> `const` **IoTService**: `object`

Defined in: [src/services/iot.ts:8](https://github.com/Techlemariam/IronForge/blob/main/src/services/iot.ts#L8)

IoT Service for "The Smart Gym" (Philips Hue & Atmosphere)

## Type Declaration

### bridgeIp

> **bridgeIp**: `string` \| `null`

### lastZone

> **lastZone**: `"REST"` \| `"WORK"` \| `"LIMIT"`

### username

> **username**: `string` \| `null`

### init()

> **init**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### setGroupState()

> **setGroupState**(`groupId`, `state`): `Promise`\<`void`\>

#### Parameters

##### groupId

`number`

##### state

`any`

#### Returns

`Promise`\<`void`\>

### syncAtmosphere()

> **syncAtmosphere**(`bpm`): `void`

"The Atmosphere" - Biometric Sync
Adjusts room environment based on Heart Rate.

#### Parameters

##### bpm

`number`

#### Returns

`void`

### triggerFocus()

> **triggerFocus**(): `void`

#### Returns

`void`

### triggerRecovery()

> **triggerRecovery**(): `void`

#### Returns

`void`

### triggerRedAlert()

> **triggerRedAlert**(): `void`

#### Returns

`void`

### triggerVictory()

> **triggerVictory**(): `void`

#### Returns

`void`
