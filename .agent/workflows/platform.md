---
description: Platform analysis for cross-device feature design
command: /platform
category: meta
trigger: manual
---
# Workflow: /platform [feature-name]
Trigger: Manual

> **Naming Convention:** Task Name must follow `[DOMAIN] Description`.

# Identity
Du är en **Platform Strategist** som analyserar hur en feature ska fungera på olika enheter och kontexter.

# Context Pins
- `docs/PLATFORM_MATRIX.md` — Master template och riktlinjer
- `docs/analysis/*.md` — Befintliga feature-analyser

# Protocol

## Step 1: Feature Identification
1. Identifiera vilken feature som ska analyseras: `[feature-name]`
2. Kontrollera om det finns en befintlig analys i `docs/analysis/`

## Step 2: Platform Analysis
För varje plattform, besvara:

### Desktop Web
- [ ] Är detta en primary use case?
- [ ] Vilken layout passar? (Full UI / Collapsed / Minimal)
- [ ] Vilken input? (Mouse / Keyboard shortcuts)
- [ ] Behövs offline-stöd?

### Mobile Web / PWA
- [ ] Är detta en primary use case?
- [ ] Vilken layout passar? (Cards / Lists / Swipe)
- [ ] Touch-optimerad?
- [ ] Fungerar offline? (IndexedDB / Service Worker cache)
- [ ] Push notifications relevant?

### TV Mode
- [ ] Är detta relevant under cardio/TV-sessions?
- [ ] Kan det visas som ambient info? (Edge glow / Badge / Ticker)
- [ ] Auto-hide behavior?
- [ ] Readable from 3 meters?

### Companion Mode (Mobil + TV)
- [ ] Finns det ett relay-scenario? (Mobil → TV)
- [ ] Vad ska mobilen visa? (Controls / Quick actions)
- [ ] Vad ska TVn visa? (Full output / Celebration)
- [ ] WebSocket/BroadcastChannel behövs?

## Step 3: Generate Matrix
Fyll i följande tabell:

```markdown
## Platform Matrix

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅/⚠️/❌ | ✅/⚠️/❌ | ✅/⚠️/❌ | ✅/⚠️/❌ |
| **Layout** | ... | ... | ... | ... |
| **Input** | ... | ... | ... | ... |
| **Offline?** | ... | ... | ... | ... |
| **Priority** | P0/P1/P2 | P0/P1/P2 | P0/P1/P2 | P0/P1/P2 |

**Notes:**
- Desktop: ...
- Mobile: ...
- TV Mode: ...
- Companion: ...
```

## Step 4: Update Documentation
1. Om `docs/analysis/[feature].md` finns:
   - Lägg till Platform Matrix-sektionen
2. Om den inte finns:
   - Skapa ny fil med grundläggande struktur + Platform Matrix

## Step 5: Implementation Recommendations
Baserat på analysen, ge konkreta rekommendationer:
- Vilka breakpoints behövs?
- Behövs separata komponenter per platform?
- Vilka hooks behövs? (`usePlatformContext`, `useCompanionRelay`)
- CSS-strategier (Tailwind responsive / CSS container queries)

# Output Format
```
┌─────────────────────────────────────────────┐
│ PLATFORM ANALYSIS: [feature-name]           │
├─────────────────────────────────────────────┤
│ Desktop     │ ✅ Primary                    │
│ Mobile      │ ✅ Primary                    │
│ TV Mode     │ ⚠️ Simplified                │
│ Companion   │ ❌ Not applicable             │
├─────────────────────────────────────────────┤
│ Recommendations:                            │
│ - Use responsive Tailwind classes           │
│ - Add useTvMode() hook for TV detection     │
│ - Cache standings in IndexedDB for mobile   │
└─────────────────────────────────────────────┘
```

# Legend
- ✅ Full support (P0 priority)
- ⚠️ Simplified/Ambient (P1-P2 priority)  
- ❌ Not applicable
