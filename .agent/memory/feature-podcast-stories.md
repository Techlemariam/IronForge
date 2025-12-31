# Feature: Podcast Integration (Pocket Casts)

> **Phase 1 Discovery** | `/analyst` persona | Date: 2025-12-30

## Context
Användaren vill kunna lyssna på podcasts från Pocket Casts under träningspass i IronForge. Detta kräver integration med Pocket Casts inofficiella API och implementation av Media Session API för kontroll via låsskärm/hörlurar.

---

## User Stories

### US-1: Som användare vill jag koppla mitt Pocket Casts-konto
**Acceptanskriterier:**
- [ ] Kan ange och spara Pocket Casts token via inställningar
- [ ] Token valideras vid anslutning
- [ ] Felmeddelande visas om token är ogiltig
- [ ] Disconnect-knapp för att ta bort integration

### US-2: Som användare vill jag se mina prenumerationer  
**Acceptanskriterier:**
- [ ] Lista alla prenumererade podcasts med artwork
- [ ] Visa "In Progress" avsnitt först
- [ ] Sökbar/filtrerbar lista

### US-3: Som användare vill jag spela podcasts under träning
**Acceptanskriterier:**
- [ ] Play/Pause med physical buttons (hörlursknapp)
- [ ] Nästa/Föregående track
- [ ] Seek funktion (hoppa 15s/30s)
- [ ] Progress-bar med tidvisning
- [ ] Resume from last position (sync)

### US-4: Som användare vill jag ha en "Tränings-spellista"
**Acceptanskriterier:**
- [ ] Kunna välja "Queue" eller "In Progress" som källa
- [ ] Automatisk övergång till nästa avsnitt
- [ ] Kommer ihåg senaste inställningen

### US-5: Som användare vill jag kontrollera podden från låsskärmen/klockan
**Acceptanskriterier:**
- [ ] Media Session API implementerad
- [ ] Artwork visas på låsskärm
- [ ] Title + Podcast name synlig
- [ ] Hardware buttons fungerar (play/pause/skip)

---

## Platform Matrix: Podcast Player

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ⚠️ | ✅ | ⚠️ | ✅ |
| **Layout** | Sidebar mini-player | Bottom sheet player | Full-screen ambient | Remote control |
| **Input** | Click, KB shortcuts | Touch, physical buttons | Voice/Auto | Touch → Cast audio |
| **Offline?** | No | PWA cache (metadata) | No | Relay commands |
| **Priority** | P1 | P0 | P2 | P1 |

### Platform Notes

**Mobile (P0):**
- Primär plattform - användare tränar med mobilen
- Media Session API kritiskt för låsskärm/hörlurskontroll
- Mini-player som overlay under träning
- Kompakt UI som inte stör workout-loggning

**Desktop (P1):**
- Sidebar-docked mini-player
- KB shortcuts: Space (play/pause), Arrows (seek)
- Kan ha expanderad vy för podcast discovery

**TV Mode (P2):**
- Ambient display - podcast artwork + waveform
- Zone-färgad border baserat på innehåll
- Auto-hide controls, voice: "Nästa podcast"

**Companion (P1):**
- Mobil = kontroll, TV = audio output (Cast-scenario)
- Mobil skickar play/pause → TV spelar
- Session-parning via samma workout-session

---

## Technical Considerations

### Auth Strategy
Pocket Casts använder Bearer Token-autentisering. Eftersom det saknas OAuth måste användaren manuellt hämta sin token från play.pocketcasts.com DevTools.

### CORS / Backend Proxy
Pocket Casts API har Origin-kontroll. Vi behöver en API route (`/api/podcast/`) som proxy för att undvika CORS-problem och dölja token från klienten.

### Audio Playback
- Direktlänk till podcast MP3 (hostat hos Libsyn/Acast/etc)
- HTML5 `<audio>` element + Media Session API
- Mixed Content risk: vissa äldre podcasts serverar HTTP (ej HTTPS)

### State Sync
- Position sync tillbaka till Pocket Casts: POST `/user/history/progress`
- Debounce: var 30:e sekund för att undvika rate limiting

---

## Dependencies
- Inga nya npm-paket krävs (native fetch + HTML5 Audio)
- Prisma schema: `PocketCastsConnection` (userId, token, createdAt)

## Risks
- **Inofficiellt API**: Kan ändras utan förvarning. Måste hantera breaking changes gracefully.
- **Rate Limiting**: Okänd gräns - implementera exponential backoff.
- **Token Expiry**: Okänd TTL - måste hantera 401 och guida användare att förnya.
