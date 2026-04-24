# 🔧 Domain: INFRA (Infrastructure & Deployment)

**Owner:** @infrastructure
**Focus:** Deployment, hosting, database, CI/CD, secrets.

## 🏗️ Architecture

### Hosting
- **Server:** Hetzner VPS (cx23) — `77.42.45.229`
- **Orchestration:** Coolify (self-hosted PaaS)
- **Network:** Tailscale VPN for secure access
- **Domain:** Pending DNS migration (using sslip.io placeholder)

### Database
- **Provider:** Supabase (hosted + local CLI for dev)
- **ORM:** Prisma 7.x
- **Known Issues:**
  - `active_sessions` table drift (exists in DB, not in migrations)
  - Mock inventory data due to missing stackable items schema

### CI/CD
- **Three-Tier Pipeline:**
  - L1 (Fast): Lint + Types + Unit Tests on PR (<5m)
  - L2 (Verify): Build + E2E Smoke on push to main (<15m)
  - L3 (Assurance): Security + Exhaustive E2E nightly
- **Jules:** Async AI agent for autonomous fixes
- **Governance Guard:** Audits workflow parity

### Secrets
- **Manager:** Doppler (source of truth)
- **⚠️ CRITICAL:** `prd.json` and `dev.json` contain unmasked production secrets committed to repo. Need immediate rotation and `.gitignore` addition.

## 🚀 Current State

| Component | Status | Notes |
|:---|:---|:---|
| **Production App** | ❌ Down | `http://77.42.45.229.sslip.io` not responding |
| **Local Dev** | ? | Needs verification (`pnpm dev`) |
| **Supabase (Cloud)** | ✅ Active | Supabase project exists |
| **Supabase (Local)** | ? | Docker-based, needs `supabase start` |
| **CI/CD** | 🟡 Partial | CI/CD hell caused dev stall |
| **DNS** | ❌ Pending | No custom domain configured |

## 💡 Insights & Decisions

- **CI/CD hell directly caused productivity collapse.** Alex got stuck, got depressed, stopped both coding AND training. Technical friction has outsized psychological impact for AuDHD.
- **Production not running** means Alex has never actually used IronForge. Priority: get local dev working ASAP so he can interact with his own app.
- **Scaling roadmap** (Phase 1-4 in DEBT.md) is premature — focus on running reliably for 1 user first.
- **Secret exposure** in committed JSON files is a P0 security issue.
