param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("up", "down", "reset", "status")]
    [string]$Action
)

$ComposeFile = "docker/ci-services.yml"

switch ($Action) {
    "up" {
        Write-Host "`n🚀 Starting Sovereign Managed Services..." -ForegroundColor Cyan
        docker compose -f $ComposeFile up -d
        Write-Host "⏳ Waiting for health checks..." -ForegroundColor Yellow
        $containers = docker compose -f $ComposeFile ps --format json | ConvertFrom-Json
        foreach ($container in $containers) {
            $name = $container.Name
            while ((docker inspect -f '{{.State.Health.Status}}' $name) -ne "healthy") {
                Write-Host "  $name is still initializing..."
                Start-Sleep -Seconds 2
            }
        }
        Write-Host "✅ All services are healthy.`n" -ForegroundColor Green
    }
    "down" {
        Write-Host "`n🛑 Stopping Sovereign Managed Services..." -ForegroundColor Red
        docker compose -f $ComposeFile down
    }
    "reset" {
        Write-Host "`n♻️ Resetting Sovereign Managed Services..." -ForegroundColor Blue
        docker compose -f $ComposeFile down -v
        docker compose -f $ComposeFile up -d
    }
    "status" {
        docker compose -f $ComposeFile ps
    }
}
