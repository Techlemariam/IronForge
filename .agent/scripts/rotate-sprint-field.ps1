#Requires -Version 7.0
<#
.SYNOPSIS
    Rotates the current sprint iteration in github-project.json

.DESCRIPTION
    Updates the "current" sprint in github-project.json to the next active iteration
    based on current date. Used during sprint activation to automatically move to
    the next sprint period.
    Uses SprintCommon for safeguards and logging.

.EXAMPLE
    .\rotate-sprint-field.ps1
    Rotates to the next sprint iteration
#>

$ErrorActionPreference = "Stop"

# Import shared module
$SprintModule = Join-Path $PSScriptRoot "lib\SprintCommon.psm1"
if (Test-Path $SprintModule) {
    Import-Module $SprintModule -Force
}
else {
    throw "SprintCommon.psm1 not found. Run from correct directory."
}

# Main
try {
    Write-Host "🔄 Sprint Field Rotation" -ForegroundColor Cyan
    Write-Host "─────────────────────────" -ForegroundColor DarkGray
    
    # Acquire lock for config updates
    $lockFile = $null
    try {
        $lockFile = Enter-SprintLock -LockName "rotate-sprint"
    }
    catch {
        Write-Host "⚠️  Could not acquire lock: $($_.Exception.Message)" -ForegroundColor Yellow
        exit 1
    }

    try {
        # Load config via SprintCommon
        $config = Get-SprintConfig
        
        $currentSprint = $config.fields.sprint.current
        Write-Host "📊 Current Sprint: $($currentSprint.title)" -ForegroundColor Yellow
        Write-Host "   Period: $($currentSprint.startDate) ($($currentSprint.duration) days)" -ForegroundColor DarkGray
        
        # Find next iteration
        $iterations = $config.fields.sprint.iterations
        
        # Find the iteration that starts after current sprint's start date
        $currentStartDate = [DateTime]$currentSprint.startDate
        
        $nextIteration = $iterations | Where-Object {
            [DateTime]$_.startDate -gt $currentStartDate
        } | Sort-Object { [DateTime]$_.startDate } | Select-Object -First 1
        
        if (-not $nextIteration) {
            # No future iteration found, try to find first iteration (wrap around)
            $nextIteration = $iterations | Sort-Object { [DateTime]$_.startDate } | Select-Object -First 1
            
            if ($nextIteration.id -eq $currentSprint.id) {
                Write-Host "⚠️  No next sprint available (only one iteration configured)" -ForegroundColor Yellow
                Write-SprintLog -Operation "Rotation" -Level "WARN" -Message "No next sprint found to rotate to"
                exit 0
            }
            
            Write-Host "ℹ️  Wrapping around to first iteration" -ForegroundColor Cyan
        }
        
        # Check if we are rotating "too fast" (warn only)
        $today = Get-Date
        $nextStart = [DateTime]$nextIteration.startDate
        if ($nextStart -gt $today.AddDays(7)) {
            Write-Host "⚠️  Warning: Rotating to a sprint that starts far in the future ($nextStart)" -ForegroundColor Yellow
            Write-SprintLog -Operation "Rotation" -Level "WARN" -Message "Rotating to future sprint: $($nextIteration.title) starts $nextStart"
        }
        
        # Update config
        $config.fields.sprint.current = @{
            id        = $nextIteration.id
            title     = $nextIteration.title
            startDate = $nextIteration.startDate
            duration  = $nextIteration.duration
        }
        
        Save-SprintConfig -Config $config
        
        Write-Host "`n✅ Sprint rotated successfully" -ForegroundColor Green
        Write-Host "   New Sprint: $($nextIteration.title)" -ForegroundColor White
        Write-Host "   Period: $($nextIteration.startDate) ($($nextIteration.duration) days)" -ForegroundColor DarkGray
        
        Write-SprintLog -Operation "Rotation" -Level "INFO" `
            -Message "Rotated sprint to $($nextIteration.title)" `
            -Data @{ 
            fromSprint = $currentSprint.title
            toSprint   = $nextIteration.title 
            startDate  = $nextIteration.startDate
        }
            
        # Write Job Summary
        Write-SprintSummary -Title "Sprint Rotation" -MarkdownContent "**Rotated to**: $($nextIteration.title)`n**Start Date**: $($nextIteration.startDate)"
    }
    finally {
        if ($lockFile) {
            Exit-SprintLock -LockFile $lockFile
        }
    }
}
catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-SprintLog -Operation "Rotation" -Level "ERROR" -Message $_.Exception.Message
    exit 1
}
