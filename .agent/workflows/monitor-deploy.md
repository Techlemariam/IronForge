---
description: Monitor Vercel Deployments
command: /monitor-deploy
category: monitor
trigger: manual
---
# Deployment Monitoring Workflow

This workflow describes how to monitor, inspect, and debug Vercel deployments using the Vercel CLI.

## 1. List Recent Deployments
View the status of recent deployments to production and preview environments.

```bash
npx vercel list --limit 5
```
- **Config**: ensure `npx vercel` is allowed in `.agent/config.json`.

## 2. Inspect a Deployment
Get detailed information about a specific deployment, including build configuration and routes.

```bash
# Inspect by URL or ID
npx vercel inspect <DEPLOYMENT_URL_OR_ID>
```

## 3. Analyze Logs (MCP)
// turbo
If `VERCEL_TOKEN` is configured, use the agent's tools to fetch build logs directly.
- Query: "Get build logs for latest deployment"
Stream runtime logs from a specific deployment (or the latest production one).

```bash
# Stream production logs
npx vercel logs production

# Stream logs from a specific deployment
npx vercel logs <DEPLOYMENT_URL>
```

## 4. Check Deployment Status (CI)
If a deployment fails in GitHub Actions but isn't clear why, check the Vercel build logs directly.

```bash
# View build logs for the latest deployment
npx vercel logs --build
```
