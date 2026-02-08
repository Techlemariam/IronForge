---
description: "Emergency rollback workflow"
command: "/rollback"
category: "ops"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
skills: ["coolify-deploy", "error-analyzer"]
inputs:
  target:
    description: "Target deployment ID or 'previous'"
    default: "previous"
---

# 🔄 Rollback Workflow

**Purpose:** Emergency procedure to revert the production environment to a previous stable state.

## Protocol

1. **Acknowledge Issue**
   - Verify error spike via `/monitor-logs service:sentry` (or Check Sentry dashboard).
   - Confirm active incident.

2. **Execute Rollback**
   - This workflow triggers the Coolify API to switch the active container to the previous build.

   ```bash
   # In terminal (mock command for Coolify skill)
   curl -X POST "$COOLIFY_URL/api/v1/applications/$COOLIFY_APP_ID/rollback" \
     -H "Authorization: Bearer $COOLIFY_API_TOKEN"
   ```

3. **Verify Stability**
   - Wait 30s-60s for container restart.
   - Run `/health-check` to verify endpoint response.

4. **Post-Mortem**
   - Create a `hotfix` branch from the `main` branch state *before* the bad merge.
   - Investigate root cause with `/debug`.

## Automation

This workflow is also automated via `.github/workflows/sentry-rollback.yml` which listens for `sentry-alert` repository dispatch events.
