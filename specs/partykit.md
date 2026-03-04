# ☁️ Feature Specification: Partykit Real-Time Integration

**Author:** `@analyst`
**Date:** 2026-02-28
**Status:** DRAFT (Ready for `@architect`)
**Epic:** Infrastructure & Latency Optimization (Season 2)

## 📌 Executive Summary

Currently, multiplayer features like the `CoOpService` and `Cardio PvP Duels` rely on polling or Supabase Realtime, which can suffer from latency issues and connection dropouts during high-intensity sessions. We are migrating these core real-time loops to **Partykit** (running on Cloudflare Workers) to achieve <10ms global latency.

---

## 📖 User Stories (INVEST)

### 1. Seamless Co-Op Connection

**As a** Guild Member
**I want to** join a "Live Co-Op Session" instantly without seeing constant "Reconnecting..." spinners
**So that** I feel connected to my friends while we run simultaneously.

### 2. Live PvP Metrics (The Duel)

**As a** Competitor in a Cardio Duel
**I want to** see my opponent's Heart Rate and Power metrics update in sub-second intervals
**So that** I can dynamically adjust my effort to beat them in real-time.

### 3. Graceful Disconnects

**As a** Mobile User
**I want to** automatically drop back into my existing Co-Op room if my LTE drops and reconnects
**So that** my workout metrics aren't lost because of a 5-second tunnel.

---

## ✅ Acceptance Criteria (Gherkin)

### Scenario 1: Connecting to a Partykit Room

- **Given** I am launching a Co-Op Session for room `guild-run-1`
- **When** the `useLiveCombat` hook initializes
- **Then** a secure WebSocket connection is established to the Partykit worker on `partykit.dev`
- **And** I am added to the `active_sessions` state in the Worker memory without hitting the Postgres database.

### Scenario 2: Broadcasting Biometric Data

- **Given** I am in a Partykit Room with 3 other users
- **When** my Bluetooth HRM sends an updated Heart Rate (e.g., 165 BPM)
- **Then** the Partykit client broadcasts this metric
- **And** the 3 other users see my UI card update with `165 BPM` in under 100ms.

### Scenario 3: Database Syncing (The Worker Commit)

- **Given** the Co-Op run has been active for 5 minutes
- **When** the Partykit Worker hits its persistence interval
- **Then** the Worker bundles the session state and performs a single bulk `POST` to our `/api/webhooks/partykit` endpoint
- **And** the Next.js server safely writes this snapshot to the `active_sessions` Postgres table.

### Scenario 4: Connection Recovery

- **Given** I lose internet connection entirely
- **When** the Partykit Worker detects a dropped websocket ping
- **Then** it retains my session data in memory for 60 seconds
- **And** when I reconnect 10 seconds later, I am immediately synced back into my exact previous state.

---

## 🛠️ Technical Notes & Architecture Implications

### Dependencies & Setup

- Requires installing `partykit` CLI and `@partykit/client`.
- We need to create a new root folder `/partykit` to host the Worker scripts (`server.ts`).
- We must define a secure authentication handshake so the Partykit server knows it is talking to authenticated IronForge users (passing the Supabase JWT via query params).

### Identified Risks

- **Data Loss on Worker Restart:** If a Cloudflare Worker is preemptively restarted, in-memory state is wiped.
  - *Mitigation:* The Worker must use `room.storage` (Cloudflare Durable Objects) to persist the active state across restarts so the workout is not lost.
- **Cost Scaling:** Partykit prices per connection minute.
  - *Mitigation:* Ensure connections are aggressively closed when the workout explicitly ends or when a user closes the app, preventing zombie connections.
