<#
.SYNOPSIS
  Generic workflow launcher for IronForge autonomous scheduling.
.DESCRIPTION
  Called by Windows Task Scheduler. Invokes Gemini CLI with a specific workflow and model.
.PARAMETER Workflow
  The workflow to execute, e.g. "night-shift", "polish", "cleanup".
.PARAMETER Model
  The Gemini model to use, e.g. "gemini-2.5-pro", "gemini-2.5-flash".
#>
param(
    [Parameter(Mandatory)][string]$Workflow,
    [string]$Model = "gemini-2.5-flash"
)

$ErrorActionPreference = "Stop"
$WORKSPACE = "c:\Users\alexa\Workspaces\IronForge"
$LOG_DIR = Join-Path $WORKSPACE ".agent\logs"
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"
$LOG_FILE = Join-Path $LOG_DIR "$Workflow-$TIMESTAMP.log"

if (-not (Test-Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null
}

function Write-Log {
    param([string]$Message)
    $entry = "[$(Get-Date -Format 'HH:mm:ss')] $Message"
    $entry | Out-File -FilePath $LOG_FILE -Append -Encoding utf8
    Write-Host $entry
}

Set-Location $WORKSPACE

Write-Log "=== Workflow Launcher ==="
Write-Log "Workflow: /$Workflow"
Write-Log "Model: $Model"
Write-Log "Log: $LOG_FILE"

# Stash dirty state
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Log "Stashing uncommitted changes..."
    git stash push -m "auto-stash-$Workflow-$TIMESTAMP"
}

# Execute via Gemini CLI
Write-Log "Invoking Gemini CLI..."
try {
    "Execute /$Workflow" | gemini --model $Model --yolo --sandbox=false 2>&1 | Out-File -FilePath $LOG_FILE -Append -Encoding utf8
    Write-Log "Gemini CLI exited with code: $LASTEXITCODE"
}
catch {
    Write-Log "Gemini CLI failed: $_"
}

# Restore stash
if ($gitStatus) {
    Write-Log "Restoring stashed changes..."
    git stash pop 2>$null
}

Write-Log "=== Workflow Launcher Complete ==="
