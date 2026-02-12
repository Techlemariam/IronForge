<#
.SYNOPSIS
  Helper script to monitor and report token usage from autonomous workflows.
.DESCRIPTION
  Reads .agent/usage.json and provides aggregated reports by date, workflow, and model.
#>

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$WORKSPACE = Split-Path -Parent $ScriptDir
$USAGE_FILE = Join-Path $WORKSPACE ".agent\usage.json"

if (-not (Test-Path $USAGE_FILE)) {
    Write-Host "No usage data found at $USAGE_FILE" -ForegroundColor Yellow
    exit
}

try {
    $usage = Get-Content $USAGE_FILE | ConvertFrom-Json
    if (-not $usage.history) {
        Write-Host "Usage log is empty." -ForegroundColor Cyan
        exit
    }

    $history = $usage.history | Sort-Object timestamp -Descending

    Write-Host "`n=== Token Usage Report ===" -ForegroundColor Cyan
    Write-Host "Total Managed History: $($history.Count) entries`n"

    # Aggregated by Date
    Write-Host "Daily Consumption:" -ForegroundColor Green
    $history | Group-Object date | Select-Object Name, @{N = 'TotalTokens'; E = { ($_.Group | Measure-Object tokens -Sum).Sum } } | Format-Table -AutoSize

    # Aggregated by Workflow
    Write-Host "Consumption by Workflow (Monthly):" -ForegroundColor Green
    $thisMonth = (Get-Date -Format "yyyy-MM")
    $history | Where-Object { $_.date.StartsWith($thisMonth) } | Group-Object workflow | Select-Object Name, @{N = 'TotalTokens'; E = { ($_.Group | Measure-Object tokens -Sum).Sum } } | Format-Table -AutoSize

    # Recent Alerts
    $today = (Get-Date -Format "yyyy-MM-dd")
    $todayUsage = ($history | Where-Object { $_.date -eq $today } | Measure-Object tokens -Sum).Sum
    Write-Host "Today's Usage: $todayUsage / 500000" -ForegroundColor ($todayUsage -gt 400000 ? "Red" : "White")
    
}
catch {
    Write-Host "Error parsing usage.json: $_" -ForegroundColor Red
}
