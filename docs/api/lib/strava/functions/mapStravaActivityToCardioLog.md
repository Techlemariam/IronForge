[**ironforge-rpg**](../../../README.md)

***

[ironforge-rpg](../../../README.md) / [lib/strava](../README.md) / mapStravaActivityToCardioLog

# Function: mapStravaActivityToCardioLog()

> **mapStravaActivityToCardioLog**(`activity`, `userId`): `Omit`\<`CardioLog`, `"id"`\>

Defined in: [src/lib/strava.ts:37](https://github.com/Techlemariam/IronForge/blob/main/src/lib/strava.ts#L37)

Maps a Strava activity to the IronForge CardioLog format.
Note: Does not create the record, just maps the data.

## Parameters

### activity

[`StravaActivity`](../interfaces/StravaActivity.md)

### userId

`string`

## Returns

`Omit`\<`CardioLog`, `"id"`\>
