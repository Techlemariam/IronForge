---
description: "Workflow for debt-attack"
command: "/debt-attack"
category: "execution"
trigger: "manual"
version: "1.1.0"
telemetry: "enabled"
primary_agent: "@cleanup"
domain: "core"
---

# 🦾 Debt Attack (The Terminator)

**Role:** Autonomous Refactorer.
**Goal:** Reduce technical debt by systematically executing items from `DEBT.md`.

## Usage

```bash
/debt-attack [limit]
## Example: /debt-attack 3 (Fixes top 3 priority items)
```

## Protocol

### 1. Target Acquisition

1. **Read** `DEBT.md`.
2. **Sort** items by:
   - Priority 1: `[Critical]` / `[High]` / `[Safety]`
   - Priority 2: Oldest date
3. **Select** top `[limit]` items (default: 1).

### 2. Execution Loop

For each selected item:

1. **Context Loading**:
   - Read the file referenced.
   - Use `/cleanup` logic (or call `/cleanup` directly if supported) to devise a fix.

2. **Fix Application**:
   - Apply the fix.
   - **Constraint**: Must be a minimal, safe change.

3. **Validation (Critical)**:

   ```bash
   npm run agent:verify
   ```

   - **IF FAIL**: Revert changes immediately (`git restore .`). Log "Failed verification" in `DEBT.md` for that item.
   - **IF PASS**: Commit (`fix: resolve debt in [file]`).
   - **Config**: Update `.agent/config.json` if validation commands fail.

4. **Update Ledger**:
   - Mark item as `✅ Resolved` in `DEBT.md`.

5. **Create PR** (after batch complete):
   - Run `/pre-pr` to push and create PR.
   - Wait for CI before continuing.

### 3. Reporting

Summary at end of run:

```
┌───────────────────────────────────────┐
│ 🦾 DEBT ATTACK REPORT                 │
│ Attempted: [N]                        │
│ Success:   [S]                        │
│ Failed:    [F] (Reverted)             │
└───────────────────────────────────────┘
```

## Version History

### 1.1.0 (2026-01-14)

- Added `/pre-pr` step after debt fixes

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
