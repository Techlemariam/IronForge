#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/n8n-create-credential.ps1
# Creates the GitHub PAT credential in n8n.
# ALL credentials (N8N_API_KEY, N8N_HOST, GH_PAT) come from Doppler.

$ErrorActionPreference = "Stop"

# Dot-source shared Doppler-backed n8n credentials
. "$PSScriptRoot/n8n-api.ps1"

# GH_PAT is also required from Doppler
$pat = $env:GH_PAT
if (-not $pat) {
    Write-Error "❌ GH_PAT is not set. Add it to Doppler: doppler secrets set GH_PAT='ghp_...'"
    exit 1
}

$payload = @{
    name = "GitHub PAT"
    type = "httpHeaderAuth"
    data = @{
        name  = "Authorization"
        value = "Bearer $pat"
    }
} | ConvertTo-Json -Depth 5

$result = Invoke-RestMethod @N8nPost `
    -Uri  "$N8nHost/api/v1/credentials" `
    -Body $payload

Write-Host "✅ Credential created!"
Write-Host "   ID:   $($result.id)"
Write-Host "   Name: $($result.name)"
Write-Host "   Use credential ID $($result.id) in n8n workflows"
