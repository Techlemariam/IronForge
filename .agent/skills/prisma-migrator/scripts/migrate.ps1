<#
.SYNOPSIS
    Prisma migration helper.

.PARAMETER Name
    Migration name for create.

.PARAMETER Deploy
    Apply pending migrations.

.PARAMETER Reset
    Reset database (destructive).

.EXAMPLE
    pwsh .agent/skills/prisma-migrator/scripts/migrate.ps1 -Name "add_field"
#>

param(
    [string]$Name,
    [switch]$Deploy,
    [switch]$Reset
)

Write-Host "🗄️ PRISMA MIGRATOR" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

if ($Reset) {
    Write-Host "⚠️ WARNING: This will reset the database!" -ForegroundColor Red
    Write-Host "   Running: npx prisma migrate reset" -ForegroundColor Yellow
    npx prisma migrate reset --force
}
elseif ($Deploy) {
    Write-Host "🚀 Deploying migrations..." -ForegroundColor Yellow
    npx prisma migrate deploy
}
elseif ($Name) {
    Write-Host "📝 Creating migration: $Name" -ForegroundColor Yellow
    npx prisma migrate dev --name $Name
}
else {
    Write-Host "Usage:" -ForegroundColor Gray
    Write-Host "  -Name 'migration_name'  Create new migration"
    Write-Host "  -Deploy                 Apply pending migrations"
    Write-Host "  -Reset                  Reset database (destructive)"
}

Write-Host "`n✅ Done" -ForegroundColor Green
