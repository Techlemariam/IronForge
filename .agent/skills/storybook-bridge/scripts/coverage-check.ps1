<#
.SYNOPSIS
    Checks Storybook coverage - lists components without stories.

.DESCRIPTION
    Scans src/components/ui and src/features for .tsx components
    and reports which ones are missing corresponding .stories.tsx files.

.EXAMPLE
    .\coverage-check.ps1
#>

$ErrorActionPreference = "Stop"
$projectRoot = (Get-Location).Path

# Directories to scan
$scanDirs = @(
    "src/components/ui",
    "src/features"
)

$totalComponents = 0
$missingStories = @()
$coveredComponents = 0

foreach ($dir in $scanDirs) {
    $fullPath = Join-Path $projectRoot $dir
    if (-not (Test-Path $fullPath)) { continue }

    # Find all .tsx files (excluding stories, tests, index files)
    $components = Get-ChildItem -Path $fullPath -Recurse -Filter "*.tsx" | 
    Where-Object { 
        $_.Name -notmatch '\.stories\.tsx$' -and 
        $_.Name -notmatch '\.test\.tsx$' -and 
        $_.Name -ne 'index.tsx' -and
        $_.Name -match '^[A-Z]' # PascalCase = component
    }

    foreach ($component in $components) {
        $totalComponents++
        $storyPath = $component.FullName -replace '\.tsx$', '.stories.tsx'
        
        # Also check src/stories/ directory
        $altStoryPath = Join-Path $projectRoot "src/stories/$($component.BaseName).stories.tsx"
        
        if ((Test-Path $storyPath) -or (Test-Path $altStoryPath)) {
            $coveredComponents++
        }
        else {
            $relativePath = $component.FullName.Replace($projectRoot, '').TrimStart('\', '/')
            $missingStories += $relativePath
        }
    }
}

# Calculate coverage
$coveragePercent = if ($totalComponents -gt 0) { 
    [math]::Round(($coveredComponents / $totalComponents) * 100, 1) 
}
else { 0 }

# Output report
Write-Host ""
Write-Host "📊 STORYBOOK COVERAGE REPORT" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Components: $totalComponents"
Write-Host "With Stories:     $coveredComponents"
Write-Host "Missing Stories:  $($missingStories.Count)"
Write-Host ""

if ($coveragePercent -ge 80) {
    Write-Host "Coverage: $coveragePercent% ✅" -ForegroundColor Green
}
elseif ($coveragePercent -ge 50) {
    Write-Host "Coverage: $coveragePercent% ⚠️" -ForegroundColor Yellow
}
else {
    Write-Host "Coverage: $coveragePercent% ❌" -ForegroundColor Red
}

if ($missingStories.Count -gt 0) {
    Write-Host ""
    Write-Host "Missing Stories:" -ForegroundColor Yellow
    foreach ($missing in $missingStories | Select-Object -First 15) {
        Write-Host "  - $missing" -ForegroundColor Gray
    }
    if ($missingStories.Count -gt 15) {
        Write-Host "  ... and $($missingStories.Count - 15) more" -ForegroundColor Gray
    }
}

# Exit with error if below threshold
$threshold = 50
if ($coveragePercent -lt $threshold) {
    Write-Host ""
    Write-Host "❌ Coverage below $threshold% threshold" -ForegroundColor Red
    exit 1
}

exit 0
