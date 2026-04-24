#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/n8n-upgrade-activate.ps1
# 1. Activates CI Triage Router + Reviewer Aggregator workflows via n8n API
# 2. Prints webhook URLs and reminds to persist in Doppler
# 3. Triggers Coolify redeploy to pull latest n8n image
#
# ALL credentials (N8N_API_KEY, N8N_HOST, COOLIFY_API_TOKEN) come from Doppler.

$ErrorActionPreference = "Stop"

# ── n8n credentials from Doppler ─────────────────────────────────────────────
. "$PSScriptRoot/n8n-api.ps1"

# ── Coolify credentials from Doppler ─────────────────────────────────────────
$coolifyHost = $env:COOLIFY_HOST
$coolifyKey = $env:COOLIFY_API_TOKEN

if (-not $coolifyHost) {
    Write-Error "❌ COOLIFY_HOST is not set. Add it to Doppler: doppler secrets set COOLIFY_HOST='http://...'"
    exit 1
}
if (-not $coolifyKey) {
    Write-Error "❌ COOLIFY_API_TOKEN is not set. Add it to Doppler."
    exit 1
}

$coolifyHeaders = @{
    "Authorization" = "Bearer $coolifyKey"
    "Accept"        = "application/json"
    "Content-Type"  = "application/json"
}

# ── STEP 1: ACTIVATE WORKFLOWS ───────────────────────────────────────────────
Write-Host "=== ACTIVATING n8n WORKFLOWS ===" -ForegroundColor Cyan

$wf1Id = "LLWLOkXohXpMxoPR"
$wf2Id = "AD8oaoJQFMPQm6JO"

foreach ($wfId in @($wf1Id, $wf2Id)) {
    Write-Host "Activating workflow $wfId..." -ForegroundColor Yellow
    try {
        $res = Invoke-RestMethod @N8nPost -Uri "$N8nHost/api/v1/workflows/$wfId/activate"
        Write-Host "  ✅ $($res | ConvertTo-Json -Compress)"
    }
    catch {
        Write-Warning "  ❌ Failed: $($_.ErrorDetails.Message)"
    }
}

# ── STEP 2: VERIFY ACTIVATION STATUS ─────────────────────────────────────────
Write-Host ""
Write-Host "=== WORKFLOW STATUS ===" -ForegroundColor Cyan

$workflows = Invoke-RestMethod @N8nGet -Uri "$N8nHost/api/v1/workflows"
$workflows.data | Select-Object id, name, active | Format-Table -AutoSize

# ── STEP 3: PRINT WEBHOOK URLS ───────────────────────────────────────────────
Write-Host ""
Write-Host "=== WEBHOOK URLS ===" -ForegroundColor Cyan
foreach ($wf in ($workflows.data | Where-Object { $_.active -eq $true })) {
    Write-Host "Workflow: $($wf.name) [ACTIVE]" -ForegroundColor Green
    $wfDetail = Invoke-RestMethod @N8nGet -Uri "$N8nHost/api/v1/workflows/$($wf.id)"
    $webhookNodes = $wfDetail.nodes | Where-Object { $_.type -eq "n8n-nodes-base.webhook" }
    foreach ($node in $webhookNodes) {
        $webhookPath = $node.parameters.path
        Write-Host "  Webhook URL: $N8nHost/webhook/$webhookPath" -ForegroundColor Cyan
        if ($wf.name -like "*Triage*") {
            Write-Host "  SET IN DOPPLER: doppler secrets set N8N_CI_TRIAGE_WEBHOOK_URL=`"$N8nHost/webhook/$webhookPath`"" -ForegroundColor Yellow
        }
    }
}

# ── STEP 4: UPGRADE n8n VIA COOLIFY ──────────────────────────────────────────
Write-Host ""
Write-Host "=== UPGRADING n8n ON COOLIFY ===" -ForegroundColor Cyan

# Read service UUID from Doppler (falls back to known value)
$serviceUuid = $env:N8N_COOLIFY_SERVICE_UUID
if (-not $serviceUuid) {
    $serviceUuid = "dskgo80w0sw80o8s8k04go84"
    Write-Warning "N8N_COOLIFY_SERVICE_UUID not set in Doppler — using default $serviceUuid"
}

$svc = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$serviceUuid" -Headers $coolifyHeaders -SkipCertificateCheck
Write-Host "Current images:"
$svc.applications | ForEach-Object { Write-Host "  $($_.name): $($_.image)" }

Write-Host ""
Write-Host "Triggering Coolify redeploy (pulls latest image)..." -ForegroundColor Yellow
try {
    $redeploy = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$serviceUuid/restart" `
        -Method Get -Headers $coolifyHeaders -SkipCertificateCheck
    Write-Host "Restart queued: $($redeploy.message)"
    Write-Host "Waiting 5s for restart to initiate..."
    Start-Sleep -Seconds 5
    $start = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$serviceUuid/start" `
        -Method Get -Headers $coolifyHeaders -SkipCertificateCheck
    Write-Host "Start queued: $($start.message)"
}
catch {
    Write-Warning "Coolify redeploy failed: $($_.ErrorDetails.Message)"
}

Write-Host ""
Write-Host "✅ Done. Check status: doppler run -- pwsh scripts/coolify-status-n8n.ps1" -ForegroundColor Green
