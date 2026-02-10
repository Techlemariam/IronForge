<#
.SYNOPSIS
  Master Workflow Scheduler for IronForge
.DESCRIPTION
  Registers Windows Task Scheduler jobs for all autonomous workflows.
  Run once to set up, or re-run to update schedules.
.NOTES
  Quota Strategy (Shared Google One Premium):
  - 03:00-08:00 CET: Heavy autonomous work (uses leftover daily tokens)
  - 09:00 CET: Antigravity quota resets (fresh tokens for interactive work)
  - 20:00 CET: Light weekly tasks

  Model Strategy:
  - Pro:   Complex coding tasks (night-shift, debt-attack, security)
  - Flash: Light monitoring, formatting, git operations
#>

param(
    [switch]$Remove,   # Remove all scheduled tasks
    [switch]$DryRun    # Show what would be created
)

$WORKSPACE = "c:\Users\alexa\Workspaces\IronForge"

# --- Schedule Definition ---
# All heavy autonomous work runs BEFORE 09:00 CET quota reset.
# Model selection: Pro for complex coding, Flash for light/fast tasks.
$schedules = @(
    # PRE-RESET: Flash first (cheap), Pro last (heavy) → maximizes leftover quota before 09:00 CET reset
    # 03:00-05:00 — Light Flash tasks (low token cost)
    @{ Name = "IronForge Git Hygiene"; Time = "03:00"; Workflow = "git-hygiene"; Freq = "DAILY"; Model = "gemini-2.5-flash" }
    @{ Name = "IronForge Polish"; Time = "04:00"; Workflow = "polish"; Freq = "DAILY"; Model = "gemini-2.5-flash" }
    @{ Name = "IronForge Cleanup"; Time = "05:00"; Workflow = "cleanup"; Freq = "DAILY"; Model = "gemini-2.5-flash" }

    # 06:00-08:00 — Heavy Pro tasks (high token cost, closer to reset)
    @{ Name = "IronForge Night Shift"; Time = "06:00"; Workflow = "night-shift"; Freq = "DAILY"; Model = "gemini-2.5-pro" }
    @{ Name = "IronForge Debt Attack"; Time = "07:00"; Workflow = "debt-attack"; Freq = "DAILY"; Model = "gemini-2.5-pro" }
    @{ Name = "IronForge Security Audit"; Time = "08:00"; Workflow = "security"; Freq = "WEEKLY"; Model = "gemini-2.5-pro" }

    # POST-RESET evening — Light weekly work only
    @{ Name = "IronForge Sprint Auto"; Time = "20:00"; Workflow = "sprint-auto"; Freq = "WEEKLY"; Model = "gemini-2.5-flash" }
)

foreach ($sched in $schedules) {
    $taskName = $sched.Name
    $time = $sched.Time
    $workflow = $sched.Workflow
    $freq = $sched.Freq
    $model = $sched.Model

    if ($Remove) {
        Write-Host "Removing: $taskName"
        schtasks /Delete /TN $taskName /F 2>$null
        continue
    }

    # Build trigger command: Call generic launcher with workflow + model params
    $launcherPath = Join-Path $WORKSPACE "scripts\workflow-launcher.ps1"
    $triggerCmd = "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$launcherPath`" -Workflow $workflow -Model $model"

    if ($DryRun) {
        Write-Host "[DRY RUN] $taskName | $time ($freq) | Model: $model"
        Write-Host "          Workflow: /$workflow"
        continue
    }

    $schedArgs = @("/Create", "/TN", "`"$taskName`"", "/TR", "`"$triggerCmd`"", "/SC", $freq, "/ST", $time, "/F")
    
    if ($freq -eq "WEEKLY") {
        $schedArgs += @("/D", "MON")
    }

    Write-Host "Registering: $taskName at $time ($freq) [Model: $model]..."
    
    try {
        & schtasks @schedArgs
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  OK" -ForegroundColor Green
        }
        else {
            Write-Warning "  Failed (exit code: $LASTEXITCODE)"
        }
    }
    catch {
        Write-Warning "  Error: $_"
    }
}

Write-Host ""
Write-Host "=== Schedule Summary ==="
Write-Host "Pre-Reset (03:00-08:00 CET):"
Write-Host "  03:00 Night Shift    [Pro]   - Complex maintenance + PR creation"
Write-Host "  04:00 Security       [Pro]   - Weekly Monday security audit"
Write-Host "  05:00 Git Hygiene    [Flash] - Branch cleanup"
Write-Host "  06:00 Polish         [Flash] - ESLint, Prettier, imports"
Write-Host "  07:00 Cleanup        [Flash] - Dead code removal"
Write-Host "  08:00 Debt Attack    [Pro]   - Fix tech debt items"
Write-Host ""
Write-Host "Quota Reset: 09:00 CET -> Fresh tokens for Antigravity (interactive)"
Write-Host ""
Write-Host "Post-Reset:"
Write-Host "  20:00 Sprint Auto    [Flash] - Weekly Monday sprint planning"
Write-Host ""
Write-Host "Run with -Remove to unregister all tasks."
Write-Host "Run with -DryRun to preview without creating."
