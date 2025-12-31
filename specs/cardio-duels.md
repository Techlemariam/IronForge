# Feature Spec: Cardio PvP Duels

## 🎯 Goal
Enable players to challenge friends or strangers to real-time (or async) cardio battles where physical effort translates to game dominance.

## 🎮 Game Modes
1. **Distance Race** (Running/Cycling): First to X km wins.
2. **Speed Demon** (Running/Cycling): Highest average pace over X minutes.
3. **Elevation Grind** (Cycling): Most elevation gained in X minutes.

## 🏗️ Architecture
- **Data Source**: Strava/Garmin via `src/services/integration`.
- **State Management**: RethinkDB/Supabase Realtime for "Live" feel.
- **Validation**: Server-side verification of workout timestamps vs Duel window.

## 📱 UI Components
- `DuelLobby`: Create/Join interface.
- `DuelArena`: Live view of progress bars (You vs Opponent).
- `DuelResult`: Winner declartion + XP/Gold rewards.

## 💾 Database Schema
```prisma
model Duel {
  id        String   @id @default(cuid())
  type      DuelType // DISTANCE, SPEED, ELEVATION
  status    DuelStatus // PENDING, ACTIVE, FINISHED
  target    Float    // e.g. 5.0 (km) or 30 (min)
  
  challengerId String
  opponentId   String?
  
  createdAt DateTime @default(now())
  winnerId  String?
}
```

## ⚠️ Edge Cases
- **Sync Delay**: Strava might delay webhook. UI must handle "Waiting for data...".
- **Cheating**: Import limits? (Future scope).

## 📅 Phases
1. **Phase 1**: Async Duels (Finish workout -> Sync -> Check Winner).
2. **Phase 2**: "Clash" Mode (Live data polling).
