---
description: "Trigger Jules sessions remotely via n8n, GitHub Actions, or CLI"
command: "/jules-dispatch"
category: "automation"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
domain: "meta"
skills: ["remote-trigger", "n8n"]
flags:
  - "--dry-run"
  - "--batch"
---

# 📡 Jules Dispatch (Remote Trigger)

**Role:** Programmatic Jules session creation.
**Goal:** Enable n8n, night-shift, CI, and remote systems to dispatch tasks to Jules without human interaction.

---

## Usage

```bash
# Via workflow command
/jules-dispatch debt D-12
/jules-dispatch debt --batch 3        # Top 3 debt items
/jules-dispatch prompt "Add JSDoc to all exported functions in src/services/"

# Via GitHub CLI (remote trigger)
gh workflow run remote-trigger.yml \
  -f workflow="/jules-dispatch" \
  -f args="debt --batch 2"

# Via n8n webhook
POST https://n8n.ironforge.dev/webhook/jules-dispatch
{ "source": "debt", "batch": 3 }
```

---

## Step 1: Resolve Tasks

### From DEBT.md (most common)

```bash
# Read and sort debt items
cat DEBT.md
```

1. Parse `DEBT.md` for unclaimed `[ ]` items
2. Sort by priority: `[Critical]` > `[High]` > `[Medium]`
3. Filter out items with `[🤖]` marker (already delegated)
4. Select top `[batch]` items (default: 1)

### From Free Prompt

Use the prompt directly — skip resolution.

---

## Step 2: Safety Validation (Automated)

For **each** resolved task, run automated checks:

// turbo

```bash
# Check for active Jules sessions on same items
if [ -f ".agent/jules/active.json" ]; then
  cat .agent/jules/active.json
fi

# Check for conflicting PRs
gh pr list --state open --json headRefName,title --jq '.[] | "\(.headRefName): \(.title)"'
```

**Auto-skip rules:**

- Task already has `[🤖]` marker → skip
- Matching active Jules session → skip
- Overlapping open PR exists → skip
- Task touches auth/security/CI files → skip (requires human review)

---

## Step 3: Batch Dispatch

For each validated task:

### 3.1 Generate Prompt

Use the same template as `/jules-handoff` Step 2.2 but in **minimal mode** (less context, faster generation):

```markdown
## Task
[Task title]

## Files
[File list from DEBT.md reference]

## Requirements
- Fix the issue described above
- All tests must pass: `pnpm test`
- No TypeScript errors: `pnpm typecheck`
- Follow existing code patterns
```

### 3.2 Create Jules Session

```bash
doppler run --project ironforge --config dev -- \
  curl -s -X POST https://jules.google.com/api/v1alpha/sessions \
  -H "Authorization: Bearer $JULES_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "Techlemariam/IronForge",
    "branch": "jules/[task-id]",
    "prompt": "[generated-prompt]"
  }'
```

### 3.3 Track

Append to `.agent/jules/active.json` (create if missing).

---

## Step 4: Report

Generate dispatch summary:

```text
┌─────────────────────────────────────┐
│ 📡 JULES DISPATCH REPORT            │
│ Dispatched: [N]                     │
│ Skipped:    [S] (conflicts/active)  │
│ Failed:     [F]                     │
├─────────────────────────────────────┤
│ Sessions:                           │
│   D-12 → jules/D-12-hevy (#abc123) │
│   D-15 → jules/D-15-types (#def456)│
└─────────────────────────────────────┘
```

---

## Night-Shift Integration

To use from `/night-shift`, add to Phase 2:

```bash
# 2.4 Jules Delegation (optional, replaces debt-attack)
if [ "$USE_JULES" = "true" ]; then
  /jules-dispatch debt --batch 2
  DEBT_RESULT="Delegated to Jules ($(cat .agent/jules/active.json | jq '.sessions | length') sessions)"
else
  /debt-attack 1 --strict
fi
```

Enable by setting `USE_JULES=true` in the night-shift invocation or as a Doppler config flag.

---

## n8n Webhook Integration

### Webhook Endpoint

Create an n8n workflow with:

1. **Webhook trigger**: `POST /webhook/jules-dispatch`
2. **Validate**: Check `Authorization` header against `REMOTE_TRIGGER_SECRET`
3. **Execute**: Call GitHub `repository_dispatch` with:

   ```json
   {
     "event_type": "remote-trigger",
     "client_payload": {
       "workflow": "/jules-dispatch",
       "args": "debt --batch 2",
       "token": "$REMOTE_TRIGGER_SECRET"
     }
   }
   ```

### Scheduled Dispatch (Cron via n8n)

Set up a nightly cron (e.g., 03:00 UTC) in n8n to auto-dispatch safe debt items:

```text
Schedule → Webhook POST → Jules Dispatch → Slack/Discord Notification
```

---

## Version History

### 1.0.0 (2026-03-04)

- Initial release
- Batch dispatch support for DEBT.md items
- Safety validation with auto-skip rules
- Night-shift integration instructions
- n8n webhook + cron integration
