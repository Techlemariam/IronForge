<#
.SYNOPSIS
    The Foreman script for the Antigravity Factory (Lite Version).
.DESCRIPTION
    Standardized factory manager for Brotherhood projects.
    Handles operating modes and provides a live status dashboard.
#>
param (
    [Parameter(Mandatory = $false)]
    [ValidateSet("GET-MODE", "SET-MODE", "STATUS")]
    [string]$Action = "STATUS",

    [Parameter(Mandatory = $false)]
    [string]$Value = ""
)

# Configuration: Detect primary roadmap/backlog file
$RoadmapFile = if (Test-Path "roadmap.md") { "roadmap.md" } elseif (Test-Path "BACKLOG.md") { "BACKLOG.md" } else { $null }

function Get-FactoryMode {
    if (Test-Path "scripts/factory-query.ts") {
        try {
            $mode = npx tsx scripts/factory-query.ts GET-MODE 2>$null
            if ($LASTEXITCODE -eq 0 -and $mode) { return $mode.Trim() }
        } catch {}
    }
    return "MANUAL"
}

function Get-FactoryStatus {
    $mode = Get-FactoryMode
    $modeIcon = switch ($mode) {
        "ON"     { "[ON]" }
        "OFF"    { "[OFF]" }
        "MANUAL" { "[MANUAL]" }
        default  { "[??]" }
    }

    $branch = git branch --show-current 2>$null
    $dirty = (git status -s 2>$null | Measure-Object).Count
    $gitStatus = if ($dirty -eq 0) { "[OK] clean" } else { "[!!] $dirty uncommitted" }

    $activeItems = @()
    $queuedItems = @()
    if ($RoadmapFile) {
        $lines = Get-Content $RoadmapFile
        foreach ($line in $lines) {
            # Standard Active: [/]
            # Taktpinne Active: [plan] or [spec]
            if ($line -match '^\s*-\s*\[(/|plan|spec)\]\s*\*\*(.+?)\*\*') {
                $activeItems += $Matches[2].Trim()
            }
            # Standard Queue: [ ] with priority
            # Taktpinne Queue: [ ] without priority (all planned are queued)
            if ($line -match '^\s*-\s*\[ \]\s*\*\*(.+?)\*\*') {
                $name = $Matches[1].Trim()
                # If no priority specified, include it if it's in a project using BACKLOG.md
                if ($line -match 'priority:\s*(critical|high)' -or $RoadmapFile -eq "BACKLOG.md") {
                    $queuedItems += $name
                }
            }
        }
    }

    $specCount = if (Test-Path "specs") { (Get-ChildItem specs -Filter *.md | Measure-Object).Count } 
                elseif (Test-Path "docs/specs") { (Get-ChildItem docs/specs -Filter *.md | Measure-Object).Count }
                else { 0 }
    
    $debtCount = if (Test-Path "DEBT.md") { (Select-String -Pattern '^\s*-\s*\[ \]' -Path "DEBT.md" | Measure-Object).Count } else { 0 }

    $ciStatus = "unknown"
    $ciIcon = "[??]"
    try {
        $ciRun = gh run list --limit 1 --json status,conclusion 2>$null | ConvertFrom-Json
        if ($ciRun -and $ciRun.Count -gt 0) {
            $run = $ciRun[0]
            if ($run.status -eq "completed") {
                $ciStatus = $run.conclusion
                $ciIcon = if ($run.conclusion -eq "success") { "[OK]" } else { "[FAIL]" }
            } else {
                $ciStatus = $run.status
                $ciIcon = "[..]"
            }
        }
    } catch { $ciStatus = "unavailable" }

    Write-Host ""
    Write-Host "+------------------------------------------------------+"
    Write-Host "| FACTORY STATUS DASHBOARD                             |"
    Write-Host "+------------------------------------------------------+"
    Write-Host "| Mode:     $modeIcon $mode"
    Write-Host "| Branch:   $branch"
    Write-Host "| Git:      $gitStatus"
    Write-Host "| CI:       $ciIcon $ciStatus"
    Write-Host "+------------------------------------------------------+"

    if ($activeItems.Count -gt 0) {
        Write-Host "| ACTIVE (In Fabrication):                             |"
        foreach ($item in $activeItems) { Write-Host "|   > $item" }
    } else {
        Write-Host "| IDLE -- No active fabrication                        |"
    }

    Write-Host "+------------------------------------------------------+"

    if ($queuedItems.Count -gt 0) {
        Write-Host "| QUEUE:                                               |"
        $i = 1
        foreach ($item in ($queuedItems | Select-Object -First 5)) {
            Write-Host "|   $i. $item"
            $i++
        }
        if ($queuedItems.Count -gt 5) { Write-Host "|   ... and $($queuedItems.Count - 5) more" }
    } else {
        Write-Host "| QUEUE: Empty                                         |"
    }

    Write-Host "+------------------------------------------------------+"
    Write-Host "| Inventory:                                            |"
    Write-Host "|   Specs:      $specCount files                        |"
    Write-Host "|   Open Debt:  $debtCount items                        |"
    Write-Host "+------------------------------------------------------+"
    Write-Host ""
}

switch ($Action) {
    "GET-MODE" { Get-FactoryMode }
    "STATUS"   { Get-FactoryStatus }
}
