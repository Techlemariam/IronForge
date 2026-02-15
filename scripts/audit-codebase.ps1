param(
    [string]$Root = ".\src",
    [string]$WorkflowDir = ".\.agent\workflows",
    [switch]$Json
)

if (-not $Json) { Write-Host "[+] Starting Codebase Audit..." -ForegroundColor Cyan }

# 1. Source File Analysis
$sourceFiles = Get-ChildItem -Path $Root -Recurse -Include "*.ts", "*.tsx" | Where-Object { $_.Name -notmatch "\.test\.|\.stories\.|\.d\." }
$testFiles = Get-ChildItem -Path $Root -Recurse -Include "*.test.ts", "*.test.tsx"
$storyFiles = Get-ChildItem -Path $Root -Recurse -Include "*.stories.tsx"

$missingTests = @()
$missingDocs = @()

foreach ($file in $sourceFiles) {
    $testName = $file.Name -replace "\.tsx?$", ".test.tsx"
    $testName2 = $file.Name -replace "\.tsx?$", ".test.ts"
    $hasTest = $testFiles | Where-Object { $_.DirectoryName -eq $file.DirectoryName -and ($_.Name -eq $testName -or $_.Name -eq $testName2) }
    if (-not $hasTest) {
        $missingTests += $file.FullName
    }
    $hasReadme = Test-Path (Join-Path $file.DirectoryName "README.md")
    if (-not $hasReadme) {
        $missingDocs += $file.FullName
    }
}

# 2. Logic & Safety Gaps
if (-not $Json) { Write-Host "`n[+] Scanning for Logic & Safety Gaps..." }
$allSourceFiles = Get-ChildItem -Path $Root -Recurse -Include "*.ts", "*.tsx"
$todos = $allSourceFiles | Select-String -Pattern "TODO|FIXME"
$anys = $allSourceFiles | Select-String -Pattern ": any", "as any", "@ts-ignore"

# 3. Workflow Integrity
$workflowIssues = @()
if (Test-Path $WorkflowDir) {
    $workflows = Get-ChildItem -Path $WorkflowDir -Filter "*.md"
    foreach ($wf in $workflows) {
        $content = Get-Content $wf.FullName -Raw
        $hasSchema = $content -match "input:|output:|schema:"
        if (-not $hasSchema) { $workflowIssues += $wf.Name }
    }
}

if ($Json) {
    $report = [PSCustomObject]@{
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        stats     = @{
            sourceFiles    = $sourceFiles.Count
            storyFiles     = $storyFiles.Count
            missingTests   = $missingTests.Count
            missingDocs    = $missingDocs.Count
            logicGaps      = ($todos | Measure-Object).Count
            safetyGaps     = ($anys | Measure-Object).Count
            workflowIssues = $workflowIssues.Count
        }
        details   = @{
            workflowsRequiringAttention = $workflowIssues
        }
    }
    $report | ConvertTo-Json -Depth 3
}
else {
    Write-Host "[STATS] Source Files: $($sourceFiles.Count)"
    Write-Host "[STATS] Story Files:  $($storyFiles.Count)"
    Write-Host "[!] Missing Tests: $($missingTests.Count)" -ForegroundColor Yellow
    Write-Host "[!] Missing Docs:  $($missingDocs.Count)" -ForegroundColor Yellow
    
    $todoCount = ($todos | Measure-Object).Count
    $anyCount = ($anys | Measure-Object).Count

    Write-Host "[!] Found $todoCount TODO/FIXME markers." -ForegroundColor Magenta
    Write-Host "[!] Found $anyCount type safety bypasses." -ForegroundColor Red

    if ($workflowIssues.Count -gt 0) {
        Write-Host "[!] $($workflowIssues.Count) workflows missing schema definitions." -ForegroundColor Yellow
    }
    else {
        Write-Host "[OK] Workflows look structured." -ForegroundColor Green
    }
    
    Write-Host "`n[+] Audit Complete."
}
