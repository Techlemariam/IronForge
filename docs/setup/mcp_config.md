# MCP Configuration Guide

This guide explains how to configure **Model Context Protocol (MCP)** integrations for IronForge. MCP allows AI agents to interact directly with your infrastructure tools (Vercel, Supabase, Sentry) for autonomous debugging and management.

## 🛠️ Required Environment Variables

Add these to your `.env` file to enable specific MCP capabilities. All keys are **optional**; if omitted, the corresponding MCP features will simply be unavailable to the agent.

### 1. Sentry Integration
Allows the agent to read error stack traces and issues.
- **Get Key:** [Sentry API Tokens](https://sentry.io/settings/account/api/auth-tokens/) (Scopes: `project:read`, `event:read`, `org:read`)
- **Env Vars:**
  ```bash
  SENTRY_AUTH_TOKEN="your_token_here"
  SENTRY_ORG="your_org_slug"
  SENTRY_PROJECT="your_project_slug"
  ```

### 2. Vercel Integration
Allows the agent to inspect deployments and build logs.
- **Get Key:** [Vercel Tokens](https://vercel.com/account/tokens)
- **Env Vars:**
  ```bash
  VERCEL_TOKEN="your_token_here"
  VERCEL_ORG_ID="your_team_id"       # Found in Team Settings
  VERCEL_PROJECT_ID="your_project_id" # Found in Project Settings
  ```

### 3. Supabase Integration
Allows the agent to validate schema drift and run read-only SQL queries.
- **Get Key:** [Supabase Project Settings > API](https://supabase.com/dashboard/project/_/settings/api)
- **Env Vars:**
  ```bash
  SUPABASE_SERVICE_KEY="your_service_role_key" # CAUTION: High privilege
  SUPABASE_PROJECT_REF="your_project_ref_id"
  ```

### 4. Google Maps Integration
Allows the agent to generate routes and elevation profiles for features like PvP.
- **Env Vars:**
  ```bash
  GOOGLE_MAPS_API_KEY="your_api_key"
  ```

## 🔒 Security Best Practices

1.  **Least Privilege:** Only grant the scopes necessary for the agent to function.
2.  **Rotation:** Rotate these keys periodically.
3.  **Local Only:** Ideally, keep highly sensitive keys (like `SUPABASE_SERVICE_KEY`) only in your local `.env` for development sessions. In CI/CD, use restricted service accounts.

## 🤖 How the Agent Uses These

When these keys are present, the agent automatically gains "tools" such as:
- `sentry_get_issue`
- `vercel_get_logs`
- `supabase_execute_sql`

This enables workflows like `/debug` and `/monitor-deploy` to be fully autonomous.
