# ⛏️ Iron Mines: Deep Analysis

**"Iron Mines"** is the internal code name for your gamified workout session (often referred to as "Dungeon Quest" in the UI).

## 🏗 Technical Architecture

### Core Components
1.  **`IronMines.tsx` (Wrapper):**
    *   Handles the lifecycle: Check-in -> Workout -> Completion -> Export.
    *   Manages "Crash Recovery" (if browser refreshes).
    *   Displays the `PreWorkoutCheck` and `CompletionScreen`.

2.  **`DungeonSessionView.tsx` (The Engine):**
    *   **Gamification:** Calculates "Damage Dealt" based on volume (Weight * Reps).
    *   **Boss Logic:** `totalHp` is dynamically calculated based on your planned workout volume.
    *   **UI:** Renders the `DungeonInterface` (Boss HUD) and `ExerciseView` (Logging).
    *   **Special Features:**
        *   **Berserker Mode (Drop Sets):** "Sacrifice Health for Damage".
        *   **Joker Sets (Overcharge):** "RPE 6 detected? Add weight for bonus XP."
        *   **Screen Shake:** Visual feedback on heavy lifts.

3.  **`useMiningSession.ts` (State hook):**
    *   Connects to Bluetooth Heart Rate (Polar H10).
    *   Saves logs to local IndexedDB/Postgres.
    *   Handles exports to Hevy/Intervals.

## ⚠️ Current Status: "Functional but Isolated"
*   It is a **fully working** alternative to Hevy for "Active" sessions.
*   **Problem:** It runs somewhat in parallel to the new "Iron Logger" we just built.
    *   *Iron Mines* = The "Game" mode (Immersive, full screen).
    *   *Iron Logger* = The "Utility" mode (Quick, tabular).

## 💡 Recommendation
**Merge the DNA.**
The "Iron Logger" you want (The Titan Killer) essentially **IS** `IronMines.tsx`, but with a faster UI.

*   **Step 1:** Use `IronMines` logic (Damage calculation, Boss HP) as the backend for `Iron Logger`.
*   **Step 2:** When you log a set in `Iron Logger`, it should trigger the same "Damage Event" as Iron Mines.
