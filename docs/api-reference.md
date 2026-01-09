# IronForge API Reference

## Overview

IronForge uses a hybrid architecture with **Next.js Server Actions** for client-server communication and standard **API Routes** for external webhooks and integrations.

---

## 🔌 API Routes (`src/app/api/`)

### Webhooks

**Path**: `/api/webhooks/hevy`

- **Method**: `POST`
- **Description**: Receives workout completion events from Hevy. Triggers XP/Gold awards and Oracle commentary.
- **Security**: Verifies `Hevy-Webhook-Secret`.

**Path**: `/api/webhooks/intervals`

- **Method**: `POST`
- **Description**: Receives activity data from Intervals.icu (Strava sync).
- **payload**: JSON body with activity details.

### System

**Path**: `/api/cron/daily-reset`

- **Method**: `GET`
- **Description**: Resets daily quests and energy caps. Protected by Vercel Cron secret.

**Path**: `/api/chat`

- **Method**: `POST`
- **Description**: Vercel AI SDK endpoint for The Oracle (LLM).

---

## ⚡ Server Actions (`src/actions/`)

### 👤 User & Account (`actions/user/`)

| Function | Description | Access |
| ---------- | ------------- | -------- |
| `ensureUserAction(id, email)` | Creates/Ensures user exists in DB on login. | Public/Auth |
| `updateFactionAction(faction)` | Updates the user's chosen faction. | Auth User |
| `updateArchetypeAction(archetype)` | Updates the user's chosen class archetype. | Auth User |
| `deleteAccountAction()` | Permanently deletes user account and data. | Auth User |
| `signOutAction()` | Signs out the current user. | Auth User |
| `getAnalyticsDashboardAction()` | Fetches combined health/game stats for dashboard. | Auth User |
| `createBackupAction()` | Generates a specific backup of user data. | Auth User |
| `restoreBackupAction(json)` | Restores user data from backup JSON. | Auth User |
| `toggleDemoModeAction(enabled)` | Enables/Disables demo mode. | Public |
| `getLoginRewardStatusAction()` | Checks daily login reward availability. | Auth User |
| `claimLoginRewardAction()` | Claims the daily login reward. | Auth User |
| `updateUserPreferencesAction(prefs)` | Updates settings (theme, units, etc). | Auth User |
| `getComprehensiveStatsAction()` | Returns detailed user statistics. | Auth User |
| `getStreakStatusAction()` | Detailed streak info and freeze status. | Auth User |
| `getSubscriptionAction()` | Returns Coach subscription status. | Auth User |
| `upgradeSubscriptionAction(tier)` | Upgrades subscription tier. | Auth User |
| `generateReferralCodeAction()` | Creates a unique referral code. | Auth User |

### 🏋️ Training & Progression (`actions/training/`)

| Function | Description | Access |
| ---------- | ------------- | -------- |
| `logTitanSet(exId, reps, wt)` | Logs a set, check quests, awards XP. | Auth User |
| `updateActivePathAction(path)` | Sets current training path (e.g., WARDEN). | Auth User |
| `getWorkoutCalendarAction()` | Fetches monthly workout history. | Auth User |
| `extractTrainingDnaAction()` | Analyzes user history for DNA profile. | Auth User |
| `checkDungeonUnlockAction()` | Checks if Zone 2 dungeons are unlocked. | Auth User |
| `startDungeonRunAction(dungeonId)` | Begins a dungeon run session. | Auth User |
| `clearFloorAction(runId)` | Progresses dungeon run, awards loot. | Auth User |
| `exportWorkoutHistoryAction()` | Exports CSV/JSON of workout logs. | Auth User |
| `logGauntletRunAction(result)` | Logs a Gauntlet run result. | Auth User |
| `addWorkoutNoteAction(logId, note)` | Adds annotation to a workout. | Auth User |
| `checkRecoveryLockAction()` | Checks if user is locked from training. | Auth User |
| `overrideRecoveryLockAction(reason)` | Bypasses recovery lock. | Auth User |
| `generateProgramAction(prefs)` | Generates AI training program. | Auth User |
| `saveProgramAction(plan)` | Saves generated program. | Auth User |
| `createWorkoutTemplateAction(data)` | Saves a workout as a template. | Auth User |
| `startWorkoutFromTemplateAction(id)` | Starts session from template. | Auth User |
| `logSetAction(exId, set)` | Low-level set logging. | Auth User |
| `finishWorkoutAction(logIds)` | Finalizes a workout session. | Auth User |
| `createExerciseAction(data)` | Creates custom exercise. | Auth User |
| `calculateVolumeL4Action()` | Calculates advanced volume metrics. | Auth User |

### 🌍 Game Systems (`actions/systems/`)

| Function | Description | Access |
| ---------- | ------------- | -------- |
| `getActiveSeasonAction()` | Fetches current Battle Pass season. | Public |
| `claimBattlePassRewardAction(tier)` | Claims BP rewards. | Auth User |
| `getActiveChallengesAction()` | Fetches active weekly challenges. | Auth User |
| `claimChallengeAction(id)` | Claims challenge reward. | Auth User |
| `getActiveCompanionAction()` | Returns active companion. | Auth User |
| `feedCompanionAction(foodId)` | Feeds companion for XP/Bond. | Auth User |
| `generateDailyQuestsAction()` | Generates daily quests if missing. | System/Auth |
| `claimQuestRewardAction(questId)` | Claims daily quest reward. | Auth User |
| `simulateLootDrop()` | Generates random loot based on context. | Auth User |
| `getLoreCollectionAction()` | Returns discovered lore entries. | Auth User |
| `getActiveEventsAction()` | Returns active seasonal events. | Public |
| `getWorldMapAction()` | Returns territory control map. | Auth User |
| `recordTerritoryActivityAction(data)` | Logs contribution to territory. | System |
| `getWeeklyChallengesAction()` | Fetches weekly challenges. | Auth User |
| `getWorldStateAction()` | Returns global world state variables. | Auth User |
| `getBestiaryAction()` | Returns monster catalog. | Auth User |

### 💰 Economy (`actions/economy/`)

| Function | Description | Access |
| ---------- | ------------- | -------- |
| `getShopInventoryAction()` | Returns items for sale. | Auth User |
| `buyItemAction(itemId)` | Purchases item from shop. | Auth User |
| `sellItemAction(itemId)` | Sells item for Gold. | Auth User |
| `getInventoryAction()` | Returns user inventory. | Auth User |
| `toggleEquipAction(itemId, slot)` | Equips/Unequips item. | Auth User |
| `craftItemAction(recipeId)` | Crafts item from materials. | Auth User |
| `enchantItemAction(itemId, effect)` | Applies enchantment. | Auth User |
| `getUserCratesAction()` | Returns unopened Loot Crates. | Auth User |
| `openCrateAction(crateId)` | Opens crate, awards contents. | Auth User |
| `collectResourcesAction()` | Collects passive resource generation. | Auth User |
| `upgradeGeneratorAction(type)` | Upgrades resource generator level. | Auth User |
| `getGoldMultiplierStatusAction()` | Returns active gold multipliers. | Auth User |
| `upgradeEquipmentAction(itemId)` | Upgrades item tier/stats. | Auth User |

### ⚔️ Combat & PvP (`actions/combat/`, `actions/pvp/`)

| Function | Description | Access |
| ---------- | ------------- | -------- |
| `startBossFight(bossId)` | Initiates boss encounter. | Auth User |
| `performCombatAction(action)` | Executes combat turn. | Auth User |
| `findRankedOpponentAction()` | Finds PvP opponent. | Auth User |
| `createDuelChallengeAction(target)` | Challenges specific user. | Auth User |

### 🤝 Social & Guilds (`actions/social/`, `actions/guild/`)

| Function | Description | Access |
| ---------- | ------------- | -------- |
| `followUser(id)` | Follows a user. | Auth User |
| `getLeaderboard(type)` | Returns leaderboard data. | Auth User |
| `getSocialFeed()` | Returns friend activity. | Auth User |
| `createGuildAction(data)` | Creates a new guild. | Auth User |
| `joinGuildAction(code)` | Joins a guild. | Auth User |
| `startRaidAction(boss)` | Starts guild raid. | Guild Admin |

### 🔗 Integrations (`actions/integrations/`)

| Function | Description | Access |
| ---------- | ------------- | -------- |
| `connectHevy(key)` | Connects Hevy account. | Auth User |
| `connectIntervals(key, id)` | Connects Intervals.icu. | Auth User |
| `getWellnessAction(date)` | Fetches wellness data. | Auth User |

---

## 🛡️ Authentication

All Server Actions and sensitive API routes require:

1. Valid Supabase Session (Cookie-based).
2. Rate-limiting (applied middleware).

## 🧩 Types

API Types are defined in `src/types/schemas.ts` and validated using **Zod** at runtime.
