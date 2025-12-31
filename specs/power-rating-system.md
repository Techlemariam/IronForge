# Power Rating System (Oracle 3.0 Prep)

## Objective
To create a unified "Power Score" that quantifies a player's physical capabilities by combining strength (Hevy) and endurance (Intervals.icu) metrics. This score will drive matchmaking, leaderboard rankings, and in-game tiers, solving the issue of static levels and lack of decay for inactive players.

## Core Problem
Currently, leveling is additive and never decreases. A player who grinded to Level 50 a year ago but hasn't trained since is still Level 50. This creates unbalanced PvP matchups.

## The Solution: Power Score (PS)
`Power Score` is dynamic. It reflects your *current* fitness state, not just historical achievements.

### Formula Overview
```
Power Score = (Strength Rating * 0.5) + (Cardio Rating * 0.5) + Consistency Bonus
```

### 1. Strength Rating (SR)
Derived from **Hevy** data.
- **Primary Metric**: Theoretical 1RM (One Rep Max) of Big 3 (Squat, Bench, Deadlift) -> Converted to **Wilks Score**.
- **Secondary Metric**: Weekly Volume (total kg lifted).
- **Calculation**:
  `SR = (Wilks Score * 10) + (Weekly Volume / 1000)`
  *Cap SR at 2000.*

### 2. Cardio Rating (CR)
Derived from **Intervals.icu** data.
- **Primary Metric**: FTP (Functional Threshold Power) or Pace-based equivalent.
- **Secondary Metric**: Weekly Distance / Duration.
- **Calculation**:
  `CR = (FTP * 4) + (Weekly Duration Hours * 50)`
  *Cap CR at 2000.*

### 3. Consistency Bonus & Decay
- **Bonus**: +1% to Total PS for every consecutive week of training (max +10%).
- **Decay**: If no activity is recorded for 7 days, PS decays by 5% per week.

### 4. Tiers & Matchmaking
Players are grouped into Tiers based on PS. Matchmaking prioritizes players within ±100 PS.

| Tier | PS Range |
| :--- | :--- |
| **Novice** | 0 - 500 |
| **Apprentice** | 501 - 1000 |
| **Adept** | 1001 - 1500 |
| **Elite** | 1501 - 2000 |
| **Titan** | 2000+ |

## Implementation Strategy
1.  **Data Ingestion**: Create `calculatePowerScore` server action.
2.  **Job Scheduler**: Run weekly calculation (Sunday midnight) to apply decay/updates.
3.  **UI Updates**: Replace "Level" with "Tier Badge" in restricted views (Arena).

## Open Questions
- How to handle users who only do one modality (e.g., only lift)? *Answer: They will simply have a lower capped PS, limiting them to 'Adept' tier max.*
- Integration with existing `PvpRank`? *Answer: PvpRank becomes a "Season Title" (mostly cosmetic/grind-based), while Power Score is the "Matchmaking Rating" (MMR).*
