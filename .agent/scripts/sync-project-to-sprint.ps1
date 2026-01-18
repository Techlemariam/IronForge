#Requires -Version 7.0
<#
.SYNOPSIS
    Syncs GitHub Project status to current.md sprint file

.DESCRIPTION
    Queries GitHub Project for sprint-related issues, checks their status,
    and updates current.md to reflect completed tasks. Ensures bi-directional sync.
    Uses SprintCommon for robustness (locks, retries).

.PARAMETER SprintFile
    Path to sprint file (default: .agent/sprints/current.md)

.PARAMETER DryRun
    Show what would be updated without making changes
#>

param(
    [Parameter(Mandatory = $false)]
    [string]$SprintFile = ".agent/sprints/current.md",

    [Parameter(Mandatory = $false)]
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# Import shared module
$SprintModule = Join-Path $PSScriptRoot "lib\SprintCommon.psm1"
if (Test-Path $SprintModule) {
    Import-Module $SprintModule -Force
}
else {
    throw "SprintCommon.psm1 not found. Run from correct directory."
}

# Helper: Get sprint issues from Project
function Get-SprintIssues {
    param([object]$Config)
    
    Write-Host "📊 Fetching sprint issues from Project..." -ForegroundColor Cyan
    
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
              state
            }
          }
          fieldValues(first: 10) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                field { ... on ProjectV2FieldCommon { name } }
                name
              }
              ... on ProjectV2ItemFieldIterationValue {
                field { ... on ProjectV2FieldCommon { name } }
                iterationId
                title
              }
            }
          }
        }
      }
    }
  }
}
"@
    
    $result = Invoke-GraphQL -Query $query -OperationName "GetSprintIssues"
    
    # Filter for current sprint items
    $currentSprintId = $Config.fields.sprint.current.id
    $sprintItems = $result.data.node.items.nodes | Where-Object {
        $sprintField = $_.fieldValues.nodes | Where-Object { 
            $_.field.name -eq "Sprint" -and $_.iterationId -eq $currentSprintId
        }
        $null -ne $sprintField
    }
    
    Write-Host "✓ Found $($sprintItems.Count) items in current sprint ($($Config.fields.sprint.current.title))" -ForegroundColor Green
    return $sprintItems
}

# Helper: Parse current.md tasks
function Get-CurrentTasks {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        throw "Sprint file not found: $FilePath"
    }
    
    $content = Get-Content $FilePath -Raw
    
    # Match both checked and unchecked tasks
    $pattern = '- \[(.)\] (.+?) <!--\s*agent:\s*(\w+)\s*\|\s*estimate:\s*([\d.]+)h\s*\|\s*source:\s*(.+?)\s*-->'
    $taskMatches = [regex]::Matches($content, $pattern)
    
    $tasks = @()
    foreach ($match in $taskMatches) {
        $tasks += @{
            Checked   = $match.Groups[1].Value -eq "x"
            Title     = $match.Groups[2].Value.Trim()
            Agent     = $match.Groups[3].Value.Trim()
            Estimate  = $match.Groups[4].Value.Trim()
            Source    = $match.Groups[5].Value.Trim()
            FullMatch = $match.Value
        }
    }
    
    return $tasks
}

# Helper: Extract issue number from source
function Get-IssueNumber {
    param([string]$Source)
    
    # Match "Issue #123" or "#123"
    $match = [regex]::Match($Source, '#(\d+)')
    if ($match.Success) {
        return [int]$match.Groups[1].Value
    }
    return $null
}

# Main
try {
    Write-Host "🔄 Sprint Sync (Project → Markdown)" -ForegroundColor Cyan
    Write-Host "────────────────────────────────────" -ForegroundColor DarkGray

    # Acquire lock for sync operations
    $lockFile = $null
    if (-not $DryRun) {
        try {
            # Low timeout for sync, skip if busy
            $lockFile = Enter-SprintLock -LockName "sprint-sync" -TimeoutSeconds 5
        }
        catch {
            Write-Host "⚠️  Could not acquire lock, skipping sync." -ForegroundColor Yellow
            exit 0
        }
    }

    try {
        # Load config via SprintCommon
        $config = Get-SprintConfig
        
        # Get Project issues
        $projectIssues = Get-SprintIssues -Config $config
        
        # Parse current.md
        Write-Host "📂 Reading sprint file: $SprintFile" -ForegroundColor Yellow
        $currentTasks = Get-CurrentTasks -FilePath $SprintFile
        Write-Host "✓ Found $($currentTasks.Count) tasks in sprint file" -ForegroundColor Green
        
        # Build lookup map: issue number → status
        $issueStatusMap = @{}
        foreach ($item in $projectIssues) {
            $issueNumber = $item.content.number
            $status = $item.fieldValues.nodes | Where-Object { $_.field.name -eq "Status" } | Select-Object -First 1
            $issueState = $item.content.state
            
            # Consider done if: status = "Done" OR issue state = "CLOSED"
            $isDone = ($status.name -eq "Done") -or ($issueState -eq "CLOSED")
            
            $issueStatusMap[$issueNumber] = @{
                Status = $status.name
                State  = $issueState
                IsDone = $isDone
            }
        }
        
        # Check for updates needed
        $updatesNeeded = @()
        
        foreach ($task in $currentTasks) {
            $issueNumber = Get-IssueNumber -Source $task.Source
            
            if ($null -eq $issueNumber) { continue }
            
            if (-not $issueStatusMap.ContainsKey($issueNumber)) { continue }
            
            $projectStatus = $issueStatusMap[$issueNumber]
            
            # If Project says done but Markdown says not done → update needed
            if ($projectStatus.IsDone -and -not $task.Checked) {
                $updatesNeeded += @{
                    Task          = $task
                    IssueNumber   = $issueNumber
                    ProjectStatus = $projectStatus.Status
                    Action        = "Mark as done"
                }
            }
            
            # If Project says not done but Markdown says done → warn (Markdown is source of truth)
            if (-not $projectStatus.IsDone -and $task.Checked) {
                Write-Host "⚠️  Issue #$issueNumber marked done in Markdown but not in Project" -ForegroundColor Yellow
            }
        }
        
        if ($updatesNeeded.Count -eq 0) {
            Write-Host "`n✅ Sprint file is in sync with Project. No updates needed." -ForegroundColor Green
            exit 0
        }
        
        Write-Host "`n📝 Updates needed: $($updatesNeeded.Count)" -ForegroundColor Cyan
        
        if ($DryRun) {
            Write-Host "`n[DRY RUN] Would update:" -ForegroundColor Yellow
            foreach ($update in $updatesNeeded) {
                Write-Host "  - Issue #$($update.IssueNumber): $($update.Task.Title)" -ForegroundColor White
                Write-Host "    Action: $($update.Action) (Project status: $($update.ProjectStatus))" -ForegroundColor DarkGray
            }
            exit 0
        }
        
        # Apply updates
        Write-Host "`n🔨 Applying updates..." -ForegroundColor Cyan
        $content = Get-Content $SprintFile -Raw
        
        foreach ($update in $updatesNeeded) {
            $oldLine = $update.Task.FullMatch
            $newLine = $oldLine -replace '- \[ \]', '- [x]'
            $content = $content -replace [regex]::Escape($oldLine), $newLine
            
            Write-Host "  ✓ Marked as done: Issue #$($update.IssueNumber)" -ForegroundColor Green
            
            Write-SprintLog -Operation "Sync" -Level "INFO" `
                -Message "Synced status for #$($update.IssueNumber)" `
                -Data @{ issue = $update.IssueNumber; status = $update.ProjectStatus }
        }
        
        # Write back to file
        $content | Out-File $SprintFile -Encoding UTF8 -NoNewline
        Write-Host "`n✅ Sprint file updated with $($updatesNeeded.Count) changes" -ForegroundColor Green

        # Update Metrics
        $config = Get-SprintConfig
        $sprintName = $config.fields.sprint.current.title
        
        # Calculate totals from current.md state
        $totalItems = $currentTasks.Count
        $completedItems = ($currentTasks | Where-Object { $_.Checked }).Count
        $totalHours = ($currentTasks | Measure-Object -Property Estimate -Sum).Sum
        $completedTasks = $currentTasks | Where-Object { $_.Checked }
        $completedHours = if ($completedTasks) { ($completedTasks | Measure-Object -Property Estimate -Sum).Sum } else { 0 }

        Add-SprintMetrics `
            -SprintName $sprintName `
            -PlannedItems $totalItems `
            -PlannedHours $totalHours `
            -CompletedItems $completedItems `
            -ActualHours $completedHours `
            -Status "in_progress"
    }
    finally {
        if ($lockFile) {
            Exit-SprintLock -LockFile $lockFile
        }
    }
}
catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-SprintLog -Operation "Sync" -Level "ERROR" -Message $_.Exception.Message
    exit 1
}
