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

### Account Management (`actions/account.ts`, `actions/user.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `deleteAccountAction()` | Permanently deletes user account and data. | Auth User |
| `signOutAction()` | Signs out the current user. | Auth User |
| `updateFactionAction(faction)` | Updates the user's chosen faction. | Auth User |

### Integrations (`actions/integrations.ts`, `actions/hevy.ts`, `actions/intervals.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `connectHevy(apiKey)` | Connects user to Hevy account. | Auth User |
| `disconnectHevy()` | Removes Hevy connection. | Auth User |
| `validateHevyApiKey(key)` | Validates Hevy API Key format/validity. | Auth User |
| `getHevyRoutinesAction()` | Fetches user's routines from Hevy. | Auth User |
| `getHevyWorkoutHistoryAction()` | Fetches recent workout history. | Auth User |
| `saveWorkoutAction(payload)` | Logs a workout back to Hevy. | Auth User |
| `connectIntervals(key, id)` | Connects to Intervals.icu. | Auth User |
| `importHevyHistoryAction(workouts)` | Bulk imports Hevy workout history. | Auth User |
| `disconnectIntervals()` | Removes Intervals.icu connection. | Auth User |
| `getWellnessAction(date)` | Fetches wellness data for specific date. | Auth User |
| `getActivitiesAction(start, end)` | Fetches activities in date range. | Auth User |
| `getEventsAction(start, end)` | Fetches calendar events. | Auth User |

### Training & Progression (`actions/training.ts`, `actions/progression.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `logTitanSet(exId, reps, wt, rpe)` | Logs a set, calculates XP/Energy rewards. | Auth User |
| `updateActivePathAction(path)` | Updates the user's current training path. | Auth User |
| `getProgressionAction()` | Returns current Level, XP, Gold. | Auth User |
| `awardGoldAction(amount)` | Admin/System action to grant gold. | Auth User |

### Combat & Gameplay (`actions/combat.ts`, `actions/gameplay.ts`, `actions/world.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `startBossFight(bossId)` | Initiates a PvE boss battle. | Auth User |
| `performCombatAction(action)` | Executes turn (Attack/Defend). | Auth User inside Combat |
| `simulateLootDrop()` | Simulates loot generation. | Auth User |
| `getWorldStateAction()` | Returns global world state. | Auth User |
| `getRegionBossAction(region)` | Fetches boss details for a region. | Auth User |
| `getBestiaryAction()` | Returns catalog of monsters (Legacy). | Auth User |

### Social & Guilds (`actions/social.ts`, `actions/guild.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `followUser(targetId)` | Follows another user. | Auth User |
| `unfollowUser(targetId)` | Unfollows a user. | Auth User |
| `getLeaderboard(type)` | Fetches Global or Friends leaderboard. | Auth User |
| `getSocialFeed(page)` | Fetches activity feed. | Auth User |
| `sendChatAction(msg)` | Sends a message to Guild chat. | Auth User |
| `attackBossAction(bossId)` | Performs guild raid attack (Legacy?). | Auth User |
| `getUserStatsAction()` | Fetches guild-related user stats. | Auth User |

### Game Data (`actions/economy/armory.ts`, `actions/combat/bestiary.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `getArmoryData()` | Fetches all items and user ownership status. | Auth User |
| `getBestiaryData()` | Fetches all monsters and user kill status. | Auth User |

### Crafting & Enchanting (`actions/economy/crafting.ts`, `actions/economy/enchanting.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `getRecipesAction(userId)` | Fetches available crafting recipes. | Auth User |
| `craftItemAction(userId, recipeId)` | Crafts an item using materials. | Auth User |
| `getAvailableEnchantmentsAction(itemId)` | Returns possible enchantments. | Auth User |
| `enchantItemAction(userId, itemId, enchantId)` | Applies an enchantment to an item. | Auth User |

### Weekly Challenges (`actions/challenges.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `getActiveChallengesAction()` | Fetches currently active challenges. | Auth User |
| `claimChallengeRewardAction(challengeId)` | Claims XP/Gold for completed challenge. | Auth User |

### Strava Integration (`actions/strava.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `getStravaAuthUrlAction()` | Limits scope and returns auth URL. | Auth User |
| `exchangeStravaTokenAction(code)` | Exchanged Oauth code for access tokens. | Auth User |
| `disconnectStravaAction()` | Revokes access and removes tokens. | Auth User |

### AI Programming (`actions/program.ts`, `actions/generatePlanAction.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `generateProgramAction(prefs)` | Generates a full training program via LLM. | Auth User |
| `saveProgramAction(plan)` | Saves a generated program to user profile. | Auth User |
| `generateWeeklyPlanAction()` | Generates a weekly schedule (Legacy?). | Auth User |

### Titan State (`actions/titan.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `getTitanAction(userId)` | Fetches the Titan state for a user. | Auth User |
| `ensureTitanAction(userId)` | Creates Titan if not exists, returns existing otherwise. | Auth User |
| `modifyTitanHealthAction(userId, delta, reason)` | Adjusts Titan HP with audit logging. | System |
| `awardTitanXpAction(userId, amount, source)` | Awards XP with multipliers, handles level-ups. | System |
| `consumeTitanEnergyAction(userId, amount)` | Deducts energy for combat/actions. | Auth User |

### Achievements (`actions/achievements.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `checkAchievementsAction(userId)` | Evaluates all achievement criteria and unlocks eligible ones. | System |
| `getPlayerAchievementsAction(userId)` | Fetches all unlocked achievements for a user. | Auth User |

### Training Programs (`actions/programs.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `createProgramAction(userId, data)` | Creates a new training program skeleton with weeks. | Auth User |
| `getProgramAction(programId)` | Fetches a specific program with all details. | Auth User |
| `updateProgramWeekAction(weekId, focus)` | Updates week focus/description. | Auth User |
| `addWorkoutToProgramAction(weekId, workout)` | Adds a workout template to a program week. | Auth User |

### Training Templates (`actions/training.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `createWorkoutTemplateAction(userId, data)` | Creates a reusable workout template from a list of exercises. | Auth User |
| `getWorkoutTemplatesAction(userId)` | Returns all saved templates for the user. | Auth User |
| `startWorkoutFromTemplateAction(templateId)` | Initiates a live workout session based on a template. | Auth User |
| `deleteWorkoutTemplateAction(templateId)` | Permanently removes a template. | Auth User |
| `duplicateTemplateAction(templateId)` | Creates a copy of an existing template. | Auth User |
| `createWorkoutTagAction(label, color)` | Creates a custom tag for organizing templates/logs. | Auth User |
| `searchWorkoutsByTagAction(tagId)` | Filters workout history or templates by specific tag. | Auth User |

| `syncTitanStateWithWellness(userId, wellness)` | Syncs Titan mood/energy with Intervals.icu wellness. | System |
| `checkAndIncrementStreakAction(userId, tz)` | Checks and increments daily workout streak. | Auth User |

### Strength Logging (`actions/strength.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `logSetAction(userId, exerciseId, set)` | Logs a set, appends to daily log, checks achievements. | Auth User |
| `finishWorkoutAction(userId, logIds)` | Finalizes a workout session. | Auth User |
| `getExerciseHistoryAction(userId, exerciseId)` | Returns historical data for charts. | Auth User |
| `createExerciseAction(data)` | Creates a custom exercise definition. | Auth User |
| `searchExercisesAction(query)` | Searches exercises by name/muscle group. | Auth User |

### PvP Arena (`actions/pvp/ranked.ts`, `actions/pvp/duel.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `getCurrentSeasonAction()` | Fetches active ranked season details. | Public |
| `getPlayerRatingAction(userId)` | Returns user's ELO rating and seasonal stats. | Auth User |
| `findRankedOpponentAction()` | Matchmaking: Finds opponent near user's rating. | Auth User |
| `submitMatchResultAction(result)` | Submits ranked match outcome, updates ELO. | Auth User |
| `createDuelChallengeAction(targetId, options)` | Sends a custom Cardio Duel challenge. | Auth User |
| `acceptDuelChallengeAction(challengeId)` | Accepts a pending duel challenge. | Auth User |
| `updateCardioDuelProgressAction(duelId, km)` | Updates progress in an active race/duel. | Auth User |

### Segment Battles (`actions/pvp/segment.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `createSegmentBattleAction(segmentId, opponentId)` | Initiates a Strava segment challenge. | Auth User |
| `resolveSegmentBattleAction(uploadId)` | Resolves a segment battle after activity upload. | Auth User |

### Coach Subscription (`actions/coach-subscription.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `getSubscriptionAction(userId)` | Returns current tier and active status. | Auth User |
| `upgradeSubscriptionAction(tier, period)` | Initiates upgrade checkout flow. | Auth User |
| `hasFeatureAccessAction(userId, feature)` | Checks if user can access specific Pro feature. | Auth User |
| `cancelSubscriptionAction(userId)` | Cancels active subscription at period end. | Auth User |

### Gauntlet Arena (`actions/gauntlet.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `logGauntletRunAction(result)` | Logs a Gauntlet run, calculates XP/Gold/Kinetic rewards. | Auth User |
| `getGauntletStatsAction()` | Returns best run stats and total run count. | Auth User |

### Push Notifications (`actions/notifications.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `subscribeUserAction(subscription)` | Saves a web push subscription for a user. | Auth User |
| `sendNotificationAction(userId, title, body)` | Sends a push notification to all user devices. | System |

### Guilds & Raids (`actions/guild/core.ts`, `actions/guild/raids.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `createGuildAction(data)` | Creates a guild and assigns creator as member. | Auth User |
| `joinGuildAction(guildId)` | Joins an existing guild. | Auth User |
| `getGuildAction()` | Returns guild details including active raid. | Auth User |
| `startRaidAction(guildId, bossName, hp, days)` | Starts a new guild raid event. | Guild Admin |
| `contributeToRaidAction(raidId, damage)` | Contributes damage to an active raid. | Auth User |

### Demo Mode (`actions/demo.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `toggleDemoModeAction(enabled)` | Enables/disables demo mode via cookie. | Public |
| `getDemoModeStatus()` | Checks if demo mode is active. | Public |

### Onboarding (`actions/onboarding.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `completeOnboardingAction()` | Marks onboarding complete, awards achievement. | Auth User |

### Oracle / Decree (`actions/oracle.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `generateDailyDecreeAction()` | Generates and persists the Oracle's daily decree. | Auth User |

### Shop System (`actions/shop-system.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `getShopInventoryAction(userId)` | Returns available shop items (consumables, gear). | Auth User |
| `buyItemAction(userId, itemId)` | Purchases an item with Gold/Gems. | Auth User |
| `sellItemAction(userId, itemId)` | Sells an owned item for Gold. | Auth User |
| `getGoldBalanceAction(userId)` | Returns user's current gold balance. | Auth User |

### Battle Pass (`actions/systems/battle-pass.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `getActiveSeasonAction()` | Fetches current Battle Pass season. | Public |
| `getUserBattlePassProgressAction(userId)` | Returns BP level, XP, and tier status. | Auth User |
| `addBattlePassXpAction(userId, amount)` | Grants Season XP (typically via system triggers). | System |
| `claimBattlePassRewardAction(userId, tier)` | Claims free/premium reward for a tier. | Auth User |
| `upgradeToPremiumAction(userId)` | Upgrades user to Premium Pass (Mock Payment). | Auth User |

### Guild Territories (`actions/territories.ts`, `actions/guild-rewards.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `getWorldMapAction()` | Returns all territories and ownership status. | Auth User |
| `getTerritoryDetailsAction(id)` | Fetches history and contest stats for a territory. | Auth User |
| `recordTerritoryActivityAction(data)` | Logs guild contribution to territory contest. | System |
| `processWeeklyTerritoryClaimsAction()` | Cron: Decides weekly territory winners. | System |
| `calculateGuildBonusAction(userId)` | Calculates active guild bonuses for a user. | Auth User |
| `awardGuildSharedRewardAction(guildId)` | Distributes raid/event rewards to members. | System |

### Power Rating (`actions/power-rating.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `recalculatePowerRatingAction(userId)` | Triggers full recalculation of user's Power Rating. | Auth User |

---

### Game Mechanics & Balance (`actions/xp-multiplier.ts`, `actions/recovery-lock.ts`, `actions/anti-grind.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `calculateXpMultiplierAction(userId)` | Returns current XP multiplier (Streak/Bio/Fatigue). | System |
| `awardXpWithMultiplierAction(userId, xp, src)` | Awards XP with full logic applied. | System |
| `checkRecoveryLockAction(userId)` | Checks if user is "locked" from training (Overtraining). | Auth User |
| `overrideRecoveryLockAction(userId, reason)` | Allows user to bypass lock (with audit log). | Auth User |
| `calculateDiminishingReturnsAction(userId)` | Checks daily workout count for "anti-grind" penalty. | Auth User |

## 🛡️ Authentication
All Server Actions and sensitive API routes require:
1. Valid Supabase Session (Cookie-based).
2. Rate-limiting (applied middleware).

## 🧩 Types
API Types are defined in `src/types/schemas.ts` and validated using **Zod** at runtime.
