#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/coolify-status-n8n.ps1
$coolifyHost = "http://ironforge-coolify.tailafb692.ts.net:8000"
$token = $env:COOLIFY_API_TOKEN
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept"        = "application/json"
}

$svc = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/dskgo80w0sw80o8s8k04go84" -Headers $headers

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
