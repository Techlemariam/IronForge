[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [lib/hevy](../README.md) / getHevyWorkouts

# Function: getHevyWorkouts()

> **getHevyWorkouts**(`apiKey`, `page`, `pageSize`): `Promise`\<\{ `page_count`: `number`; `workouts`: `HevyWorkout`[]; \}\>

Defined in: [src/lib/hevy.ts:9](https://github.com/Techlemariam/IronForge/blob/main/src/lib/hevy.ts#L9)

Fetches the user's workout history from the external Hevy API.
This is safe to call from both server components and API routes.

## Parameters

### apiKey

`string`

### page

`number` = `1`

### pageSize

`number` = `10`

## Returns

`Promise`\<\{ `page_count`: `number`; `workouts`: `HevyWorkout`[]; \}\>
