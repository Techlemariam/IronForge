[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/neuro](../README.md) / NeuroService

# Variable: NeuroService

> `const` **NeuroService**: `object`

Defined in: [src/services/neuro.ts:8](https://github.com/Techlemariam/IronForge/blob/main/src/services/neuro.ts#L8)

THE NEURO-LINK ENGINE
Generates Binaural Beats to entrain brainwave states.
Requires Headphones for full effect (Stereo Separation).

## Type Declaration

### ctx

> **ctx**: `AudioContext` \| `null`

### currentMode

> **currentMode**: `"ALPHA"` \| `"GAMMA"` \| `"OFF"` \| `"THETA"`

### gainNode

> **gainNode**: `GainNode` \| `null`

### isPlaying

> **isPlaying**: `boolean` = `false`

### oscLeft

> **oscLeft**: `OscillatorNode` \| `null`

### oscRight

> **oscRight**: `OscillatorNode` \| `null`

### engageDeepRest()

> **engageDeepRest**(): `void`

#### Returns

`void`

### engageFocus()

> **engageFocus**(): `void`

#### Returns

`void`

### engageRecovery()

> **engageRecovery**(): `void`

#### Returns

`void`

### init()

> **init**(): `void`

#### Returns

`void`

### start()

> **start**(`targetFreq`, `carrierFreq`): `void`

Entrains the brain to a specific frequency.

#### Parameters

##### targetFreq

`number`

The difference in Hz between ears (e.g., 40Hz for Gamma).

##### carrierFreq

`number` = `200`

The base tone (e.g., 200Hz). Lower is usually more grounding.

#### Returns

`void`

### stop()

> **stop**(): `void`

#### Returns

`void`
