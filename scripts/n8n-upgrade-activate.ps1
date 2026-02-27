#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/n8n-upgrade-activate.ps1
# 1. Upgrades n8n on Coolify to latest via image tag update
# 2. Activates CI Triage Router + Reviewer Aggregator workflows

$n8nHost = "https://ironforge-coolify.tailafb692.ts.net"
$coolifyHost = "http://ironforge-coolify.tailafb692.ts.net:8000"
$n8nKey = $env:N8N_API_KEY
$coolifyKey = $env:COOLIFY_API_TOKEN

$n8nHeaders = @{
    "X-N8N-API-KEY" = $n8nKey
    "Content-Type"  = "application/json"
}
$coolifyHeaders = @{
    "Authorization" = "Bearer $coolifyKey"
    "Accept"        = "application/json"
    "Content-Type"  = "application/json"
}

# ── STEP 1: ACTIVATE WORKFLOWS ──────────────────────────────────────────────
Write-Host "=== ACTIVATING n8n WORKFLOWS ===" -ForegroundColor Cyan

$wf1Id = "LLWLOkXohXpMxoPR"
$wf2Id = "AD8oaoJQFMPQm6JO"

foreach ($wfId in @($wf1Id, $wf2Id)) {
    Write-Host "Activating workflow $wfId..." -ForegroundColor Yellow
    try {
        $res = Invoke-RestMethod -Uri "$n8nHost/api/v1/workflows/$wfId/activate" `
            -Method Post `
            -Headers $n8nHeaders `
            -SkipCertificateCheck
        Write-Host "  Result: $($res | ConvertTo-Json -Compress)"
    }
    catch {
        $errBody = $_.ErrorDetails.Message
        Write-Warning "  Failed: $errBody"
    }
}

# ── STEP 2: VERIFY ACTIVATION STATUS ─────────────────────────────────────────
Write-Host ""
Write-Host "=== WORKFLOW STATUS ===" -ForegroundColor Cyan

$workflows = Invoke-RestMethod -Uri "$n8nHost/api/v1/workflows" `
    -Headers $n8nHeaders `
    -SkipCertificateCheck

$workflows.data | Select-Object id, name, active | Format-Table -AutoSize

# Get webhook URLs for active webhooks
Write-Host ""
Write-Host "=== WEBHOOK URLS ===" -ForegroundColor Cyan
foreach ($wf in $workflows.data | Where-Object { $_.active -eq $true }) {
    Write-Host "Workflow: $($wf.name) [ACTIVE]" -ForegroundColor Green
    # Find webhook nodes
    $wfDetail = Invoke-RestMethod -Uri "$n8nHost/api/v1/workflows/$($wf.id)" `
        -Headers $n8nHeaders -SkipCertificateCheck
    $webhookNodes = $wfDetail.nodes | Where-Object { $_.type -eq "n8n-nodes-base.webhook" }
    foreach ($node in $webhookNodes) {
        $webhookPath = $node.parameters.path
        Write-Host "  Webhook URL: $n8nHost/webhook/$webhookPath" -ForegroundColor Cyan
        if ($wf.name -like "*Triage*") {
            Write-Host "  SET IN DOPPLER: doppler secrets set N8N_CI_TRIAGE_WEBHOOK_URL=`"$n8nHost/webhook/$webhookPath`"" -ForegroundColor Yellow
        }
    }
}

# ── STEP 3: UPGRADE n8n VIA COOLIFY ──────────────────────────────────────────
Write-Host ""
Write-Host "=== UPGRADING n8n ON COOLIFY ===" -ForegroundColor Cyan

$serviceUuid = "dskgo80w0sw80o8s8k04go84"

# Get current compose
$svc = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$serviceUuid" `
    -Headers $coolifyHeaders

Write-Host "Current images:"
$svc.applications | ForEach-Object { Write-Host "  $($_.name): $($_.image)" }

# Update the service to redeploy with latest image
Write-Host ""
Write-Host "Triggering Coolify redeploy (pulls latest image)..." -ForegroundColor Yellow
try {
    $redeploy = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$serviceUuid/restart" `
        -Method Get -Headers $coolifyHeaders
    Write-Host "Restart queued: $($redeploy.message)"
    Write-Host "Waiting 5s for restart to initiate..."
    Start-Sleep -Seconds 5
    $start = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$serviceUuid/start" `
        -Method Get -Headers $coolifyHeaders
    Write-Host "Start queued: $($start.message)"
}
catch {
    Write-Warning "Coolify redeploy failed: $($_.ErrorDetails.Message)"
}

Write-Host ""
Write-Host "Done. Check Coolify UI or run: doppler run -- pwsh scripts/coolify-status-n8n.ps1" -ForegroundColor Green
