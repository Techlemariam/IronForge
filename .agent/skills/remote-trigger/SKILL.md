---
name: remote-trigger
description: Remote workflow triggering via n8n, Moltbot, or API
version: 1.0.0
category: automation
owner: "@infrastructure"
platforms: ["windows", "linux", "macos"]
requires: []
---

# 🎯 Remote Trigger Skill

Enables triggering IronForge agent workflows from external systems like n8n, Moltbot, Slack, or any HTTP client.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    n8n      │     │   Moltbot   │     │   Slack     │
│  Workflow   │     │   Discord   │     │  Workflow   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  GitHub API            │
              │  repository_dispatch   │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  remote-trigger.yml    │
              │  GitHub Action         │
              └────────────────────────┘
```

## Usage

### 1. Via GitHub CLI

```bash
gh workflow run remote-trigger.yml \
  -f workflow="/night-shift" \
  -f branch="main" \
  -f dry_run="false"
```

### 2. Via cURL (repository_dispatch)

```bash
curl -X POST \
  -H "Authorization: token $GITHUB_PAT" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/dispatches \
  -d '{
    "event_type": "remote-trigger",
    "client_payload": {
      "workflow": "/health-check",
      "branch": "main",
      "token": "$REMOTE_TRIGGER_SECRET"
    }
  }'
```

### 3. Via n8n Webhook

See `n8n-workflow.json` in this directory for a ready-to-import workflow.

### 4. Via Moltbot (Discord/Slack)

```
/ironforge run /night-shift
/ironforge run /health-check --dry-run
/ironforge deploy preview
```

## Available Workflows

| Command | Description |
|:--------|:------------|
| `/night-shift` | Autonomous nightly maintenance |
| `/health-check` | System diagnostics |
| `/debug` | Error analysis |
| `/monitor-all` | Run all monitors |
| `/triage` | Priority assessment |
| `/evolve` | Dependency updates |
| `/ci-doctor` | CI failure resolution |

## Security

1. **REMOTE_TRIGGER_SECRET**: Add to GitHub Secrets. Include in `client_payload.token` for repository_dispatch.
2. **GITHUB_PAT**: Personal Access Token with `repo` and `workflow` scopes.
3. **Tailscale**: Keep n8n/Moltbot behind Tailscale network.

## Setup

1. Add `REMOTE_TRIGGER_SECRET` to GitHub Secrets
2. Add `GITHUB_PAT` to n8n credentials
3. Import `n8n-workflow.json` to your n8n instance
4. Configure Moltbot webhook (see `moltbot-config.md`)
