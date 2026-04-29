<#
.SYNOPSIS
  Restart Docker-based GitHub Actions runners for IronForge.
.DESCRIPTION
  Used by the Runner Heartbeat workflow and manual recovery.
  Recreates runners via docker-compose.runners.yml.
#>

param(
    [int]$Scale = 3,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$ComposeFile = "$PSScriptRoot\..\docker-compose.runners.yml"

Write-Host "🔄 Restarting IronForge runners (scale=$Scale)..." -ForegroundColor Cyan

# Check if compose file exists
if (-not (Test-Path $ComposeFile)) {
    Write-Error "❌ Compose file not found: $ComposeFile"
    exit 1
}

# Stop existing runners
Write-Host "⏹️ Stopping existing runners..."
docker compose -f $ComposeFile down --remove-orphans 2>&1 | Out-Null

# Start fresh
Write-Host "▶️ Starting $Scale runners..."
doppler run -- docker compose -f $ComposeFile up -d --scale runner=$Scale

# Runners started.
