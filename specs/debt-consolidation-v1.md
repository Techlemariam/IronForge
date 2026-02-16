# Spec: Debt Consolidation v1

## 📋 Requirements

- **Goal**: Clean up persistent technical debt in Game Mechanics and Infrastructure.
- **Scope**: `PowerRatingService.ts`, `schema.prisma`.

## ## User Stories

- As a Player, I want my streak to be calculated accurately so that my Power Rating doesn't drop due to a calculation bug.
- As a Developer, I want the database schema to be in sync with migrations to avoid "Scrap Yard" errors in CI.

## ## System Design

### PowerRating Streak Logic

- Use `date-fns` to bucket logs into logical weeks.
- Ensure the streak remains unbroken if a user trains on Sunday of Week N and Monday of Week N+2 (Wait, that is a break).
- Streak logic: Count consecutive weeks (Mon-Sun) that have >= 1 activity.
- The "Current Week" is a special case: If no training yet, look at last week to keep streak alive.

### Database Sync

- Models: `FactoryStatus`, `FactorySettings`, `FactoryTask`.
- Action: Generate migration from current schema state.

## ## Visual Design

- N/A (Backend logic).

## ## Test Plan

### Unit Tests

- Case A: User trains every week for 5 weeks. Result: 5.
- Case B: User trains every week, skips current week (mid-week check). Result: Previous streak stays.
- Case C: User skips a full week. Result: Streak resets to 0 (or 1 if they train).
- Case D: Crossing Jan 1st boundaries.

## ## Security

- Standard Prisma input validation.
