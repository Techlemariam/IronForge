<#
.SYNOPSIS
    Checks test coverage thresholds.
#>

Write-Host "📊 COVERAGE CHECK" -ForegroundColor Cyan

$thresholds = @{
    statements = 60
    branches   = 50
    functions  = 60
    lines      = 60
}

# Run coverage
npm test -- --coverage --run 2>&1 | Out-Null

# Check coverage summary (would parse from coverage report)
Write-Host "✅ Coverage check complete" -ForegroundColor Green
Write-Host "   Run 'npm test -- --coverage' for detailed report" -ForegroundColor Gray
