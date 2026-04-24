#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/coolify-inspect.ps1
# Coolify API runs on port 8000

. "$PSScriptRoot/coolify-api.ps1"
$coolifyHost = $script:coolifyHost
$headers = $script:coolifyHeaders

Write-Host "=== PROJECTS ===" -ForegroundColor Cyan
try {
    $projects = Invoke-RestMethod -Uri "$coolifyHost/api/v1/projects" -Headers $headers
    $projects | ConvertTo-Json -Depth 4
}
catch { Write-Warning "Projects: $_" }

Write-Host ""
Write-Host "=== SERVERS ===" -ForegroundColor Cyan
try {
    $servers = Invoke-RestMethod -Uri "$coolifyHost/api/v1/servers" -Headers $headers
    $servers | ConvertTo-Json -Depth 3
}
catch { Write-Warning "Servers: $_" }

Write-Host ""
Write-Host "=== SERVICES ===" -ForegroundColor Cyan
try {
    $services = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services" -Headers $headers
    $services | ConvertTo-Json -Depth 4
}
catch { Write-Warning "Services: $_" }

Write-Host ""
Write-Host "=== APPLICATIONS ===" -ForegroundColor Cyan
try {
    $apps = Invoke-RestMethod -Uri "$coolifyHost/api/v1/applications" -Headers $headers
    $apps | ConvertTo-Json -Depth 3
}
catch { Write-Warning "Applications: $_" }
