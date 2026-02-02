<#
.SYNOPSIS
    Gatekeeper - Pre-commit quality gate for IronForge.

.PARAMETER Quick
    Skip tests, only run types and lint.

.EXAMPLE
    pwsh .agent/skills/gatekeeper/scripts/verify.ps1
    pwsh .agent/skills/gatekeeper/scripts/verify.ps1 -Quick
#>

param(
    [switch]$Quick
)

$ErrorActionPreference = "Stop"
$failed = $false

Write-Host "🚦 GATEKEEPER - Quality Gate" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Step 1: TypeScript
Write-Host "`n📦 [1/4] TypeScript Check..." -ForegroundColor Yellow
try {
    npm run check-types 2>&1 | Out-Null
    Write-Host "   ✅ Types: PASS" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Types: FAIL" -ForegroundColor Red
    npm run check-types
    $failed = $true
}

# Step 2: ESLint
Write-Host "`n🔍 [2/4] ESLint Check..." -ForegroundColor Yellow
try {
    npm run lint 2>&1 | Out-Null
    Write-Host "   ✅ Lint: PASS" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Lint: FAIL" -ForegroundColor Red
    npm run lint
    $failed = $true
}

# Step 3: Prisma Validate
Write-Host "`n🗄️ [3/4] Prisma Schema..." -ForegroundColor Yellow
try {
    npx prisma validate 2>&1 | Out-Null
    Write-Host "   ✅ Schema: VALID" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Schema: INVALID" -ForegroundColor Red
    $failed = $true
}

# Step 4: Tests (skip if Quick)
if (-not $Quick) {
    Write-Host "`n🧪 [4/4] Unit Tests..." -ForegroundColor Yellow
    try {
        npm test -- --run 2>&1 | Out-Null
        Write-Host "   ✅ Tests: PASS" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Tests: FAIL" -ForegroundColor Red
        $failed = $true
    }
}
else {
    Write-Host "`n⏭️ [4/4] Tests: SKIPPED (Quick mode)" -ForegroundColor Gray
}

# Summary
Write-Host "`n=============================" -ForegroundColor Cyan
if ($failed) {
    Write-Host "❌ GATEKEEPER: BLOCKED" -ForegroundColor Red
    Write-Host "   Fix errors above before committing." -ForegroundColor Red
    exit 1
}
else {
    Write-Host "✅ GATEKEEPER: PASSED" -ForegroundColor Green
    Write-Host "   Ready to commit/push." -ForegroundColor Green
    exit 0
}
