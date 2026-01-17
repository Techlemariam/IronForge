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

# Import common module for retry logic and logging
$CommonModule = Join-Path $PSScriptRoot "lib\Common.psm1"
if (Test-Path $CommonModule) {
    Import-Module $CommonModule -Force
    Initialize-ProjectLogger -LogName "link-issue"
}

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

    # Get Issue Node ID (global ID)
    $issueNodeId = gh issue view $IssueNumber --json id -q .id
    if (-not $issueNodeId) {
        throw "Failed to get Global ID for issue #$IssueNumber"
    }

    # Add Issue to Project using GraphQL (bypass owner resolution issues)
    Write-Host "`n⏳ Adding Issue to Project (GraphQL)..." -ForegroundColor Yellow
    
    $query = 'mutation($project:ID!, $item:ID!) { addProjectV2ItemById(input: {projectId: $project, contentId: $item}) { item { id } } }'
    $addResultJson = gh api graphql -f query=$query -f project=$($config.projectId) -f item=$issueNodeId 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to add issue to Project via GraphQL: $addResultJson"
    }
    
    $itemId = ($addResultJson | ConvertFrom-Json).data.addProjectV2ItemById.item.id
    Write-Host "✓ Issue added to Project. Item ID: $itemId" -ForegroundColor Green


    # Update fields
    $updates = @()

    # Status (always set)
    $statusField = $config.fields.status
    $statusOptionId = $statusField.options.$Status
    if ($statusOptionId) {
        $mutation = 'mutation($project:ID!, $item:ID!, $field:ID!, $value:String!) { updateProjectV2ItemFieldValue(input: {projectId: $project, itemId: $item, fieldId: $field, value: { singleSelectOptionId: $value }}) { projectV2Item { id } } }'
        $res = gh api graphql -f query=$mutation -f project=$($config.projectId) -f item=$itemId -f field=$($statusField.id) -f value=$statusOptionId 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Failed to set Status: $res" }
        $updates += "Status=$Status"
    }

    # Priority
    if ($Priority) {
        $priorityField = $config.fields.priority
        $priorityOptionId = $priorityField.options.$Priority
        if ($priorityOptionId) {
            $mutation = 'mutation($project:ID!, $item:ID!, $field:ID!, $value:String!) { updateProjectV2ItemFieldValue(input: {projectId: $project, itemId: $item, fieldId: $field, value: { singleSelectOptionId: $value }}) { projectV2Item { id } } }'
            $res = gh api graphql -f query=$mutation -f project=$($config.projectId) -f item=$itemId -f field=$($priorityField.id) -f value=$priorityOptionId 2>&1
            if ($LASTEXITCODE -ne 0) { throw "Failed to set Priority: $res" }
            $updates += "Priority=$Priority"
        }
    }

    # Domain
    if ($Domain) {
        $domainField = $config.fields.domain
        $domainOptionId = $domainField.options.$Domain
        if ($domainOptionId) {
            $mutation = 'mutation($project:ID!, $item:ID!, $field:ID!, $value:String!) { updateProjectV2ItemFieldValue(input: {projectId: $project, itemId: $item, fieldId: $field, value: { singleSelectOptionId: $value }}) { projectV2Item { id } } }'
            $res = gh api graphql -f query=$mutation -f project=$($config.projectId) -f item=$itemId -f field=$($domainField.id) -f value=$domainOptionId 2>&1
            if ($LASTEXITCODE -ne 0) { throw "Failed to set Domain: $res" }
            $updates += "Domain=$Domain"
        }
    }

    # Effort
    if ($Effort) {
        $effortField = $config.fields.effort
        $effortOptionId = $effortField.options.$Effort
        if ($effortOptionId) {
            $mutation = 'mutation($project:ID!, $item:ID!, $field:ID!, $value:String!) { updateProjectV2ItemFieldValue(input: {projectId: $project, itemId: $item, fieldId: $field, value: { singleSelectOptionId: $value }}) { projectV2Item { id } } }'
            $res = gh api graphql -f query=$mutation -f project=$($config.projectId) -f item=$itemId -f field=$($effortField.id) -f value=$effortOptionId 2>&1
            if ($LASTEXITCODE -ne 0) { throw "Failed to set Effort: $res" }
            $updates += "Effort=$Effort"
        }
    }

    # ROI
    if ($ROI) {
        $roiField = $config.fields.roi
        $mutation = 'mutation($project:ID!, $item:ID!, $field:ID!, $value:Float!) { updateProjectV2ItemFieldValue(input: {projectId: $project, itemId: $item, fieldId: $field, value: { number: $value }}) { projectV2Item { id } } }'
        $res = gh api graphql -f query=$mutation -f project=$($config.projectId) -f item=$itemId -f field=$($roiField.id) -F value=$ROI 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Failed to set ROI: $res" }
        $updates += "ROI=$ROI"
    }

    Write-Host "`n✅ Success! Issue #$IssueNumber linked with: $($updates -join ', ')" -ForegroundColor Green

}
catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
