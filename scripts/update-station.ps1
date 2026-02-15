param (
    [Parameter(Mandatory=$true)]
    [string]$Station,

    [Parameter(Mandatory=$true)]
    [string]$Status,

    [int]$Health = 80,

    [string]$Branch = "main",

    [string]$RunId = "0"
)

$factoryDir = Join-Path $PSScriptRoot "..\.agent\factory"
if (-not (Test-Path $factoryDir)) {
    New-Item -ItemType Directory -Path $factoryDir -Force | Out-Null
}

$statusFile = Join-Path $factoryDir "$Station.json"

$data = @{
    station = $Station
    current = $Status
    health = $Health
    branch = $Branch
    runId = $RunId
    updatedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
}

$data | ConvertTo-Json | Set-Content -Path $statusFile -Encoding utf8

Write-Host "Updated station '$Station' with status: $Status" -ForegroundColor Green
