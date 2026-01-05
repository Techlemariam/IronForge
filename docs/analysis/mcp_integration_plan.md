# 🔌 MCP Integration Plan for IronForge

**Status:** Draft | **Date:** 2026-01-05 | **Author:** Infrastructure Agent

## 1. Executive Summary
Integration of specialized **Model Context Protocols (MCPs)** will significantly enhance the AI agent's ability to autonomously manage IronForge's infrastructure, debug issues, and accelerate feature development. This document outlines the high-impact integrations tailored to our specific stack (Next.js, Supabase, Vercel).

---

## 2. Priority 1: Core Infrastructure (The "Nervous System")

These MCPs should be integrated immediately to support the **Infrastructure Pilot** and **Debug** personas.

### 🐘 Supabase MCP
**Why:** IronForge relies heavily on Postgres. The agent needs to see the *actual* database schema and data, not just the local Prisma schema (which might drift).
- **Capabilities:**
  - `list_tables`, `describe_table`: verify schema vs Prisma.
  - `execute_sql`: Run complex analysis queries (e.g., "Find all Titans with > 1000 XP").
  - `manage_migrations`: Assist in migration conflict resolution.
- **Action:** Ensure `supabase-mcp-server` is stable and configured with read-only access for general browsing, and write access only for strict migration tools.

### 🛡️ Sentry MCP
**Why:** We recently integrated `@sentry/nextjs`. The agent needs to *read* these errors to fix them.
- **Capabilities:**
  - `get_latest_issues`: Proactively catch new runtime errors.
  - `get_issue_details`: Retrieve stack traces and breadcrumbs without leaving the IDE.
  - `resolve_issue`: Mark fixed issues directly from chat.
- **Usage:** The `/debug` workflow can automatically query Sentry for the latest error when a build fails or a user reports a bug.

### ▲ Vercel MCP
**Why:** The CLI is good, but an MCP allows semantic querying of deployment states.
- **Capabilities:**
  - `get_deployment_status`: Check if the latest commit is live.
  - `get_build_logs`: Parse logs for semantic errors (e.g., "Why did the edge function fail?").
  - `list_projects`: Manage env vars across environments.

---

## 3. Priority 2: Feature Enablers (The "Limbs")

These MCPs unlock specific features on the roadmap.

### 💳 Stripe MCP
**Req for:** `Monetization Phase` (Season 2).
- **Why:** Integrating payments is high-risk. An agent that can verify "Is the webhook signature valid?" or "Get the latest test transaction" reduces implementation time.
- **Tools:** `get_customer`, `list_subscriptions`, `verify_webhook_event`.

### 🗺️ Google Maps Platform MCP
**Req for:** `Cardio PvP Duels` & `Territory Conquest`.
- **Why:** Geospatial data is complex.
- **Use Cases:**
  - "Generate a random 5km running route in Stockholm for a PvP duel."
  - "Calculate the elevation gain between Point A and Point B."
- **Tools:** `routes_api`, `elevation_api`, `places_api`.

### 🎵 Spotify/Apple Music MCP (Concept)
**Req for:** `Immersive Training Mode`.
- **Idea:** Control music playback based on workout intensity (Heart Rate Zones).
- **Agent Role:** "Sync user's 'Beast Mode' playlist when HR > 170 bpm."

---

## 4. Operational Strategy

### Security Standard
1.  **Least Privilege:** MCPs should default to `read-only`. Write actions (e.g., `execute_sql`, `deploy`) require explicit user confirmation (human-in-the-loop).
2.  **Environment Variables:** Never hardcode keys in `mcp_config.json`. Use referenced env vars.

### Proposed Workflow Updates
- **/debug**: Update to auto-query **Sentry MCP** for context.
- **/monitor-db**: Update to use **Supabase MCP** for drift detection.
- **/monitor-deploy**: Update to use **Vercel MCP** for deep log analysis.

---

## 5. Next Steps
1.  **Fix Connectivity:** Resolve current connection issues with local MCP servers.
2.  **Configuration:** Create a robust `.env` pattern for MCP credentials.
3.  **Pilot:** Enable `Sentry MCP` as the first new integration to assist with current CI/CD debugging.
