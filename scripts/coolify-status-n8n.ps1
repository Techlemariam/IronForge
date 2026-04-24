#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/coolify-status-n8n.ps1
# ALL credentials (COOLIFY_API_TOKEN, COOLIFY_HOST) come from Doppler.

$ErrorActionPreference = "Stop"

$coolifyHost = $env:COOLIFY_HOST
if (-not $coolifyHost) {
    Write-Error "❌ COOLIFY_HOST is not set. Add to Doppler: doppler secrets set COOLIFY_HOST='http://...'"
    exit 1
}
$token = $env:COOLIFY_API_TOKEN
if (-not $token) { Write-Error "❌ COOLIFY_API_TOKEN is not set."; exit 1 }
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept"        = "application/json"
}

$serviceUuid = $env:N8N_COOLIFY_SERVICE_UUID
if (-not $serviceUuid) {
    $serviceUuid = "dskgo80w0sw80o8s8k04go84"
    Write-Warning "N8N_COOLIFY_SERVICE_UUID not set in Doppler — using default $serviceUuid"
}
$svc = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$serviceUuid" -Headers $headers -SkipCertificateCheck

Write-Host "=== n8n Service Status ===" -ForegroundColor Cyan
Write-Host "UUID:         $($svc.uuid)"
Write-Host "Name:         $($svc.name)"
Write-Host "Type:         $($svc.service_type)"
Write-Host "Status:       $($svc.status)"
Write-Host "FQDN:         $($svc.fqdn)"
Write-Host ""
Write-Host "Containers:" -ForegroundColor Yellow
$svc.applications | ForEach-Object {
    Write-Host "  $($_.name): $($_.image) [$($_.status)] | last_online: $($_.last_online_at)"
}
