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
$GEMINI_JS = "D:\Scoop\apps\nodejs-lts\current\bin\node_modules\@google\gemini-cli\dist\index.js"

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

Write-Log "=== Workflow Launcher ==="
Write-Log "Workflow: /$Workflow"
Write-Log "Model: $Model"
Write-Log "Log: $LOG_FILE"

# --- Git State: Stash dirty state ---
$gitStatus = git status --porcelain
if ($gitStatus) {
  Write-Log "Stashing uncommitted changes..."
  git stash push -m "auto-stash-$Workflow-$TIMESTAMP"
}

# --- MCP Safe Mode: Disable workspace settings.json to prevent hangs ---
$WorkspaceSettings = Join-Path $WORKSPACE ".gemini\settings.json"
$DisabledSettings = Join-Path $WORKSPACE ".gemini\settings.json.disabled"
$DisabledByMe = $false

if (Test-Path $WorkspaceSettings) {
  Write-Log "Temporarily disabling workspace MCP settings..."
  Move-Item $WorkspaceSettings $DisabledSettings -Force
  $DisabledByMe = $true
}

# --- Command Execution ---
Write-Log "Invoking Gemini CLI via Node.js..."

try {
  # Using node directly to avoid pwsh wrapper encoding/interleaving issues
  $promptValue = "Execute /$Workflow"
    
  # Run node and capture output. 
  # We use --no-deprecation to silence the punycode warning.
  node --no-deprecation $GEMINI_JS -p $promptValue --model $Model --yolo --sandbox=false 2>&1 | Tee-Object -FilePath $LOG_FILE -Append
    
  Write-Log "Gemini CLI finished with exit code: $LASTEXITCODE"
}
catch {
  Write-Log "Gemini CLI execution failed: $_"
}
finally {
  # --- Cleanup ---
  if ($DisabledByMe -and (Test-Path $DisabledSettings)) {
    Write-Log "Restoring workspace MCP settings..."
    Move-Item $DisabledSettings $WorkspaceSettings -Force
  }

  if ($gitStatus) {
    Write-Log "Restoring stashed changes..."
    git stash pop 2>$null
  }
}

Write-Log "=== Workflow Launcher Complete ==="
