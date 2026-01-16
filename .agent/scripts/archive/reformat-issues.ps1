#!/usr/bin/env pwsh
# Bulk reformat existing GitHub issues to the new agent-optimized template structure

$Issues = 73..88
$Repo = "Techlemariam/IronForge"

function Get-TemplateBody {
    param([string]$Type, [hashtable]$Data)
    
    if ($Type -eq "FEATURE") {
        return @"
## Feature Request
$($Data.Overview)

## 📋 Context
**Roadmap:** [roadmap.md](../roadmap.md)
$($Data.Context)

## 📄 Specification
$($Data.Spec)

## ✅ Acceptance Criteria
$($Data.Acceptance)

## 🔧 Technical Notes
$($Data.Technical)

## 📁 Files Affected
$($Data.Files)

## 🔗 Dependencies
$($Data.Dependencies)
"@
    }
    elseif ($Type -eq "BUG") {
        return @"
## Bug Report
$($Data.Overview)

## 🐛 Bug Description
$($Data.Description)

## 📝 Steps to Reproduce
$($Data.Reproduce)

## ✅ Expected Behavior
$($Data.Expected)

## ❌ Actual Behavior
$($Data.Actual)

## 📋 Error Logs
$($Data.Logs)

## 🔍 Debug Context
$($Data.Context)

## 📁 Suspected Files
$($Data.Files)
"@
    }
    else { # INFRA
        return @"
## Infrastructure Task
$($Data.Overview)

## 📋 Context
$($Data.Context)

## 🎯 Scope
$($Data.Scope)

## ✅ Acceptance Criteria
$($Data.Acceptance)

## 📁 Files Affected
$($Data.Files)

## ⚠️ Risks & Rollback
$($Data.Risks)
"@
    }
}

Write-Host "🔄 Starting bulk reformat of issues #73 to #88..." -ForegroundColor Cyan

foreach ($num in $Issues) {
    Write-Host "  Processing #$num..." -NoNewline
    
    # Get current body
    $currentJson = gh issue view $num --repo $Repo --json title,body | ConvertFrom-Json
    $title = $currentJson.title
    $body = $currentJson.body
    
    # Basic extraction logic
    $overview = ""
    $metadata = ""
    $acceptance = ""
    $context = ""
    
    if ($body -match "## Overview\r?\n(.*?)(?=\r?\n##|$)") { $overview = $matches[1].Trim() }
    if ($body -match "## Metadata\r?\n(.*?)(?=\r?\n##|$)") { $metadata = $matches[1].Trim() }
    if ($body -match "## Acceptance Criteria\r?\n(.*?)(?=\r?\n##|$)") { $acceptance = $matches[1].Trim() }
    
    $data = @{
        Overview = $overview
        Acceptance = $acceptance
        Context = "Imported from roadmap.md metadata:`n$metadata"
        Spec = "See roadmap.md or referenced spec files."
        Technical = "TBD by architect."
        Files = "TBD."
        Dependencies = "None listed."
        Scope = "See roadmap.md overview."
        Risks = "Standard deployment risks."
    }

    $type = "INFRA"
    if ($title -match "\[FEATURE\]") { $type = "FEATURE" }
    elseif ($title -match "\[BUG\]") { 
        $type = "BUG" 
        $data.Description = $overview
        $data.Reproduce = "See issue context."
        $data.Expected = "Normal operation."
        $data.Actual = "Failure reported in CI/Logs."
        $data.Logs = "Check CI pipeline logs."
        $data.Context = "Automated test failure."
    }

    $newBody = Get-TemplateBody -Type $type -Data $data
    
    # Update issue
    gh issue edit $num --repo $Repo --body "$newBody" | Out-Null
    
    Write-Host " ✅" -ForegroundColor Green
}

Write-Host "`n✅ Bulk update complete!" -ForegroundColor Green
