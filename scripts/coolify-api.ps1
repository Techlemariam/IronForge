#!/usr/bin/env pwsh
# coolify-api.ps1 — Shared Coolify API bootstrap
#
# Dot-source this file in all Coolify scripts:
#   . "$PSScriptRoot/coolify-api.ps1"
#
# Required Doppler secrets:
#   COOLIFY_HOST          — base URL, e.g. http://ironforge-coolify.tailafb692.ts.net:8000
#   COOLIFY_API_TOKEN     — Coolify API bearer token
#
# Optional Doppler secrets:
#   N8N_COOLIFY_SERVICE_UUID    — UUID of the n8n Coolify service
#   COOLIFY_SERVER_UUID         — UUID of the default Coolify server
#   COOLIFY_PROJECT_UUID        — UUID of the default Coolify project
#
# TLS: SkipCertificateCheck is always enabled for Tailscale internal endpoints.
#   Override with COOLIFY_SKIP_TLS=false if using a trusted public cert.

$ErrorActionPreference = "Stop"

$script:coolifyHost = $env:COOLIFY_HOST
if (-not $script:coolifyHost) {
    Write-Error "COOLIFY_HOST is not set. Add to Doppler: doppler secrets set COOLIFY_HOST='http://...'"
    exit 1
}
# Strip trailing slash for consistency
$script:coolifyHost = $script:coolifyHost.TrimEnd('/')

$script:coolifyToken = $env:COOLIFY_API_TOKEN
if (-not $script:coolifyToken) {
    Write-Error "COOLIFY_API_TOKEN is not set. Add to Doppler: doppler secrets set COOLIFY_API_TOKEN='...'"
    exit 1
}

$script:coolifyHeaders = @{
    "Authorization" = "Bearer $($script:coolifyToken)"
    "Accept"        = "application/json"
    "Content-Type"  = "application/json"
}

# TLS skip — default on for Tailscale internal endpoints
$script:coolifySkipTls = $env:COOLIFY_SKIP_TLS -ne "false"

# Convenience wrapper
function Invoke-CoolifyAPI {
    param(
        [string]$Path,
        [string]$Method = "Get",
        [object]$Body
    )
    $uri = "$($script:coolifyHost)/api/v1/$($Path.TrimStart('/'))"
    $params = @{ Uri = $uri; Headers = $script:coolifyHeaders; Method = $Method }
    if ($Body) { $params.Body = ($Body | ConvertTo-Json -Depth 10 -Compress) }
    if ($script:coolifySkipTls) { $params.SkipCertificateCheck = $true }
    Invoke-RestMethod @params
}
