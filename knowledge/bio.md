# 🧬 Domain: BIO (Bio-Integration)

**Owner:** @titan-coach, @infrastructure
**Focus:** External API integrations (Hevy, Intervals.icu, Garmin), recovery tracking, training data.

## 🔌 Active Integrations

### 1. Hevy (Primary Strength Tracker)
- **Status:** ✅ Active
- **Data:** Routines, exercises, sets, user workout logs.
- **API:** REST, authenticated via `HEVY_API_KEY`.
- **Usage:** Alex tracks all strength training in Hevy. IronForge pulls routines and converts them to game-compatible quest format via `hevyAdapter.ts`.
- **Key Files:** `src/services/bio/`, `src/utils/hevyAdapter.ts`, `src/types/hevy.ts`

### 2. Intervals.icu (Cardio & Recovery)
- **Status:** ✅ Active
- **Data:** Garmin watch data (via Intervals sync), HRV, sleep, activity loads, wellness.
- **API:** REST, authenticated via `INTERVALS_API_KEY` + `INTERVALS_ATHLETE_ID`.
- **Usage:** Provides Recovery Oracle with bio-data for TRAIN/REST/LIGHT verdicts.
- **Key Files:** `src/services/bio/`

### 3. Garmin (Direct)
- **Status:** 🟡 Partial (OAuth flow incomplete)
- **Data:** Health API (heart rate, sleep, stress, body battery).
- **Blocked:** Awaiting Garmin API program approval.
- **Workaround:** Uses Intervals.icu as Garmin proxy.

### 4. Strava (Cardio Activities)
- **Status:** ✅ Shipped
- **Data:** Running, cycling activities, routes.
- **API:** OAuth 2.0.

## 🧠 Alex's Training Context

- **System 6.2:** Three sessions (A, C, D) targeting posterior chain, lower body depth, and upper body.
- **Equipment:** Home gym — GHD, landmine, cables, barbell, leg developer.
- **Goals:** Feel good mentally/physically, run, cycle, lift heavy, no back pain.
- **Schedule:** Two windows only — morning (pre-kids) and evening (post-kids).

## 💡 Insights & Decisions

- **Hevy is the source of truth** for all strength data. IronForge does NOT replace Hevy's logging.
- **Intervals.icu is the recovery oracle** — provides the bio-signals for readiness verdicts.
- **Zod validation** of API responses is partial — needs completion for robustness.
- **Error handling** in catch blocks needs audit — some may silently swallow errors.
