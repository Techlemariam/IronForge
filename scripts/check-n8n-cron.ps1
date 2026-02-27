<#
.SYNOPSIS
  Check n8n Reviewer Aggregator cron health.
.DESCRIPTION
  Queries the n8n API for the latest execution of the reviewer-aggregator
  workflow and alerts if it hasn't run in the last 2 hours.
#>

$ErrorActionPreference = "Stop"

$n8nHost = $env:N8N_HOST
$n8nApiKey = $env:N8N_API_KEY

if (-not $n8nHost -or -not $n8nApiKey) {
    Write-Error "❌ N8N_HOST and N8N_API_KEY must be set (use doppler run)"
    exit 1
}

$headers = @{ "X-N8N-API-KEY" = $n8nApiKey }

# 1. Find reviewer-aggregator workflow
Write-Host "🔍 Checking Reviewer Aggregator health..." -ForegroundColor Cyan
$workflows = Invoke-RestMethod -Uri "$n8nHost/api/v1/workflows" -Headers $headers
$aggregator = $workflows.data | Where-Object { $_.name -match "reviewer.aggregator" -or $_.name -match "Reviewer" }

if (-not $aggregator) {
    Write-Host "⚠️ Reviewer Aggregator workflow not found in n8n!" -ForegroundColor Yellow
    exit 1
}

$workflowId = $aggregator[0].id
$isActive = $aggregator[0].active
Write-Host "  Workflow ID: $workflowId"
Write-Host "  Active: $isActive"

if (-not $isActive) {
    Write-Host "🚨 Reviewer Aggregator is INACTIVE!" -ForegroundColor Red
    exit 1
}

# 2. Check last execution
$executions = Invoke-RestMethod -Uri "$n8nHost/api/v1/executions?workflowId=$workflowId&limit=1" -Headers $headers
$lastExec = $executions.data | Select-Object -First 1

if (-not $lastExec) {
    Write-Host "⚠️ No executions found for Reviewer Aggregator" -ForegroundColor Yellow
    exit 1
}

$lastTime = [DateTime]::Parse($lastExec.startedAt)
$hoursAgo = [Math]::Round(((Get-Date).ToUniversalTime() - $lastTime).TotalHours, 1)

Write-Host "  Last execution: $($lastExec.startedAt) ($hoursAgo hours ago)"
Write-Host "  Status: $($lastExec.status)"

if ($hoursAgo -gt 2) {
    Write-Host "🚨 Reviewer Aggregator hasn't run in $hoursAgo hours (threshold: 2h)" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Reviewer Aggregator is healthy (last run: ${hoursAgo}h ago)" -ForegroundColor Green
