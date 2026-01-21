# =============================================================================
# Debug Coolify - Autonomous Log Fetcher
# =============================================================================
# Usage: .\debug-coolify.ps1 [-ServerIP <ip>] [-User <username>]
#
# This script connects to your Coolify VPS and fetches:
# - System metrics (memory, disk)
# - Docker container status
# - Coolify build logs
# - Recent error logs
#
# Perfect for debugging when you're away from your computer!
# =============================================================================

param(
    [string]$ServerIP = "77.42.45.229",
    [string]$User = "root"
)

$Server = "$User@$ServerIP"

Write-Host "🔍 Fetching logs from Coolify server: $ServerIP" -ForegroundColor Cyan
Write-Host ""

$Command = @"
echo '=== SYSTEM METRICS ==='
echo 'Memory:'
free -m
echo ''
echo 'Disk:'
df -h /
echo ''
echo '=== DOCKER CONTAINERS ==='
docker ps -a --format 'table {{.ID}}\t{{.Status}}\t{{.Names}}' | head -10
echo ''
echo '=== COOLIFY LOGS (Last 100 lines) ==='
docker logs coolify --tail 100 2>&1
echo ''
echo '=== RECENT BUILD LOGS ==='
find /data/coolify -type f -name '*.log' -mmin -60 2>/dev/null | head -3
"@

try {
    ssh -o BatchMode=yes -o StrictHostKeyChecking=no $Server $Command
    Write-Host ""
    Write-Host "✅ Logs fetched successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to fetch logs: $_" -ForegroundColor Red
    exit 1
}
