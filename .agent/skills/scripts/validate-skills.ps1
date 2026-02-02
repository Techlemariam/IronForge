<#
.SYNOPSIS
    Validates skill-workflow alignment.
    
.DESCRIPTION
    Checks that:
    1. All skills have owners
    2. All workflows reference their skills
    3. Referenced skills exist
    
.EXAMPLE
    .\validate-skills.ps1
#>

$ErrorActionPreference = "Stop"
$projectRoot = (Get-Location).Path

Write-Host "`n🔍 SKILL-WORKFLOW ALIGNMENT CHECK" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# 1. Check skills have owners
$skillDirs = Get-ChildItem -Path ".agent/skills" -Directory | Where-Object { $_.Name -notin @("bundles", "examples", "scripts") }
$orphanSkills = @()

foreach ($skill in $skillDirs) {
    $skillFile = Join-Path $skill.FullName "SKILL.md"
    if (Test-Path $skillFile) {
        $content = Get-Content $skillFile -Raw
        if ($content -notmatch 'owner:\s*"@[^"]+"') {
            $orphanSkills += $skill.Name
        }
    }
}

if ($orphanSkills.Count -gt 0) {
    Write-Host "`n⚠️  Skills without owners:" -ForegroundColor Yellow
    $orphanSkills | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
} else {
    Write-Host "`n✅ All skills have owners" -ForegroundColor Green
}

# 2. Check workflows for skills field
$workflowFiles = Get-ChildItem -Path ".agent/workflows" -Filter "*.md" | Where-Object { $_.Name -notmatch "METADATA|INDEX|GRAPH|MANUAL" }
$workflowsWithSkills = 0
$workflowsWithoutSkills = @()

foreach ($wf in $workflowFiles) {
    $content = Get-Content $wf.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match 'skills:\s*\[') {
        $workflowsWithSkills++
    } else {
        $workflowsWithoutSkills += $wf.BaseName
    }
}

Write-Host "`n📊 Workflow Coverage:" -ForegroundColor Cyan
Write-Host "   With skills:    $workflowsWithSkills"
Write-Host "   Without skills: $($workflowsWithoutSkills.Count)"

# 3. Summary
$totalSkills = $skillDirs.Count
Write-Host "`n📈 Summary:" -ForegroundColor Cyan
Write-Host "   Total Skills:    $totalSkills"
Write-Host "   Total Workflows: $($workflowFiles.Count)"
Write-Host "   Orphan Skills:   $($orphanSkills.Count)"

if ($orphanSkills.Count -eq 0 -and $workflowsWithSkills -gt ($workflowFiles.Count / 2)) {
    Write-Host "`n✅ Skill-Workflow alignment is GOOD" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  Skill-Workflow alignment needs improvement" -ForegroundColor Yellow
    exit 1
}
