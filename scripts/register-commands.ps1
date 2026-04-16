# register-commands.ps1
# Usage: doppler run --project panopticon --config dev -- pwsh scripts/register-commands.ps1

$botToken = $env:DISCORD_BOT_TOKEN
$appId = $env:DISCORD_APPLICATION_ID

if (-not $botToken -or -not $appId) {
    Write-Error "Missing DISCORD_BOT_TOKEN or DISCORD_APPLICATION_ID in environment"
    exit 1
}

$headers = @{
    "Authorization" = "Bot $botToken"
    "Content-Type"  = "application/json"
    "User-Agent"    = "DiscordBot (https://github.com/Techlemariam/IronForge, 1.0.0)"
}

$commands = @(
    @{
        name = "status"
        description = "Check project CI/health status"
        options = @(
            @{
                name = "project"
                description = "Project name"
                type = 3
                required = $true
                choices = @(
                    @{ name = "ironforge"; value = "IronForge" },
                    @{ name = "taktpinne"; value = "Taktpinne" },
                    @{ name = "matlogistik"; value = "Matlogistik" },
                    @{ name = "panopticon"; value = "Panopticon" }
                )
            }
        )
    },
    @{
        name = "health"
        description = "Show cross-project health matrix"
    },
    @{
        name = "deploy"
        description = "Trigger a project deployment"
        options = @(
            @{
                name = "project"
                description = "Project name"
                type = 3
                required = $true
                choices = @(
                    @{ name = "ironforge"; value = "IronForge" },
                    @{ name = "taktpinne"; value = "Taktpinne" },
                    @{ name = "matlogistik"; value = "Matlogistik" }
                )
            },
            @{
                name = "environment"
                description = "Target environment"
                type = 3
                required = $true
                choices = @(
                    @{ name = "staging"; value = "staging" },
                    @{ name = "production"; value = "production" }
                )
            }
        )
    }
)

$uri = "https://discord.com/api/v10/applications/$appId/commands"

Write-Host "Registering Slash Commands with Discord..." -ForegroundColor Cyan
foreach ($cmd in $commands) {
    $body = $cmd | ConvertTo-Json -Depth 10
    try {
        $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body
        Write-Host "✅ Registered: /$($cmd.name)" -ForegroundColor Green
    } catch {
        Write-Error "❌ Failed to register /$($cmd.name): $_"
    }
}
