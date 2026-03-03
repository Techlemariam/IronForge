<#
.SYNOPSIS
  Send an inter-agent message via the IronForge API.
.EXAMPLE
  pwsh -File .agent/scripts/agent-message-send.ps1 -From "@manager" -To "@coder" -Topic "HANDOFF" -Content "Please implement feat/X" -TaskId "R-03"
#>
param (
  [Parameter(Mandatory = $true)]  [string]$From,
  [Parameter(Mandatory = $true)]  [string]$To,
  [Parameter(Mandatory = $true)]  [ValidateSet("HANDOFF", "ALERT", "REQUEST", "REVIEW", "INFO", "BLOCKED")]
  [string]$Topic,
  [Parameter(Mandatory = $true)]  [string]$Content,
  [Parameter(Mandatory = $false)] [string]$TaskId = "",
  [Parameter(Mandatory = $false)] [string]$PRNumber = ""
)

# Read env from Doppler
$appUrl = doppler run -- pwsh -Command 'Write-Output $env:NEXT_PUBLIC_APP_URL'
$cronSecret = doppler run -- pwsh -Command 'Write-Output $env:CRON_SECRET'

$appUrl = $appUrl.Trim()
$cronSecret = $cronSecret.Trim()

if (-not $appUrl -or -not $cronSecret) {
  Write-Error "ERROR: NEXT_PUBLIC_APP_URL or CRON_SECRET not set in Doppler."
  exit 1
}

$endpoint = "$appUrl/api/agent/message"

$payload = @{
  from    = $From
  to      = $To
  topic   = $Topic
  content = $Content
}
if ($TaskId) { $payload.taskId = $TaskId }
if ($PRNumber) { $payload.prNumber = [int]$PRNumber }

$body = $payload | ConvertTo-Json -Depth 3 -Compress

try {
  $response = Invoke-RestMethod `
    -Uri     $endpoint `
    -Method  POST `
    -Headers @{ Authorization = "Bearer $cronSecret"; "Content-Type" = "application/json" } `
    -Body    $body

  Write-Host ""
  Write-Host "✅ Message sent!" -ForegroundColor Green
  Write-Host "   ID:    $($response.id)"
  Write-Host "   From:  $From → To: $To"
  Write-Host "   Topic: $Topic"
  Write-Host "   Time:  $($response.createdAt)"
}
catch {
  $statusCode = $_.Exception.Response?.StatusCode.value__
  Write-Error "❌ FAILED (HTTP $statusCode): $_"
  exit 1
}
