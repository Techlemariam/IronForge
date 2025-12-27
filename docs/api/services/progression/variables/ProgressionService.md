[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [services/progression](../README.md) / ProgressionService

# Variable: ProgressionService

> `const` **ProgressionService**: `object`

Defined in: [src/services/progression.ts:14](https://github.com/Techlemariam/IronForge/blob/main/src/services/progression.ts#L14)

## Type Declaration

### addExperience()

> **addExperience**(`userId`, `amount`): `Promise`\<\{ `activePath`: `string` \| `null`; `activeTitleId`: `string` \| `null`; `bodyWeight`: `number`; `city`: `string` \| `null`; `country`: `string` \| `null`; `createdAt`: `Date`; `currentMacroCycle`: `string` \| `null`; `email`: `string` \| `null`; `faction`: `Faction`; `ftpCycle`: `number` \| `null`; `ftpRun`: `number` \| `null`; `gold`: `number`; `heroName`: `string` \| `null`; `hevyApiKey`: `string` \| `null`; `hrv`: `number` \| `null`; `hrZones`: `JsonValue`; `id`: `string`; `intervalsApiKey`: `string` \| `null`; `intervalsAthleteId`: `string` \| `null`; `kineticEnergy`: `number`; `level`: `number`; `lthr`: `number` \| `null`; `maxHr`: `number` \| `null`; `mobilityLevel`: `string` \| `null`; `powerZonesCycle`: `JsonValue`; `powerZonesRun`: `JsonValue`; `prioritizeHyperPro`: `boolean`; `recoveryLevel`: `string` \| `null`; `restingHr`: `number` \| `null`; `stravaAccessToken`: `string` \| `null`; `stravaAthleteId`: `string` \| `null`; `stravaExpiresAt`: `number` \| `null`; `stravaRefreshToken`: `string` \| `null`; `subscriptionExpiry`: `Date` \| `null`; `subscriptionStatus`: `string` \| `null`; `subscriptionTier`: `SubscriptionTier`; `totalExperience`: `number`; `updatedAt`: `Date`; \}\>

Awards Experience to a user and handles leveling.

#### Parameters

##### userId

`string`

##### amount

`number`

#### Returns

`Promise`\<\{ `activePath`: `string` \| `null`; `activeTitleId`: `string` \| `null`; `bodyWeight`: `number`; `city`: `string` \| `null`; `country`: `string` \| `null`; `createdAt`: `Date`; `currentMacroCycle`: `string` \| `null`; `email`: `string` \| `null`; `faction`: `Faction`; `ftpCycle`: `number` \| `null`; `ftpRun`: `number` \| `null`; `gold`: `number`; `heroName`: `string` \| `null`; `hevyApiKey`: `string` \| `null`; `hrv`: `number` \| `null`; `hrZones`: `JsonValue`; `id`: `string`; `intervalsApiKey`: `string` \| `null`; `intervalsAthleteId`: `string` \| `null`; `kineticEnergy`: `number`; `level`: `number`; `lthr`: `number` \| `null`; `maxHr`: `number` \| `null`; `mobilityLevel`: `string` \| `null`; `powerZonesCycle`: `JsonValue`; `powerZonesRun`: `JsonValue`; `prioritizeHyperPro`: `boolean`; `recoveryLevel`: `string` \| `null`; `restingHr`: `number` \| `null`; `stravaAccessToken`: `string` \| `null`; `stravaAthleteId`: `string` \| `null`; `stravaExpiresAt`: `number` \| `null`; `stravaRefreshToken`: `string` \| `null`; `subscriptionExpiry`: `Date` \| `null`; `subscriptionStatus`: `string` \| `null`; `subscriptionTier`: `SubscriptionTier`; `totalExperience`: `number`; `updatedAt`: `Date`; \}\>

### awardAchievement()

> **awardAchievement**(`userId`, `achievementId`): `Promise`\<`void`\>

Awards an achievement and its associated rewards.

#### Parameters

##### userId

`string`

##### achievementId

`string`

#### Returns

`Promise`\<`void`\>

### awardGold()

> **awardGold**(`userId`, `amount`): `Promise`\<\{ `activePath`: `string` \| `null`; `activeTitleId`: `string` \| `null`; `bodyWeight`: `number`; `city`: `string` \| `null`; `country`: `string` \| `null`; `createdAt`: `Date`; `currentMacroCycle`: `string` \| `null`; `email`: `string` \| `null`; `faction`: `Faction`; `ftpCycle`: `number` \| `null`; `ftpRun`: `number` \| `null`; `gold`: `number`; `heroName`: `string` \| `null`; `hevyApiKey`: `string` \| `null`; `hrv`: `number` \| `null`; `hrZones`: `JsonValue`; `id`: `string`; `intervalsApiKey`: `string` \| `null`; `intervalsAthleteId`: `string` \| `null`; `kineticEnergy`: `number`; `level`: `number`; `lthr`: `number` \| `null`; `maxHr`: `number` \| `null`; `mobilityLevel`: `string` \| `null`; `powerZonesCycle`: `JsonValue`; `powerZonesRun`: `JsonValue`; `prioritizeHyperPro`: `boolean`; `recoveryLevel`: `string` \| `null`; `restingHr`: `number` \| `null`; `stravaAccessToken`: `string` \| `null`; `stravaAthleteId`: `string` \| `null`; `stravaExpiresAt`: `number` \| `null`; `stravaRefreshToken`: `string` \| `null`; `subscriptionExpiry`: `Date` \| `null`; `subscriptionStatus`: `string` \| `null`; `subscriptionTier`: `SubscriptionTier`; `totalExperience`: `number`; `updatedAt`: `Date`; \}\>

Awards Gold to a user.

#### Parameters

##### userId

`string`

##### amount

`number`

#### Returns

`Promise`\<\{ `activePath`: `string` \| `null`; `activeTitleId`: `string` \| `null`; `bodyWeight`: `number`; `city`: `string` \| `null`; `country`: `string` \| `null`; `createdAt`: `Date`; `currentMacroCycle`: `string` \| `null`; `email`: `string` \| `null`; `faction`: `Faction`; `ftpCycle`: `number` \| `null`; `ftpRun`: `number` \| `null`; `gold`: `number`; `heroName`: `string` \| `null`; `hevyApiKey`: `string` \| `null`; `hrv`: `number` \| `null`; `hrZones`: `JsonValue`; `id`: `string`; `intervalsApiKey`: `string` \| `null`; `intervalsAthleteId`: `string` \| `null`; `kineticEnergy`: `number`; `level`: `number`; `lthr`: `number` \| `null`; `maxHr`: `number` \| `null`; `mobilityLevel`: `string` \| `null`; `powerZonesCycle`: `JsonValue`; `powerZonesRun`: `JsonValue`; `prioritizeHyperPro`: `boolean`; `recoveryLevel`: `string` \| `null`; `restingHr`: `number` \| `null`; `stravaAccessToken`: `string` \| `null`; `stravaAthleteId`: `string` \| `null`; `stravaExpiresAt`: `number` \| `null`; `stravaRefreshToken`: `string` \| `null`; `subscriptionExpiry`: `Date` \| `null`; `subscriptionStatus`: `string` \| `null`; `subscriptionTier`: `SubscriptionTier`; `totalExperience`: `number`; `updatedAt`: `Date`; \}\>

### findBestLift()

> **findBestLift**(`userId`, `exerciseNames`): `Promise`\<`number`\>

Helper to find max e1rm for a set of exercise names.

#### Parameters

##### userId

`string`

##### exerciseNames

`string`[]

#### Returns

`Promise`\<`number`\>

### getProgressionState()

> **getProgressionState**(`userId`): `Promise`\<\{ `gold`: `number`; `kineticEnergy`: `number`; `level`: `number`; `progressPct`: `number`; `totalXp`: `number`; `xpToNextLevel`: `number`; \} \| `null`\>

Gets the full progression state for a user.

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<\{ `gold`: `number`; `kineticEnergy`: `number`; `level`: `number`; `progressPct`: `number`; `totalXp`: `number`; `xpToNextLevel`: `number`; \} \| `null`\>

### updateWilksScore()

> **updateWilksScore**(`userId`): `Promise`\<`number`\>

Calculates and updates the user's Wilks Score based on best lifts.

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`number`\>
