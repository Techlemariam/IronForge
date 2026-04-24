#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/n8n-update-workflows.ps1
# ALL credentials (N8N_API_KEY, N8N_HOST) come from Doppler.

$ErrorActionPreference = "Stop"

# Dot-source shared Doppler-backed n8n credentials
. "$PSScriptRoot/n8n-api.ps1"

# Update CI Triage Router
$wf1Id = "LLWLOkXohXpMxoPR"
$wf1Body = Get-Content -Raw (Join-Path (Split-Path $PSScriptRoot -Parent) 'n8n/ci-triage-router.n8n')
Write-Host "Updating CI Triage Router ($wf1Id)..." -ForegroundColor Cyan
$r1 = Invoke-RestMethod @N8nPut -Uri "$N8nHost/api/v1/workflows/$wf1Id" -Body $wf1Body
Write-Host "  ✅ CI Triage Router updated: $($r1.id) - $($r1.name)"

# Update Reviewer Aggregator
$wf2Id = "AD8oaoJQFMPQm6JO"
$wf2Body = Get-Content -Raw (Join-Path (Split-Path $PSScriptRoot -Parent) 'n8n/reviewer-aggregator.n8n')
Write-Host "Updating Reviewer Aggregator ($wf2Id)..." -ForegroundColor Cyan
$r2 = Invoke-RestMethod @N8nPut -Uri "$N8nHost/api/v1/workflows/$wf2Id" -Body $wf2Body
Write-Host "  ✅ Reviewer Aggregator updated: $($r2.id) - $($r2.name)"
