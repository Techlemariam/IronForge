<#
.SYNOPSIS
    Logs skill invocations for telemetry.

.PARAMETER SkillName
    Name of the skill being invoked.

.PARAMETER Action
    Action performed (e.g., "execute", "test").

.EXAMPLE
    . .agent/skills/scripts/log-skill.ps1 -SkillName "git-guard" -Action "execute"
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$SkillName,
    
    [Parameter(Mandatory = $false)]
    [string]$Action = "execute",
    
    [Parameter(Mandatory = $false)]
    [int]$ExitCode = 0
)

$logDir = Join-Path (Split-Path -Parent $PSScriptRoot) ".." "logs"
$logFile = Join-Path $logDir "skill-usage.json"

# Ensure log directory exists
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Create log entry
$entry = @{
    timestamp = (Get-Date -Format "o")
    skill     = $SkillName
    action    = $Action
    exitCode  = $ExitCode
    user      = $env:USERNAME
    branch    = (git rev-parse --abbrev-ref HEAD 2>$null) ?? "unknown"
}

# Append to log file
$existingLog = @()
if (Test-Path $logFile) {
    $existingLog = Get-Content $logFile -Raw | ConvertFrom-Json -AsHashtable
    if ($null -eq $existingLog) { $existingLog = @() }
}

$existingLog += $entry
$existingLog | ConvertTo-Json -Depth 3 | Set-Content $logFile -Encoding UTF8
