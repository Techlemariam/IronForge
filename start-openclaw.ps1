# Load .env variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#]+?)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"')
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

# Alias tokens for CLI tools
if ($env:GITHUB_PERSONAL_ACCESS_TOKEN) {
    [Environment]::SetEnvironmentVariable("GH_TOKEN", $env:GITHUB_PERSONAL_ACCESS_TOKEN, "Process")
    [Environment]::SetEnvironmentVariable("GITHUB_TOKEN", $env:GITHUB_PERSONAL_ACCESS_TOKEN, "Process")
}



# Kill any stale Gateway processes (by port and name)
$port = 18789
$pidToKill = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($pidToKill) {
    Write-Host "🧹 Cleaning up process $pidToKill listening on port $port..." -ForegroundColor Yellow
    Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
}

$staleProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*openclaw*gateway*"
}
if ($staleProcesses) {
    Write-Host "🧹 Cleaning up $($staleProcesses.Count) remaining stale Gateway process(es)..." -ForegroundColor Yellow
    $staleProcesses | Stop-Process -Force
    Start-Sleep -Seconds 1
}

Write-Host "🦞 Starting Moltbot (OpenClaw)..." -ForegroundColor Cyan

Write-Host "🤖 Discord Token: $($env:DISCORD_BOT_TOKEN ? 'Loaded' : 'MISSING')" -ForegroundColor DarkGray
Write-Host "🤖 Gemini API Key: $($env:GEMINI_API_KEY ? ('Loaded (' + $env:GEMINI_API_KEY.Substring($env:GEMINI_API_KEY.Length - 6) + ')') : 'MISSING')" -ForegroundColor DarkGray
Write-Host "🤖 Google API Key: $($env:GOOGLE_API_KEY ? ('Loaded (' + $env:GOOGLE_API_KEY.Substring($env:GOOGLE_API_KEY.Length - 6) + ')') : 'MISSING')" -ForegroundColor DarkGray
Write-Host "🤖 Groq API Key:   $($env:GROQ_API_KEY ? ('Loaded (' + $env:GROQ_API_KEY.Substring($env:GROQ_API_KEY.Length - 6) + ')') : 'MISSING')" -ForegroundColor DarkGray

# Start Gateway
openclaw gateway --port 18789 --allow-unconfigured --token ironforge-secure-2026 --verbose --tailscale serve
