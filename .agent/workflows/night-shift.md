---
description: "Workflow for night-shift"
command: "/night-shift"
category: "meta"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "meta"
---
# 🌙 The Night Shift

**Role:** The Nightly Janitor.
**Goal:** Perform time-consuming maintenance while the team sleeps.

## Protocol

### 1. Roadmap Triage
```bash
/triage
```
- **Goal:** Ensure `ROADMAP.md` reflects the latest reality from all monitors.
- **Output:** Updated roadmap sections.

### 2. Deep Performance Scan
```bash
/perf
```
- **Goal:** Analyze bundle sizes and run Lighthouse checks that take too long for day-time dev.

### 3. Evolution Check
```bash
/evolve --auto-apply
```
- **Goal:** Optimize tokens and archive unused workflows automatically.

### 4. Conservative Debt Attack
```bash
/debt-attack 1
```
- **Goal:** Try to fix **one** low-risk debt item.
- **Constraint:** Must use Strict Mode (revert on any failure).
- **Config**: Ensure all maintenance tools are allowed in `.agent/config.json`.

### 5. Morning Briefing
Generate `DAILY_BRIEF.md`:
```markdown
## ☀️ Morning Briefing for [Date]

## Nightly Actions
- 🧹 Debt Fixed: [Item] (or "None")
- 🚀 Perf Check: [Result]
- 🗺️ Roadmap: [Updates]

## Suggested Focus Today
[Top 3 Items from Roadmap]
```


## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata