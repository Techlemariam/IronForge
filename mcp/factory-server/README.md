# IronForge Factory MCP Server

Model Context Protocol (MCP) server for orchestrating autonomous workflows in the IronForge project using Antigravity's native quota system.

## Overview

This MCP server enables GitHub Actions and Antigravity to trigger autonomous workflows (like `/night-shift`, `/cleanup`, `/polish`) while leveraging Antigravity's enterprise-level quota instead of custom Gemini API keys.

## Features

- **Antigravity Integration**: Signals Antigravity via task files to execute workflows using its native quota
- **Quota Monitoring**: Tracks usage for analytics (monitoring only, not enforcement)
- **Fallback Mechanism**: Automatically falls back to GitHub Actions when Antigravity is unavailable
- **Health Checks**: Validates runner and environment health
- **MCP Tools**: Exposes tools for quota status, workflow triggering, and health monitoring

## Architecture

```
GitHub Actions → Self-Hosted Runner → MCP Server → Task Signal → Antigravity
                                          ↓ (fallback)
                                    GitHub Actions workflow_dispatch
```

## Installation

### Prerequisites

- Node.js 18+
- TypeScript
- Antigravity installed and configured
- GitHub repository access

### Build

```bash
cd mcp/factory-server
npm install
npm run build
```

### Configuration

Add to Antigravity's `mcp_config.json`:

```json
{
  "mcpServers": {
    "ironforge-factory": {
      "command": "node",
      "args": [
        "c:/Users/alexa/Workspaces/IronForge/mcp/factory-server/build/index.js"
      ],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}",
        "REPO_OWNER": "Techlemariam",
        "REPO_NAME": "IronForge"
      }
    }
  }
}
```

Restart Antigravity to load the MCP server.

## MCP Tools

### `get_quota_status`

Returns current Antigravity quota usage for monitoring.

**Input**: None

**Output**:

```
📊 Antigravity Quota Status (Monitoring)

Source: antigravity
Status: Healthy
Used Today: 42
Remaining: 9958
Usage: 0%

Note: This is for monitoring only. Antigravity manages its own quota system with enterprise-level limits.
```

### `check_runner_health`

Executes health check script for self-hosted runners.

**Input**: None

**Output**: Health check results from PowerShell script

### `trigger_autonomous_workflow`

Triggers an autonomous workflow via Antigravity or GitHub Actions fallback.

**Input**:

```json
{
  "workflow": "night-shift",  // Options: night-shift, polish, git-hygiene, cleanup, debt-attack, security, sprint-auto
  "model": "gemini-2.5-flash"  // Options: gemini-2.5-flash, gemini-2.5-pro
}
```

**Output** (Antigravity available):

```
✅ Antigravity available. Task signal written to .agent/tasks/current.md

Workflow: night-shift
Model: gemini-2.5-flash

Antigravity will execute this using its native quota system.
```

**Output** (Antigravity unavailable):

```
⚠️ Antigravity unavailable. Triggered fallback via GitHub Actions workflow_dispatch.

Workflow: autonomous-night-shift.yml
Model: gemini-2.5-flash

Check GitHub Actions for execution status.
```

## Usage

### From Antigravity

In an Antigravity chat, call the MCP tool:

```
Use the trigger_autonomous_workflow tool with:
- workflow: "cleanup"
- model: "gemini-2.5-flash"
```

### From GitHub Actions

Use the `autonomous-antigravity-trigger.yml` workflow:

```yaml
- name: Trigger Workflow
  uses: actions/github-script@v7
  with:
    script: |
      await github.rest.actions.createWorkflowDispatch({
        owner: 'Techlemariam',
        repo: 'IronForge',
        workflow_id: 'autonomous-antigravity-trigger.yml',
        ref: 'main',
        inputs: {
          workflow: 'night-shift',
          model: 'gemini-2.5-flash'
        }
      });
```

### From External Systems (n8n)

HTTP Request to GitHub API:

```json
{
  "method": "POST",
  "url": "https://api.github.com/repos/Techlemariam/IronForge/actions/workflows/autonomous-antigravity-trigger.yml/dispatches",
  "headers": {
    "Authorization": "Bearer YOUR_GITHUB_TOKEN",
    "Accept": "application/vnd.github+json"
  },
  "body": {
    "ref": "main",
    "inputs": {
      "workflow": "cleanup",
      "model": "gemini-2.5-flash"
    }
  }
}
```

## How It Works

### 1. Antigravity Available Path

1. MCP tool receives trigger request
2. Checks if `.agent/tasks` directory exists (indicates Antigravity availability)
3. Writes task signal to `.agent/tasks/current.md`:

   ```markdown
   # Autonomous Mission: night-shift
   Model: gemini-2.5-flash
   Triggered via MCP at 2026-02-16T23:30:00Z
   
   ## Instructions
   Execute the `/night-shift` workflow using the gemini-2.5-flash model.
   
   This task was triggered by the ironforge-factory MCP server and should use Antigravity's native quota system.
   ```

4. Antigravity picks up the task signal
5. Executes workflow using its native quota
6. Usage tracked for monitoring (not enforcement)

### 2. Fallback Path

1. MCP tool receives trigger request
2. Antigravity unavailable (`.agent/tasks` doesn't exist)
3. Falls back to GitHub Actions `workflow_dispatch`
4. Triggers `autonomous-{workflow}.yml` workflow
5. Workflow runs on GitHub-hosted or self-hosted runner

## Quota System

### Monitoring vs. Enforcement

**Previous Behavior** (Custom API):

- Tracked quota against 1,500 RPD limit
- Blocked execution when quota reached "Critical" status
- Required manual quota management

**Current Behavior** (Antigravity):

- Tracks usage for monitoring only (10,000+ monitoring threshold)
- Never blocks execution (Antigravity manages its own quota)
- Automatic quota management by Antigravity

### Quota Tracking File

Location: `.agent/quota_usage.json`

```json
{
  "date": "2026-02-16",
  "count": 42
}
```

**Purpose**: Analytics and visibility, not enforcement

## Development

### Project Structure

```
mcp/factory-server/
├── src/
│   ├── index.ts           # Main MCP server implementation
│   └── quota-manager.ts   # Quota tracking (monitoring only)
├── build/                 # Compiled JavaScript
├── package.json
└── tsconfig.json
```

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Testing

```bash
# Start MCP server locally
node build/index.js

# Test with MCP inspector or client
```

## Troubleshooting

### MCP Server Not Loading

**Symptoms**: Tools not available in Antigravity

**Solutions**:

1. Rebuild server: `npm run build`
2. Check `mcp_config.json` has correct path
3. Restart Antigravity
4. Check Antigravity logs for MCP errors

### Task Signal Not Picked Up

**Symptoms**: Task file remains in `.agent/tasks/current.md`

**Solutions**:

1. Verify Antigravity is running
2. Check file permissions on `.agent/tasks`
3. Restart Antigravity to reload MCP servers
4. Verify MCP server is registered

### Fallback Always Triggered

**Symptoms**: Always uses GitHub Actions, never Antigravity

**Solutions**:

1. Verify `.agent/tasks` directory exists
2. Check MCP server has access to project directory
3. Ensure server is built and running
4. Test with `get_quota_status` tool

## Documentation

- [Antigravity Quota Strategy](../../docs/ANTIGRAVITY_QUOTA_STRATEGY.md) - Architecture and benefits
- [Self-Hosted Runner Setup](../../docs/SELF_HOSTED_RUNNER_SETUP.md) - Step-by-step setup guide

## License

Part of the IronForge project.
