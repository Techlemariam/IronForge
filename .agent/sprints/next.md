# 📅 Sprint Roadmap (26-30)

This document outlines the planned sprints from Sprint 26 through Sprint 30, providing a high-level view of the project trajectory.

---

## Sprint 26: Competitive Evolution

**Period**: 2026-01-24 — 2026-01-31
**Goal**: Launch Arena PvP Seasons and enhance World Events while closing documentation gaps.

| Priority | Item                      | Agent          | Est. | Source        |
| :------- | :------------------------ | :------------- | :--- | :------------ |
| High     | Arena PvP Seasons         | /game-designer | 5h   | roadmap       |
| High     | World Events Enhancement  | /game-designer | 4h   | roadmap       |
| Medium   | Documentation Catch-up    | /librarian     | 3h   | health-report |
| Medium   | Fix Hardcoded Cardio HR   | /titan-coach   | 2h   | DEBT.md       |
| Low      | Leaderboard Consolidation | /ui-ux         | 2h   | ux-audit      |

**Stats**: 5 items | 16h | Debt 30% | Features 55% | Polish 15%

---

## Sprint 27: Campaign & Customization

**Period**: 2026-01-31 — 2026-02-07
**Goal**: Extend Campaign Mode and introduce Citadel Customization.

| Priority | Item                            | Agent           | Est. | Source   |
| :------- | :------------------------------ | :-------------- | :--- | :------- |
| High     | Campaign Mode Enhancement       | /game-designer  | 5h   | roadmap  |
| High     | Housing/Citadel Customization   | /ui-ux          | 4h   | roadmap  |
| Medium   | Build Performance Optimization  | /infrastructure | 3h   | roadmap  |
| Medium   | Cron Job Monitoring             | /infrastructure | 2h   | roadmap  |
| Low      | Micro-animations (Loot Reveals) | /ui-ux          | 2h   | ux-audit |

**Stats**: 5 items | 16h | Debt 30% | Features 55% | Polish 15%

---

## Sprint 28: Monetization & Observability

**Period**: 2026-02-07 — 2026-02-14
**Goal**: Activate Premium Cosmetics Store and improve system observability.

| Priority | Item                                    | Agent           | Est. | Source   |
| :------- | :-------------------------------------- | :-------------- | :--- | :------- |
| High     | Premium Cosmetics Store                 | /game-designer  | 5h   | roadmap  |
| Medium   | Structured Logging (Pino)               | /infrastructure | 3h   | roadmap  |
| Medium   | Database Migration CI Guard Enhancement | /infrastructure | 2h   | roadmap  |
| Medium   | Health Check Endpoint                   | /infrastructure | 1h   | roadmap  |
| Low      | Focus-visible Rings (a11y)              | /ui-ux          | 2h   | ux-audit |

**Stats**: 5 items | 13h | Debt 45% | Features 40% | Polish 15%

---

## Sprint 29: Cardio Expansion & Polish

**Period**: 2026-02-14 — 2026-02-21
**Goal**: Complete Cardio PvP Duels and polish remaining UX debt.

| Priority | Item                                             | Agent          | Est. | Source   |
| :------- | :----------------------------------------------- | :------------- | :--- | :------- |
| High     | Cardio PvP Duels (Finalize)                      | /game-designer | 5h   | roadmap  |
| Medium   | Podcast Integration (Finalize)                   | /coder         | 3h   | roadmap  |
| Medium   | Fix `workouts.ts` Strength Generation            | /game-designer | 2h   | DEBT.md  |
| Medium   | Use `intervals.ts` fields (rampRate, zone_times) | /titan-coach   | 2h   | DEBT.md  |
| Low      | Loading Skeletons                                | /ui-ux         | 2h   | ux-audit |

**Stats**: 5 items | 14h | Debt 30% | Features 55% | Polish 15%

---

## Sprint 30: Stripe & Accessibility

**Period**: 2026-02-21 — 2026-02-28
**Goal**: Integrate Stripe Monetization and complete Accessibility audit.

| Priority | Item                              | Agent           | Est. | Source   |
| :------- | :-------------------------------- | :-------------- | :--- | :------- |
| Critical | Stripe Monetization System        | /infrastructure | 6h   | roadmap  |
| High     | Tutorial Tooltips for Beginners   | /ui-ux          | 3h   | roadmap  |
| Medium   | Accessibility Audit (ARIA labels) | /ui-ux          | 3h   | roadmap  |
| Low      | Modal Focus Trapping              | /ui-ux          | 2h   | ux-audit |
| Low      | Keyboard Shortcuts Polish         | /ui-ux          | 1h   | ux-audit |

**Stats**: 5 items | 15h | Debt 20% | Features 40% | Polish 40%

---

## Summary

| Sprint | Theme                        | Focus                          |
| :----- | :--------------------------- | :----------------------------- |
| 26     | Competitive Evolution        | Arena Seasons, World Events    |
| 27     | Campaign & Customization     | Campaign Mode, Citadel Housing |
| 28     | Monetization & Observability | Cosmetics Store, Logging       |
| 29     | Cardio Expansion             | Cardio Duels, Podcast          |
| 30     | Stripe & Accessibility       | Payments, a11y                 |

**Total Estimated Hours**: 74h across 5 sprints (~15h/sprint avg)
