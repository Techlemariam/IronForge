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
if [ -f ROADMAP.md ]; then
  if ! /triage; then
    echo "Triaging failed" >> night-shift.log
    exit 1
  fi
else
  echo "ROADMAP.md missing, skipping triage" >> night-shift.log
fi
```

- **Goal:** Ensure `ROADMAP.md` reflects the latest reality from all monitors.
- **Output:** Updated roadmap sections.

### 2. Deep Performance Scan

```bash
timeout 45m /perf || { echo "Performance scan failed" >> night-shift.log; exit 1; }
```

- **Goal:** Analyze bundle sizes and run Lighthouse checks that take too long for day-time dev.

### 3. Evolution Check

```bash
/evolve --dry-run > evolve_plan.md
if grep -q "BREAKING CHANGE" evolve_plan.md; then
  echo "Evolution has breaking changes, aborting" >> night-shift.log
  exit 1
else
  /evolve --auto-apply
fi
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

## References

- [Night‑Shift Permissions](night-shift-permissions.md)
- [Night‑Shift Log](night-shift.log)
