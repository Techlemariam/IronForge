#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Shared n8n API helper — dot-source this at the top of every n8n script.
  ALL credentials come from Doppler environment variables.

.USAGE
  . "$PSScriptRoot/n8n-api.ps1"   # dot-source to inherit vars
  Invoke-RestMethod @N8nGet -Uri "$N8nHost/api/v1/workflows"

.REQUIRED DOPPLER SECRETS
  N8N_API_KEY      — n8n API token (Settings → API → Create API key)
  N8N_HOST         — base URL, e.g. https://ironforge-coolify.tailafb692.ts.net

.OPTIONAL DOPPLER SECRETS
  N8N_SKIP_TLS     — set to "true" to skip TLS validation (dev/internal only)
#>

$ErrorActionPreference = "Stop"

# ── Resolve secrets from environment (set by `doppler run --`) ───────────────
$N8nHost = $env:N8N_HOST
$N8nApiKey = $env:N8N_API_KEY
# Default: skip TLS for Tailscale internal endpoints (override with N8N_SKIP_TLS=false)
$SkipTls = $env:N8N_SKIP_TLS -ne "false"

# ── Guard: must be run via doppler ───────────────────────────────────────────
if (-not $N8nHost) {
  Write-Error @"
❌ N8N_HOST is not set.
   Run this script via doppler:
     doppler run -- pwsh $($MyInvocation.ScriptName)
"@
  exit 1
}

if (-not $N8nApiKey) {
  Write-Error @"
❌ N8N_API_KEY is not set.
   Add it to Doppler:
     doppler secrets set N8N_API_KEY="<your-n8n-api-key>"
   Then re-run:
     doppler run -- pwsh $($MyInvocation.ScriptName)
"@
  exit 1
}

# ── Shared request parameters ─────────────────────────────────────────────────
$N8nHeaders = @{
  "X-N8N-API-KEY" = $N8nApiKey
  "Content-Type"  = "application/json"
  "Accept"        = "application/json"
}

# Base splatting objects — merge with -Uri in callers
$N8nGet = @{
  Method  = "Get"
  Headers = $N8nHeaders
}
if ($SkipTls) { $N8nGet["SkipCertificateCheck"] = $true }

$N8nPost = @{
  Method  = "Post"
  Headers = $N8nHeaders
}
if ($SkipTls) { $N8nPost["SkipCertificateCheck"] = $true }

$N8nPut = @{
  Method  = "Put"
  Headers = $N8nHeaders
}
if ($SkipTls) { $N8nPut["SkipCertificateCheck"] = $true }

Write-Verbose "n8n-api.ps1 loaded — host: $N8nHost | TLS skip: $SkipTls"
