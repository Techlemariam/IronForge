---
description: "Workflow for monitor-growth"
command: "/monitor-growth"
category: "monitoring"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@strategist"
domain: "business"
---
# 📈 Growth & Revenue Engine Monitor

**Purpose:** Track progress towards the "Passive Income" Business Triggers defined in `ROADMAP.md`. Bridge the gap between *building* features and *acquiring* users.

## 1. Business Trigger Status
Check the core metrics required to activate monetization (Phase 2).

| Trigger | Target | Current Status Source |
|---------|--------|-----------------------|
| **Traction** | 100 Recurring Users | `SELECT count(*) FROM User WHERE lastLogin > 7_days_ago` |
| **Retention** | > 20% | Growth Dashboard / Analytics |
| **Demand** | Explicit "Can I pay?" | Discord / Support Emails |
| **Cost** | > 500 SEK/mo | Vercel/Supabase Billing |

## 2. Acquisition & SEO Health
Ensure the platform is discoverable and accessible.

```bash
## Check SEO basics
cat public/robots.txt
cat public/sitemap.xml
rg "<meta name=\"description\"" src/app/layout.tsx
rg "SpeedInsights" src/app/layout.tsx # Check performance monitoring status

## Check Landing Page existence
ls src/app/page.tsx src/components/marketing/
```
- **Config**: Add `rg` and `ls` to `.agent/config.json`.

## 3. Platform Reach Audit (Retention Drivers)
Verify widespread availability to maximize user retention, per `docs/PLATFORM_MATRIX.md`.

- **Mobile (PWA):** Is the install prompt visible? `rg "beforeinstallprompt" src/`
- **TV Mode:** Is the HUD optimized? `rg "tv-mode" src/`
- **Desktop:** Is the "Power User" dashboard fully functional?

## 4. Funnel Gaps
Identify where users are dropping off.

- [ ] **Onboarding:** Is `FirstLoginQuest` completion < 50%?
- [ ] **Activation:** Do users log a workout within 24h?
- [ ] **Social:** Do users have > 0 Friends?

## 5. Output Format
Generate a **Growth Health Report**:

```markdown
## 📈 GROWTH HEALTH REPORT: [Date]

### 💰 Path to Passive Income
- **Recurring Users:** [Count] / 100
- **Retention:** [Rate]%
- **Monetization Status:** ⏸️ PAUSED (Waiting for triggers)

### 🌍 Platform Reach
- **Mobile PWA:** [Status]
- **TV Mode:** [Status]
- **Desktop:** [Status]

### 🚨 Critical Growth Gaps
1. [Gap 1] (e.g., "No Landing Page")
2. [Gap 2] (e.g., "TV Mode Broken")

### ✅ Recommended Actions
- [ ] [Action 1]
- [ ] [Action 2]
```


## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata