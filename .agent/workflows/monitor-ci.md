---
description: Monitor CI/CD Workflows
command: /monitor-ci
category: monitor
trigger: manual
---
# CI/CD Monitoring Workflow

This workflow describes how to monitor and debug CI/CD runs using the GitHub CLI (`gh`).

## 1. List Recent Runs
View the status of the most recent pipeline runs.

```bash
gh run list --limit 5
```
- **Config**: Ensure `gh` is in `.agent/config.json`.

## 2. Check Sentry (MCP)
// turbo
If `SENTRY_AUTH_TOKEN` is configured, use the agent's tools to fetch the latest issue details.
- Query: "Get latest issue for project ironforge-rpg"

## 3. Analyze Failure Logs
If a job fails, extract relevant logs to diagnose the issue.
Get a summary of jobs and steps for a specific run.

```bash
gh run view <RUN_ID>
```

## 4. Analyze Failure Logs
If a job fails, extract relevant logs to diagnose the issue.

```bash
# View failed jobs only
gh run view <RUN_ID> --log-failed

# Search for specific errors in the log (PowerShell)
gh run view <RUN_ID> --log-failed | findstr /C:"Error" /C:"fail"
```

## 5. Rerun Failed Jobs
Trigger a rerun for failed jobs in the workflow.

```bash
gh run rerun <RUN_ID> --failed
```

## 6. Check Database Migrations (Prisma)
If `DB Guard` fails, it often indicates a schema drift.

```bash
# Check status of migrations against a live DB
npx prisma migrate status

# Resolve a failed migration (mark as applied)
npx prisma migrate resolve --applied <MIGRATION_NAME>
```

---
**Tip:** Use `gh run view --web` to open the run in your browser for a better visual overview.

---

## 7. Common CI/CD Failures & Solutions

### Vercel Deployment Failures

#### Deprecated `--preview` Flag
**Error:** `Error: unknown or unexpected option: --preview`

**Cause:** Vercel CLI v50+ removed the `--preview` flag.

**Solution:**
```yaml
# Old (failing)
vercel deploy --preview --token=${{ secrets.VERCEL_TOKEN }}

# New (correct)
vercel deploy --token=${{ secrets.VERCEL_TOKEN }}
```

#### Missing Environment Variables in Preview
**Error:** `Invalid environment variables: { DATABASE_URL: [ 'Required' ] }`

**Cause:** Vercel preview builds don't inherit GitHub Actions env vars.

**Solutions:**
1. Configure env vars in Vercel Dashboard for "Preview" environment
2. Skip preview deployments for certain PRs:
```yaml
if: github.event_name == 'pull_request' && github.base_ref != 'main'
```

### GitHub Permissions Errors

#### Release Creation Fails with 403
**Error:** `GitHub release failed with status: 403`

**Cause:** Missing workflow permissions.

**Solution:** Add to workflow file:
```yaml
permissions:
  contents: write
  pull-requests: read
```

### Dependabot PR Failures

#### Analyze Dependabot PR Checks
```bash
# View PR checks status
gh pr checks <PR_NUMBER>

# View specific run for Dependabot PR
gh run view <RUN_ID> --log-failed
```

**Common Issues:**
- **Breaking changes** in package updates (e.g., Tailwind CSS v3 → v4)
- **Old workflow configurations** not yet synced from main
- **Missing environment variables** in test setup

#### Rebase Dependabot PR
```bash
# Comment on PR to trigger rebase
# Comment on PR to trigger rebase
gh pr comment <PR_NUMBER> --body "@dependabot rebase"
```

### Build Failures

#### PostCSS Plugin Errors
**Error:** `It looks like you're trying to use 'tailwindcss' directly as a PostCSS plugin`

**Cause:** Package version mismatch (e.g., Tailwind CSS v4 requires `@tailwindcss/postcss`).

**Solution:** Check package documentation for migration guides.

### E2E Test Failures

#### WebServer Timeout
**Error:** `Timed out waiting 120000ms from config.webServer`

**Cause:** Dev server failed to start due to missing env vars or build errors.

**Solution:**
1. Check that test environment has required env vars
2. Verify build succeeds locally: `pnpm run build`
3. Check Playwright config for proper env setup

