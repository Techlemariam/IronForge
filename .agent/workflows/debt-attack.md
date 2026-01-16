---
description: "Workflow for debt-attack"
command: "/debt-attack"
category: "execution"
trigger: "manual"
version: "1.2.0"
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

### 0. Pre-Execution Safety Checks

**CRITICAL:** Verify no conflicts before starting work.

1. **Check Open PRs:**

   ```bash
   # List all open PRs with their titles and file changes
   gh pr list --state open --json number,title,files
   ```

   - **Extract** file paths from PR changes.
   - **Compare** against files referenced in selected debt items.
   - **IF MATCH**: Skip that debt item and log `⏭️ Skipped (PR #N in progress)` in console.

2. **Check Feature Branches:**

   ```bash
   # List all branches except main and current branch
   git branch -r | grep -v 'main\|HEAD'
   ```

   For each branch:

   ```bash
   # Get recent commits and file changes on each branch
   git log origin/<branch> --since="7 days ago" --name-only --pretty=format:"%s"
   ```

   - **Search** commit messages for debt item keywords (e.g., file path, description).
   - **IF MATCH**: Skip that debt item and log `⏭️ Skipped (work in progress on branch <branch>)`.

3. **Fallback Check (GitHub Search):**

   ```bash
   # Search for related issues/PRs mentioning the debt item
   gh search issues "[debt item description or file path]" --state open
   ```

   - **IF FOUND**: Review manually and decide to skip or proceed.

4. **Validation:**
   - **IF** all selected items are skipped: Exit workflow with message "No available debt items to fix (all in progress)".
   - **ELSE**: Proceed with available items.

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

5. **Link to GitHub Issue** (if exists):

   ```bash
   # Search for related issue
   gh issue list --search "[debt item description]" --limit 1
   
   # Add fix reference to issue
   gh issue comment #N --body "Fixed in commit $(git rev-parse --short HEAD)"
   
   # Close issue if this was the only fix needed
   gh issue close #N --reason completed
   ```

6. **Create PR** (after batch complete):
   - Run `/pre-pr` to push and create PR.
   - Wait for CI before continuing.

### 3. Reporting

Summary at end of run:

```text
┌───────────────────────────────────────┐
│ 🦾 DEBT ATTACK REPORT                 │
│ Attempted: [N]                        │
│ Success:   [S]                        │
│ Failed:    [F] (Reverted)             │
└───────────────────────────────────────┘
```

## Version History

### 1.2.0 (2026-01-16)

- Added **Pre-Execution Safety Checks** to prevent conflicts:
  - Validates no open PRs are working on selected debt items
  - Checks feature branches for ongoing work on same items
  - Fallback GitHub search for related issues/PRs
  - Skips conflicting items automatically

### 1.1.0 (2026-01-14)

- Added `/pre-pr` step after debt fixes

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
