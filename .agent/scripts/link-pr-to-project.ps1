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

# Import common module for retry logic and logging
$CommonModule = Join-Path $PSScriptRoot "lib\Common.psm1"
if (Test-Path $CommonModule) {
    Import-Module $CommonModule -Force
    Initialize-ProjectLogger -LogName "link-pr"
}

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

    # Get PR Node ID (global ID)
    $prNodeId = gh pr view $pr --json id -q .id
    if (-not $prNodeId) {
        throw "Failed to get Global ID for PR #$pr"
    }

    # Add PR to Project using GraphQL (bypass owner resolution issues)
    Write-Host "`n⏳ Adding PR to Project (GraphQL)..." -ForegroundColor Yellow
    
    $query = 'mutation($project:ID!, $item:ID!) { addProjectV2ItemById(input: {projectId: $project, contentId: $item}) { item { id } } }'
    $addResultJson = gh api graphql -f query=$query -f project=$($config.projectId) -f item=$prNodeId 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to add PR to Project via GraphQL: $addResultJson"
    }
    
    $itemId = ($addResultJson | ConvertFrom-Json).data.addProjectV2ItemById.item.id
    Write-Host "✓ PR added to Project. Item ID: $itemId" -ForegroundColor Green


    # Set Status
    $statusField = $config.fields.status
    $statusOptionId = $statusField.options.$Status

    if (-not $statusOptionId) {
        throw "Invalid status: $Status"
    }

    Write-Host "`n⏳ Setting Status = '$Status' (GraphQL)..." -ForegroundColor Yellow
    
    $mutation = 'mutation($project:ID!, $item:ID!, $field:ID!, $value:String!) { updateProjectV2ItemFieldValue(input: {projectId: $project, itemId: $item, fieldId: $field, value: { singleSelectOptionId: $value }}) { projectV2Item { id } } }'
    $updateResult = gh api graphql -f query=$mutation -f project=$($config.projectId) -f item=$itemId -f field=$($statusField.id) -f value=$statusOptionId 2>&1

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to set status via GraphQL: $updateResult"
    }

    Write-Host "✓ Status updated" -ForegroundColor Green

    Write-Host "`n✅ Success! PR #$pr linked to Project with Status = '$Status'" -ForegroundColor Green

}
catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
