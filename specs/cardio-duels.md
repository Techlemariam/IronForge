# 🏃‍♂️ Cardio PvP Duels Specification

**Status:** In-Progress
**Domain:** Game / PvP
**Integration:** Strava / Intervals.icu (via Webhooks)

## 1. Concept
Real-time or asynchronous cardio competitions between users. Unlike Titan Duels (which are auto-battles based on stats), Cardio Duels are settled by actual physical activity.

## 2. Duel Modes

### A. Distance Race (Asynchronous / Real-time)
*   **Goal:** Be the first to cover X km.
*   **Target:** 5km, 10km, 21km, 42km.
*   **Logic:**
    *   Both players start at 0 distance.
    *   Webhooks update `challengerDistance` and `defenderDistance`.
    *   First to reach `targetDistance` wins.
*   **Edge Case:** If both upload activities completing the distance at slightly different times, the one who finished *earlier in wall-clock time* wins (using activity start_time + duration).

### B. Speed Demon (Asynchronous)
*   **Goal:** Fastest time to complete X distance.
*   **Target:** 1km, 5km.
*   **Logic:**
    *   Challenger sets a time (e.g., 5km in 25:00).
    *   Defender has 24h to beat it.
    *   Logic compares `moving_time` for the matching distance segment.

### C. Elevation Grind (Cycling Only)
*   **Goal:** Climb X meters of vertical gain.
*   **Target:** 500m, 1000m, 2000m.

## 3. Matchmaking
*   **Primary Factor:** Power Rating (Titan Score).
*   **Secondary Factor:** W/kg Tier (e.g. 3.0-3.5 W/kg).
*   **Logic:**
    *   User looks for opponent.
    *   System queries `User.titan.powerRating` +/- 100.
    *   Displays 3 potential rivals.

## 4. UI/UX
*   **Duel Card:** Shows progress bars for both players.
*   **Updates:** "Live" updates if multiple short activities are synced, or one big update.
*   **Taunt System:** "Send Taunt" button sends push notification.

## 5. Rewards (via `DuelRewardsService`)
*   **Winner:**
    *   High XP (function of distance/effort).
    *   Gold.
    *   Chance for Kinetic Shards.
*   **Loser:**
    *   Participation XP (30% of winner).
    *   Small Gold.

## 6. Technical Flow
1.  **Challenge Created:** `DuelChallenge` record created with `duelType="DISTANCE_RACE"`.
2.  **Activity Synced:** Strava Webhook -> `processCardioLog` -> `updateCardioDuelProgress`.
3.  **Progress Check:** Update `challengerDistance` += activity.distance.
4.  **Win Check:** If `newDistance >= targetDistance`:
    *   Mark `winnerId`.
    *   Calculate Rewards.
    *   Notify users.
