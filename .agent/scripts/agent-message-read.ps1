<#
.SYNOPSIS
  Read unread inter-agent messages via the IronForge API.
.EXAMPLE
  pwsh -File .agent/scripts/agent-message-read.ps1 -Role "@coder"
  pwsh -File .agent/scripts/agent-message-read.ps1 -Role "@coder" -All
  pwsh -File .agent/scripts/agent-message-read.ps1 -Role "@coder" -MarkRead
#>
param (
  [Parameter(Mandatory = $true)]  [string]$Role,
  [Parameter(Mandatory = $false)] [switch]$All,
  [Parameter(Mandatory = $false)] [switch]$MarkRead,
  [Parameter(Mandatory = $false)] [int]$Limit = 20
)

# Read env from Doppler
$appUrl = (doppler run -- pwsh -Command 'Write-Output $env:NEXT_PUBLIC_APP_URL').Trim()
$cronSecret = (doppler run -- pwsh -Command 'Write-Output $env:CRON_SECRET').Trim()

if (-not $appUrl -or -not $cronSecret) {
  Write-Error "ERROR: NEXT_PUBLIC_APP_URL or CRON_SECRET not set in Doppler."
  exit 1
}

$status = if ($All) { "" } else { "&status=UNREAD" }
$endpoint = "$appUrl/api/agent/message?to=$([uri]::EscapeDataString($Role))&limit=$Limit$status"
$headers = @{ Authorization = "Bearer $cronSecret" }

$timeoutSec = 30
try {
  $response = Invoke-RestMethod -Uri $endpoint -Method GET -Headers $headers -TimeoutSec $timeoutSec
}
catch {
  Write-Error "❌ FAILED: $_"
  exit 1
}

if ($response.count -eq 0) {
  Write-Host "📭 No messages for $Role." -ForegroundColor DarkGray
  exit 0
}

Write-Host ""
Write-Host "📬 $($response.count) message(s) for $Role" -ForegroundColor Cyan
Write-Host ""

$idsToMark = @()
foreach ($msg in $response.messages) {
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
  Write-Host "  ID:     $($msg.id)" -ForegroundColor DarkGray
  Write-Host "  From:   $($msg.senderRole)  →  Topic: $($msg.topic)" -ForegroundColor Yellow
  if ($msg.taskId) { Write-Host "  Task:   $($msg.taskId)"   -ForegroundColor Magenta }
  if ($msg.prNumber) { Write-Host "  PR:     #$($msg.prNumber)" -ForegroundColor Magenta }
  Write-Host "  Time:   $($msg.createdAt)" -ForegroundColor DarkGray
  Write-Host ""
  Write-Host $msg.content -ForegroundColor White
  Write-Host ""
  $idsToMark += $msg.id
}
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# Mark as read if requested, or if reading unread messages (default behavior)
if ($idsToMark.Count -gt 0 -and ($MarkRead -or -not $All)) {
  $patchBody = @{ ids = $idsToMark } | ConvertTo-Json -Compress
  try {
    $patch = Invoke-RestMethod `
      -Uri     "$appUrl/api/agent/message" `
      -Method  PATCH `
      -Headers (@{ Authorization = "Bearer $cronSecret"; "Content-Type" = "application/json" }) `
      -Body    $patchBody `
      -TimeoutSec $timeoutSec
    Write-Host ""
    Write-Host "✅ Marked $($patch.updated) message(s) as READ." -ForegroundColor Green
  }
  catch {
    Write-Warning "⚠️  Could not mark messages as read: $_"
  }
}
