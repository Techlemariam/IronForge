---
description: Monitor CI/CD Workflows
---
# CI/CD Monitoring Workflow

This workflow describes how to monitor and debug CI/CD runs using the GitHub CLI (`gh`).

## 1. List Recent Runs
View the status of the most recent pipeline runs.

```bash
gh run list --limit 5
```

## 2. Monitor a Specific Run
Watch the progress of a currently running workflow.

```bash
# Get the Run ID from the list command above
gh run watch <RUN_ID>
```

To exit watch mode, press `Ctrl+C`.

## 3. View Run Details
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
