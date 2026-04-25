#!/usr/bin/env pwsh
# scratch/audit-coolify.ps1
. "$PSScriptRoot/../scripts/coolify-api.ps1"

Write-Host "--- Auditing Coolify Servers ---" -ForegroundColor Cyan
try {
    $servers = Invoke-CoolifyAPI -Path "servers"
    $servers | Select-Object name, uuid, ip_address, reachable | Format-Table -AutoSize
} catch {
    Write-Warning "Failed to fetch servers: $($_.Exception.Message)"
}

Write-Host "`n--- Auditing Coolify Projects ---" -ForegroundColor Cyan
try {
    $projects = Invoke-CoolifyAPI -Path "projects"
    foreach ($p in $projects) {
        Write-Host "Project: $($p.name) ($($p.uuid))" -ForegroundColor Green
        $resources = Invoke-CoolifyAPI -Path "projects/$($p.uuid)/resources"
        $resources | Select-Object name, type, status, server_name | Format-Table -AutoSize
    }
} catch {
    Write-Warning "Failed to fetch projects/resources: $($_.Exception.Message)"
}
