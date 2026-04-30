# CI Secret Validation

if ($env:SKIP_ENV_VALIDATION -eq "true") {
    Write-Host "⏭️ SKIP_ENV_VALIDATION is true. Skipping secret validation." -ForegroundColor Yellow
    exit 0
}

$RequiredSecrets = @(
    "DATABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

$MissingSecrets = @()

foreach ($Secret in $RequiredSecrets) {
    $Value = Get-Item -Path "env:$Secret" -ErrorAction SilentlyContinue
    if (-not $Value -or $Value.Value -eq "dummy" -or $Value.Value -eq "https://dummy.supabase.co") {
        $MissingSecrets += $Secret
    }
}

if ($MissingSecrets.Count -gt 0) {
    Write-Host "❌ Missing Critical Secrets: $($MissingSecrets -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All critical secrets present." -ForegroundColor Green
exit 0
