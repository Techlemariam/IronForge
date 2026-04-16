# restart-n8n-webhooks.ps1
# Restarts n8n via Coolify API, then verifies webhook registration

$coolify = "http://ironforge-coolify.tailafb692.ts.net:8000"
$n8nUuid = "dskgo80w0sw80o8s8k04go84"
$h = @{
    "Authorization" = "Bearer $env:COOLIFY_API_TOKEN"
    "Accept"        = "application/json"
    "Content-Type"  = "application/json"
}
$n8nBase = $env:N8N_HOST
$n8nApiKey = $env:N8N_API_KEY
$n8nH = @{ "X-N8N-API-KEY" = $n8nApiKey }
$n8nJson = @{ "Content-Type" = "application/json" }

Write-Host "=== Step 1: Restart n8n via Coolify ===" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod -Uri "$coolify/api/v1/services/$n8nUuid/restart" `
        -Method Post -Headers $h -SkipCertificateCheck
    Write-Host "  Restart triggered: $($r | ConvertTo-Json -Compress)"
}
catch {
    Write-Host "  ⚠ Restart error (expected per known issue): $($_.ErrorDetails.Message)"
    Write-Host "  Proceeding to Start after 5s..."
}

Start-Sleep -Seconds 5

Write-Host "`n=== Step 2: Start n8n (post-restart followup) ===" -ForegroundColor Cyan
try {
    $r2 = Invoke-RestMethod -Uri "$coolify/api/v1/services/$n8nUuid/start" `
        -Method Post -Headers $h -SkipCertificateCheck
    Write-Host "  Started: $($r2 | ConvertTo-Json -Compress)"
}
catch {
    Write-Host "  ⚠ Start: $($_.ErrorDetails.Message)"
}

Write-Host "`nWaiting 35s for n8n to boot and register webhooks..." -ForegroundColor DarkGray
Start-Sleep -Seconds 35

Write-Host "`n=== Step 3: Verify webhooks ===" -ForegroundColor Cyan
$webhooks = @(
    @{ name = "CI Triage Router"; url = "$n8nBase/webhook/ci-triage"; payload = @{ repository = "IronForge"; conclusion = "failure"; run_id = "verify-$(Get-Date -Format 'HHmmss')" } }
    @{ name = "Reviewer Aggregator"; url = "$n8nBase/webhook/reviewer-aggregate"; payload = @{ action = "submitted"; pr_number = 243 } }
    @{ name = "IronForge Remote Trigger"; url = "$n8nBase/webhook/ironforge-trigger"; payload = @{ task = "verify"; dry_run = $true } }
)
foreach ($wh in $webhooks) {
    $body = $wh.payload | ConvertTo-Json -Compress
    try {
        $r = Invoke-RestMethod -Uri $wh.url -Method Post -Headers $n8nJson -Body $body -SkipCertificateCheck
        Write-Host "  ✅ $($wh.name) — webhook accepted"
    }
    catch {
        $code = $_.Exception.Response.StatusCode.value__
        $msgRaw = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        $msg = if ($msgRaw) { $msgRaw.message } else { $_.ErrorDetails.Message }
        Write-Host "  ❌ $($wh.name) — HTTP $code : $msg"
    }
}

Start-Sleep -Seconds 8

Write-Host "`n=== Step 4: Final execution results ===" -ForegroundColor Cyan
$wfMap = @{
    "CI Triage Router"            = "LLWLOkXohXpMxoPR"
    "IronForge Remote Trigger V3" = "N6l6IZxtvbhnwS3x"
    "Reviewer Aggregator"         = "AD8oaoJQFMPQm6JO"
    "Monitoring Dashboard"        = "Tv0z7QUCzTfgLDGq"
    "IronForge Morning Reminder"  = "8z5fycjP1iyVX4PH"
}
foreach ($name in ($wfMap.Keys | Sort-Object)) {
    $id = $wfMap[$name]
    $exec = Invoke-RestMethod -Uri "$n8nBase/api/v1/executions?workflowId=$id&limit=1" `
        -Headers $n8nH -SkipCertificateCheck
    $last = $exec.data | Select-Object -First 1
    if ($last) {
        $ago = [Math]::Round(((Get-Date) - [DateTime]$last.startedAt).TotalMinutes, 1)
        $dur = if ($last.stoppedAt) { [Math]::Round(([DateTime]$last.stoppedAt - [DateTime]$last.startedAt).TotalMilliseconds) } else { "?" }
        $icon = if ($last.status -eq "success") { "✅" } elseif ($last.status -eq "error") { "❌" } else { "⏳" }
        Write-Host "  $icon $name — $($last.status.ToUpper()) (${ago}min ago, ${dur}ms)"
        if ($last.status -eq "error") {
            $d = Invoke-RestMethod -Uri "$n8nBase/api/v1/executions/$($last.id)?includeData=true" -Headers $n8nH -SkipCertificateCheck
            $rErr = $d.data.resultData.runData.PSObject.Properties | Where-Object { $_.Value.error }
            if ($rErr) { $rErr | ForEach-Object { Write-Host "     ↳ [$($_.Name)] $($_.Value.error.message)" } }
        }
    }
    else {
        Write-Host "  ⚪ $name — no executions"
    }
}
