#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/coolify-update-n8n.ps1
# Finds service UUID and triggers restart of n8n on Coolify

$coolifyHost = "http://ironforge-coolify.tailafb692.ts.net:8000"
$token = $env:COOLIFY_API_TOKEN
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept"        = "application/json"
    "Content-Type"  = "application/json"
}

Write-Host "Fetching all services to find n8n..." -ForegroundColor Cyan
$svcs = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services" -Headers $headers
$n8nService = $svcs | Where-Object { $_.service_type -eq "n8n" -or $_.name -like "*n8n*" }

if (-not $n8nService) {
    Write-Host "All services:"
    $svcs | Select-Object uuid, name, service_type, status | Format-Table -AutoSize
    Write-Error "Could not find n8n service"
    exit 1
}

Write-Host "Found n8n service:" -ForegroundColor Green
$n8nService | Select-Object uuid, name, service_type, status | Format-Table -AutoSize

$svcUuid = $n8nService.uuid
Write-Host "Service UUID: $svcUuid"

Write-Host ""
Write-Host "Triggering restart to pick up latest images..." -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$svcUuid/restart" -Method Get -Headers $headers
    Write-Host "Result: $($r | ConvertTo-Json)"
}
catch {
    Write-Warning "Restart endpoint failed: $_"
}

Write-Host ""
Write-Host "Current image versions:" -ForegroundColor Cyan
$n8nService.applications | ForEach-Object {
    Write-Host "  $($_.name): $($_.image) [$($_.status)]"
}
