[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/vision](../README.md) / VisionService

# Class: VisionService

Defined in: [src/services/vision.ts:9](https://github.com/Techlemariam/IronForge/blob/main/src/services/vision.ts#L9)

TITAN VISION ENGINE 2.0 (GHOST SPOTTER)
Uses MediaPipe Pose to track skeletal mechanics in real-time.

## Methods

### detect()

> **detect**(`video`, `timestamp`): \{ `landmarks`: `NormalizedLandmark`[]; `metrics`: \{ `isBelowParallel`: `boolean`; `repDetected`: `boolean`; `state`: `"ECCENTRIC"` \| `"CONCENTRIC"` \| `"TOP"` \| `"BOTTOM"`; `velocity`: `string`; \}; \} \| `null`

Defined in: [src/services/vision.ts:54](https://github.com/Techlemariam/IronForge/blob/main/src/services/vision.ts#L54)

Analyzes a video frame for skeletal data.
Calculates velocity and checks squat depth (Hip < Knee).

#### Parameters

##### video

`HTMLVideoElement`

##### timestamp

`number`

#### Returns

\{ `landmarks`: `NormalizedLandmark`[]; `metrics`: \{ `isBelowParallel`: `boolean`; `repDetected`: `boolean`; `state`: `"ECCENTRIC"` \| `"CONCENTRIC"` \| `"TOP"` \| `"BOTTOM"`; `velocity`: `string`; \}; \} \| `null`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/services/vision.ts:32](https://github.com/Techlemariam/IronForge/blob/main/src/services/vision.ts#L32)

#### Returns

`Promise`\<`void`\>

***

### getInstance()

> `static` **getInstance**(): `VisionService`

Defined in: [src/services/vision.ts:25](https://github.com/Techlemariam/IronForge/blob/main/src/services/vision.ts#L25)

#### Returns

`VisionService`
