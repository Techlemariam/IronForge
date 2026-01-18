#Requires -Version 7.0
<#
.SYNOPSIS
    Generates sprint plan from GitHub Project backlog

.DESCRIPTION
    Queries GitHub Project #4 for Backlog items, prioritizes them according to
    sprint-plan.md rules, and generates next.md with proper formatting.
    Uses SprintCommon for robustness (locks, retries, logging).

.PARAMETER BacklogFile
    Optional JSON file with pre-fetched backlog items

.PARAMETER OutputFile
    Output path for generated sprint plan (default: .agent/sprints/next.md)

.PARAMETER SprintName
    Optional sprint name (default: auto-generated from date)

.PARAMETER MaxItems
    Maximum number of items to include (default: 8)

.PARAMETER MaxHours
    Maximum estimated hours (default: 20)
#>

param(
    [Parameter(Mandatory = $false)]
    [string]$BacklogFile,

    [Parameter(Mandatory = $false)]
    [string]$OutputFile = ".agent/sprints/next.md",

    [Parameter(Mandatory = $false)]
    [string]$SprintName,

    [Parameter(Mandatory = $false)]
    [int]$MaxItems = 8,

    [Parameter(Mandatory = $false)]
    [int]$MaxHours = 20
)

$ErrorActionPreference = "Stop"

# Import shared module
$SprintModule = Join-Path $PSScriptRoot "lib/SprintCommon.psm1"
if (Test-Path $SprintModule) {
    Import-Module $SprintModule -Force
}
else {
    throw "SprintCommon.psm1 not found. Run from correct directory."
}

# Helper: Fetch backlog from Project
function Get-ProjectBacklog {
    param([object]$Config)
    
    Write-Host "📊 Fetching backlog from GitHub Project #$($Config.projectNumber)..." -ForegroundColor Cyan
    
    $query = @"
query {
  node(id: "$($Config.projectId)") {
    ... on ProjectV2 {
      items(first: 100) {
        nodes {
          id
          content {
            ... on Issue {
              number
              title
              labels(first: 10) { nodes { name } }
              body
            }
          }
          fieldValues(first: 10) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                field { ... on ProjectV2FieldCommon { name } }
                name
              }
              ... on ProjectV2ItemFieldNumberValue {
                field { ... on ProjectV2FieldCommon { name } }
                number
              }
            }
          }
        }
      }
    }
  }
}
"@
    
    $result = Invoke-GraphQL -Query $query -OperationName "GetBacklog"
    
    # Filter for Backlog items only
    $backlogItems = $result.data.node.items.nodes | Where-Object {
        $status = $_.fieldValues.nodes | Where-Object { $_.field.name -eq "Status" } | Select-Object -First 1
        $status.name -eq "Backlog"
    }
    
    Write-Host "✓ Found $($backlogItems.Count) backlog items" -ForegroundColor Green
    return $backlogItems
}

# Helper: Parse item metadata
function Get-ItemMetadata {
    param([object]$Item)
    
    $metadata = @{
        Number   = $Item.content.number
        Title    = $Item.content.title
        Priority = "Medium"
        Effort   = "M"
        Domain   = "Unknown"
        ROI      = 0
        Labels   = @()
    }
    
    # Extract field values
    foreach ($field in $Item.fieldValues.nodes) {
        switch ($field.field.name) {
            "Priority" { $metadata.Priority = $field.name }
            "Effort" { $metadata.Effort = $field.name }
            "Domain" { $metadata.Domain = $field.name }
            "ROI" { $metadata.ROI = $field.number }
        }
    }
    
    # Extract labels
    if ($Item.content.labels.nodes) {
        $metadata.Labels = $Item.content.labels.nodes | ForEach-Object { $_.name }
    }
    
    return $metadata
}

# Helper: Estimate hours from effort
function Get-EstimatedHours {
    param([string]$Effort)
    
    switch ($Effort) {
        "S" { return 2 }
        "M" { return 4 }
        "L" { return 8 }
        "XL" { return 12 }
        default { return 4 }
    }
}

# Helper: Determine agent from domain/labels
function Get-SuggestedAgent {
    param([object]$Metadata)
    
    # Check labels first
    if ($Metadata.Labels -contains "bug") { return "debug" }
    if ($Metadata.Labels -contains "debt") { return "cleanup" }
    if ($Metadata.Labels -contains "ui") { return "ui-ux" }
    if ($Metadata.Labels -contains "security") { return "security" }
    
    # Check domain
    switch ($Metadata.Domain) {
        "game" { return "game-designer" }
        "bio" { return "titan-coach" }
        "infra" { return "infrastructure" }
        "social" { return "coder" }
        "commerce" { return "coder" }
        default { return "coder" }
    }
}

# Main
try {
    Write-Host "🚀 Sprint Plan Generator" -ForegroundColor Cyan
    Write-Host "─────────────────────────" -ForegroundColor DarkGray
    
    # Acquire lock for planning (ensure only one plan generated at a time)
    $lockFile = $null
    try {
        $lockFile = Enter-SprintLock -LockName "generate-plan"
    }
    catch {
        Write-Host "⚠️  Could not acquire lock: $($_.Exception.Message)" -ForegroundColor Yellow
        exit 1
    }

    try {
        # Load config
        $config = Get-SprintConfig
        
        # Get backlog items
        if ($BacklogFile -and (Test-Path $BacklogFile)) {
            Write-Host "📂 Loading backlog from file: $BacklogFile" -ForegroundColor Yellow
            $backlogItems = Get-Content $BacklogFile | ConvertFrom-Json
        }
        else {
            $backlogItems = Get-ProjectBacklog -Config $config
        }
        
        if ($backlogItems.Count -eq 0) {
            Write-Host "⚠️  No backlog items found. Exiting." -ForegroundColor Yellow
            exit 0
        }
        
        # Parse and prioritize
        Write-Host "`n📋 Analyzing items..." -ForegroundColor Cyan
        
        $parsedItems = $backlogItems | ForEach-Object {
            $metadata = Get-ItemMetadata -Item $_
            $metadata.EstimatedHours = Get-EstimatedHours -Effort $metadata.Effort
            $metadata.Agent = Get-SuggestedAgent -Metadata $metadata
            $metadata
        }
        
        # Sort by priority, then ROI
        $priorityOrder = @{ "Critical" = 1; "High" = 2; "Medium" = 3; "Low" = 4 }
        $sorted = $parsedItems | Sort-Object {
            $priorityOrder[$_.Priority]
        }, { - $_.ROI }
        
        # Limit to MaxItems and MaxHours
        $selected = @()
        $totalHours = 0
        
        foreach ($item in $sorted) {
            if ($selected.Count -ge $MaxItems) { break }
            if (($totalHours + $item.EstimatedHours) -gt $MaxHours) { continue }
            
            $selected += $item
            $totalHours += $item.EstimatedHours
        }
        
        Write-Host "✓ Selected $($selected.Count) items ($totalHours hours)" -ForegroundColor Green
        
        # Calculate stats
        $debtCount = ($selected | Where-Object { $_.Labels -contains "debt" }).Count
        $debtRatio = if ($selected.Count -gt 0) { [math]::Round(($debtCount / $selected.Count) * 100) } else { 0 }
        
        # Generate sprint name
        if (-not $SprintName) {
            $weekNumber = (Get-Date).ToString("yyyy-'W'ww")
            $SprintName = "Sprint $weekNumber"
        }
        
        # Generate next.md
        Write-Host "`n📝 Generating sprint plan..." -ForegroundColor Cyan
        
        $startDate = (Get-Date).ToString("yyyy-MM-dd")
        $endDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        
        $sprintPlan = @"
## Next Sprint: $SprintName

**Period**: $startDate - $endDate
**Goal**: Execute highest-priority backlog items from Project #4

## Backlog

"@
        
        # Group by priority
        foreach ($priority in @("Critical", "High", "Medium", "Low")) {
            $items = $selected | Where-Object { $_.Priority -eq $priority }
            if ($items.Count -eq 0) { continue }
            
            $sprintPlan += "`n### Priority: $priority`n`n"
            
            foreach ($item in $items) {
                $sprintPlan += "- [ ] $($item.Title) <!-- agent: $($item.Agent) | estimate: $($item.EstimatedHours)h | source: Issue #$($item.Number) -->`n"
            }
        }
        
        $sprintPlan += @"

---

## Sprint Stats

- **Total Items**: $($selected.Count)
- **Estimated Hours**: ${totalHours}h
- **Debt Ratio**: ${debtRatio}%

## Dependencies

- None identified (auto-generated plan)

---

**Generated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Source**: GitHub Project #$($config.projectNumber)
"@
        
        # Write to file
        $outputDir = Split-Path $OutputFile -Parent
        if (-not (Test-Path $outputDir)) {
            New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
        }
        
        $sprintPlan | Out-File $OutputFile -Encoding UTF8 -NoNewline
        
        Write-Host "✅ Sprint plan generated: $OutputFile" -ForegroundColor Green
        Write-Host "`n📊 Summary:" -ForegroundColor Cyan
        Write-Host "   Items: $($selected.Count)/$MaxItems" -ForegroundColor White
        Write-Host "   Hours: ${totalHours}h/${MaxHours}h" -ForegroundColor White
        Write-Host "   Debt: ${debtRatio}%" -ForegroundColor White
        
        # Write Job Summary for GitHub Actions
        Write-SprintSummary -Title "Automated Sprint Plan" -MarkdownContent $sprintPlan
    }
    finally {
        if ($lockFile) {
            Exit-SprintLock -LockFile $lockFile
        }
    }
}
catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-SprintLog -Operation "Planning" -Level "ERROR" -Message $_.Exception.Message
    exit 1
}
