---
name: n8n-monitor
description: Application health monitoring and alerting via n8n
version: 1.0.0
category: automation
owner: "@infrastructure"
platforms: ["windows", "linux", "macos"]
requires: ["remote-trigger"]
---

# 🕵️ n8n-monitor Skill

Provides automated health monitoring and alerting for the IronForge application using n8n workflows.

## Components

- **Monitoring Dashboard**: `monitoring-dashboard.json`. A workflow that checks `/api/health` every 15 minutes.
- **Alerting**: Configurable Discord/Slack alerts on failure.

## Usage

### 1. Setup

- Ensure the `remote-trigger` skill is configured.
- Import `monitoring-dashboard.json` into your n8n instance.

### 2. Configuration

- Set the `HEALTH_ID` or URL to point to your IronForge instance:
  `https://ironforge-coolify.tailafb692.ts.net/api/health`
- Configure the Discord/Slack webhook in the n8n "Alert" node.

## Workflows Included

| File | Description |
|:-----|:------------|
| `monitoring-dashboard.json` | 15-minute interval health check and alerting. |

## Integration

This skill works best when combined with the `remote-trigger` skill, allowing for automated recovery workflows (like triggering `/night-shift` or `/ci-doctor`) if a health check fails.
