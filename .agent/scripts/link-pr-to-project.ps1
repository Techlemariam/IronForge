#Requires -Version 7.0
<#
.SYNOPSIS
    Links a Pull Request to GitHub Project #4 and sets Status to "In Review"

.DESCRIPTION
    Automatically links the current PR (or specified PR) to the IronForge Project Board
    and sets the status to "In Review". Reads configuration from github-project.json.

.PARAMETER PRNumber
    Optional PR number. If not specified, auto-detects from current branch.

.PARAMETER Status
    Optional status to set. Defaults to "in_review". Valid: backlog, in_progress, in_review, merged_staging, done

.PARAMETER WhatIf
    Shows what would happen without making changes

.EXAMPLE
    .\link-pr-to-project.ps1
    Links current PR to Project

.EXAMPLE
    .\link-pr-to-project.ps1 -PRNumber 42 -Status "in_progress"
    Links PR #42 and sets status to In Progress
#>

param(
    [Parameter(Mandatory = $false)]
    [int]$PRNumber,

    [Parameter(Mandatory = $false)]
    [ValidateSet("backlog", "in_progress", "in_review", "merged_staging", "done")]
    [string]$Status = "in_review",

    [Parameter(Mandatory = $false)]
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"

# Helper: Load config
function Get-ProjectConfig {
    $configPath = Join-Path $PSScriptRoot "..\config\github-project.json"
    if (-not (Test-Path $configPath)) {
        throw "Config file not found: $configPath"
    }
    return Get-Content $configPath | ConvertFrom-Json
}

# Helper: Get PR number
function Get-CurrentPR {
    param([int]$ExplicitPR)
    
    if ($ExplicitPR) {
        return $ExplicitPR
    }

    # Try to find PR from current branch
    $currentBranch = git rev-parse --abbrev-ref HEAD 2>$null
    if (-not $currentBranch) {
        throw "Not in a git repository"
    }

    if ($currentBranch -eq "main") {
        throw "Cannot link PR from main branch"
    }

    # Find PR for current branch
    $prJson = gh pr list --head $currentBranch --json number --limit 1 2>$null | ConvertFrom-Json
    if ($prJson -and $prJson.Count -gt 0) {
        return $prJson[0].number
    }

    throw "No PR found for branch '$currentBranch'. Create PR first."
}

# Main
try {
    Write-Host "🔗 GitHub Project PR Linker" -ForegroundColor Cyan
    Write-Host "──────────────────────────────" -ForegroundColor DarkGray

    # Load config
    $config = Get-ProjectConfig
    Write-Host "✓ Loaded config for Project #$($config.projectNumber)" -ForegroundColor Green

    # Get PR number
    $pr = Get-CurrentPR -ExplicitPR $PRNumber
    Write-Host "✓ Target PR: #$pr" -ForegroundColor Green

    if ($WhatIf) {
        Write-Host "`n[WHATIF] Would perform:" -ForegroundColor Yellow
        Write-Host "  1. Add PR #$pr to Project #$($config.projectNumber)"
        Write-Host "  2. Set Status = '$Status'"
        exit 0
    }

    # Get PR URL
    $prUrl = gh pr view $pr --json url -q .url
    if (-not $prUrl) {
        throw "Failed to get URL for PR #$pr"
    }

    Write-Host "✓ PR URL: $prUrl" -ForegroundColor Green

    # Add PR to Project
    Write-Host "`n⏳ Adding PR to Project..." -ForegroundColor Yellow
    $addResult = gh project item-add $config.projectNumber --owner $config.owner --url $prUrl 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        # Check if already added
        if ($addResult -match "already exists") {
            Write-Host "⚠️  PR already in Project (skipping add)" -ForegroundColor Yellow
        }
        else {
            throw "Failed to add PR to Project: $addResult"
        }
    }
    else {
        Write-Host "✓ PR added to Project" -ForegroundColor Green
    }

    # Get item ID
    Write-Host "`n⏳ Fetching Project item ID..." -ForegroundColor Yellow
    $itemsJson = gh project item-list $config.projectNumber --owner $config.owner --format json --limit 100 | ConvertFrom-Json
    $item = $itemsJson.items | Where-Object { $_.content.number -eq $pr } | Select-Object -First 1

    if (-not $item) {
        throw "Could not find PR #$pr in Project items"
    }

    $itemId = $item.id
    Write-Host "✓ Item ID: $itemId" -ForegroundColor Green

    # Set Status
    $statusField = $config.fields.status
    $statusOptionId = $statusField.options.$Status

    if (-not $statusOptionId) {
        throw "Invalid status: $Status"
    }

    Write-Host "`n⏳ Setting Status = '$Status'..." -ForegroundColor Yellow
    gh project item-edit --project-id $config.projectId --id $itemId `
        --field-id $statusField.id --single-select-option-id $statusOptionId | Out-Null

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to set status"
    }

    Write-Host "✓ Status updated" -ForegroundColor Green

    Write-Host "`n✅ Success! PR #$pr linked to Project with Status = '$Status'" -ForegroundColor Green

}
catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
