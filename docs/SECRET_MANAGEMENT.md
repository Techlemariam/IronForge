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

## 📚 References

- [Doppler Dashboard](https://dashboard.doppler.com/workplace/ironforge)
- [mcp_config.json](file:///c:/Users/alexa/.gemini/antigravity/mcp_config.json)
