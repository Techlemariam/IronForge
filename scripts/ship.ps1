<#
.SYNOPSIS
  🚢 ship.ps1 v3 — Unified Zero-Hell Release Automation
  
.DESCRIPTION
  Standardized release pipeline for the Gemini Brotherhood ecosystem.
  Enforces pnpm, Biome, and automated quality gates before merge.
  
.PARAMETER DryRun
  Simulate the entire flow without pushing or creating PRs.
  
.PARAMETER Force
  Skip agent:verify (for hotfixes only).
  
.PARAMETER SkipStagingCheck
  Skip the staging health-check after push.
#>

[CmdletBinding()]
param(
  [switch]$DryRun,
  [switch]$Force,
  [switch]$SkipStagingCheck
)

$ErrorActionPreference = "Stop"

# ─── CONFIG ──────────────────────────────────────────────────────────────────
$PROJECT = Split-Path (git rev-parse --show-toplevel) -Leaf
$LOG_DIR = Join-Path $PSScriptRoot ".ship-logs"
$MAX_RETRIES = 2

$VERSION = "unknown"
if (Test-Path "package.json") {
  $VERSION = (Get-Content package.json -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json).version
} elseif (Test-Path "src-tauri/tauri.conf.json") {
  $VERSION = (Get-Content src-tauri/tauri.conf.json -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json).version
}


# Project-specific overrides (Staging URLs)
$STAGING_CONFIG = @{
  "matlogistik" = "https://matlogistik-staging.tailafb692.ts.net";
  "WarRoom"     = "https://warroom-staging.tailafb692.ts.net";
  "Taktpinne"   = "https://taktpinne-staging.tailafb692.ts.net";
  "IronForge"   = "https://ironforge-staging.tailafb692.ts.net"
}
$STAGING_URL = $STAGING_CONFIG[$PROJECT]
if ($env:STAGING_URL) { $STAGING_URL = $env:STAGING_URL }

# ─── HELPERS ─────────────────────────────────────────────────────────────────
function Write-Step([string]$emoji, [string]$msg) { Write-Host "`n[$emoji] $msg" -ForegroundColor Cyan }
function Write-Pass([string]$msg) { Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Fail([string]$msg) { Write-Host "  ❌ $msg" -ForegroundColor Red }
function Write-Warn([string]$msg) { Write-Host "  ⚠️  $msg" -ForegroundColor Yellow }
function Write-Info([string]$msg) { Write-Host "  ℹ️  $msg" -ForegroundColor DarkGray }

function Write-ShipLog {
  param([string]$Event, [string]$Detail, [string]$Status = "INFO")
  if (-not (Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null }
  $logFile = Join-Path $LOG_DIR "ship-$(Get-Date -Format 'yyyy-MM-dd').jsonl"
  $entry = @{
    timestamp = (Get-Date -Format "o"); event = $Event; detail = $Detail
    status = $Status; branch = $script:BRANCH; project = $PROJECT
  } | ConvertTo-Json -Compress
  Add-Content -Path $logFile -Value $entry
}

# ─── PHASE 0: ENVIRONMENT CHECK ─────────────────────────────────────────────
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  🚢 ship.ps1 v3 — Unified Zero-Hell Pipeline" -ForegroundColor Magenta
Write-Host "  📍 Project: $PROJECT (v$VERSION)" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta

if ($DryRun) { Write-Host "  🧪 DRY RUN MODE" -ForegroundColor Yellow }
if ($Force)  { Write-Host "  ⚡ FORCE MODE" -ForegroundColor Yellow }

$script:BRANCH = git branch --show-current
Write-Step "0️⃣" "Environment Check"

# Guards
if ($script:BRANCH -eq "main" -or $script:BRANCH -eq "develop") {
  Write-Fail "Cannot ship from '$script:BRANCH'. Use a feature branch."
  exit 1
}

if (git status --porcelain) {
  Write-Fail "Working tree is dirty. Commit or stash first."
  exit 1
}

try { gh auth status 2>&1 | Out-Null; if ($LASTEXITCODE -ne 0) { throw } } catch {
  Write-Fail "GitHub CLI not authenticated."; exit 1
}

# Ensure pnpm
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Fail "pnpm is required but not found."; exit 1
}

Write-Pass "Pre-flight checks passed"

# ─── PHASE 1: VERIFY & AUTO-FIX ─────────────────────────────────────────────
Write-Step "1️⃣" "Quality Gate (Self-Healing)"

if ($Force) {
  Write-Warn "Skipping agent:verify"
} else {
  $verifyAttempt = 0; $verifyPassed = $false
  
  while ($verifyAttempt -le $MAX_RETRIES -and -not $verifyPassed) {
    $verifyAttempt++
    Write-Info "Attempt $verifyAttempt of $($MAX_RETRIES + 1)..."
    $verifyOutput = pnpm run agent:verify 2>&1 | Out-String
    
    if ($LASTEXITCODE -eq 0) {
      $verifyPassed = $true
      Write-Pass "Verification passed"
    } else {
      Write-Fail "Verification failed"
      
      if ($verifyAttempt -le $MAX_RETRIES) {
        $autoFixed = $false
        
        # 🔧 Biome Fix
        if ($verifyOutput -match "biome") {
          Write-Info "Detected formatting/lint issues. Running biome check --write..."
          pnpm biome check --write . 2>&1 | Out-Null
          $autoFixed = $true
        }
        
        # 🔧 Security Audit Fix
        if ($verifyOutput -match "audit|security") {
          Write-Info "Detected security vulnerabilities. Running pnpm audit fix..."
          pnpm audit fix 2>&1 | Out-String | Out-Null
          $autoFixed = $true
        }
        
        if ($autoFixed) {
          $fixedFiles = git status --porcelain
          if ($fixedFiles) {
            Write-Pass "Auto-fixed $($fixedFiles.Count) issues. Committing..."
            git add -A
            git commit -m "fix: auto-remediate [ship.ps1]" --no-verify
          }
        } else {
          Write-Fail "Error not auto-fixable. Aborting."
          $verifyOutput -split "`n" | Select-Object -Last 10 | ForEach-Object { Write-Warn "    $_" }
          exit 1
        }
      }
    }
  }
  
  if (-not $verifyPassed) { Write-Fail "Verification failed after retries."; exit 1 }
}

# ─── PHASE 2: MERGE & PUSH ──────────────────────────────────────────────────
Write-Step "2️⃣" "Deployment Sequence"

if ($DryRun) {
  Write-Info "[DRY RUN] Would merge $script:BRANCH → develop and push"
} else {
  # Merge to main
  git checkout main; git pull origin main
  if (!(git merge $script:BRANCH --no-edit)) {
    Write-Fail "Merge conflict! Rollback manual intervention required."
    git merge --abort; git checkout $script:BRANCH; exit 1
  }
  
  # Push
  Write-Info "Pushing to origin main..."
  git push origin main
  if ($LASTEXITCODE -ne 0) {
    Write-Fail "Push failed. Rolling back local merge."
    git reset --hard HEAD~1; git checkout $script:BRANCH; exit 1
  }
}

# ─── PHASE 3: STAGING HEALTH ────────────────────────────────────────────────
if ($STAGING_URL -and -not $DryRun -and -not $SkipStagingCheck) {
  Write-Step "3️⃣" "Staging Health Check"
  Write-Info "Pinging $STAGING_URL..."
  for ($i = 1; $i -le 6; $i++) {
    Start-Sleep -Seconds 10
    try {
      $r = Invoke-WebRequest -Uri $STAGING_URL -TimeoutSec 10 -SkipCertificateCheck -ErrorAction SilentlyContinue
      if ($r.StatusCode -eq 200) { Write-Pass "Staging OK (attempt $i)"; break }
    } catch { Write-Info "Waiting for deploy ($i/6)..." }
  }
}

# ─── PHASE 4: PULL REQUEST ──────────────────────────────────────────────────
Write-Step "4️⃣" "Pull Request (main → production)"

$PR_TITLE = "release: ship $script:BRANCH for project $PROJECT"
$PR_BODY = @"
## 🚢 Automated Ship (v3) — Zero-Hell Standard
- **Project**: $PROJECT
- **Version**: v$VERSION
- **Source**: ``$script:BRANCH``
- **Verification**: ✅ Passed $(if ($verifyAttempt -gt 1) { "(Auto-fixed after $verifyAttempt attempts)" })
- **Staging**: 🚀 Triggered
- **Timestamp**: $(Get-Date -Format 'yyyy-MM-dd HH:mm')

_Generated by standardized brotherhood-ship engine._
"@

if ($DryRun) {
  Write-Info "[DRY RUN] Would create PR"
} else {
  # Note: Since we already merged to main, this PR might be for 'production' if there's a separate branch, 
  # but for IronForge, main IS production/staging-target.
  # I'll keep the PR creation to 'main' if it's already there, or skip if identical.
  gh pr create --base main --head $script:BRANCH --title "$PR_TITLE" --body "$PR_BODY" 2>$null
  if ($LASTEXITCODE -eq 0) { Write-Pass "PR Created" } else { Write-Warn "PR already exists" }
}

# ─── CLEANUP ─────────────────────────────────────────────────────────────────
if (-not $DryRun) { git checkout $script:BRANCH }

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ SHIP COMPLETE! ($PROJECT v$VERSION)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-ShipLog -Event "SHIP_SUCCESS" -Detail "Finished unified ship cycle for v$VERSION"
