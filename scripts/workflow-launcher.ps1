<#
.SYNOPSIS
  Generic workflow launcher for IronForge autonomous scheduling.
.DESCRIPTION
  Called by Windows Task Scheduler or GitHub Actions. Invokes Gemini CLI with a specific workflow and model.
.PARAMETER Workflow
  The workflow to execute, e.g. "night-shift", "polish", "cleanup".
.PARAMETER Model
  The Gemini model to use, e.g. "gemini-2.5-pro", "gemini-2.5-flash".
#>
param(
  [Parameter(Mandatory)][string]$Workflow,
  [string]$Model = "gemini-2.5-flash"
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$WORKSPACE = Split-Path -Parent $ScriptDir
$ErrorActionPreference = "Continue"

$LOG_DIR = Join-Path $WORKSPACE ".agent\logs"
$USAGE_FILE = Join-Path $WORKSPACE ".agent\usage.json"
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"
$LOG_FILE = Join-Path $LOG_DIR "$Workflow-$TIMESTAMP.log"

# Path to the Gemini CLI JS
$GEMINI_JS = "D:\Scoop\apps\nodejs-lts\current\bin\node_modules\@google\gemini-cli\dist\index.js"
if (-not (Test-Path $GEMINI_JS)) {
  $GEMINI_JS = Join-Path $WORKSPACE "node_modules\@google\gemini-cli\dist\index.js"
}

if (-not (Test-Path $LOG_DIR)) {
  New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null
}

function Write-Log {
  param([string]$Message)
  $entry = "[$(Get-Date -Format 'HH:mm:ss')] $Message"
  $entry | Out-File -FilePath $LOG_FILE -Append -Encoding utf8
  Write-Host $entry
}

function Check-Budget {
  if (Test-Path $USAGE_FILE) {
    try {
      $content = Get-Content $USAGE_FILE -Raw
      if (-not $content) { return $true }
      $usage = $content | ConvertFrom-Json
      $today = Get-Date -Format "yyyy-MM-dd"
      
      $monthlyLimit = if ($env:TOKEN_MONTHLY_LIMIT) { [int64]$env:TOKEN_MONTHLY_LIMIT } else { 5000000 }
      $dailyLimit = if ($env:TOKEN_DAILY_LIMIT) { [int64]$env:TOKEN_DAILY_LIMIT } else { 500000 }
      $monthlyUsage = 0
      $dailyUsage = 0

      if ($usage.history) {
        foreach ($entry in $usage.history) {
          if ($entry.date -eq $today) {
            $dailyUsage += $entry.tokens
          }
          if ($entry.date -and $entry.date.Length -ge 7 -and $entry.date.StartsWith($today.Substring(0, 7))) {
            $monthlyUsage += $entry.tokens
          }
        }
      }

      if ($dailyUsage -ge $dailyLimit) {
        Write-Log "WARNING: Daily token budget exceeded ($dailyUsage / $dailyLimit). Abort."
        return $false
      }
      if ($monthlyUsage -ge $monthlyLimit) {
        Write-Log "WARNING: Monthly token budget exceeded ($monthlyUsage / $monthlyLimit). Abort."
        return $false
      }
      Write-Log "Budget Check: Daily ($dailyUsage / $dailyLimit), Monthly ($monthlyUsage / $monthlyLimit)"
    } catch {
      Write-Log "Warning: Could not parse usage.json. Proceeding anyway."
    }
  }
  return $true
}

function Log-Usage {
  param([int]$tokens)
  $today = Get-Date -Format "yyyy-MM-dd"
  $newEntry = @{
    date      = $today
    workflow  = $Workflow
    model     = $Model
    tokens    = $tokens
    timestamp = Get-Date -Format "o"
  }
  $usage = @{ history = @() }
  if (Test-Path $USAGE_FILE) {
    try {
        $content = Get-Content $USAGE_FILE -Raw
        if ($content) { $usage = $content | ConvertFrom-Json }
    } catch {}
  }
  if (-not $usage.history) { $usage.history = @() }
  $usage.history += $newEntry
  $usage | ConvertTo-Json -Depth 10 | Out-File $USAGE_FILE -Encoding utf8
  Write-Log "Logged $tokens tokens to usage.json"
}

Set-Location $WORKSPACE

$EnvFile = Join-Path $WORKSPACE ".env"
if (Test-Path $EnvFile) {
  $envContent = Get-Content $EnvFile
  foreach ($line in $envContent) {
    if ($line -match "^(GEMINI_API_KEY|TOKEN_DAILY_LIMIT|TOKEN_MONTHLY_LIMIT)=(.*)$") {
      $key = $matches[1]; $val = $matches[2].Trim()
      $val = $val -replace "^['""]", "" -replace "['""]$", ""
      [System.Environment]::SetEnvironmentVariable($key, $val, "Process")
      Write-Log "Loaded $key from .env"
    }
  }
}

Write-Log "=== Workflow Launcher ==="
Write-Log "Workflow: /$Workflow"
Write-Log "Model: $Model"
Write-Log "Log: $LOG_FILE"

if (-not (Check-Budget)) { exit 1 }

$gitStatus = git status --porcelain
if ($gitStatus) {
  Write-Log "Stashing uncommitted changes..."
  git stash push -m "auto-stash-$Workflow-$TIMESTAMP"
}

$WorkspaceSettings = Join-Path $WORKSPACE ".gemini\settings.json"
$DisabledSettings = Join-Path $WORKSPACE ".gemini\settings.json.disabled"
$DisabledByMe = $false
if (Test-Path $WorkspaceSettings) {
  Write-Log "Temporarily disabling workspace MCP settings..."
  Move-Item $WorkspaceSettings $DisabledSettings -Force
  $DisabledByMe = $true
}

Write-Log "Invoking Gemini CLI via Node.js..."
$success = $false
try {
  $promptValue = "Execute /$Workflow"
  node --no-deprecation $GEMINI_JS -p $promptValue --model $Model --yolo --sandbox=false 2>&1 | Tee-Object -FilePath $LOG_FILE -Append
  $exitCode = $LASTEXITCODE
  Write-Log "Gemini CLI finished with exit code: $exitCode"
  if ($exitCode -eq 0) {
    $success = $true
    $logContent = Get-Content $LOG_FILE
    $totalTokens = 0
    foreach ($line in $logContent) {
      if ($line -match "Tokens:\s*(\d+)") { $totalTokens += [int]$matches[1] }
    }
    Log-Usage (if ($totalTokens -gt 0) { $totalTokens } else { 1000 })
  } else {
    Write-Log "Error: Gemini CLI failed with exit code $exitCode"
  }
} catch {
  Write-Log "Gemini CLI execution encountered an exception: $_"
} finally {
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
if (-not $success) {
  Write-Output "Workflow failed. Exiting with status 1."
  exit 1
}
exit 0
