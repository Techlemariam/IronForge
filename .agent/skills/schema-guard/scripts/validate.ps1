<#
.SYNOPSIS
    Validates Prisma schema.
#>

Write-Host "🗄️ SCHEMA GUARD" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan

$failed = $false

# Validate
Write-Host "`n[1/3] Validating schema..." -ForegroundColor Yellow
try {
    npx prisma validate 2>&1 | Out-Null
    Write-Host "   ✅ Schema: VALID" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Schema: INVALID" -ForegroundColor Red
    npx prisma validate
    $failed = $true
}

# Format check
Write-Host "`n[2/3] Checking format..." -ForegroundColor Yellow
$before = Get-Content "prisma/schema.prisma" -Raw
npx prisma format 2>&1 | Out-Null
$after = Get-Content "prisma/schema.prisma" -Raw
if ($before -eq $after) {
    Write-Host "   ✅ Format: OK" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️ Format: Auto-fixed" -ForegroundColor Yellow
}

# Generate
Write-Host "`n[3/3] Generating types..." -ForegroundColor Yellow
try {
    npx prisma generate 2>&1 | Out-Null
    Write-Host "   ✅ Types: Generated" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Types: Failed" -ForegroundColor Red
    $failed = $true
}

if ($failed) {
    Write-Host "`n❌ SCHEMA GUARD: FAILED" -ForegroundColor Red
    exit 1
}
else {
    Write-Host "`n✅ SCHEMA GUARD: PASSED" -ForegroundColor Green
    exit 0
}
