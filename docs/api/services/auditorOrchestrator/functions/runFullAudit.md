[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/auditorOrchestrator](../README.md) / runFullAudit

# Function: runFullAudit()

> **runFullAudit**(`forceRefresh`, `apiKey?`, `baseUrl?`, `prefetchedHistory?`): `Promise`\<`AuditReport`\>

Defined in: [src/services/auditorOrchestrator.ts:24](https://github.com/Techlemariam/IronForge/blob/main/src/services/auditorOrchestrator.ts#L24)

Runs a full audit cycle:
1. Fetches recent workout history from Hevy
2. Calculates weekly volume per muscle group
3. Analyzes weaknesses and imbalances
4. Caches the report locally

## Parameters

### forceRefresh

`boolean` = `false`

If true, ignores cache and forces a new API call (logic handled by caller or here)

### apiKey?

`string` | `null`

### baseUrl?

`string`

### prefetchedHistory?

`any`[]

## Returns

`Promise`\<`AuditReport`\>

The generated AuditReport
