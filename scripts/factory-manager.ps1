<#
.SYNOPSIS
    The Foreman script for the Antigravity Factory.
.DESCRIPTION
    Manages factory operating modes (ON, OFF, MANUAL), enforces operational guards,
    orchestrates station flow, and provides a live factory status dashboard.
.PARAMETER Action
    The action to perform: GET-MODE, SET-MODE, CHECK-GUARD, AUTO-FLOW, MAINTAIN, INDEX, RUN, PROCESS-QUEUE, GET-PROMPT, STATUS.
.PARAMETER Value
    The value for the action (e.g., the mode to set, or the feature name for RUN).
.PARAMETER Station
    The factory station to run (for RUN/GET-PROMPT): design, fabrication, verify, ship.
#>
param (
    [Parameter(Mandatory = $false)]
    [ValidateSet("GET-MODE", "SET-MODE", "CHECK-GUARD", "AUTO-FLOW", "MAINTAIN", "INDEX", "RUN", "PROCESS-QUEUE", "GET-PROMPT", "STATUS")]
    [string]$Action = "GET-MODE",

    [Parameter(Mandatory = $false)]
    [string]$Value = "",

    [Parameter(Mandatory = $false)]
    [ValidateSet("design", "fabrication", "verify", "ship")]
    [string]$Station = "design"
)


$QueryScript = "npx tsx scripts/factory-query.ts"

function Get-FactoryMode {
    $mode = Invoke-Expression "$QueryScript GET-MODE"
    if ($LASTEXITCODE -ne 0 -or !$mode) { 
        return "MANUAL" 
    }
    return $mode.Trim()
}

function Set-FactoryMode([string]$Mode) {
    Invoke-Expression "$QueryScript SET-MODE $Mode"
    Write-Host "Factory Mode set to: $Mode"
}

function Get-FactoryStatus {
    # -- 1. Factory Mode --
    $mode = Get-FactoryMode
    $modeIcon = switch ($mode) {
        "ON"     { "[ON]" }
        "OFF"    { "[OFF]" }
        "MANUAL" { "[MANUAL]" }
        default  { "[??]" }
    }

    # -- 2. Git Context --
    $branch = git branch --show-current 2>$null
    if (-not $branch) { $branch = "unknown" }
    $dirty = (git status -s 2>$null | Measure-Object).Count
    $gitStatus = if ($dirty -eq 0) { "[OK] clean" } else { "[!!] $dirty uncommitted" }

    # -- 3. Roadmap: Active (in-progress) items --
    $activeItems = @()
    $queuedItems = @()
    if (Test-Path "roadmap.md") {
        $lines = Get-Content "roadmap.md"
        foreach ($line in $lines) {
            # In-progress: - [/] **Feature Name**
            if ($line -match '^\s*-\s*\[/\]\s*\*\*(.+?)\*\*') {
                $activeItems += $Matches[1].Trim()
            }
            # Queued planned items with high/critical priority
            if ($line -match '^\s*-\s*\[ \]\s*\*\*(.+?)\*\*.*priority:\s*(critical|high)') {
                $queuedItems += $Matches[1].Trim()
            }
        }
    }

    # -- 4. Specs Inventory --
    $specCount = 0
    if (Test-Path "specs") {
        $specCount = (Get-ChildItem specs -Filter *.md | Measure-Object).Count
    }

    # -- 5. DEBT.md open items --
    $debtCount = 0
    if (Test-Path "DEBT.md") {
        $debtCount = (Select-String -Pattern '^\s*-\s*\[ \]' -Path "DEBT.md" | Measure-Object).Count
    }

    # -- 6. CI Status (latest run) --
    $ciStatus = "unknown"
    $ciIcon = "[??]"
    try {
        $ciRun = gh run list --limit 1 --json status,conclusion,name 2>$null | ConvertFrom-Json
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
    } catch {
        $ciStatus = "unavailable"
    }

    # -- Render Dashboard --
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
        foreach ($item in $activeItems) {
            Write-Host "|   > $item"
        }
    } else {
        Write-Host "| IDLE -- No active fabrication                        |"
    }

    Write-Host "+------------------------------------------------------+"

    if ($queuedItems.Count -gt 0) {
        Write-Host "| QUEUE (High/Critical Priority):                      |"
        $i = 1
        foreach ($item in ($queuedItems | Select-Object -First 5)) {
            Write-Host "|   $i. $item"
            $i++
        }
        if ($queuedItems.Count -gt 5) {
            $remaining = $queuedItems.Count - 5
            Write-Host "|   ... and $remaining more"
        }
    } else {
        Write-Host "| QUEUE: Empty                                         |"
    }

    Write-Host "+------------------------------------------------------+"
    Write-Host "| Inventory:                                            |"
    Write-Host "|   Specs:      $specCount files in specs/"
    Write-Host "|   Open Debt:  $debtCount items in DEBT.md"
    Write-Host "+------------------------------------------------------+"
    Write-Host ""
}

switch ($Action) {
    "GET-MODE" {
        $mode = Get-FactoryMode
        Write-Host $mode
    }
    "SET-MODE" {
        Set-FactoryMode -Mode $Value
    }
    "CHECK-GUARD" {
        $mode = Get-FactoryMode
        if ($mode -eq "OFF") {
            Write-Error "FACTORY OFFLINE. Operations suspended."
            exit 1
        }
        Write-Host "Factory Guard Passed ($mode mode)"
    }
    "AUTO-FLOW" {
        $mode = Get-FactoryMode
        if ($mode -eq "ON") {
            Write-Host "Auto-Flow: Triggering next station..."
            # Log successful station transition and trigger next
        }
    }
    "MAINTAIN" {
        Write-Host "Hiring Maintenance (@ci-doctor)..."
        powershell scripts/workflow-launcher.ps1 -Workflow ci-doctor
    }
    "INDEX" {
        Write-Host "Hiring Librarian (@librarian)..."
        powershell scripts/workflow-launcher.ps1 -Workflow librarian
    }
    "RUN" {
        # Forward to orchestration core
        powershell .agent/scripts/factory-manager.ps1 -Feature $Value -Station $Station -Action RUN
    }
    "PROCESS-QUEUE" {
        # Forward to orchestration core
        powershell .agent/scripts/factory-manager.ps1 -Action PROCESS-QUEUE
    }
    "GET-PROMPT" {
        # Forward to orchestration core
        powershell .agent/scripts/factory-manager.ps1 -Feature $Value -Station $Station -Action GET-PROMPT
    }
    "STATUS" {
        Get-FactoryStatus
    }
}
