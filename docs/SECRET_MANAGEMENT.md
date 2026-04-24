# Secret Management Protocol

This document defines the standard for managing secrets and API tokens in the IronForge project.

## 🔐 Doppler: The Single Source of Truth

We use **Doppler** to manage all environment variables and secrets. Local `.env` files are **STRICTLY PROHIBITED** and will be ignored by all core workflows. Using `.env` is considered a security violation.

### 🛠️ Local Development

To run the project with secrets, you **MUST** use the Doppler CLI:

```bash
doppler run -- [command]
```

Example: `doppler run -- npm run dev`

### 🚀 CI/CD & GitHub Actions

Doppler is configured to automatically sync secrets to GitHub Actions.

- **Doppler Config**: `dev` or `prd` configs map to the repository.
- **Access**: Secrets are injected into workflows via the `GH_PAT` or other mapped variables.

## ⚠️ Important Naming Conventions

### GitHub Personal Access Token (`GH_PAT`)

Due to GitHub Actions internal restrictions, custom secrets cannot start with `GITHUB_`.

- **Standard Name**: `GH_PAT`
- **MCP usage**: References `${env:GH_PAT}` in `mcp_config.json`.

## 🛠️ MCP Configuration

All MCP servers must reference secrets via Doppler environment variables in `mcp_config.json`:

```json
{
  "env": {
    "SECRET_NAME": "${env:DOPPLER_SECRET_NAME}"
  }
}
```

## 🤖 n8n Secrets

The following secrets are required by `scripts/n8n-api.ps1` (shared helper dot-sourced by all n8n scripts):

| Doppler Key | Description |
| --- | --- |
| `N8N_API_KEY` | n8n API token — Settings → API → Create API key |
| `N8N_HOST` | Base URL of the n8n instance, e.g. `https://n8n.ironforge.internal` |
| `N8N_SKIP_TLS` | Set to `"true"` to skip TLS validation (dev/internal only, default: unset) |
| `N8N_COOLIFY_SERVICE_UUID` | Coolify service UUID for the n8n service (used in upgrade/status scripts) |
| `N8N_CI_TRIAGE_WEBHOOK_URL` | Webhook URL of the CI Triage Router workflow (populated after first deploy) |

Add these via Doppler:

```bash
doppler secrets set N8N_API_KEY="<your-key>" N8N_HOST="https://n8n.ironforge.internal"
```

## 🛳️ Coolify Secrets

| Doppler Key | Description |
| --- | --- |
| `COOLIFY_HOST` | Coolify base URL, e.g. `http://ironforge-coolify.tailafb692.ts.net:8000` |
| `COOLIFY_API_TOKEN` | Coolify API token — Coolify Dashboard → Settings → API |

## 📚 References

- [Doppler Dashboard](https://dashboard.doppler.com/workplace/ironforge)
- [mcp_config.json](file:///c:/Users/alexa/.gemini/antigravity/mcp_config.json)
