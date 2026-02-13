<#
.SYNOPSIS
    The Foreman script for the Antigravity Factory.
.DESCRIPTION
    Manages factory operating modes (ON, OFF, MANUAL), enforces operational guards,
    and orchestrates station flow including automated maintenance and indexing.
.PARAMETER Action
    The action to perform: GET-MODE, SET-MODE, CHECK-GUARD, AUTO-FLOW, MAINTAIN, INDEX, RUN, PROCESS-QUEUE, GET-PROMPT.
.PARAMETER Value
    The value for the action (e.g., the mode to set, or the feature name for RUN).
.PARAMETER Station
    The factory station to run (for RUN/GET-PROMPT): design, fabrication, verify, ship.
#>
param (
    [Parameter(Mandatory = $false)]
    [ValidateSet("GET-MODE", "SET-MODE", "CHECK-GUARD", "AUTO-FLOW", "MAINTAIN", "INDEX", "RUN", "PROCESS-QUEUE", "GET-PROMPT")]
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
}
