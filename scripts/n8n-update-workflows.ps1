#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/n8n-update-workflows.ps1
$n8nHost = "https://ironforge-coolify.tailafb692.ts.net"
$key = $env:N8N_API_KEY

if (-not $key) { Write-Error "N8N_API_KEY missing"; exit 1 }

$headers = @{
    "X-N8N-API-KEY" = $key
    "Content-Type"  = "application/json"
}

# Update CI Triage Router
$wf1Id = "LLWLOkXohXpMxoPR"
$wf1Body = Get-Content -Raw n8n/ci-triage-router.n8n
Write-Host "Updating CI Triage Router ($wf1Id)..."
$r1 = Invoke-RestMethod -Uri "$n8nHost/api/v1/workflows/$wf1Id" `
    -Method Put `
    -Headers $headers `
    -Body $wf1Body `
    -SkipCertificateCheck
Write-Host "CI Triage Router updated: $($r1.id) - $($r1.name)"

# Update Reviewer Aggregator
$wf2Id = "AD8oaoJQFMPQm6JO"
$wf2Body = Get-Content -Raw n8n/reviewer-aggregator.n8n
Write-Host "Updating Reviewer Aggregator ($wf2Id)..."
$r2 = Invoke-RestMethod -Uri "$n8nHost/api/v1/workflows/$wf2Id" `
    -Method Put `
    -Headers $headers `
    -Body $wf2Body `
    -SkipCertificateCheck
Write-Host "Reviewer Aggregator updated: $($r2.id) - $($r2.name)"
