# Moltbot Configuration for IronForge

This document describes how to configure Moltbot (or similar Discord/Slack bots) to trigger IronForge workflows.

## Discord Bot Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application: "IronForge Bot"
3. Add Bot user
4. Copy Bot Token

### 2. Bot Commands

Register the following slash commands:

| Command | Description |
|:--------|:------------|
| `/ironforge run <workflow>` | Trigger a workflow |
| `/ironforge status` | Check last run status |
| `/ironforge deploy <env>` | Trigger deployment |

### 3. Webhook Integration

Moltbot should POST to n8n webhook:

```bash
POST https://n8n.your-tailnet.ts.net/webhook/ironforge-trigger
Content-Type: application/json

{
  "workflow": "/night-shift",
  "branch": "main",
  "token": "${REMOTE_TRIGGER_SECRET}",
  "source": "moltbot",
  "user": "username#1234"
}
```

## Slack Workflow Builder

### 1. Create Workflow

1. Open Slack → Tools → Workflow Builder
2. Create new workflow triggered by `/ironforge`
3. Add "Send a webhook" step

### 2. Webhook Configuration

```yaml
URL: https://n8n.your-tailnet.ts.net/webhook/ironforge-trigger
Method: POST
Body:
  workflow: "{{input.workflow}}"
  branch: "{{input.branch || 'main'}}"
  token: "${REMOTE_TRIGGER_SECRET}"
  source: "slack"
  user: "{{user.name}}"
```

## Environment Variables

Add these to your bot's environment:

```bash
# n8n Webhook URL (behind Tailscale)
N8N_WEBHOOK_URL=https://n8n.your-tailnet.ts.net/webhook/ironforge-trigger

# Shared secret for authentication
REMOTE_TRIGGER_SECRET=your-secure-random-string

# GitHub for direct API calls (alternative)
GITHUB_PAT=ghp_your_personal_access_token
GITHUB_OWNER=Techlemariam
GITHUB_REPO=IronForge
```

## Example: Python Discord Bot

```python
import discord
from discord import app_commands
import aiohttp
import os

class IronForgeBot(discord.Client):
    def __init__(self):
        super().__init__(intents=discord.Intents.default())
        self.tree = app_commands.CommandTree(self)

    async def setup_hook(self):
        await self.tree.sync()

bot = IronForgeBot()

@bot.tree.command(name="ironforge", description="Trigger IronForge workflow")
@app_commands.describe(workflow="Workflow to run", branch="Target branch")
async def ironforge(interaction: discord.Interaction, workflow: str, branch: str = "main"):
    await interaction.response.defer()
    
    async with aiohttp.ClientSession() as session:
        payload = {
            "workflow": workflow,
            "branch": branch,
            "token": os.environ["REMOTE_TRIGGER_SECRET"],
            "source": "discord",
            "user": str(interaction.user)
        }
        
        async with session.post(os.environ["N8N_WEBHOOK_URL"], json=payload) as resp:
            if resp.status == 200:
                await interaction.followup.send(f"✅ Triggered `{workflow}` on `{branch}`")
            else:
                await interaction.followup.send(f"❌ Failed to trigger workflow")

bot.run(os.environ["DISCORD_BOT_TOKEN"])
```

## Security Notes

1. **Never expose n8n publicly** - Keep behind Tailscale
2. **Rotate secrets regularly** - Update `REMOTE_TRIGGER_SECRET` monthly
3. **Audit logs** - n8n keeps execution history
4. **Rate limiting** - Configure n8n to prevent abuse
