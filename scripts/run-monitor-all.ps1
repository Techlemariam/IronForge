# 🏥 System Health Monitoring Script (PowerShell)
$date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$reportPath = "SYSTEM_HEALTH.md"

Write-Output "# 🏥 System Health Report" | Out-File -FilePath $reportPath -Encoding utf8
Write-Output "**Date:** $date`n" | Out-File -Append -FilePath $reportPath -Encoding utf8

# Helper to run a monitor and save JSON
function Run-Monitor {
    param (
        [string]$Name,
        [string]$Command,
        [string]$JsonPath,
        [string]$SectionTitle
    )
    Write-Output "## $SectionTitle" | Out-File -Append -FilePath $reportPath -Encoding utf8
    Write-Output "Running $Name..."
    
    # Simulate /command by running the underlying logic or the command if supported
    # For now, we'll run the core logic and produce a JSON
    # We'll use a template for the JSON if the tool doesn't exist
    
    $status = "pass"
    $details = "N/A"
    
    try {
        if ($Name -eq "CI") {
            $runs = doppler run -- gh run list --limit 1 --json status,conclusion
            $latest = $runs | ConvertFrom-Json | Select-Object -First 1
            if ($latest.conclusion -eq "failure") { $status = "fail" }
            $details = "Latest run: $($latest.status) - $($latest.conclusion)"
        }
        elseif ($Name -eq "Deploy") {
            # Check staging ping
            $ping = Test-Connection ironforge-staging.tailafb692.ts.net -Count 1 -Quiet
            if (-not $ping) { $status = "fail"; $details = "Staging unreachable" }
            else { $details = "Staging reachable" }
        }
        elseif ($Name -eq "DB") {
            $statusStr = doppler run -- npx prisma migrate status 2>&1
            if ($statusStr -match "Error" -or $statusStr -match "failed") { $status = "fail" }
            $details = $statusStr -join " "
        }
    } catch {
        $status = "error"
        $details = $_.Exception.Message
    }
    
    $jsonObj = @{
        name = $Name
        status = $status
        timestamp = $date
        details = $details
    }
    
    $jsonObj | ConvertTo-Json | Out-File -FilePath $JsonPath -Encoding utf8
    Write-Output "Status: $status" | Out-File -Append -FilePath $reportPath -Encoding utf8
    Write-Output "Details: $details`n" | Out-File -Append -FilePath $reportPath -Encoding utf8
}

# 1. DevOps Health
Run-Monitor -Name "CI" -JsonPath "ci_health.json" -SectionTitle "1. DevOps Health"
Run-Monitor -Name "Deploy" -JsonPath "deploy_health.json" -SectionTitle ""
Run-Monitor -Name "DB" -JsonPath "db_health.json" -SectionTitle ""

# 2. Codebase Health
# (Adding more checks as needed)

# Calculate Score
$score = 100
if (Test-Path ci_health.json) {
    if ((Get-Content ci_health.json | ConvertFrom-Json).status -eq "fail") { $score -= 20 }
}
if (Test-Path deploy_health.json) {
    if ((Get-Content deploy_health.json | ConvertFrom-Json).status -eq "fail") { $score -= 30 }
}
if (Test-Path db_health.json) {
    if ((Get-Content db_health.json | ConvertFrom-Json).status -eq "fail") { $score -= 20 }
}

Write-Output "**System Health Score:** $score" | Out-File -Append -FilePath $reportPath -Encoding utf8
if ($score -lt 80) {
    Write-Output "⚠️ SYSTEM UNHEALTHY" | Out-File -Append -FilePath $reportPath -Encoding utf8
} else {
    Write-Output "✅ SYSTEM HEALTHY" | Out-File -Append -FilePath $reportPath -Encoding utf8
}

Write-Output "Monitoring Complete. Report generated at $reportPath"
