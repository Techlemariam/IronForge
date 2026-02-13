<#
.SYNOPSIS
    Checks the health of the GitHub Self-Hosted Runner and local system.
    Returns JSON for MCP server consumption.
#>

$results = @{
    Timestamp          = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    RunnerProcess      = $false
    GitHubConnectivity = $false
    DiskSpaceGB        = 0
    Status             = "Healthy"
    Messages           = @()
}

# 1. Check if Runner process is active
$runnerProc = Get-Process -Name "Runner.Listener" -ErrorAction SilentlyContinue
if ($runnerProc) {
    $results.RunnerProcess = $true
}
else {
    $results.Status = "Degraded"
    $results.Messages += "Runner.Listener process is not running."
}

# 2. Check GitHub API connectivity
try {
    $response = Invoke-WebRequest -Uri "https://api.github.com" -Method Head -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $results.GitHubConnectivity = $true
    }
}
catch {
    $results.Status = "Unhealthy"
    $results.Messages += "Cannot reach GitHub API."
}

# 3. Check Disk Space (C: drive)
$drive = Get-PSDrive C
$freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
$results.DiskSpaceGB = $freeSpaceGB

if ($freeSpaceGB -lt 5) {
    $results.Status = "Warning"
    $results.Messages += "Low disk space: $freeSpaceGB GB remaining."
}

# Output as JSON
return $results | ConvertTo-Json -Compress
