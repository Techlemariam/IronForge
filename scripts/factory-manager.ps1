<#
.SYNOPSIS
    The Foreman script for the Antigravity Factory.
.DESCRIPTION
    Manages factory operating modes (ON, OFF, MANUAL), enforces operational guards,
    and orchestrates station flow including automated maintenance and indexing.
.PARAMETER Action
    The action to perform: GET-MODE, SET-MODE, CHECK-GUARD, AUTO-FLOW, MAINTAIN, INDEX.
.PARAMETER Value
    The value for the action (e.g., the mode to set).
#>
param (
    [Parameter(Mandatory = $false)]
    [ValidateSet("GET-MODE", "SET-MODE", "CHECK-GUARD", "AUTO-FLOW")]
    [string]$Action = "GET-MODE",

    [Parameter(Mandatory = $false)]
    [string]$Value = ""
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
        # Trigger the ci-doctor workflow
        Invoke-Expression "powershell .agent/workflows/ci-doctor.md"
    }
    "INDEX" {
        Write-Host "Hiring Librarian (@librarian)..."
        # Trigger the librarian workflow to index and document
        Invoke-Expression "powershell .agent/workflows/librarian.md"
    }
}
