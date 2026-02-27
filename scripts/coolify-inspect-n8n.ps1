#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/coolify-inspect-n8n.ps1
# Deep inspect of the n8n project on Coolify

$coolifyHost = "http://ironforge-coolify.tailafb692.ts.net:8000"
$token = $env:COOLIFY_API_TOKEN
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept"        = "application/json"
    "Content-Type"  = "application/json"
}

$n8nProjectUuid = "y4sck8c40g4cockw48sg0sok"
$serverUuid = "swwk0owc8sokwo80w48k48w0"

Write-Host "=== n8n PROJECT FULL DETAIL ===" -ForegroundColor Cyan
$proj = Invoke-RestMethod -Uri "$coolifyHost/api/v1/projects/$n8nProjectUuid" -Headers $headers
$proj | ConvertTo-Json -Depth 8

Write-Host ""
Write-Host "=== ALL SERVICES ===" -ForegroundColor Cyan
$svc = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services" -Headers $headers
$svc | ConvertTo-Json -Depth 5

Write-Host ""
Write-Host "=== SERVICE APPS IN n8n PROJECT ===" -ForegroundColor Cyan
foreach ($env in $proj.environments) {
    Write-Host "Environment: $($env.name) ($($env.uuid))"
    $env.applications | Select-Object name, uuid, status, image, fqdn, ports_exposes, build_pack | Format-Table -AutoSize
    $env.services | Select-Object name, uuid, status, image | Format-Table -AutoSize
}
