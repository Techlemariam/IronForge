<#
.SYNOPSIS
  Autonomous Night Shift trigger via Gemini CLI headless mode.
.DESCRIPTION
  Scheduled by Windows Task Scheduler to run at 03:00 CET daily.
  Uses Gemini CLI in --yolo mode to execute the night-shift workflow.
.NOTES
  Version: 1.0.1
  Created: 2026-02-10
#>

param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# --- Config ---
$WORKSPACE = "c:\Users\alexa\Workspaces\IronForge"

# Quota Strategy: Gemini CLI shares Google One Premium quota with Antigravity.
# Autonomous jobs run BEFORE 09:00 CET reset → uses "yesterday's" leftover tokens.
# After 09:00, fresh quota is available for interactive Antigravity work.
$LOG_DIR = Join-Path $WORKSPACE ".agent\logs"
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"
$LOG_FILE = Join-Path $LOG_DIR "night-shift-gemini-$TIMESTAMP.log"

# Ensure log directory exists
if (-not (Test-Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null
}

# --- Logging helper ---
function Write-Log {
    param([string]$Message)
    $entry = "[$(Get-Date -Format 'HH:mm:ss')] $Message"
    $entry | Out-File -FilePath $LOG_FILE -Append -Encoding utf8
    Write-Host $entry
}

Write-Log "Night Shift Gemini Trigger started"
Write-Log "Workspace: $WORKSPACE"

# --- Pre-flight checks ---
Set-Location $WORKSPACE

# Check git is clean
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Log "Warning: Working directory not clean. Stashing changes..."
    git stash push -m "night-shift-auto-stash-$TIMESTAMP"
}

# Check branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Log "Current branch: $currentBranch"

# --- Build the prompt ---
# Note: The closing "@ must be at the very start of the line
$prompt = @"
You are the Lead Software Engineer for the IronForge project.

## Your Mission
Execute the nightly maintenance workflow defined in `.agent/workflows/night-shift.md`.
Follow EVERY step in order. This is an autonomous run.

## Critical Rules
1. Create a new branch `night-shift/$(Get-Date -Format 'yyyy-MM-dd')` from main
2. Run security audit: ``pnpm audit --audit-level=high``
3. Run codebase audit: ``.\scripts\audit-codebase.ps1 -Json``
4. Check for outdated dependencies: ``npm outdated --json``
5. Generate the DAILY_BRIEF.md with all findings
6. Commit all changes with message: ``chore(night-shift): maintenance for $(Get-Date -Format 'yyyy-MM-dd')``
7. Push the branch and create a Pull Request using ``gh pr create``
8. Return to the original branch when done

## Output
When done, write a summary to: $LOG_FILE
"@

if ($DryRun) {
    Write-Log "DRY RUN - Prompt that would be sent:"
    Write-Log $prompt
    Write-Log "Dry run complete. No Gemini CLI invocation."
    exit 0
}

# --- Execute via Gemini CLI ---
# --- Auth: Load API Key from .env ---
$EnvFile = Join-Path $WORKSPACE ".env"
if (Test-Path $EnvFile) {
    $envContent = Get-Content $EnvFile
    foreach ($line in $envContent) {
        if ($line -match "^GEMINI_API_KEY=(.*)$") {
            $val = $matches[1].Trim()
            $val = $val -replace "^['""]", "" -replace "['""]$", ""
            $env:GEMINI_API_KEY = $val
            Write-Log "Loaded GEMINI_API_KEY from .env"
            break
        }
    }
}

# --- Execute via Gemini CLI ---
Write-Log "Invoking Gemini CLI in headless + yolo mode (Node.js wrapper)..."
$GEMINI_JS = "D:\Scoop\apps\nodejs-lts\current\bin\node_modules\@google\gemini-cli\dist\index.js"

try {
    # Using node directly to avoid pwsh wrapper encoding/interleaving issues
    # and to suppress punycode warning via --no-deprecation
    
    # We pipe the prompt to the process
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "node"
    $psi.Arguments = "--no-deprecation `"$GEMINI_JS`" --yolo --sandbox=false"
    $psi.RedirectStandardInput = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false
    $psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8
    $psi.StandardErrorEncoding = [System.Text.Encoding]::UTF8
    $psi.EnvironmentVariables["GEMINI_API_KEY"] = $env:GEMINI_API_KEY
    $psi.WorkingDirectory = $WORKSPACE

    $proc = [System.Diagnostics.Process]::Start($psi)
    
    # Write prompt to stdin
    $proc.StandardInput.WriteLine($prompt)
    $proc.StandardInput.Close()

    # Capture output
    $stdout = $proc.StandardOutput.ReadToEnd()
    $stderr = $proc.StandardError.ReadToEnd()
    
    $proc.WaitForExit()
    
    # Log output
    if ($stdout) { 
        $stdout | Out-File -FilePath $LOG_FILE -Append -Encoding utf8 
        Write-Host $stdout
    }
    if ($stderr) { 
        $stderr | Out-File -FilePath $LOG_FILE -Append -Encoding utf8 
        Write-Host $stderr -ForegroundColor Yellow
    }
    
    if ($proc.ExitCode -ne 0) {
        Write-Log "Gemini CLI finished with error exit code: $($proc.ExitCode)"
        # If expected error, maybe don't throw? But we want to know.
        if ($stderr -notmatch "DeprecationWarning") {
            throw "Gemini CLI failed with code $($proc.ExitCode)"
        }
    }
    else {
        Write-Log "Gemini CLI finished successfully."
    }
}
catch {
    Write-Log "Gemini CLI execution failed: $_"
    exit 1
}



# --- Post-flight ---
# Return to original branch if needed
$nowBranch = git rev-parse --abbrev-ref HEAD
if ($nowBranch -ne $currentBranch) {
    Write-Log "Returning to $currentBranch"
    git checkout $currentBranch
}

# Unstash if we stashed earlier
if ($gitStatus) {
    Write-Log "Restoring stashed changes..."
    git stash pop 2>$null
}

Write-Log "Night Shift Gemini Trigger complete."
