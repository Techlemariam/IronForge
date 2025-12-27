[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/bluetooth-ftms](../README.md) / FTMSService

# Variable: FTMSService

> `const` **FTMSService**: `object`

Defined in: [src/services/bluetooth-ftms.ts:11](https://github.com/Techlemariam/IronForge/blob/main/src/services/bluetooth-ftms.ts#L11)

## Type Declaration

### controlPoint

> **controlPoint**: `BluetoothRemoteGATTCharacteristic` \| `null`

### device

> **device**: `BluetoothDevice` \| `null`

### server

> **server**: `BluetoothRemoteGATTServer` \| `null`

### connect()

> **connect**(): `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

### resetControl()

> **resetControl**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### setSimGrade()

> **setSimGrade**(`grade`): `Promise`\<`void`\>

Sets Simulation Grade (Sim Mode)

#### Parameters

##### grade

`number`

Percentage slope (e.g. 5.5 for 5.5%)

#### Returns

`Promise`\<`void`\>

### setTargetPower()

> **setTargetPower**(`watts`): `Promise`\<`void`\>

Sets target watts (ERG Mode)

#### Parameters

##### watts

`number`

#### Returns

`Promise`\<`void`\>

### writeControlPoint()

> **writeControlPoint**(`bytes`): `Promise`\<`void`\>

#### Parameters

##### bytes

`number`[]

#### Returns

`Promise`\<`void`\>
