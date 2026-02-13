# scripts/factory-monitor.ps1
# Monitors CI status and triggers ci-doctor if needed.

$branch = git rev-parse --abbrev-ref HEAD
Write-Host "🔍 Monitoring Factory Recovery for branch: $branch"

# Check latest run status using gh CLI
# Ensure gh is logged in and accessible
try {
    $latestRunJson = gh run list --branch $branch --limit 1 --json status, conclusion, databaseId, headSha
    $latestRun = $latestRunJson | ConvertFrom-Json
}
catch {
    Write-Warning "Failed to fetch GitHub Action status. Ensure 'gh' CLI is installed and authenticated."
    exit 1
}

if ($latestRun -and $latestRun.Count -gt 0) {
    $status = $latestRun[0].status
    $conclusion = $latestRun[0].conclusion
    $runId = $latestRun[0].databaseId
    $sha = $latestRun[0].headSha

    Write-Host "📊 CI Status: $status ($conclusion) for SHA: $sha"

    # Ensure directory exists
    $reportDir = ".agent/factory"
    if (!(Test-Path $reportDir)) {
        New-Item -ItemType Directory -Path $reportDir -Force
    }

    if ($status -eq "completed" -and $conclusion -eq "failure") {
        Write-Host "🚨 CI Failure detected! Triggering CI-Doctor logic..."
        
        $recoveryInfo = @{
            lastFailure     = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            runId           = $runId
            branch          = $branch
            sha             = $sha
            conclusion      = $conclusion
            status          = $status
            suggestedAction = "Run @[.agent/workflows/ci-doctor.md]"
            updatedAt       = Get-Date -Format "o"
        } | ConvertTo-Json
        
        $recoveryInfo | Out-File -FilePath "$reportDir/recovery-status.json" -Encoding utf8
        Write-Host "✅ Recovery status updated in $reportDir/recovery-status.json"
    }
    else {
        Write-Host "✅ CI is healthy, in progress, or recently cleared."
        # If we had a previous failure for THIS SHA, we might keep it, 
        # but if it's a new successful run or a new SHA, we clear it.
        if (Test-Path "$reportDir/recovery-status.json") {
            $oldStatus = Get-Content "$reportDir/recovery-status.json" | ConvertFrom-Json
            if ($status -eq "completed" -and $conclusion -eq "success") {
                Remove-Item "$reportDir/recovery-status.json"
                Write-Host "🧹 Cleared old recovery status."
            }
        }
    }
}
else {
    Write-Host "ℹ️ No recent runs found for this branch."
}
