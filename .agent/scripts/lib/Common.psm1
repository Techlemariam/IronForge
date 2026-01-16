# Common.psm1 - Shared PowerShell module for GitHub Project scripts
# Contains: Retry logic, logging, rate limiting, error handling

$ErrorActionPreference = "Stop"

# ============================================================================
# LOGGING
# ============================================================================

$script:LogPath = $null

function Initialize-ProjectLogger {
    <#
    .SYNOPSIS
        Initializes structured JSON logging
    #>
    param(
        [string]$LogDir = (Join-Path $PSScriptRoot "..\logs"),
        [string]$LogName = "project-automation"
    )
    
    if (-not (Test-Path $LogDir)) {
        New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
    }
    
    $date = Get-Date -Format "yyyy-MM-dd"
    $script:LogPath = Join-Path $LogDir "$LogName-$date.jsonl"
}

function Write-ProjectLog {
    <#
    .SYNOPSIS
        Writes a structured log entry
    #>
    param(
        [Parameter(Mandatory)]
        [ValidateSet("INFO", "WARN", "ERROR", "DEBUG")]
        [string]$Level,
        
        [Parameter(Mandatory)]
        [string]$Message,
        
        [hashtable]$Data = @{},
        
        [string]$Operation = ""
    )
    
    $entry = @{
        timestamp = (Get-Date -Format "o")
        level     = $Level
        message   = $Message
        operation = $Operation
        data      = $Data
    }
    
    # Console output with color
    $color = switch ($Level) {
        "INFO" { "White" }
        "WARN" { "Yellow" }
        "ERROR" { "Red" }
        "DEBUG" { "Gray" }
    }
    
    Write-Host "[$Level] $Message" -ForegroundColor $color
    
    # File output (JSON Lines format)
    if ($script:LogPath) {
        $entry | ConvertTo-Json -Compress | Add-Content $script:LogPath
    }
}

# ============================================================================
# RETRY LOGIC
# ============================================================================

function Invoke-WithRetry {
    <#
    .SYNOPSIS
        Executes a script block with exponential backoff retry
    .PARAMETER ScriptBlock
        The code to execute
    .PARAMETER MaxRetries
        Maximum number of retry attempts (default: 3)
    .PARAMETER InitialDelaySeconds
        Initial delay before first retry (default: 2)
    .PARAMETER RetryableErrors
        Array of error patterns that should trigger retry
    #>
    param(
        [Parameter(Mandatory)]
        [scriptblock]$ScriptBlock,
        
        [int]$MaxRetries = 3,
        
        [int]$InitialDelaySeconds = 2,
        
        [string[]]$RetryableErrors = @(
            "timeout",
            "rate limit",
            "502",
            "503",
            "504",
            "ETIMEDOUT",
            "ECONNRESET"
        )
    )
    
    $attempt = 0
    $lastError = $null
    
    while ($attempt -lt $MaxRetries) {
        $attempt++
        
        try {
            $result = & $ScriptBlock
            
            if ($attempt -gt 1) {
                Write-ProjectLog -Level "INFO" -Message "Succeeded after $attempt attempts" -Operation "Retry"
            }
            
            return $result
        }
        catch {
            $lastError = $_
            $errorMessage = $_.Exception.Message
            
            # Check if error is retryable
            $isRetryable = $false
            foreach ($pattern in $RetryableErrors) {
                if ($errorMessage -match $pattern) {
                    $isRetryable = $true
                    break
                }
            }
            
            if (-not $isRetryable -or $attempt -ge $MaxRetries) {
                Write-ProjectLog -Level "ERROR" -Message "Failed after $attempt attempts: $errorMessage" -Operation "Retry"
                throw
            }
            
            # Exponential backoff
            $delay = $InitialDelaySeconds * [Math]::Pow(2, $attempt - 1)
            Write-ProjectLog -Level "WARN" -Message "Attempt $attempt failed, retrying in ${delay}s..." -Operation "Retry" -Data @{
                error       = $errorMessage
                nextAttempt = $attempt + 1
            }
            
            Start-Sleep -Seconds $delay
        }
    }
    
    throw $lastError
}

# ============================================================================
# RATE LIMITING
# ============================================================================

$script:RateLimitRemaining = $null
$script:RateLimitReset = $null

function Test-RateLimit {
    <#
    .SYNOPSIS
        Checks GitHub API rate limit and waits if necessary
    #>
    param(
        [int]$MinRemaining = 10
    )
    
    try {
        $headers = gh api rate_limit --jq '.rate | "\(.remaining) \(.reset)"' 2>$null
        if ($headers) {
            $parts = $headers -split ' '
            $script:RateLimitRemaining = [int]$parts[0]
            $script:RateLimitReset = [int]$parts[1]
            
            if ($script:RateLimitRemaining -lt $MinRemaining) {
                $waitSeconds = $script:RateLimitReset - [int](Get-Date -UFormat %s)
                if ($waitSeconds -gt 0) {
                    Write-ProjectLog -Level "WARN" -Message "Rate limit low ($script:RateLimitRemaining remaining), waiting ${waitSeconds}s" -Operation "RateLimit"
                    Start-Sleep -Seconds ([Math]::Min($waitSeconds, 60))
                }
            }
        }
    }
    catch {
        # Ignore rate limit check failures
    }
}

# ============================================================================
# METRICS
# ============================================================================

$script:Metrics = @{
    success   = 0
    failure   = 0
    retries   = 0
    startTime = $null
}

function Start-MetricsCollection {
    $script:Metrics.startTime = Get-Date
    $script:Metrics.success = 0
    $script:Metrics.failure = 0
    $script:Metrics.retries = 0
}

function Add-MetricSuccess { $script:Metrics.success++ }
function Add-MetricFailure { $script:Metrics.failure++ }
function Add-MetricRetry { $script:Metrics.retries++ }

function Get-MetricsSummary {
    $duration = if ($script:Metrics.startTime) {
        ((Get-Date) - $script:Metrics.startTime).TotalSeconds
    }
    else { 0 }
    
    return @{
        success          = $script:Metrics.success
        failure          = $script:Metrics.failure
        retries          = $script:Metrics.retries
        duration_seconds = [Math]::Round($duration, 2)
        success_rate     = if (($script:Metrics.success + $script:Metrics.failure) -gt 0) {
            [Math]::Round($script:Metrics.success / ($script:Metrics.success + $script:Metrics.failure) * 100, 1)
        }
        else { 100 }
    }
}

function Write-MetricsSummary {
    $summary = Get-MetricsSummary
    Write-ProjectLog -Level "INFO" -Message "Execution complete" -Operation "Metrics" -Data $summary
    
    Write-Host ""
    Write-Host "📊 Metrics Summary" -ForegroundColor Cyan
    Write-Host "  Success: $($summary.success)" -ForegroundColor Green
    Write-Host "  Failure: $($summary.failure)" -ForegroundColor $(if ($summary.failure -gt 0) { "Red" } else { "Green" })
    Write-Host "  Retries: $($summary.retries)" -ForegroundColor $(if ($summary.retries -gt 0) { "Yellow" } else { "Green" })
    Write-Host "  Duration: $($summary.duration_seconds)s"
    Write-Host "  Success Rate: $($summary.success_rate)%"
}

# ============================================================================
# MULTI-PROJECT SUPPORT (Category 14)
# ============================================================================

$script:CurrentProject = $null

function Get-ProjectConfig {
    <#
    .SYNOPSIS
        Gets project configuration, supporting multiple projects
    .PARAMETER ProjectName
        Optional project name. Defaults to 'default' or env var IRONFORGE_PROJECT
    .PARAMETER ConfigDir
        Config directory path
    #>
    param(
        [string]$ProjectName = $env:IRONFORGE_PROJECT,
        [string]$ConfigDir = (Join-Path $PSScriptRoot "..\config")
    )
    
    if (-not $ProjectName) { $ProjectName = "default" }
    
    # Try project-specific config first
    $configPath = Join-Path $ConfigDir "github-project-$ProjectName.json"
    if (-not (Test-Path $configPath)) {
        # Fall back to main config
        $configPath = Join-Path $ConfigDir "github-project.json"
    }
    
    if (-not (Test-Path $configPath)) {
        throw "Config file not found: $configPath"
    }
    
    $script:CurrentProject = Get-Content $configPath | ConvertFrom-Json
    
    # Override owner from env if set
    if ($env:IRONFORGE_OWNER) {
        $script:CurrentProject.owner = $env:IRONFORGE_OWNER
    }
    
    Write-ProjectLog -Level "DEBUG" -Message "Loaded project config: $($script:CurrentProject.projectNumber)" -Operation "Config" -Data @{
        project = $script:CurrentProject.projectNumber
        owner   = $script:CurrentProject.owner
    }
    
    return $script:CurrentProject
}

function Get-CurrentProject {
    <#
    .SYNOPSIS
        Returns the currently loaded project config
    #>
    if (-not $script:CurrentProject) {
        return Get-ProjectConfig
    }
    return $script:CurrentProject
}

# ============================================================================
# NOTIFICATIONS (Category 15)
# ============================================================================

$script:NotificationConfig = @{
    Enabled    = $false
    WebhookUrl = $null
    Channel    = "general"
}

function Initialize-Notifications {
    <#
    .SYNOPSIS
        Initializes notification system
    .PARAMETER WebhookUrl
        Slack/Discord webhook URL (or set IRONFORGE_WEBHOOK env var)
    .PARAMETER Channel
        Channel name for notifications
    #>
    param(
        [string]$WebhookUrl = $env:IRONFORGE_WEBHOOK,
        [string]$Channel = "project-automation"
    )
    
    if ($WebhookUrl) {
        $script:NotificationConfig.Enabled = $true
        $script:NotificationConfig.WebhookUrl = $WebhookUrl
        $script:NotificationConfig.Channel = $Channel
        Write-ProjectLog -Level "INFO" -Message "Notifications enabled" -Operation "Notify"
    }
}

function Send-Notification {
    <#
    .SYNOPSIS
        Sends a notification to configured webhook
    .PARAMETER Message
        Message text to send
    .PARAMETER Type
        Notification type: success, warning, error, info
    .PARAMETER Title
        Optional title for the notification
    .PARAMETER Fields
        Hashtable of additional fields to include
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Message,
        
        [ValidateSet("success", "warning", "error", "info")]
        [string]$Type = "info",
        
        [string]$Title = "IronForge Project Automation",
        
        [hashtable]$Fields = @{}
    )
    
    if (-not $script:NotificationConfig.Enabled) {
        Write-ProjectLog -Level "DEBUG" -Message "Notifications disabled, skipping" -Operation "Notify"
        return
    }
    
    $color = switch ($Type) {
        "success" { "#36a64f" }
        "warning" { "#ff9800" }
        "error" { "#ff0000" }
        "info" { "#2196f3" }
    }
    
    $emoji = switch ($Type) {
        "success" { "✅" }
        "warning" { "⚠️" }
        "error" { "❌" }
        "info" { "ℹ️" }
    }
    
    # Build Slack-compatible payload
    $payload = @{
        username    = "IronForge Bot"
        icon_emoji  = ":hammer:"
        attachments = @(
            @{
                color  = $color
                title  = "$emoji $Title"
                text   = $Message
                fields = @()
                footer = "IronForge Project Automation"
                ts     = [int](Get-Date -UFormat %s)
            }
        )
    }
    
    # Add custom fields
    foreach ($key in $Fields.Keys) {
        $payload.attachments[0].fields += @{
            title = $key
            value = $Fields[$key]
            short = $true
        }
    }
    
    try {
        $json = $payload | ConvertTo-Json -Depth 10 -Compress
        Invoke-RestMethod -Uri $script:NotificationConfig.WebhookUrl -Method Post -Body $json -ContentType "application/json" | Out-Null
        Write-ProjectLog -Level "INFO" -Message "Notification sent: $Type" -Operation "Notify"
    }
    catch {
        Write-ProjectLog -Level "WARN" -Message "Failed to send notification: $($_.Exception.Message)" -Operation "Notify"
    }
}

function Send-PRNotification {
    <#
    .SYNOPSIS
        Sends a notification for PR events
    #>
    param(
        [int]$PRNumber,
        [string]$Action,
        [string]$Status
    )
    
    $message = switch ($Action) {
        "linked" { "PR #$PRNumber linked to Project with Status: $Status" }
        "merged" { "PR #$PRNumber merged! Status updated to: $Status" }
        "closed" { "PR #$PRNumber closed. Status: $Status" }
        default { "PR #$PRNumber - $Action -> $Status" }
    }
    
    $type = switch ($Action) {
        "merged" { "success" }
        "closed" { "warning" }
        default { "info" }
    }
    
    Send-Notification -Message $message -Type $type -Title "Pull Request Update" -Fields @{
        "PR"     = "#$PRNumber"
        "Action" = $Action
        "Status" = $Status
    }
}

function Send-IssueNotification {
    <#
    .SYNOPSIS
        Sends a notification for Issue events
    #>
    param(
        [int]$IssueNumber,
        [string]$Action,
        [string]$Priority = "",
        [string]$Domain = ""
    )
    
    $message = "Issue #$IssueNumber $Action"
    if ($Priority) { $message += " (Priority: $Priority)" }
    
    $type = switch ($Action) {
        "done" { "success" }
        "linked" { "info" }
        default { "info" }
    }
    
    $fields = @{ "Issue" = "#$IssueNumber"; "Action" = $Action }
    if ($Priority) { $fields["Priority"] = $Priority }
    if ($Domain) { $fields["Domain"] = $Domain }
    
    Send-Notification -Message $message -Type $type -Title "Issue Update" -Fields $fields
}

function Send-ErrorNotification {
    <#
    .SYNOPSIS
        Sends an error notification
    #>
    param(
        [string]$Operation,
        [string]$ErrorMessage,
        [hashtable]$Context = @{}
    )
    
    $fields = @{ "Operation" = $Operation }
    foreach ($key in $Context.Keys) {
        $fields[$key] = $Context[$key]
    }
    
    Send-Notification -Message "Automation failed: $ErrorMessage" -Type "error" -Title "⚠️ Error Alert" -Fields $fields
}

# ============================================================================
# EXPORTS
# ============================================================================

Export-ModuleMember -Function @(
    # Logging
    'Initialize-ProjectLogger',
    'Write-ProjectLog',
    # Retry
    'Invoke-WithRetry',
    # Rate Limiting
    'Test-RateLimit',
    # Metrics
    'Start-MetricsCollection',
    'Add-MetricSuccess',
    'Add-MetricFailure',
    'Add-MetricRetry',
    'Get-MetricsSummary',
    'Write-MetricsSummary',
    # Multi-Project
    'Get-ProjectConfig',
    'Get-CurrentProject',
    # Notifications
    'Initialize-Notifications',
    'Send-Notification',
    'Send-PRNotification',
    'Send-IssueNotification',
    'Send-ErrorNotification'
)
