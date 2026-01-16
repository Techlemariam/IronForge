#Requires -Version 7.0
<#
.SYNOPSIS
    Links a GitHub Issue to Project #4 with metadata (Priority, Domain, ROI, Effort, Status)

.DESCRIPTION
    Links an issue to IronForge Project Board and populates custom fields.
    Can auto-parse metadata from roadmap.md or accept explicit parameters.

.PARAMETER IssueNumber
    GitHub Issue number (required)

.PARAMETER Priority
    Priority level. Valid: critical, high, medium, low

.PARAMETER Domain
    Domain area. Valid: game, infra, bio, social, commerce

.PARAMETER Effort
    Effort estimate. Valid: S, M, L, XL

.PARAMETER ROI
    Numeric ROI value

.PARAMETER Status
    Status in Project. Valid: backlog, in_progress, in_review, merged_staging, done
    Defaults to "backlog"

.PARAMETER Auto
    Auto-parse metadata from roadmap.md comments

.PARAMETER WhatIf
    Shows what would happen without making changes

.EXAMPLE
    .\link-issue-to-project.ps1 -IssueNumber 42 -Priority "high" -Domain "game" -Effort "L"
    
.EXAMPLE
    .\link-issue-to-project.ps1 -IssueNumber 42 -Auto
    Auto-parses metadata from roadmap.md
#>

param(
    [Parameter(Mandatory = $true)]
    [int]$IssueNumber,

    [Parameter(Mandatory = $false)]
    [ValidateSet("critical", "high", "medium", "low")]
    [string]$Priority,

    [Parameter(Mandatory = $false)]
    [ValidateSet("game", "infra", "bio", "social", "commerce")]
    [string]$Domain,

    [Parameter(Mandatory = $false)]
    [ValidateSet("S", "M", "L", "XL")]
    [string]$Effort,

    [Parameter(Mandatory = $false)]
    [double]$ROI,

    [Parameter(Mandatory = $false)]
    [ValidateSet("backlog", "in_progress", "in_review", "merged_staging", "done")]
    [string]$Status = "backlog",

    [Parameter(Mandatory = $false)]
    [switch]$Auto,

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

# Helper: Parse roadmap metadata
function Get-RoadmapMetadata {
    param([int]$IssueNum)
    
    $roadmapPath = Join-Path $PSScriptRoot "..\..\roadmap.md"
    if (-not (Test-Path $roadmapPath)) {
        throw "roadmap.md not found"
    }

    $content = Get-Content $roadmapPath -Raw
    
    # Find issue reference and extract metadata from HTML comment
    if ($content -match "#$IssueNum\).*?<!--\s*(.+?)\s*-->") {
        $metadata = @{}
        $comment = $matches[1]
        
        if ($comment -match "priority:\s*(\w+)") { $metadata.Priority = $matches[1] }
        if ($comment -match "domain:\s*(\w+)") { $metadata.Domain = $matches[1] }
        if ($comment -match "effort:\s*(\w+)") { $metadata.Effort = $matches[1] }
        if ($comment -match "roi:\s*([\d.]+)") { $metadata.ROI = [double]$matches[1] }
        
        return $metadata
    }

    return $null
}

# Main
try {
    Write-Host "🔗 GitHub Project Issue Linker" -ForegroundColor Cyan
    Write-Host "───────────────────────────────" -ForegroundColor DarkGray

    # Load config
    $config = Get-ProjectConfig
    Write-Host "✓ Loaded config for Project #$($config.projectNumber)" -ForegroundColor Green

    # Auto-parse metadata if requested
    if ($Auto) {
        Write-Host "⏳ Auto-parsing metadata from roadmap.md..." -ForegroundColor Yellow
        $autoMeta = Get-RoadmapMetadata -IssueNum $IssueNumber
        
        if ($autoMeta) {
            if (-not $Priority -and $autoMeta.Priority) { $Priority = $autoMeta.Priority }
            if (-not $Domain -and $autoMeta.Domain) { $Domain = $autoMeta.Domain }
            if (-not $Effort -and $autoMeta.Effort) { $Effort = $autoMeta.Effort }
            if (-not $ROI -and $autoMeta.ROI) { $ROI = $autoMeta.ROI }
            Write-Host "✓ Auto-parsed: Priority=$Priority, Domain=$Domain, Effort=$Effort, ROI=$ROI" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️  No metadata found in roadmap.md for issue #$IssueNumber" -ForegroundColor Yellow
        }
    }

    Write-Host "✓ Target Issue: #$IssueNumber" -ForegroundColor Green

    if ($WhatIf) {
        Write-Host "`n[WHATIF] Would perform:" -ForegroundColor Yellow
        Write-Host "  1. Add Issue #$IssueNumber to Project #$($config.projectNumber)"
        Write-Host "  2. Set Status = '$Status'"
        if ($Priority) { Write-Host "  3. Set Priority = '$Priority'" }
        if ($Domain) { Write-Host "  4. Set Domain = '$Domain'" }
        if ($Effort) { Write-Host "  5. Set Effort = '$Effort'" }
        if ($ROI) { Write-Host "  6. Set ROI = $ROI" }
        exit 0
    }

    # Get Issue URL
    $issueUrl = gh issue view $IssueNumber --json url -q .url
    if (-not $issueUrl) {
        throw "Failed to get URL for issue #$IssueNumber"
    }

    Write-Host "✓ Issue URL: $issueUrl" -ForegroundColor Green

    # Add Issue to Project
    Write-Host "`n⏳ Adding Issue to Project..." -ForegroundColor Yellow
    $addResult = gh project item-add $config.projectNumber --owner $config.owner --url $issueUrl 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        if ($addResult -match "already exists") {
            Write-Host "⚠️  Issue already in Project (skipping add)" -ForegroundColor Yellow
        }
        else {
            throw "Failed to add issue to Project: $addResult"
        }
    }
    else {
        Write-Host "✓ Issue added to Project" -ForegroundColor Green
    }

    # Get item ID
    Write-Host "`n⏳ Fetching Project item ID..." -ForegroundColor Yellow
    $itemsJson = gh project item-list $config.projectNumber --owner $config.owner --format json --limit 100 | ConvertFrom-Json
    $item = $itemsJson.items | Where-Object { $_.content.number -eq $IssueNumber } | Select-Object -First 1

    if (-not $item) {
        throw "Could not find issue #$IssueNumber in Project items"
    }

    $itemId = $item.id
    Write-Host "✓ Item ID: $itemId" -ForegroundColor Green

    # Update fields
    $updates = @()

    # Status (always set)
    $statusField = $config.fields.status
    $statusOptionId = $statusField.options.$Status
    if ($statusOptionId) {
        gh project item-edit --project-id $config.projectId --id $itemId `
            --field-id $statusField.id --single-select-option-id $statusOptionId | Out-Null
        $updates += "Status=$Status"
    }

    # Priority
    if ($Priority) {
        $priorityField = $config.fields.priority
        $priorityOptionId = $priorityField.options.$Priority
        if ($priorityOptionId) {
            gh project item-edit --project-id $config.projectId --id $itemId `
                --field-id $priorityField.id --single-select-option-id $priorityOptionId | Out-Null
            $updates += "Priority=$Priority"
        }
    }

    # Domain
    if ($Domain) {
        $domainField = $config.fields.domain
        $domainOptionId = $domainField.options.$Domain
        if ($domainOptionId) {
            gh project item-edit --project-id $config.projectId --id $itemId `
                --field-id $domainField.id --single-select-option-id $domainOptionId | Out-Null
            $updates += "Domain=$Domain"
        }
    }

    # Effort
    if ($Effort) {
        $effortField = $config.fields.effort
        $effortOptionId = $effortField.options.$Effort
        if ($effortOptionId) {
            gh project item-edit --project-id $config.projectId --id $itemId `
                --field-id $effortField.id --single-select-option-id $effortOptionId | Out-Null
            $updates += "Effort=$Effort"
        }
    }

    # ROI
    if ($ROI) {
        $roiField = $config.fields.roi
        gh project item-edit --project-id $config.projectId --id $itemId `
            --field-id $roiField.id --number $ROI | Out-Null
        $updates += "ROI=$ROI"
    }

    Write-Host "`n✅ Success! Issue #$IssueNumber linked with: $($updates -join ', ')" -ForegroundColor Green

}
catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
