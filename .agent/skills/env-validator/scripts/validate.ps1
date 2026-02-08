<#
.SYNOPSIS
    Validates required environment variables.
#>

$required = @(
    @{ name = "DATABASE_URL"; pattern = "^postgres" },
    @{ name = "NEXT_PUBLIC_SUPABASE_URL"; pattern = "^https://" },
    @{ name = "NEXT_PUBLIC_SUPABASE_ANON_KEY"; pattern = "^eyJ" },
    @{ name = "CRON_SECRET"; pattern = ".{32,}" }
)

$optional = @(
    "SENTRY_DSN",
    "VERCEL_TOKEN",
    "HEVY_API_KEY",
    "INTERVALS_API_KEY"
)

Write-Host "🔐 ENV VALIDATOR" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

$failed = $false

foreach ($var in $required) {
    $value = [Environment]::GetEnvironmentVariable($var.name)
    if (-not $value) {
        Write-Host "❌ $($var.name): MISSING" -ForegroundColor Red
        $failed = $true
    }
    elseif ($var.pattern -and $value -notmatch $var.pattern) {
        Write-Host "⚠️ $($var.name): INVALID FORMAT" -ForegroundColor Yellow
        $failed = $true
    }
    else {
        Write-Host "✅ $($var.name): OK" -ForegroundColor Green
    }
}

Write-Host "`nOptional:" -ForegroundColor Gray
foreach ($name in $optional) {
    $value = [Environment]::GetEnvironmentVariable($name)
    $status = if ($value) { "✅ Set" } else { "⏭️ Not set" }
    Write-Host "   $name`: $status" -ForegroundColor Gray
}

if ($failed) {
    Write-Host "`n❌ ENV VALIDATION FAILED" -ForegroundColor Red
    exit 1
}
else {
    Write-Host "`n✅ ENV VALIDATION PASSED" -ForegroundColor Green
    exit 0
}
