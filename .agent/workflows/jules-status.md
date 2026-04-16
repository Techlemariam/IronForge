---
description: Monitor Jules autonomous sessions — check status, update active.json, handle stale sessions
---

# /jules-status — Jules Session Monitor

## Purpose

Monitor active Jules sessions, poll their status, and update `.agent/jules/active.json`.
This workflow can be run manually or is called automatically by `/jules-handoff` post-dispatch.

## Usage

```text
/jules-status                    # Show all active sessions
/jules-status [session-id]       # Check specific session
/jules-status --cleanup          # Mark stale sessions + archive completed
```

## Prerequisites

- `JULES_API_KEY` available via Doppler
- `.agent/jules/active.json` exists (bootstrapped by `/jules-handoff`)

---

## Step 1 — Load Active Sessions

Read `.agent/jules/active.json` and parse using the Zod schema:

```typescript
import { julesActiveFileSchema } from '.agent/jules/jules-session.schema';
```

If the file doesn't exist or is empty, report "No active Jules sessions" and exit.

---

## Step 2 — Poll Jules API

For each session with status `dispatched` or `in_progress`:

```text
GET https://api.jules.google.com/v1/sessions/{session-id}
Authorization: Bearer $JULES_API_KEY
```

Map API response to local status:

| API Status | Local Status |
| :--- | :--- |
| `queued` | `dispatched` |
| `running` | `in_progress` |
| `review_requested` | `awaiting_review` |
| `completed` | `completed` |
| `failed` | `failed` |
| `cancelled` | `failed` |

---

## Step 3 — Detect Stale Sessions

A session is **stale** if:

- Status is `dispatched` and age > 30 minutes
- Status is `in_progress` and age > 2 hours
- Status is `awaiting_review` and age > 24 hours

Mark stale sessions with `status: "stale"` in `active.json`.

---

## Step 4 — Check for PRs

For sessions with `awaiting_review` or `completed` status, scan GitHub for PRs:

```text
gh pr list --head jules/{task-id}* --json number,url,state
```

If a PR is found, update the session with `prUrl` and `prNumber`.

---

## Step 5 — Update active.json

Write updated sessions back to `.agent/jules/active.json`:

- Set `lastUpdated` to current ISO timestamp
- Preserve completed sessions for 48 hours, then archive
- Validate against Zod schema before writing

---

## Step 6 — Display Report

Generate a summary table:

```text
┌──────────────────────────────────────────────────────────┐
│ 🤖 JULES SESSION STATUS                                  │
├────────────┬──────────┬───────────────┬──────────────────┤
│ Task       │ Status   │ Branch        │ Age              │
├────────────┼──────────┼───────────────┼──────────────────┤
│ D-12       │ ✅ done  │ jules/D-12-…  │ 45m              │
│ S-03       │ 🔄 run   │ jules/S-03-…  │ 12m              │
│ D-15       │ ⚠️ stale │ jules/D-15-…  │ 3h               │
└────────────┴──────────┴───────────────┴──────────────────┘
```

---

## Step 7 — Cleanup Mode (--cleanup)

When `--cleanup` flag is passed:

1. Archive sessions older than 48 hours to `.agent/jules/archive.json`
2. Remove stale sessions after 3 failed retries
3. Delete local branches for completed sessions: `git branch -D jules/{task-id}*`
4. Report cleanup summary

---

## Error Handling

| Error | Action |
| :--- | :--- |
| Jules API unreachable | Skip poll, report "API offline", keep current status |
| Invalid session ID | Log warning, mark as `failed` with error message |
| active.json parse error | Backup current file, reinitialize empty |
| Rate limited | Wait 30s and retry once, then skip |

---

## Integration Points

| Caller | When |
| :--- | :--- |
| `/jules-handoff` | After dispatch (Step 4: Track) |
| `/night-shift` | End of nightly run to check Jules batch results |
| `/monitor-all` | As part of system health sweep |
| `/claim-task` | Before claiming, to check for conflicts |

---

## Automation

This workflow can run on a cron via GitHub Actions:

```yaml
# Triggered by .github/workflows/jules-monitor.yml
# Schedule: every 15 minutes during active hours
```
