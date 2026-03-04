# Self-Hosted Runner Setup for Antigravity

This guide walks you through setting up a self-hosted GitHub Actions runner with Antigravity integration for executing autonomous workflows.

## Prerequisites

- Hetzner VPS managed via Coolify (IronForge primary environment)
- Doppler CLI installed (`doppler run`)
- GitHub repository admin access
- PowerShell 7+
- A valid GitHub Personal Access Token (`GH_PAT`) in Doppler

## Architecture

The IronForge self-hosted runners are run as **Ephemeral Docker Containers** via Coolify on the Hetzner VPS. Three discrete services (`github-runners`, `github-runners-2`, `github-runners-3`) run continuously in `Restart policy: always`.
Using `EPHEMERAL=true` allows runners to automatically tear down and start fresh after every job, eliminating configuration conflicts.

## Step 1: Install Antigravity

If you haven't already installed Antigravity:

1. Download Antigravity from the official source
2. Install to default location or custom path
3. Verify installation:

```powershell
# Check if Antigravity is accessible
Test-Path "$env:USERPROFILE\.gemini\antigravity"
```

## Step 2: Configure MCP Server

### 2.1 Verify MCP Configuration

Check that `ironforge-factory` MCP server is registered:

```powershell
# View MCP config
Get-Content "$env:USERPROFILE\.gemini\antigravity\mcp_config.json" | ConvertFrom-Json | Select-Object -ExpandProperty mcpServers | Select-Object -ExpandProperty "ironforge-factory"
```

Expected output:

```json
{
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
```

### 2.2 Build MCP Server

```powershell
cd C:\Users\alexa\Workspaces\IronForge\mcp\factory-server
npm install
npm run build
```

### 2.3 Test MCP Server

Restart Antigravity and verify the MCP server is loaded:

1. Close Antigravity completely
2. Reopen Antigravity
3. In a new chat, check available MCP tools:
   - `get_quota_status`
   - `check_runner_health`
   - `trigger_autonomous_workflow`

## Step 3: Deploy Runners via Coolify API

Instead of manually configuring a Windows service, we deploy 3 ephemeral runners via Docker Compose to the Hetzner VPS directly through the Coolify API.

### 3.1 Verify Doppler Secrets

Ensure the following secrets are present in your Doppler `prd` config:

- `COOLIFY_API_TOKEN`: Token for Coolify API access
- `GH_PAT`: GitHub Personal Access Token with repo access

### 3.2 Run the Deploy Script

```powershell
# Create the services in Coolify (only run once)
doppler run --project ironforge --config prd -- pwsh scripts/coolify-deploy-runners.ps1 -Action create

# Start the services
doppler run --project ironforge --config prd -- pwsh scripts/coolify-deploy-runners.ps1 -Action start

# Check status of the runners
doppler run --project ironforge --config prd -- pwsh scripts/coolify-deploy-runners.ps1 -Action status
```

You can view the specific Docker Compose layout in `docker-compose.runners.yml`.

## Step 4: Configure Environment Variables

### 4.1 Set Required Environment Variables

The runner inherits environment variables from Coolify (injected via Doppler if needed). Ensure `GH_PAT` mapping is intact in the compose file.

### 4.2 Verify Environment Access

Create a test workflow to verify environment variables:

```yaml
name: Test Self-Hosted Runner
on: workflow_dispatch

jobs:
  test:
    runs-on: self-hosted
    steps:
      - name: Check Environment
        run: |
          Write-Output "Checking environment..."
          if ($env:GITHUB_TOKEN) { Write-Output "✅ GITHUB_TOKEN set" }
          if (Test-Path "$env:USERPROFILE\.gemini\antigravity") { Write-Output "✅ Antigravity found" }
          if (Test-Path ".agent\tasks") { Write-Output "✅ Task directory found" }
        shell: pwsh
```

## Step 5: Test Antigravity Integration

### 5.1 Manual Workflow Trigger

1. Go to GitHub Actions tab
2. Select **Autonomous Antigravity Trigger** workflow
3. Click **Run workflow**
4. Select:
   - Workflow: `cleanup`
   - Model: `gemini-2.5-flash`
5. Click **Run workflow**

### 5.2 Verify Execution

Check the workflow logs for:

```sh
✅ Antigravity MCP config found
✅ Task directory found
✅ Task signal written to .agent\tasks\current.md
Antigravity will pick up this task and execute using its native quota system.
```

### 5.3 Check Runner Status

To monitor the runner network:

```powershell
# View runner status
doppler run --project ironforge --config prd -- pwsh scripts/coolify-deploy-runners.ps1 -Action status
```

### 5.4 Monitor Antigravity

Open Antigravity and check if it picks up the task:

- Look for new chat or activity
- Check MCP server logs
- Verify workflow execution

## Step 6: Configure Automatic Workflows

### 6.1 Schedule Night Shift

Create a scheduled workflow:

```yaml
name: Scheduled Night Shift
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily

jobs:
  trigger:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
      
      - name: Trigger Night Shift
        run: |
          gh workflow run autonomous-antigravity-trigger.yml \
            --field workflow=night-shift \
            --field model=gemini-2.5-flash
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 6.2 Configure n8n Integration

If using n8n for orchestration:

1. Create HTTP Request node
2. Configure GitHub API call:

```json
{
  "method": "POST",
  "url": "https://api.github.com/repos/Techlemariam/IronForge/actions/workflows/autonomous-antigravity-trigger.yml/dispatches",
  "authentication": "headerAuth",
  "headers": {
    "Accept": "application/vnd.github+json"
  },
  "body": {
    "ref": "main",
    "inputs": {
      "workflow": "{{ $json.workflow }}",
      "model": "gemini-2.5-flash"
    }
  }
}
```

## Troubleshooting

### Runner Not Appearing in GitHub

**Symptoms**: Runner doesn't show up in Settings → Actions → Runners

**Solutions**:

1. Check service status via `coolify-deploy-runners.ps1 -Action status`
2. Look at logs for the specific runner in the Coolify UI on Hetzner VPS
3. Restart the specific stuck service: `coolify-deploy-runners.ps1 -Action stop`, wait 10s, then `-Action start`

### Antigravity Not Found

**Symptoms**: Workflow shows "⚠️ Antigravity MCP config not found"

**Solutions**:

1. Verify Antigravity is installed for the runner service account
2. Check path: `Test-Path "$env:USERPROFILE\.gemini\antigravity\mcp_config.json"`
3. Ensure runner service has correct user context
4. Try running as user service instead of system service

### Task Signal Not Picked Up

**Symptoms**: Task file remains in `.agent/tasks/current.md`

**Solutions**:

1. Check Antigravity is running
2. Verify MCP server is registered and built
3. Restart Antigravity to reload MCP servers
4. Check file permissions on `.agent/tasks` directory

### Environment Variables Not Available

**Symptoms**: Workflow fails with missing environment variables

**Solutions**:

1. Ensure the secret exists in Doppler `prd` config.
2. In the Docker Compose payload (`coolify-deploy-runners.ps1`), ensure the variable is mounted properly to the `runner:` step if necessary.

## Maintenance

### Update Runner

```powershell
# The runner handles self-updating within the ephemeral container.
# If you need to force an update, rebuild the Coolify service:
doppler run --project ironforge --config prd -- pwsh scripts/coolify-deploy-runners.ps1 -Action stop
doppler run --project ironforge --config prd -- pwsh scripts/coolify-deploy-runners.ps1 -Action start
```

### Update MCP Server

```powershell
cd C:\Users\alexa\Workspaces\IronForge\mcp\factory-server
git pull
npm install
npm run build

# Restart Antigravity to reload MCP server
```

### Monitor Runner Health

```powershell
# Check multi-service status via API
doppler run --project ironforge --config prd -- pwsh scripts/coolify-deploy-runners.ps1 -Action status
```

## Security Considerations

1. **Service Account**: Run the runner service under a dedicated service account with minimal permissions
2. **Secrets**: Never log secrets or tokens in workflow outputs
3. **Network**: Consider running on a private network or VPN
4. **Updates**: Keep runner software updated for security patches
5. **Access Control**: Limit who can trigger workflows on self-hosted runners

## Next Steps

- Set up monitoring and alerting for runner health
- Configure backup runners for high availability
- Integrate with n8n for advanced orchestration
- Set up automatic runner updates
- Configure log rotation and cleanup
