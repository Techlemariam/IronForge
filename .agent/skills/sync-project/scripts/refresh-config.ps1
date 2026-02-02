#Requires -Version 7.0
<#
.SYNOPSIS
    Refreshes github-project.json with current field IDs from GitHub API

.DESCRIPTION
    Fetches current Project V2 field IDs and option IDs from GitHub GraphQL API
    and updates the local config file. Run this if Project fields change.

.PARAMETER WhatIf
    Shows what would be updated without making changes

.EXAMPLE
    .\refresh-project-config.ps1
    
.EXAMPLE
    .\refresh-project-config.ps1 -WhatIf
#>

param(
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"

$ConfigPath = Join-Path $PSScriptRoot "..\config\github-project.json"
$Owner = "Techlemariam"
$ProjectNumber = 4

Write-Host "🔄 GitHub Project Config Refresher" -ForegroundColor Cyan
Write-Host "────────────────────────────────────" -ForegroundColor DarkGray

# GraphQL query to fetch all field IDs
$query = @"
{
  user(login: "$Owner") {
    projectV2(number: $ProjectNumber) {
      id
      title
      fields(first: 20) {
        nodes {
          ... on ProjectV2Field {
            id
            name
            dataType
          }
          ... on ProjectV2SingleSelectField {
            id
            name
            dataType
            options {
              id
              name
            }
          }
        }
      }
    }
  }
}
"@

Write-Host "⏳ Fetching Project fields from GitHub API..." -ForegroundColor Yellow

try {
    $response = gh api graphql -f query="$query" | ConvertFrom-Json
    $project = $response.data.user.projectV2
    
    if (-not $project) {
        throw "Project not found"
    }
    
    Write-Host "✓ Found project: $($project.title)" -ForegroundColor Green
    
    # Build new config
    $newConfig = @{
        projectId     = $project.id
        projectNumber = $ProjectNumber
        owner         = $Owner
        fields        = @{}
    }
    
    foreach ($field in $project.fields.nodes) {
        if (-not $field.name) { continue }
        
        $fieldName = $field.name.ToLower() -replace '\s+', '_'
        
        $fieldData = @{
            id = $field.id
        }
        
        if ($field.options) {
            $options = @{}
            foreach ($opt in $field.options) {
                $optName = $opt.name.ToLower() -replace '\s+', '_' -replace '/', '_'
                $options[$optName] = $opt.id
            }
            $fieldData.options = $options
        }
        
        $newConfig.fields[$fieldName] = $fieldData
    }
    
    # Compare with existing
    $existingConfig = $null
    if (Test-Path $ConfigPath) {
        $existingConfig = Get-Content $ConfigPath | ConvertFrom-Json
    }
    
    $jsonOutput = $newConfig | ConvertTo-Json -Depth 4
    
    if ($WhatIf) {
        Write-Host "`n[WHATIF] Would update $ConfigPath with:" -ForegroundColor Yellow
        Write-Host $jsonOutput
        exit 0
    }
    
    # Write new config
    $jsonOutput | Set-Content $ConfigPath -Encoding utf8
    
    Write-Host "`n✅ Config updated: $ConfigPath" -ForegroundColor Green
    Write-Host "`nFields found:" -ForegroundColor Cyan
    foreach ($fieldName in $newConfig.fields.Keys) {
        $field = $newConfig.fields[$fieldName]
        $optCount = if ($field.options) { $field.options.Count } else { 0 }
        Write-Host "  - $fieldName ($optCount options)" -ForegroundColor White
    }
    
}
catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
