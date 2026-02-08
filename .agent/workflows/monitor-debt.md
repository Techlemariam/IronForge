---
description: "Workflow for monitor-debt"
command: "/monitor-debt"
category: "monitoring"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "core"
skills: ["debt-scanner"]
---

# 🕵️ Debt Monitor

**Role:** Codebase Scanner.
**Goal:** Identify hidden technical debt and ensure it's tracked in `DEBT.md`.

## Protocol

### 1. Scan for Markers

Search key areas for common debt indicators.

```bash
## 1. Type Safety Bypasses
rg ": any|as any" src/ --line-number

## 2. Suppression Comments
rg "@ts-ignore|@ts-expect-error|eslint-disable" src/ --line-number

## 3. Explicit Intent Markers
rg "TODO|FIXME|HACK|REF" src/ --line-number
```

- **Config**: Add `rg` (ripgrep) to `.agent/config.json` if missing.

### 2. Verify Against DEBT.md

1. **Read** `DEBT.md`.
2. **Compare**: For each finding, check if a corresponding entry exists.
   - _Note:_ Be smart. If `DEBT.md` has "Fix all 'any' types in src/utils", consider individual hits in `src/utils/*.ts` as tracked.

### 3. Log New Debt

If found items are **NOT** tracked:

1. **Format Entry**:

   ```markdown
   | YYYY-MM-DD | `src/path/to/file` | [Type] Description of debt | @cleanup | 🔴 Open |
   ```

   **Types:**
   - `[Safety]`: `any`, `ts-ignore` usage.
   - `[Logic]`: `TODO`, `FIXME` indicating missing logic.
   - `[Style]`: Extensive ESLint disables.

2. **Append** to `DEBT.md` (preserve table formatting).

### 4. Output Summary

```
┌───────────────────────────────────────┐
│ 🕵️ DEBT MONITOR REPORT                │
│ Found: [N] Total Markers              │
│ New:   [M] Added to DEBT.md           │
└───────────────────────────────────────┘
```

## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
