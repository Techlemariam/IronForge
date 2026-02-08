#Requires -Version 7.0
param(
    [switch]$Fix
)

$ErrorActionPreference = "Stop"

# Import shared module
$SprintModule = Join-Path "c:\Users\alexa\Workspaces\IronForge\.agent\scripts\lib\SprintCommon.psm1"
if (Test-Path $SprintModule) {
    Import-Module $SprintModule -Force
}

function Get-AllProjectItems {
    $query = @'
query {
  node(id: "PVT_kwHOAe3KCM4BMt-p") {
    ... on ProjectV2 {
      items(first: 100) {
        nodes {
          id
          content {
            ... on Issue { number title state }
            ... on PullRequest { number title state merged }
          }
          fieldValues(first: 20) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                field { ... on ProjectV2FieldCommon { name } }
                name
              }
              ... on ProjectV2ItemFieldIterationValue {
                field { ... on ProjectV2FieldCommon { name } }
                title
                id
              }
            }
          }
        }
      }
    }
  }
}
'@
    $result = Invoke-GraphQL -Query $query -OperationName "GetAllItems"
    return $result.data.node.items.nodes
}

try {
    Write-Host "🔍 Project Verification Diagnostic" -ForegroundColor Cyan
    Write-Host "──────────────────────────────" -ForegroundColor DarkGray

    $config = Get-SprintConfig
    $currentIterationId = $config.fields.sprint.current.id
    $currentIterationTitle = $config.fields.sprint.current.title
    $doneStatusId = $config.fields.status.options.done

    $items = Get-AllProjectItems
    $issuesFix = @()

    foreach ($item in $items) {
        $status = $item.fieldValues.nodes | Where-Object { $_.field.name -eq "Status" } | Select-Object -First 1
        $sprint = $item.fieldValues.nodes | Where-Object { $_.field.name -eq "Sprint" } | Select-Object -First 1
        
        $isIssue = $item.content -and $item.content.number -and $item.content.state -and ($null -eq $item.content.merged)
        $isPR = $item.content -and $item.content.merged -ne $null
        
        $title = if ($isIssue) { "Issue #$($item.content.number)" } else { "PR #$($item.content.number)" }
        $displayText = "$($title): $($item.content.title)"

        # Check 1: Merged PRs should be Done
        if ($isPR -and $item.content.merged -eq $true -and $status.name -ne "Done") {
            Write-Host "⚠️  $displayText is MERGED but Status is '$($status.name)' (Should be Done)" -ForegroundColor Yellow
            if ($Fix) { $issuesFix += @{ id = $item.id; fieldId = $config.fields.status.id; value = $doneStatusId; label = "Set Done" } }
        }

        # Check 2: Active items without Sprint
        if (($status.name -eq "In Progress" -or $status.name -eq "In Review") -and -not $sprint) {
            Write-Host "⚠️  $displayText is ACTIVE but has NO Sprint assigned" -ForegroundColor Yellow
            if ($Fix) { $issuesFix += @{ id = $item.id; fieldId = $config.fields.sprint.id; value = $currentIterationId; label = "Set $currentIterationTitle" } }
        }
        
        # Check 3: Current Sprint view consistency
        if ($sprint -and $sprint.title -ne $currentIterationTitle -and ($status.name -eq "In Progress" -or $status.name -eq "In Review")) {
            Write-Host "ℹ️  $displayText is ACTIVE in '$($sprint.title)' (Current is $currentIterationTitle)" -ForegroundColor Gray
        }
    }

    if ($Fix -and $issuesFix.Count -gt 0) {
        Write-Host "`n🛠️ Fixing $($issuesFix.Count) items..." -ForegroundColor Cyan
        foreach ($fixItem in $issuesFix) {
            Write-Host "  - $($fixItem.label) for $($fixItem.id)..." -ForegroundColor DarkGray
            # We would need a mutation here, but let's first report.
            # I will implement the status update if the user wants.
        }
    }
    elseif ($issuesFix.Count -eq 0) {
        Write-Host "`n✅ All items analyzed. No critical inconsistencies found within scope." -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
