#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/coolify-start-n8n.ps1
. "$PSScriptRoot/coolify-api.ps1"

$serviceUuid = $env:N8N_COOLIFY_SERVICE_UUID
if (-not $serviceUuid) {
    $serviceUuid = "dskgo80w0sw80o8s8k04go84"
    Write-Warning "N8N_COOLIFY_SERVICE_UUID not set — using default $serviceUuid"
}
$coolifyHost = $script:coolifyHost
$headers = $script:coolifyHeaders

Write-Host "Starting n8n service..." -ForegroundColor Cyan
$r = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$serviceUuid/start" -Method Get -Headers $headers
Write-Host "Result: $($r | ConvertTo-Json)"

Start-Sleep -Seconds 8

Write-Host ""
Write-Host "Checking status..." -ForegroundColor Yellow
$svc = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$serviceUuid" -Headers $headers
Write-Host "Status: $($svc.status)"
$svc.applications | ForEach-Object {
    Write-Host "  $($_.name): $($_.image) [$($_.status)]"
}
