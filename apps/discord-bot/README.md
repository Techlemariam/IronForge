# IronForge Discord Bot

Discord bot for triggering IronForge agent workflows remotely.

## Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** → Name: `IronForge Bot`
3. Go to **Bot** tab → Click **"Add Bot"**
4. Copy the **Bot Token** (save it!)
5. Enable **"Message Content Intent"** (optional)
6. Go to **OAuth2** → Copy the **Client ID**

### 2. Invite Bot to Server

Use this URL (replace `YOUR_CLIENT_ID`):

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2147483648&scope=bot%20applications.commands
```

### 3. Environment Variables

```bash
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_CLIENT_ID=your-client-id
N8N_WEBHOOK_URL=https://ironforge-coolify.tailafb692.ts.net/webhook/ironforge-trigger
REMOTE_TRIGGER_SECRET=your-secret
```

### 4. Deploy to Coolify

1. In Coolify, create new **"Application"** (not Service)
2. Source: Git repository or Docker
3. Add environment variables
4. Deploy!

## Commands

| Command | Description |
|:--------|:------------|
| `/ironforge workflow:X` | Trigger workflow X |
| `/ironforge-status` | Check system status |

## Local Development

```bash
cd apps/discord-bot
npm install
node index.js
```
