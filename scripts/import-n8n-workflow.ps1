#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/import-n8n-workflow.ps1 [-Path n8n/my-workflow.json]
# Imports all *.json (or a specific file) from the n8n/ folder into n8n.
# ALL credentials come from Doppler via n8n-api.ps1.
param(
    [string]$Path = ""   # Optional: import a single file instead of all
)

$ErrorActionPreference = "Stop"

# Dot-source shared Doppler-backed n8n credentials
. "$PSScriptRoot/n8n-api.ps1"

$n8nDir = Join-Path (Split-Path $PSScriptRoot -Parent) "n8n"
$files = if ($Path) {
    @(Get-Item $Path)
}
else {
    Get-ChildItem -Path $n8nDir -Filter "*.json"
}

if (-not $files) { Write-Warning "No workflow files found."; exit 0 }

foreach ($file in $files) {
    Write-Host "Importing: $($file.Name)..." -ForegroundColor Cyan
    $json = Get-Content $file.FullName -Raw
    
    try {
        $response = Invoke-RestMethod @N8nPost `
            -Uri  "$N8nHost/api/v1/workflows" `
            -Body $json
        Write-Host "  ✅ OK — ID: $($response.id) | Name: $($response.name)" -ForegroundColor Green
    }
    catch {
        Write-Warning "  ❌ FAILED: $($_.ErrorDetails.Message)"
    }
}

Write-Host "`nDone."
