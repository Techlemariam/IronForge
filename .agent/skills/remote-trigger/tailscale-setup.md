# Tailscale Setup for IronForge Infrastructure

This guide configures Tailscale for secure access to your self-hosted infrastructure.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TAILSCALE NETWORK                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Hetzner   │  │   Home PC   │  │   Mobile    │              │
│  │    VPS      │  │  (Dev)      │  │   (Work)    │              │
│  │             │  │             │  │             │              │
│  │ ┌─────────┐ │  │             │  │             │              │
│  │ │ Coolify │ │  │ Antigravity │  │ Discord Bot │              │
│  │ │   n8n   │ │  │   Cockpit   │  │ Slack App   │              │
│  │ │PostgreSQL│ │  │             │  │             │              │
│  │ └─────────┘ │  │             │  │             │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                   MagicDNS: *.tailnet.ts.net                     │
└─────────────────────────────────────────────────────────────────┘
```

## 1. Install Tailscale on Hetzner VPS

### Cloud-init (during VPS creation)

```yaml
#cloud-config
packages:
  - curl

runcmd:
  - curl -fsSL https://tailscale.com/install.sh | sh
  - tailscale up --authkey=tskey-auth-XXXX --hostname=ironforge-hetzner
```

### Manual Installation

```bash
# On Hetzner VPS (Ubuntu/Debian)
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --hostname=ironforge-hetzner
```

## 2. Configure ACLs

Add to your Tailscale ACL policy (admin.tailscale.com):

```json
{
  "tagOwners": {
    "tag:ironforge": ["autogroup:admin"]
  },
  "acls": [
    // Personal devices can access everything
    { "action": "accept", "src": ["autogroup:member"], "dst": ["*:*"] },
    
    // IronForge services can talk to each other
    { "action": "accept", "src": ["tag:ironforge"], "dst": ["tag:ironforge:*"] }
  ],
  "ssh": [
    // Allow SSH to IronForge servers
    { "action": "accept", "src": ["autogroup:member"], "dst": ["tag:ironforge"], "users": ["autogroup:nonroot"] }
  ]
}
```

## 3. Hostname Configuration

After setup, your services are available at:

| Service | URL |
|:--------|:----|
| Coolify | `https://ironforge-hetzner.tailnet.ts.net:8000` |
| n8n | `https://ironforge-hetzner.tailnet.ts.net:5678` |
| PostgreSQL | `ironforge-hetzner.tailnet.ts.net:5432` |
| App (Local) | `http://ironforge-hetzner.tailnet.ts.net:3000` |

## 4. Tailscale Funnel (Public Webhooks)

For public webhook endpoints (Sentry, GitHub):

```bash
# Enable Funnel for specific ports
tailscale serve --bg --https=443 http://localhost:5678

# Or use Funnel for a specific path
tailscale funnel 443 /webhook
```

This exposes `https://ironforge-hetzner.tailnet.ts.net/webhook` publicly.

## 5. Environment Updates

Update your `.env.local`:

```bash
# Before (exposed to internet)
COOLIFY_URL=https://coolify.your-domain.com

# After (Tailscale-only)
COOLIFY_URL=https://ironforge-hetzner.tailnet.ts.net:8000

# n8n
N8N_WEBHOOK_URL=https://ironforge-hetzner.tailnet.ts.net:5678/webhook/ironforge-trigger
```

## 6. Docker Compose Integration

Update `docker-compose.yml` for Tailscale sidecar:

```yaml
services:
  tailscale:
    image: tailscale/tailscale:latest
    container_name: tailscale
    hostname: ironforge-docker
    environment:
      - TS_AUTHKEY=tskey-auth-XXXX
      - TS_STATE_DIR=/var/lib/tailscale
    volumes:
      - tailscale-state:/var/lib/tailscale
      - /dev/net/tun:/dev/net/tun
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    restart: unless-stopped

  app:
    # ... existing config
    network_mode: service:tailscale  # Share Tailscale network

volumes:
  tailscale-state:
```

## Security Benefits

| Risk | Mitigation |
|:-----|:-----------|
| Exposed admin panels | Not on public internet |
| SSH brute force | Tailscale SSH with MagicDNS |
| Credential stuffing | No public login pages |
| DDoS | No public endpoints (except Funnel) |
| Lateral movement | ACLs restrict service-to-service |

## Troubleshooting

```bash
# Check Tailscale status
tailscale status

# Ping another device
tailscale ping ironforge-hetzner

# Check if Funnel is active
tailscale funnel status

# View logs
journalctl -u tailscaled -f
```
