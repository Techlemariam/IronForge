<#
.SYNOPSIS
    Automatically generates valid stories for all components missing them.
    WARNING: This will generate many files.

.EXAMPLE
    .\auto-generate-missing.ps1
#>

$ErrorActionPreference = "Stop"
$projectRoot = (Get-Location).Path
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Directories to scan
$scanDirs = @(
    "src/components/ui",
    "src/features"
)

Write-Host "🔍 Scanning for components without stories..." -ForegroundColor Cyan

$missingComponents = @()

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
        $storyPath = $component.FullName -replace '\.tsx$', '.stories.tsx'
        $altStoryPath = Join-Path $projectRoot "src/stories/$($component.BaseName).stories.tsx"
        
        if (-not ((Test-Path $storyPath) -or (Test-Path $altStoryPath))) {
            $missingComponents += $component.FullName
        }
    }
}

$count = $missingComponents.Count
Write-Host "found $count components missing stories." -ForegroundColor Yellow

if ($count -eq 0) {
    Write-Host "✅ No missing stories found!" -ForegroundColor Green
    exit 0
}

# Ask for confirmation if running interactively (skipped for automation)
# Read-Host "Press Enter to generate $count stories..."

$generateScript = Join-Path $scriptDir "generate-story.ps1"

$i = 0
foreach ($compPath in $missingComponents) {
    $i++
    $percent = [math]::Round(($i / $count) * 100, 0)
    Write-Progress -Activity "Generating Stories" -Status "Processing $compPath" -PercentComplete $percent
    
    try {
        & $generateScript -ComponentPath $compPath
    }
    catch {
        Write-Host "❌ Failed for $compPath : $_" -ForegroundColor Red
    }
}

Write-Host "✅ Generated $count stories!" -ForegroundColor Green
