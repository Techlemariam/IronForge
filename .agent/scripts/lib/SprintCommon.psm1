#Requires -Version 7.0
<#
.SYNOPSIS
    Shared utilities for Sprint automation scripts

.DESCRIPTION
    Common functions for retry logic, logging, guards, and GraphQL operations.
    Import this module in all sprint-related scripts.
#>

# ============================================================================
# CONFIGURATION
# ============================================================================

$script:LogDirectory = Join-Path $PSScriptRoot "..\logs"
$script:LockDirectory = Join-Path $PSScriptRoot "..\locks"
$script:MetricsDirectory = Join-Path $PSScriptRoot "..\metrics"

# Ensure directories exist
@($script:LogDirectory, $script:LockDirectory, $script:MetricsDirectory) | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
    }
}

# ============================================================================
# LOGGING
# ============================================================================

function Write-SprintLog {
    <#
    .SYNOPSIS
        Writes structured JSON log entry
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Operation,
        
        [Parameter(Mandatory)]
        [ValidateSet("INFO", "WARN", "ERROR", "DEBUG")]
        [string]$Level,
        
        [Parameter(Mandatory)]
        [string]$Message,
        
        [Parameter()]
        [hashtable]$Data = @{},
        
        [Parameter()]
        [string]$LogName = "sprint"
    )
    
    $logEntry = @{
        timestamp = (Get-Date).ToString("o")
        level     = $Level
        operation = $Operation
        message   = $Message
        data      = $Data
    }
    
    $logFile = Join-Path $script:LogDirectory "$LogName-$(Get-Date -Format 'yyyy-MM-dd').log"
    $logEntry | ConvertTo-Json -Compress | Add-Content -Path $logFile
    
    # Also write to console with color
    $color = switch ($Level) {
        "INFO" { "Cyan" }
        "WARN" { "Yellow" }
        "ERROR" { "Red" }
        "DEBUG" { "DarkGray" }
    }
    Write-Host "[$Level] $($Operation): $Message" -ForegroundColor $color
}

# ============================================================================
# RETRY LOGIC
# ============================================================================

function Invoke-RetryableOperation {
    <#
    .SYNOPSIS
        Executes a script block with retry logic and exponential backoff
    #>
    param(
        [Parameter(Mandatory)]
        [scriptblock]$ScriptBlock,
        
        [Parameter()]
        [int]$MaxRetries = 3,
        
        [Parameter()]
        [int]$InitialDelayMs = 1000,
        
        [Parameter()]
        [double]$BackoffMultiplier = 2.0,
        
        [Parameter()]
        [string]$OperationName = "Operation"
    )
    
    $attempt = 0
    $delay = $InitialDelayMs
    
    while ($attempt -lt $MaxRetries) {
        $attempt++
        try {
            $result = & $ScriptBlock
            return $result
        }
        catch {
            $errorMessage = $_.Exception.Message
            
            if ($attempt -eq $MaxRetries) {
                Write-SprintLog -Operation $OperationName -Level "ERROR" `
                    -Message "Failed after $MaxRetries attempts: $errorMessage" `
                    -Data @{ attempt = $attempt; error = $errorMessage }
                throw
            }
            
            Write-SprintLog -Operation $OperationName -Level "WARN" `
                -Message "Attempt $attempt failed, retrying in $delay ms..." `
                -Data @{ attempt = $attempt; nextDelay = $delay; error = $errorMessage }
            
            Start-Sleep -Milliseconds $delay
            $delay = [int]($delay * $BackoffMultiplier)
        }
    }
}

# ============================================================================
# GRAPHQL HELPERS
# ============================================================================

function Invoke-GraphQL {
    <#
    .SYNOPSIS
        Executes GraphQL query with retry logic
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Query,
        
        [Parameter()]
        [string]$OperationName = "GraphQL"
    )
    
    Invoke-RetryableOperation -OperationName $OperationName -ScriptBlock {
        $result = gh api graphql -f query=$Query 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            throw "GraphQL error: $result"
        }
        
        return $result | ConvertFrom-Json
    }
}

# ============================================================================
# CONCURRENCY GUARDS
# ============================================================================

function Enter-SprintLock {
    <#
    .SYNOPSIS
        Acquires exclusive lock for sprint operations
    #>
    param(
        [Parameter()]
        [string]$LockName = "sprint-operation",
        
        [Parameter()]
        [int]$TimeoutSeconds = 60
    )
    
    $lockFile = Join-Path $script:LockDirectory "$LockName.lock"
    $startTime = Get-Date
    
    while (Test-Path $lockFile) {
        $lockContent = Get-Content $lockFile -ErrorAction SilentlyContinue | ConvertFrom-Json -ErrorAction SilentlyContinue
        
        # Check if lock is stale (older than 5 minutes)
        if ($lockContent -and $lockContent.timestamp) {
            $lockAge = (Get-Date) - [DateTime]$lockContent.timestamp
            if ($lockAge.TotalMinutes -gt 5) {
                Write-SprintLog -Operation "Lock" -Level "WARN" `
                    -Message "Removing stale lock (age: $($lockAge.TotalMinutes) min)" `
                    -Data @{ lockFile = $lockFile }
                Remove-Item $lockFile -Force
                break
            }
        }
        
        # Check timeout
        $elapsed = (Get-Date) - $startTime
        if ($elapsed.TotalSeconds -gt $TimeoutSeconds) {
            throw "Failed to acquire lock '$LockName' within $TimeoutSeconds seconds"
        }
        
        Write-SprintLog -Operation "Lock" -Level "DEBUG" `
            -Message "Waiting for lock '$LockName'..." `
            -Data @{ elapsed = $elapsed.TotalSeconds }
        
        Start-Sleep -Seconds 2
    }
    
    # Acquire lock
    @{
        timestamp = (Get-Date).ToString("o")
        pid       = $PID
        hostname  = $env:COMPUTERNAME
        operation = $LockName
    } | ConvertTo-Json | Out-File $lockFile -Encoding UTF8
    
    Write-SprintLog -Operation "Lock" -Level "DEBUG" `
        -Message "Acquired lock '$LockName'" `
        -Data @{ lockFile = $lockFile }
    
    return $lockFile
}

function Exit-SprintLock {
    <#
    .SYNOPSIS
        Releases sprint lock
    #>
    param(
        [Parameter(Mandatory)]
        [string]$LockFile
    )
    
    if (Test-Path $LockFile) {
        Remove-Item $LockFile -Force
        Write-SprintLog -Operation "Lock" -Level "DEBUG" `
            -Message "Released lock" `
            -Data @{ lockFile = $LockFile }
    }
}

# ============================================================================
# DUPLICATE DETECTION
# ============================================================================

function Test-IssueExists {
    <#
    .SYNOPSIS
        Checks if an issue with the given title already exists
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Title,
        
        [Parameter()]
        [string]$State = "all"
    )
    
    $escapedTitle = $Title -replace '"', '\"'
    $searchResult = gh issue list --search "`"$escapedTitle`" in:title" --state $State --json number, title --limit 10 | ConvertFrom-Json
    
    $exactMatch = $searchResult | Where-Object { $_.title -eq $Title }
    
    if ($exactMatch) {
        Write-SprintLog -Operation "DuplicateCheck" -Level "WARN" `
            -Message "Issue already exists: #$($exactMatch.number)" `
            -Data @{ title = $Title; existingNumber = $exactMatch.number }
        return $exactMatch
    }
    
    return $null
}

# ============================================================================
# CAPACITY VALIDATION
# ============================================================================

function Test-SprintCapacity {
    <#
    .SYNOPSIS
        Validates sprint capacity against limits
    #>
    param(
        [Parameter(Mandatory)]
        [int]$TotalHours,
        
        [Parameter(Mandatory)]
        [int]$ItemCount,
        
        [Parameter()]
        [int]$MaxHours = 20,
        
        [Parameter()]
        [int]$MaxItems = 8
    )
    
    $errors = @()
    
    if ($TotalHours -gt $MaxHours) {
        $errors += "Sprint exceeds hour limit: ${TotalHours}h > ${MaxHours}h max"
    }
    
    if ($ItemCount -gt $MaxItems) {
        $errors += "Sprint exceeds item limit: $ItemCount > $MaxItems max"
    }
    
    if ($errors.Count -gt 0) {
        Write-SprintLog -Operation "CapacityCheck" -Level "ERROR" `
            -Message "Sprint capacity exceeded" `
            -Data @{ totalHours = $TotalHours; itemCount = $ItemCount; errors = $errors }
        return @{ Valid = $false; Errors = $errors }
    }
    
    Write-SprintLog -Operation "CapacityCheck" -Level "INFO" `
        -Message "Sprint capacity OK: ${TotalHours}h, $ItemCount items" `
        -Data @{ totalHours = $TotalHours; itemCount = $ItemCount }
    
    return @{ Valid = $true; Errors = @() }
}

# ============================================================================
# CONFIG HELPERS
# ============================================================================

function Get-SprintConfig {
    <#
    .SYNOPSIS
        Loads github-project.json with validation
    #>
    $configPath = Join-Path $PSScriptRoot "..\config\github-project.json"
    
    if (-not (Test-Path $configPath)) {
        throw "Config file not found: $configPath"
    }
    
    $config = Get-Content $configPath | ConvertFrom-Json
    
    # Validate required fields
    if (-not $config.projectId) { throw "Config missing: projectId" }
    if (-not $config.fields.sprint) { throw "Config missing: fields.sprint" }
    if (-not $config.fields.sprint.current) { throw "Config missing: fields.sprint.current" }
    
    return $config
}

function Save-SprintConfig {
    <#
    .SYNOPSIS
        Saves github-project.json with backup
    #>
    param(
        [Parameter(Mandatory)]
        [object]$Config
    )
    
    $configPath = Join-Path $PSScriptRoot "..\config\github-project.json"
    
    # Create backup
    $backupPath = Join-Path $script:LogDirectory "github-project-$(Get-Date -Format 'yyyyMMdd-HHmmss').json.bak"
    Copy-Item $configPath $backupPath -Force
    
    # Save new config
    $Config | ConvertTo-Json -Depth 10 | Out-File $configPath -Encoding UTF8 -NoNewline
    
    Write-SprintLog -Operation "Config" -Level "INFO" `
        -Message "Config saved (backup: $backupPath)" `
        -Data @{ configPath = $configPath; backupPath = $backupPath }
}

# ============================================================================
# METRICS & VELOCITY
# ============================================================================

function Add-SprintMetrics {
    <#
    .SYNOPSIS
        Records sprint metrics for velocity tracking
    #>
    param(
        [Parameter(Mandatory)]
        [string]$SprintName,
        
        [Parameter(Mandatory)]
        [int]$PlannedItems,
        
        [Parameter(Mandatory)]
        [int]$PlannedHours,
        
        [Parameter()]
        [int]$CompletedItems = 0,
        
        [Parameter()]
        [int]$ActualHours = 0,
        
        [Parameter()]
        [string]$Status = "started"
    )
    
    $metricsFile = Join-Path $script:MetricsDirectory "velocity.json"
    
    $metrics = @()
    if (Test-Path $metricsFile) {
        $metrics = Get-Content $metricsFile | ConvertFrom-Json
    }
    
    $entry = @{
        sprintName     = $SprintName
        timestamp      = (Get-Date).ToString("o")
        status         = $Status
        plannedItems   = $PlannedItems
        plannedHours   = $PlannedHours
        completedItems = $CompletedItems
        actualHours    = $ActualHours
        velocity       = if ($PlannedItems -gt 0) { [math]::Round($CompletedItems / $PlannedItems * 100, 1) } else { 0 }
    }
    
    # Update existing or add new
    $existing = $metrics | Where-Object { $_.sprintName -eq $SprintName }
    if ($existing) {
        $index = [Array]::IndexOf($metrics, $existing)
        $metrics[$index] = $entry
    }
    else {
        $metrics += $entry
    }
    
    $metrics | ConvertTo-Json -Depth 5 | Out-File $metricsFile -Encoding UTF8
    
    Write-SprintLog -Operation "Metrics" -Level "INFO" `
        -Message "Recorded metrics for $SprintName (velocity: $($entry.velocity)%)" `
        -Data $entry
    
    return $entry
}

function Get-SprintVelocity {
    <#
    .SYNOPSIS
        Calculates average velocity from historical sprints
    #>
    param(
        [Parameter()]
        [int]$LastNSprints = 3
    )
    
    $metricsFile = Join-Path $script:MetricsDirectory "velocity.json"
    
    if (-not (Test-Path $metricsFile)) {
        return @{ AverageVelocity = 0; SprintCount = 0 }
    }
    
    $metrics = Get-Content $metricsFile | ConvertFrom-Json
    $completed = $metrics | Where-Object { $_.status -eq "completed" } | Sort-Object timestamp -Descending | Select-Object -First $LastNSprints
    
    if ($completed.Count -eq 0) {
        return @{ AverageVelocity = 0; SprintCount = 0 }
    }
    
    $avgVelocity = ($completed | Measure-Object -Property velocity -Average).Average
    
    return @{
        AverageVelocity = [math]::Round($avgVelocity, 1)
        SprintCount     = $completed.Count
        LastSprints     = $completed
    }
}

# ============================================================================
# GITHUB ACTIONS HELPERS
# ============================================================================

function Write-SprintSummary {
    <#
    .SYNOPSIS
        Writes markdown summary to GitHub Actions job summary
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Title,
        
        [Parameter(Mandatory)]
        [string]$MarkdownContent
    )
    
    if ($env:GITHUB_STEP_SUMMARY) {
        $summary = "## $Title`n`n$MarkdownContent"
        Add-Content -Path $env:GITHUB_STEP_SUMMARY -Value $summary
        Write-Host "📝 Added to Job Summary: $Title" -ForegroundColor Cyan
    }
    else {
        Write-Host "ℹ️  GITHUB_STEP_SUMMARY not set (skipping summary)" -ForegroundColor DarkGray
    }
}

# ============================================================================
# EXPORT
# ============================================================================

Export-ModuleMember -Function @(
    'Write-SprintLog',
    'Invoke-RetryableOperation',
    'Invoke-GraphQL',
    'Enter-SprintLock',
    'Exit-SprintLock',
    'Test-IssueExists',
    'Test-SprintCapacity',
    'Get-SprintConfig',
    'Save-SprintConfig',
    'Add-SprintMetrics',
    'Get-SprintVelocity',
    'Write-SprintSummary'
)
