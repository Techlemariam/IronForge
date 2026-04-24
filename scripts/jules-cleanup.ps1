<#
.SYNOPSIS
  Jules stale session cleanup and archiving utility.

.DESCRIPTION
  Scans .agent/jules/active.json for:
    - Stale sessions (dispatched > threshold without completing)
    - Completed sessions older than retention window
    - Orphaned local branches (jules/*) without an active session

  Marks them appropriately, archives old ones, and optionally deletes
  local branches.

.EXAMPLE
  # Preview mode (no changes)
  .\scripts\jules-cleanup.ps1

  # Apply cleanup
  .\scripts\jules-cleanup.ps1 -Apply

  # Also prune orphaned local branches
  .\scripts\jules-cleanup.ps1 -Apply -PruneBranches
#>

[CmdletBinding()]
param(
  [switch]$Apply,
  [switch]$PruneBranches,
  [int]$StaleThresholdMinutes   = 120,  # 2 hrs
  [int]$RetentionHours          = 48,   # archive after 48h
  [int]$MaxRetries              = 3
)

$ErrorActionPreference = "Stop"

$ActivePath  = ".agent/jules/active.json"
$ArchivePath = ".agent/jules/archive.json"

# ─── Helpers ─────────────────────────────────────────────────────────────────
function Log-Info([string]$msg)  { Write-Host "  ℹ️  $msg" -ForegroundColor Cyan }
function Log-Pass([string]$msg)  { Write-Host "  ✅ $msg" -ForegroundColor Green }
function Log-Warn([string]$msg)  { Write-Host "  ⚠️  $msg" -ForegroundColor Yellow }
function Log-Action([string]$msg){ Write-Host "  🔧 $msg" -ForegroundColor Magenta }
function Log-Fail([string]$msg)  { Write-Host "  ❌ $msg" -ForegroundColor Red }

$now = Get-Date

if (-not $Apply) {
  Write-Host "`n══════════════════════════════════════════" -ForegroundColor DarkYellow
  Write-Host "  ⚠️  DRY RUN — No changes will be written" -ForegroundColor DarkYellow
  Write-Host "  Run with -Apply to apply changes."         -ForegroundColor DarkYellow
  Write-Host "══════════════════════════════════════════`n" -ForegroundColor DarkYellow
}

# ─── Load active.json ─────────────────────────────────────────────────────────
if (-not (Test-Path $ActivePath)) {
  Log-Warn "active.json not found. Nothing to clean up."
  exit 0
}

$activeData = Get-Content $ActivePath -Raw | ConvertFrom-Json
$sessions   = $activeData.sessions

if ($sessions.Count -eq 0) {
  Log-Pass "No active sessions. Nothing to clean up."
  exit 0
}

Log-Info "Loaded $($sessions.Count) sessions from active.json"

# ─── Load / init archive ──────────────────────────────────────────────────────
$archive = @()
if (Test-Path $ArchivePath) {
  $archive = Get-Content $ArchivePath -Raw | ConvertFrom-Json
  if ($archive -isnot [array]) { $archive = @($archive) }
}

# ─── Process sessions ─────────────────────────────────────────────────────────
$toKeep    = @()
$toArchive = @()
$staleMark = @()

foreach ($s in $sessions) {
  $dispatchedAt = [datetime]::Parse($s.dispatchedAt)
  $ageMinutes   = ($now - $dispatchedAt).TotalMinutes
  $ageHours     = ($now - $dispatchedAt).TotalHours
  $isTerminal   = $s.status -in @("completed", "failed")

  # Archive terminal sessions past retention window
  if ($isTerminal -and $ageHours -gt $RetentionHours) {
    Log-Action "Archive: [$($s.taskId)] status=$($s.status) age=$([int]$ageHours)h"
    $toArchive += $s
    continue
  }

  # Detect stale
  $staleThresholds = @{
    dispatched       = $StaleThresholdMinutes
    in_progress      = $StaleThresholdMinutes * 2
    awaiting_review  = $StaleThresholdMinutes * 24
  }
  $threshold = $staleThresholds[$s.status]
  if ($threshold -and $ageMinutes -gt $threshold -and -not $isTerminal) {
    Log-Warn "Stale: [$($s.taskId)] status=$($s.status) age=$([int]$ageMinutes)m (threshold: ${threshold}m)"

    if ($s.retryCount -lt $MaxRetries) {
      Log-Action "  → Will mark as 'stale' (retry $($s.retryCount + 1)/$MaxRetries available)"
      $staleMark += $s.id
    } else {
      Log-Action "  → Max retries reached. Marking as 'failed' and archiving."
      $s.status    = "failed"
      $s.lastError = "Stale: exceeded $MaxRetries retries (age: $([int]$ageMinutes)m)"
      $toArchive  += $s
      continue
    }
  }

  if ($s.status -ne "completed" -and $s.status -ne "failed") {
    Log-Info "Keep:    [$($s.taskId)] status=$($s.status) age=$([int]$ageMinutes)m"
  }
  $toKeep += $s
}

# ─── Apply stale marks ────────────────────────────────────────────────────────
foreach ($session in $toKeep) {
  if ($staleMark -contains $session.id) {
    $session.status     = "stale"
    $session.retryCount = $session.retryCount + 1
  }
}

# ─── Prune orphaned branches ──────────────────────────────────────────────────
if ($PruneBranches) {
  Write-Host "`n[Branch Cleanup]" -ForegroundColor Cyan
  try {
    $activeBranches = $toKeep | ForEach-Object { $_.branch }
    $localBranches  = git branch --list "jules/*" 2>&1 | ForEach-Object { $_.Trim() -replace '^\*\s*', '' }

    foreach ($branch in $localBranches) {
      if ($branch -notin $activeBranches) {
        Log-Action "Orphaned branch: $branch"
        if ($Apply) {
          git branch -D $branch 2>&1 | Out-Null
          Log-Pass "  Deleted local branch: $branch"
        }
      }
    }
  } catch {
    Log-Warn "Could not list git branches: $_"
  }
}

# ─── Write changes ────────────────────────────────────────────────────────────
Write-Host "`n[Summary]" -ForegroundColor Cyan
Log-Info "Sessions to keep:    $($toKeep.Count)"
Log-Info "Sessions to archive: $($toArchive.Count)"
Log-Info "Sessions marked stale: $($staleMark.Count)"

if ($Apply) {
  # Update active.json
  $activeData.sessions    = $toKeep
  $activeData.lastUpdated = $now.ToString("o")
  $activeData | ConvertTo-Json -Depth 10 | Set-Content $ActivePath
  Log-Pass "active.json updated ($($toKeep.Count) sessions kept)"

  # Write archive
  if ($toArchive.Count -gt 0) {
    $merged = @($archive) + @($toArchive)
    $merged | ConvertTo-Json -Depth 10 | Set-Content $ArchivePath
    Log-Pass "archive.json updated ($($merged.Count) total archived)"
  }
} else {
  Log-Warn "No changes written (dry run). Use -Apply to commit."
}

Write-Host ""
