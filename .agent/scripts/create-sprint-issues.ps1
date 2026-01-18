#Requires -Version 7.0
<#
.SYNOPSIS
    Creates GitHub Issues from sprint tasks

.DESCRIPTION
    Parses current.md sprint file, creates GitHub Issues for each task,
    and links them to GitHub Project #4 with appropriate status.
    Uses SprintCommon for robustness (locks, retries, duplicate checks).

.PARAMETER SprintFile
    Path to sprint file (default: .agent/sprints/current.md)

.PARAMETER Status
    Initial status for created issues (default: in_progress)

.PARAMETER DryRun
    Show what would be created without making changes
#>

param(
    [Parameter(Mandatory = $false)]
    [string]$SprintFile = ".agent/sprints/current.md",

    [Parameter(Mandatory = $false)]
    [ValidateSet("backlog", "in_progress", "in_review", "merged_staging", "done")]
    [string]$Status = "in_progress",

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

# Helper: Parse sprint file
function Get-SprintTasks {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        throw "Sprint file not found: $FilePath"
    }
    
    $content = Get-Content $FilePath -Raw
    
    # Match: - [ ] Title <!-- agent: X | estimate: Yh | source: Z -->
    $pattern = '- \[ \] (.+?) <!--\s*agent:\s*(\w+)\s*\|\s*estimate:\s*([\d.]+)h\s*\|\s*source:\s*(.+?)\s*-->'
    $taskMatches = [regex]::Matches($content, $pattern)
    
    $tasks = @()
    foreach ($match in $taskMatches) {
        $tasks += @{
            Title    = $match.Groups[1].Value.Trim()
            Agent    = $match.Groups[2].Value.Trim()
            Estimate = $match.Groups[3].Value.Trim()
            Source   = $match.Groups[4].Value.Trim()
        }
    }
    
    return $tasks
}

# Helper: Extract sprint metadata
function Get-SprintMetadata {
    param([string]$FilePath)
    
    $content = Get-Content $FilePath -Raw
    
    # Extract sprint name
    $nameMatch = [regex]::Match($content, '## (?:Next Sprint|Current Sprint):\s*(.+)')
    $sprintName = if ($nameMatch.Success) { $nameMatch.Groups[1].Value.Trim() } else { "Unknown Sprint" }
    
    # Extract period
    $periodMatch = [regex]::Match($content, '\*\*Period\*\*:\s*(.+)')
    $period = if ($periodMatch.Success) { $periodMatch.Groups[1].Value.Trim() } else { "Unknown" }
    
    # Extract goal
    $goalMatch = [regex]::Match($content, '\*\*Goal\*\*:\s*(.+)')
    $goal = if ($goalMatch.Success) { $goalMatch.Groups[1].Value.Trim() } else { "No goal specified" }
    
    return @{
        Name   = $sprintName
        Period = $period
        Goal   = $goal
    }
}

# Main
try {
    Write-Host "🎯 Sprint Issue Creator" -ForegroundColor Cyan
    Write-Host "────────────────────────" -ForegroundColor DarkGray
    
    # Parse sprint file
    Write-Host "📂 Reading sprint file: $SprintFile" -ForegroundColor Yellow
    $metadata = Get-SprintMetadata -FilePath $SprintFile
    $tasks = Get-SprintTasks -FilePath $SprintFile
    
    Write-Host "✓ Sprint: $($metadata.Name)" -ForegroundColor Green
    Write-Host "✓ Period: $($metadata.Period)" -ForegroundColor Green
    Write-Host "✓ Found $($tasks.Count) tasks" -ForegroundColor Green
    
    if ($tasks.Count -eq 0) {
        Write-Host "⚠️  No tasks to create. Exiting." -ForegroundColor Yellow
        exit 0
    }
    
    # Validate Capacity using SprintCommon
    $totalHours = 0
    foreach ($task in $tasks) {
        $totalHours += [double]$task.Estimate
    }
    $capacityCheck = Test-SprintCapacity -TotalHours $totalHours -ItemCount $tasks.Count
    
    if (-not $capacityCheck.Valid) {
        Write-Host "⚠️  Sprint capacity warning:" -ForegroundColor Yellow
        foreach ($err in $capacityCheck.Errors) {
            Write-Host "  - $err" -ForegroundColor Yellow
        }
        # We warn but don't stop for now, could become a hard stop later
    }

    if ($DryRun) {
        Write-Host "`n[DRY RUN] Would create the following issues:" -ForegroundColor Yellow
        foreach ($task in $tasks) {
            Write-Host "  - $($task.Title)" -ForegroundColor White
            Write-Host "    Agent: $($task.Agent) | Estimate: $($task.Estimate)h" -ForegroundColor DarkGray
        }
        exit 0
    }
    
    # Create issues
    Write-Host "`n🔨 Creating issues..." -ForegroundColor Cyan
    
    # Acquire lock to prevent concurrent issue creation
    $lockFile = $null
    try {
        $lockFile = Enter-SprintLock -LockName "create-sprint-issues"
    }
    catch {
        Write-Host "⚠️  Could not acquire lock: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   Another sprint operation may be in progress. Aborting." -ForegroundColor Yellow
        exit 1
    }
    
    $createdIssues = @()
    $skippedIssues = @()
    
    try {
        foreach ($task in $tasks) {
            Write-Host "`n  Creating: $($task.Title)" -ForegroundColor Yellow
            
            # Check for duplicate using SprintCommon
            $existing = Test-IssueExists -Title $task.Title -State "open"
            if ($existing) {
                Write-Host "  ⚠️  Issue already exists: #$($existing.number) - Skipping" -ForegroundColor Yellow
                $skippedIssues += @{
                    Title          = $task.Title
                    ExistingNumber = $existing.number
                }
                continue
            }
            
            # Build issue body
            $issueBody = @"
**Sprint Task**

- **Sprint**: $($metadata.Name)
- **Period**: $($metadata.Period)
- **Agent**: @$($task.Agent)
- **Estimate**: $($task.Estimate)h
- **Source**: $($task.Source)

---

## Goal

$($metadata.Goal)

---

*This issue was automatically created from the active sprint plan.*
*File: ``$SprintFile``*
"@
            
            # Create issue with retry logic
            $issueNumber = $null
            $issueUrl = $null
            
            Invoke-RetryableOperation -OperationName "Create Issue" -ScriptBlock {
                $createdUrl = gh issue create `
                    --title $task.Title `
                    --body $issueBody `
                    --label "sprint,auto-generated" `
                    --assignee "@me" 2>&1
                
                if ($LASTEXITCODE -ne 0) {
                    throw "Failed to create issue: $createdUrl"
                }
                
                $issueUrl = $createdUrl
                $issueNumber = ($createdUrl -split '/')[-1]
            }

            Write-Host "  ✓ Created issue #$issueNumber" -ForegroundColor Green
            
            # Link to Project
            Write-Host "  ⏳ Linking to Project..." -ForegroundColor DarkGray
            
            $linkScript = Join-Path $PSScriptRoot "link-issue-to-project.ps1"
            if (Test-Path $linkScript) {
                # We use the existing link script for basic linking
                & $linkScript -IssueNumber $issueNumber -Status $Status 2>&1 | Out-Null
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  ✓ Linked to Project with status: $Status" -ForegroundColor Green
                    
                    # Set Sprint field using SprintCommon helpers
                    try {
                        $config = Get-SprintConfig
                        
                        if ($config.fields.sprint) {
                            Write-Host "  ⏳ Setting Sprint field..." -ForegroundColor DarkGray
                            
                            # Get project item ID
                            $itemQuery = @"
query {
  node(id: "$($config.projectId)") {
    ... on ProjectV2 {
      items(first: 100) {
        nodes {
          id
          content {
            ... on Issue {
              number
            }
          }
        }
      }
    }
  }
}
"@
                            $result = Invoke-GraphQL -Query $itemQuery
                            $projectItem = $result.data.node.items.nodes | Where-Object { $_.content.number -eq $issueNumber } | Select-Object -First 1
                            
                            if ($projectItem) {
                                $sprintMutation = @"
mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "$($config.projectId)"
    itemId: "$($projectItem.id)"
    fieldId: "$($config.fields.sprint.id)"
    value: { iterationId: "$($config.fields.sprint.current.id)" }
  }) {
    projectV2Item {
      id
    }
  }
}
"@
                                Invoke-GraphQL -Query $sprintMutation | Out-Null
                                Write-Host "  ✓ Sprint set to: $($config.fields.sprint.current.title)" -ForegroundColor Green
                            }
                        }
                    }
                    catch {
                        Write-Host "  ⚠️  Sprint field assignment failed: $($_.Exception.Message)" -ForegroundColor Yellow
                    }
                }
                else {
                    Write-Host "  ⚠️  Failed to link to Project (issue created anyway)" -ForegroundColor Yellow
                }
            }
            
            $createdIssues += @{
                Number = $issueNumber
                Title  = $task.Title
                Url    = $issueUrl
            }
        }
        
        # Record metrics
        Add-SprintMetrics `
            -SprintName $metadata.Name `
            -PlannedItems $tasks.Count `
            -PlannedHours $totalHours `
            -CompletedItems 0 `
            -ActualHours 0 `
            -Status "started"
    }
    finally {
        # Always release lock
        if ($lockFile) {
            Exit-SprintLock -LockFile $lockFile
        }
    }
    
    # Summary
    Write-Host "`n✅ Created $($createdIssues.Count)/$($tasks.Count) issues" -ForegroundColor Green
    
    if ($skippedIssues.Count -gt 0) {
        Write-Host "`n⚠️  Skipped $($skippedIssues.Count) duplicate issues" -ForegroundColor Yellow
    }
    
    if ($createdIssues.Count -gt 0) {
        Write-Host "`n📋 Created Issues:" -ForegroundColor Cyan
        foreach ($issue in $createdIssues) {
            Write-Host "  #$($issue.Number): $($issue.Title)" -ForegroundColor White
            Write-Host "  $($issue.Url)" -ForegroundColor DarkGray
        }
    }
}
catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
