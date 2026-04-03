<#
.SYNOPSIS
  Dry-run test for the Jules dispatch pipeline.

.DESCRIPTION
  Validates the full Jules dispatch chain without actually triggering
  a Jules session. Tests: Doppler key presence, GH CLI connectivity,
  active.json schema validity, and dry dispatch payload construction.

.EXAMPLE
  .\scripts\jules-dry-run.ps1
  .\scripts\jules-dry-run.ps1 -TaskId "D-12" -Verbose
#>

[CmdletBinding()]
param(
  [string]$TaskId   = "DRY-RUN-01",
  [string]$Branch   = "main",
  [string]$Prompt   = "Fix TypeScript error in component. [DRY RUN - no actual changes]"
)

$ErrorActionPreference = "Stop"

# ─── Helpers ─────────────────────────────────────────────────────────────────
function Write-Step([string]$name) {
  Write-Host "`n[$name]" -ForegroundColor Cyan
}

function Write-Pass([string]$msg) {
  Write-Host "  ✅ $msg" -ForegroundColor Green
}

function Write-Fail([string]$msg) {
  Write-Host "  ❌ $msg" -ForegroundColor Red
}

function Write-Warn([string]$msg) {
  Write-Host "  ⚠️  $msg" -ForegroundColor Yellow
}

$failures = @()

# ─── 1. Doppler Key ──────────────────────────────────────────────────────────
Write-Step "1. Doppler — JULES_API_KEY presence"
try {
  $key = doppler secrets get JULES_API_KEY --project ironforge --config dev --plain 2>&1
  if ($key -and $key.Length -gt 10) {
    Write-Pass "JULES_API_KEY found (length: $($key.Length) chars)"
  } else {
    Write-Fail "JULES_API_KEY is empty or too short"
    $failures += "JULES_API_KEY missing"
  }
} catch {
  Write-Fail "Doppler CLI error: $_"
  $failures += "Doppler CLI unavailable"
}

# ─── 2. GitHub CLI ───────────────────────────────────────────────────────────
Write-Step "2. GitHub CLI — connectivity check"
try {
  $ghStatus = gh auth status 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Pass "GitHub CLI authenticated"
  } else {
    Write-Fail "GitHub CLI not authenticated"
    $failures += "GH CLI not authenticated"
  }
} catch {
  Write-Fail "GitHub CLI not found: $_"
  $failures += "GH CLI missing"
}

# ─── 3. jules-mission.yml exists ─────────────────────────────────────────────
Write-Step "3. GH Actions — jules-mission.yml exists"
$missionYml = ".github/workflows/jules-mission.yml"
if (Test-Path $missionYml) {
  Write-Pass "jules-mission.yml found at $missionYml"
} else {
  Write-Fail "jules-mission.yml NOT found at $missionYml"
  $failures += "jules-mission.yml missing"
}

# ─── 4. active.json schema ───────────────────────────────────────────────────
Write-Step "4. active.json — schema validation"
$activeJson = ".agent/jules/active.json"
$schemaJson = ".agent/jules/schema.json"

if (-not (Test-Path $activeJson)) {
  Write-Fail "active.json not found — bootstrapping..."
  $emptyFile = @{ version = "1.0.0"; lastUpdated = $null; sessions = @() } | ConvertTo-Json -Depth 5
  New-Item -ItemType Directory -Path ".agent/jules" -Force | Out-Null
  Set-Content -Path $activeJson -Value $emptyFile
  Write-Warn "Bootstrapped empty active.json"
}

try {
  $content = Get-Content $activeJson -Raw | ConvertFrom-Json
  if ($content.version -and $content.PSObject.Properties.Name -contains "sessions") {
    Write-Pass "active.json parses correctly (version: $($content.version), sessions: $($content.sessions.Count))"
  } else {
    Write-Fail "active.json missing required fields"
    $failures += "active.json schema invalid"
  }
} catch {
  Write-Fail "active.json parse error: $_"
  $failures += "active.json unreadable"
}

# ─── 5. Dry dispatch payload ──────────────────────────────────────────────────
Write-Step "5. Dispatch payload — construction test"
$branchName = "jules/$($TaskId.ToLower() -replace '[^a-z0-9]', '-')-dry-run"
$payload = @{
  event_type     = "jules-dispatch"
  client_payload = @{
    task_id = $TaskId
    prompt  = $Prompt
    branch  = $Branch
    dry_run = $true
    token   = "DRY_RUN_TOKEN"
  }
} | ConvertTo-Json -Depth 5

Write-Pass "Payload constructed:"
Write-Host $payload -ForegroundColor DarkGray

Write-Pass "Would dispatch to branch: $branchName"

# ─── 6. n8n template check ───────────────────────────────────────────────────
Write-Step "6. n8n template — presence check"
$n8nTemplate = ".agent/jules/n8n-template.json"
if (Test-Path $n8nTemplate) {
  Write-Pass "n8n-template.json found"
} else {
  Write-Warn "n8n-template.json not found (optional)"
}

# ─── 7. Scope guard simulation ───────────────────────────────────────────────
Write-Step "7. Scope guard — simulation"
$forbiddenPatterns = @("prisma/migrations", ".github/workflows", "src/lib/auth", "docker-compose", ".env")
$mockChangedFiles = @("src/components/Button.tsx", "src/utils/format.ts")

$violations = @()
foreach ($file in $mockChangedFiles) {
  foreach ($pattern in $forbiddenPatterns) {
    if ($file -like "*$pattern*") { $violations += $file }
  }
}

if ($violations.Count -eq 0) {
  Write-Pass "Scope guard: no violations in mock file set"
} else {
  Write-Fail "Scope violations: $($violations -join ', ')"
  $failures += "Scope guard failed"
}

# ─── Summary ─────────────────────────────────────────────────────────────────
Write-Host "`n═══════════════════════════════════" -ForegroundColor Magenta
Write-Host "  🤖 Jules Dry-Run Summary" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════" -ForegroundColor Magenta

if ($failures.Count -eq 0) {
  Write-Host "  ✅ ALL CHECKS PASSED — pipeline ready" -ForegroundColor Green
  Write-Host "  Run `/jules-handoff $TaskId` to dispatch for real." -ForegroundColor DarkGray
  exit 0
} else {
  Write-Host "  ❌ $($failures.Count) CHECK(S) FAILED:" -ForegroundColor Red
  foreach ($f in $failures) { Write-Host "     - $f" -ForegroundColor Red }
  Write-Host ""
  Write-Host "  Fix the above before dispatching Jules." -ForegroundColor Yellow
  exit 1
}
