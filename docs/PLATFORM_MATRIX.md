# Platform Strategy Matrix

> Varje feature ska designas med alla plattformar i åtanke.

## Plattformar

| Platform | Device | Context | Primary Use | Growth Role |
|:---------|:-------|:--------|:------------|:------------|
| **Desktop Web** | Laptop/PC | Vid skrivbord | Planering, analys, djupdykning | **Acquisition** (SEO, marketing, heavy onboarding) |
| **Mobile Web (PWA)** | Telefon | Gym, on-the-go | Logging, quick actions | **Retention** (Daily usage, push notifications) |
| **Native App** (future) | iOS/Android | Gym | Push, offline, widgets | **Retention** (Deep system integration) |
| **TV Mode** | TV via HDMI/Cast | Cardio, hemmagym | Ambient HUD, glanceable | **Differentiation** (Unique "WOW" factor) |
| **Companion** | Mobil + TV | Cardio | Mobil = remote, TV = display | **Virality** (Social/Multiplayer usage) |

---

## Feature Matrix Template

```markdown
### [Feature Name]

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅/⚠️/❌ | ✅/⚠️/❌ | ✅/⚠️/❌ | ✅/⚠️/❌ |
| **Layout** | Full UI | Collapsed | Minimal | Split |
| **Input** | Mouse/KB | Touch | Remote/Voice | Touch→Cast |
| **Offline?** | No | PWA Cache | No | Relay |
| **Priority** | P0/P1/P2 | P0/P1/P2 | P0/P1/P2 | P0/P1/P2 |
```

Legend: ✅ Full support | ⚠️ Simplified | ❌ Not applicable

---

## Existing Features - Platform Mapping

### Iron Mines (Strength Logging)

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ⚠️ | ✅ | ❌ | ⚠️ |
| **Layout** | Full table | Swipe cards | N/A | Quick +Rep |
| **Input** | Click | Touch/Swipe | N/A | Big buttons |
| **Offline?** | No | Yes (IndexedDB) | N/A | Relay |
| **Priority** | P1 | P0 | N/A | P2 |

### Cardio Studio

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ⚠️ | ⚠️ | ✅ | ✅ |
| **Layout** | Split view | Controls only | Ambient HUD | Remote→TV |
| **Input** | KB shortcuts | Touch | Auto-hide | Swipe/tap |
| **Offline?** | No | BLE cache | No | WebSocket |
| **Priority** | P1 | P1 | P0 | P0 |

### Training Center (Codex)

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ⚠️ | ❌ | ❌ |
| **Layout** | Grid + details | List | N/A | N/A |
| **Input** | Click | Tap | N/A | N/A |
| **Offline?** | No | Cached templates | N/A | N/A |
| **Priority** | P0 | P1 | N/A | N/A |

### Combat Arena

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ✅ | ⚠️ | ⚠️ |
| **Layout** | Full animations | Simplified | Spectator | Quick attack |
| **Input** | Click | Tap | Watch | Action buttons |
| **Offline?** | No | No | No | No |
| **Priority** | P0 | P0 | P2 | P2 |

### Oracle Verdict

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ✅ | ⚠️ | ❌ |
| **Layout** | Card + details | Card | Edge glow | N/A |
| **Input** | Click | Tap | Auto | N/A |
| **Offline?** | No | Cached decree | No | N/A |
| **Priority** | P0 | P0 | P1 | N/A |

### Iron Leagues

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ✅ | ⚠️ | ❌ |
| **Layout** | Table + graph | List | Position only | N/A |
| **Input** | Click | Tap | View | N/A |
| **Offline?** | No | Cached standings | No | N/A |
| **Priority** | P0 | P0 | P2 | N/A |

### Cardio PvP Duels

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ⚠️ | ✅ | ⚠️ | ❌ |
| **Layout** | Detailed Analysis | Matchmaking/Status | VS View (Spectator) | N/A |
| **Input** | KB/Mouse | Touch | Passive | N/A |
| **Offline?** | No | Cached Status | No | N/A |
| **Priority** | P2 | P1 | P2 | N/A |

### Battle Pass

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ✅ | ⚠️ | ❌ |
| **Layout** | Full track + rewards | Scrollable track | Progress bar only | N/A |
| **Input** | Click to claim | Tap to claim | View only | N/A |
| **Offline?** | No | Cached progress | No | N/A |
| **Priority** | P0 | P0 | P1 | N/A |

### Guild System (Quests, Raids, Territories)

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ✅ | ⚠️ | ⚠️ |
| **Layout** | Full dashboard | Tab navigation | Guild status widget | Quick actions |
| **Input** | Click | Touch/Swipe | View only | Raid join button |
| **Offline?** | No | Cached roster | No | Relay |
| **Priority** | P0 | P0 | P2 | P2 |

### Daily Quests & Streaks

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ✅ | ⚠️ | ❌ |
| **Layout** | Quest list + streak | Cards + streak badge | Streak counter only | N/A |
| **Input** | Click | Tap | Auto-display | N/A |
| **Offline?** | No | Cached quests | No | N/A |
| **Priority** | P0 | P0 | P1 | N/A |

### Achievements

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ✅ | ⚠️ | ❌ |
| **Layout** | Grid + categories | List + filters | Recent unlock toast | N/A |
| **Input** | Click to view | Tap to view | Auto-dismiss | N/A |
| **Offline?** | No | Cached unlocks | No | N/A |
| **Priority** | P0 | P0 | P2 | N/A |

### Arena PvP Seasons

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ✅ | ⚠️ | ❌ |
| **Layout** | Bracket + standings | List + rank badge | Current rank display | N/A |
| **Input** | Click to challenge | Tap to queue | View only | N/A |
| **Offline?** | No | Cached rank | No | N/A |
| **Priority** | P0 | P0 | P2 | N/A |

### Shop & Economy

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ✅ | ❌ | ⚠️ |
| **Layout** | Full catalog | Scrollable list | N/A | Quick buy |
| **Input** | Click to buy | Tap to buy | N/A | Confirm on phone |
| **Offline?** | No | Cached catalog | N/A | Relay |
| **Priority** | P0 | P0 | N/A | P2 |

### Companion System (Pet)

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ✅ | ⚠️ | ❌ |
| **Layout** | Pet + stats panel | Pet avatar + level | Idle pet animation | N/A |
| **Input** | Click to interact | Tap to feed/pet | Ambient display | N/A |
| **Offline?** | No | Cached state | No | N/A |
| **Priority** | P1 | P0 | P1 | N/A |

### Analytics Dashboard

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ⚠️ | ❌ | ❌ |
| **Layout** | Full charts + tables | Summary cards | N/A | N/A |
| **Input** | Click + hover | Tap + scroll | N/A | N/A |
| **Offline?** | No | Cached summaries | N/A | N/A |
| **Priority** | P0 | P1 | N/A | N/A |

---

## Design Principles

### 1. Mobile-First, Desktop-Enhanced

- Design for touch first
- Add mouse/keyboard shortcuts for power users
- Increase information density on desktop

### 2. TV = Glanceable Only

- Max 3 data points visible at once
- Zone-based color coding
- Auto-hide non-essential UI
- Large text (readable from 3m)

### 3. Companion = Relay + Control

- Mobil skickar commands via WebSocket
- TV tar emot och visar
- Samma session-ID för pairing
- Mobil = input device, TV = output device

### 4. Offline-First for Gym

- All logging features cache locally
- Sync on reconnect
- Show "Syncing..." status
- Never lose data

---

## Technical Implementation

### Responsive Breakpoints

```typescript
const BREAKPOINTS = {
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  tv: '(min-width: 1280px) and (pointer: coarse)', // 720p+, no mouse
};
```

### Context Detection

```typescript
const usePlatformContext = () => {
  const isTouchDevice = 'ontouchstart' in window;
  const isLargeScreen = window.innerWidth >= 1280;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  if (isLargeScreen && !isTouchDevice) return 'desktop';
  if (isLargeScreen && isTouchDevice) return 'tv';
  if (isStandalone) return 'pwa';
  return 'mobile-web';
};
```

### Companion Pairing

```typescript
// Mobil: Generate session code
const sessionCode = nanoid(6).toUpperCase(); // "ABC123"
broadcastChannel.postMessage({ type: 'PAIR', code: sessionCode });

// TV: Listen for pairing
broadcastChannel.onmessage = (e) => {
  if (e.data.type === 'PAIR' && e.data.code === enteredCode) {
    setCompanionConnected(true);
  }
};
```

---

## Checklist for New Features

When designing a new feature, answer:

1. [ ] Where is this feature **primarily used**? (Gym? Home? Office?)
2. [ ] What **device** will users have? (Phone in hand? Looking at TV?)
3. [ ] What **input** is available? (Touch? Keyboard? Voice? None?)
4. [ ] Does it need to work **offline**?
5. [ ] Is there a **companion scenario**? (Mobil + TV)
6. [ ] What's the **minimum viable display**? (1 number? Chart? List?)

---

## Example: New Feature Analysis

### Example: "PR Celebration Animation"

| Aspect | Desktop | Mobile | TV Mode | Companion |
|:-------|:--------|:-------|:--------|:----------|
| **Primary?** | ✅ | ✅ | ✅ | ⚠️ |
| **Layout** | Full confetti | Haptic + mini | Full screen takeover | Haptic on phone, visual on TV |
| **Input** | Auto-dismiss | Tap to dismiss | Auto-dismiss 5s | Tap phone to dismiss TV |
| **Offline?** | Yes (local) | Yes | No | Relay |
| **Priority** | P0 | P0 | P1 | P1 |
