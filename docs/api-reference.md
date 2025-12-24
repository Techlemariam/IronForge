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

### Game Data (`actions/armory.ts`, `actions/bestiary.ts`, `actions/forge.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `getArmoryData()` | Fetches all items and user ownership status. | Auth User |
| `getBestiaryData()` | Fetches all monsters and user kill status. | Auth User |
| `craftItem(recipeId)` | Crafts an item using resources/currency. | Auth User |

### AI Programming (`actions/program.ts`, `actions/generatePlanAction.ts`)
| Function | Description | Access |
|----------|-------------|--------|
| `generateProgramAction(prefs)` | Generates a full training program via LLM. | Auth User |
| `saveProgramAction(plan)` | Saves a generated program to user profile. | Auth User |
| `generateWeeklyPlanAction()` | Generates a weekly schedule (Legacy?). | Auth User |

---

## 🛡️ Authentication
All Server Actions and sensitive API routes require:
1. Valid Supabase Session (Cookie-based).
2. Rate-limiting (applied middleware).

## 🧩 Types
API Types are defined in `src/types/schemas.ts` and validated using **Zod** at runtime.
