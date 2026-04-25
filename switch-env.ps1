param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("local", "remote")]
    [string]$Mode
)

$EnvFile = ".env"
$MiniPC_Host = "mini-pc.tailafb692.ts.net"
$Local_Host = "localhost"

# IronForge specific ports
$DB_Port = "54422"

if (-not (Test-Path $EnvFile)) {
    Write-Error "Hittade ingen .env-fil i $PWD"
    return
}

$Content = Get-Content $EnvFile -Raw

if ($Mode -eq "remote") {
    Write-Host "Växlar till REMOTE läge (Mini-PC Engine Room)..." -ForegroundColor Cyan
    # Swap localhost for Mini-PC host
    $Content = $Content -replace "localhost:$DB_Port", "$MiniPC_Host`:$DB_Port"
    $Content = $Content -replace "127.0.0.1:$DB_Port", "$MiniPC_Host`:$DB_Port"
} else {
    Write-Host "Växlar till LOCAL läge (Pilot Seat Engine)..." -ForegroundColor Yellow
    # Swap Mini-PC host for localhost
    $Content = $Content -replace [regex]::Escape("$MiniPC_Host`:$DB_Port"), "$Local_Host`:$DB_Port"
}

Set-Content $EnvFile $Content
Write-Host "✅ .env har uppdaterats för $Mode-drift." -ForegroundColor Green

if ($Mode -eq "remote") {
    Write-Host "⚠️ Kom ihåg att Docker Desktop på Khameleon nu kan stängas av för att spara RAM!" -ForegroundColor Magenta
}
