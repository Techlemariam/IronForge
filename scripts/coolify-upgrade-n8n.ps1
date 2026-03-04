#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/coolify-upgrade-n8n.ps1
# Updates n8n service image to latest via Coolify service environment variable

$coolifyHost = "http://ironforge-coolify.tailafb692.ts.net:8000"
$token = $env:COOLIFY_API_TOKEN
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept"        = "application/json"
    "Content-Type"  = "application/json"
}

$serviceUuid = "dskgo80w0sw80o8s8k04go84"

# Step 1: Get current service env vars
Write-Host "Fetching current service env vars..." -ForegroundColor Cyan
try {
    $envVars = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$serviceUuid/envs" -Headers $headers
    $envVars | ConvertTo-Json -Depth 4
}
catch {
    Write-Warning "Could not fetch envs: $($_.ErrorDetails.Message)"
}

# Step 2: Update the n8n image version to latest
Write-Host ""
Write-Host "Updating n8n image version to latest..." -ForegroundColor Yellow

$updateBody = @{
    key           = "SERVICE_IMAGE_N8N"
    value         = "n8nio/n8n:latest"
    is_build_time = $false
    is_preview    = $false
    is_required   = $false
    is_shown_once = $false
} | ConvertTo-Json

try {
    $r = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$serviceUuid/envs" `
        -Method Patch -Headers $headers -Body $updateBody
    Write-Host "Updated: $($r | ConvertTo-Json -Compress)"
}
catch {
    Write-Warning "Env update failed: $($_.ErrorDetails.Message)"
    Write-Host "Trying bulk update instead..."
    $bulkBody = @{
        data = @(
            @{ key = "SERVICE_IMAGE_N8N"; value = "n8nio/n8n:latest" }
        )
    } | ConvertTo-Json -Depth 3
    try {
        Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$serviceUuid/envs/bulk" `
            -Method Patch -Headers $headers -Body $bulkBody
        Write-Host "Bulk update attempted."
    }
    catch {
        Write-Warning "Bulk update also failed: $($_.ErrorDetails.Message)"
    }
}

# Step 3: Trigger a full redeploy
Write-Host ""
Write-Host "Triggering service stop + start to pick up new image..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$serviceUuid/stop" -Method Get -Headers $headers
Start-Sleep -Seconds 3
$r = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$serviceUuid/start" -Method Get -Headers $headers
Write-Host "Start: $($r.message)"

Write-Host ""
Write-Host "Upgrade initiated. Check status with:" -ForegroundColor Green
Write-Host "  doppler run -- pwsh scripts/coolify-status-n8n.ps1"
