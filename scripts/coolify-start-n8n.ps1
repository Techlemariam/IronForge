#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/coolify-start-n8n.ps1
$coolifyHost = "http://ironforge-coolify.tailafb692.ts.net:8000"
$token = $env:COOLIFY_API_TOKEN
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept"        = "application/json"
}

Write-Host "Starting n8n service..." -ForegroundColor Cyan
$r = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/dskgo80w0sw80o8s8k04go84/start" -Method Get -Headers $headers
Write-Host "Result: $($r | ConvertTo-Json)"

Start-Sleep -Seconds 8

Write-Host ""
Write-Host "Checking status..." -ForegroundColor Yellow
$svc = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/dskgo80w0sw80o8s8k04go84" -Headers $headers
Write-Host "Status: $($svc.status)"
$svc.applications | ForEach-Object {
    Write-Host "  $($_.name): $($_.image) [$($_.status)]"
}
