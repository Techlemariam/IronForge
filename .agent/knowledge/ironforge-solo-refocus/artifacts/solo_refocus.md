# IronForge Solo Refocus & AuDHD Optimization

## Strategic Pivot
IronForge is now a **solo-first, AuDHD-supportive** training tool that minimizes cognitive load and initiation friction.

## Completed Work
- ✅ PvP features frozen (Battle Pass, Arena removed from nav; Colosseum hidden from CitadelHub)
- ✅ Equipment list documented in `USER.md`
- ✅ `.gitignore` hardened (prd.json, dev.json blocked)
- ✅ Doppler-first workflow (`doppler run`)

## Equipment Catalog
- **Cardio:** Titan Athlete Life T80 (treadmill), Wahoo KICKR Bike
- **Strength:** Freak Athlete System 6.2, GHD, cable machine, leg developer, squat rack, barbell, dumbbells, kettlebells, landmine

## Open Tasks

### UI/UX (Decision Offloading)
- `[ ]` **TodaysMission.tsx** — High-contrast view that removes decision fatigue. Shows one clear direction for the day.
- `[ ]` **Launch Sequence** — Pulsing UI that makes starting feel like launching a mission, not a chore.

### Feature Implementation
- `[ ]` **Equipment Recall** — Logic for "Back Extension @ Red 8" type memory aids
- `[ ]` **Window Awareness** — Morning/Evening detection to suggest appropriate workouts
- `[ ]` **Dual-Tone Oracle** — Commander (direct orders) vs Companion (supportive) modes

### Infrastructure
- `[/]` **Supabase Local** — Docker containers need healthy storage; `doppler run -- npx supabase start`
- `[ ]` **Verify login flow** — Demo Mode or test user

## Local Dev
```powershell
doppler run -- npm run dev    # Starts on localhost:3001
doppler run -- npx supabase start   # Requires Docker healthy
```

## Key Design Principles
- **Decision offloading:** The app decides, not the user
- **Initiation support:** Reduce friction to zero clicks to start
- **High contrast:** Large text, minimal visual noise
- **Solo focus:** No social features, no leaderboards
