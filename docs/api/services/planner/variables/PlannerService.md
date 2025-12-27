[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/planner](../README.md) / PlannerService

# Variable: PlannerService

> `const` **PlannerService**: `object`

Defined in: [src/services/planner.ts:18](https://github.com/Techlemariam/IronForge/blob/main/src/services/planner.ts#L18)

Server-Side Planner Service
Orchestrates data from DB, Hevy, and Intervals to generate weekly plans.

## Type Declaration

### triggerWeeklyPlanGeneration()

> **triggerWeeklyPlanGeneration**: (`userId`) => `Promise`\<\{ `createdAt`: `string`; `days`: `object`[]; `id`: `string`; `weekStart`: `string`; \}\>

Triggers the generation of a weekly plan for a user.
Can be called from Server Actions or Cron Jobs.

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<\{ `createdAt`: `string`; `days`: `object`[]; `id`: `string`; `weekStart`: `string`; \}\>
