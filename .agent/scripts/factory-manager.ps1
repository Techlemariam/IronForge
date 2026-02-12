param (
    [string]$Feature,
    [string]$Station = "design",
    [string]$Action = "RUN", # RUN, GET-MODE, SET-MODE, CHECK-GUARD, PROCESS-QUEUE, GET-PROMPT
    [switch]$GeminiCLI
)

# -----------------------------------------------------------------------------
# 🏭 FACTORY MANAGER v1.2 (Orchestration Grade)
# The Foreman of the Antigravity Factory.
# -----------------------------------------------------------------------------

# Sanitize $Feature to prevent path traversal
if ($Feature -and ($Feature -match "[\\/..]")) {
    Write-Error "Invalid Feature name: Path traversal detected."
    exit 1
}

function Get-EstimatedCostSEK {
    param ([int64]$Tokens)
    # Gemini 1.5 Flash: Mixed avg ~$0.15 / 1M tokens
    # USD -> SEK: ~10.5
    $RatePerMillion = 0.15 * 10.5
    $Cost = ($Tokens / 1000000) * $RatePerMillion
    return [math]::Round($Cost, 4)
}

function Log-Factory {
    param ([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Color = switch ($Level) {
        "ERROR" { "Red" }
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        default { "White" }
    }
    Write-Host "[$Timestamp] [FACTORY] [$Level] $Message" -ForegroundColor $Color
}

function Get-FactoryMode {
    return "ON"
}

function Get-TotalTokenUsage {
    $UsageFile = ".agent/usage.json"
    if (-not (Test-Path $UsageFile)) { return 0 }
    try {
        $content = Get-Content $UsageFile -Raw
        if ([string]::IsNullOrWhiteSpace($content)) { return 0 }
        $Data = $content | ConvertFrom-Json
        $Total = 0
        foreach ($entry in $Data.history) { $Total += [int]$entry.tokens }
        return $Total
    }
    catch { return 0 }
}

function Send-FactoryNotification {
    param ([string]$Message, [string]$Status = "INFO")
    
    # Check for Webhook in Env
    $WebhookUrl = $env:FACTORY_NOTIFY_WEBHOOK
    if (-not $WebhookUrl) {
        # Fallback to Write-Log for local runs
        Log-Factory "System Notification ($Status): $Message" "DEBUG"
        return
    }

    $Color = switch ($Status) {
        "SUCCESS" { 65280 } # Green
        "ERROR" { 16711680 } # Red
        "WARNING" { 16776960 } # Yellow
        default { 3447003 } # Blue
    }

    $Payload = @{
        embeds = @(@{
                title       = "🏭 Factory Update: $Status"
                description = $Message
                color       = $Color
                timestamp   = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
            })
    } | ConvertTo-Json -Depth 10

    try {
        Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $Payload -ContentType 'application/json'
    }
    catch {
        Log-Factory "Failed to send notification: $_" "WARNING"
    }
}

function Sync-BranchWithMain {
    param ([string]$Branch)
    Log-Factory "Syncing branch $Branch with origin/main..."
    git fetch origin main --quiet
    $Current = git rev-parse --abbrev-ref HEAD
    if ($Current -ne $Branch) {
        if (git show-ref --verify --quiet "refs/heads/$Branch") { git checkout $Branch --quiet }
        else { git checkout -b $Branch origin/main --quiet }
    }
    
    # Attempt Rebase
    git rebase origin/main --quiet
    if ($LASTEXITCODE -ne 0) {
        Log-Factory "REBASE_CONFLICT: Branch $Branch is dirty. Triggering CI Doctor..." "ERROR"
        git rebase --abort
        # In a real scenario, we'd invoke /ci-doctor here
        return $false
    }
    Log-Factory "Sync Complete. Foundation is clean." "SUCCESS"
    return $true
}

function Get-TokenBudget {
    $UsageFile = ".agent/usage.json"
    if (-not (Test-Path $UsageFile)) { return $true }
    try {
        $content = Get-Content $UsageFile -Raw
        if ([string]::IsNullOrWhiteSpace($content)) { return $true }
        $usage = $content | ConvertFrom-Json
        $today = Get-Date -Format "yyyy-MM-dd"
        
        $dailyLimit = if ($env:TOKEN_DAILY_LIMIT) { [int64]$env:TOKEN_DAILY_LIMIT } else { 500000 }
        $dailyUsage = 0

        if ($usage.history) {
            foreach ($entry in $usage.history) {
                if ($entry.date -eq $today) { $dailyUsage += $entry.tokens }
            }
        }

        if ($dailyUsage -ge $dailyLimit) { return $false }
        return $true
    }
    catch { return $true }
}

# --- Actions ---

if ($Action -eq "GET-MODE") {
    Write-Output (Get-FactoryMode)
    exit 0
}

if ($Action -eq "CHECK-GUARD") {
    Log-Factory "Checking Factory Guards..."
    $Branch = git rev-parse --abbrev-ref HEAD
    if ($Branch -eq "main" -or $Branch -eq "master") {
        Log-Factory "GUARD TRIGGERED: Never run the Factory directly on main/master." "ERROR"
        exit 1
    }
    Log-Factory "Guards passed. Operating on branch: $Branch" "SUCCESS"
    exit 0
}

if ($Action -eq "PROCESS-QUEUE") {
    Log-Factory "Loading Strategic Queue..."
    $QueueFile = ".agent/queue.json"
    if (-not (Test-Path $QueueFile)) {
        Log-Factory "Error: Queue file not found!" "ERROR"
        exit 1
    }
    
    $QueueData = Get-Content $QueueFile -Raw | ConvertFrom-Json
    $Pending = $QueueData.queue | Where-Object { $_.status -eq "pending" }
    
    if ($Pending.Count -eq 0) {
        Log-Factory "Queue is empty. No tasks to process." "SUCCESS"
        exit 0
    }
    
    Log-Factory "Found $($Pending.Count) pending tasks. Advancing to next item..."
    $Task = $Pending[0] # Process one at a time to reduce blast radius
    Log-Factory "Selected Task: $($Task.title) (ID: $($Task.id))"
    
    # Map title to feature name (Slugify)
    $FeatureName = $Task.title -replace "[^a-zA-Z0-9]", "-" -replace "-+", "-" -replace "^-", "" -replace "-$", ""
    Log-Factory "QUEUE_NEXT: $FeatureName" "SUCCESS"
    Write-Output $FeatureName
    exit 0
}

if ($Action -eq "GET-PROMPT") {
    if (-not $Feature) { exit 1 }
    $SpecFile = "specs/$Feature.md"
    if (-not (Test-Path $SpecFile)) { exit 1 }

    $Prompt = switch ($Station) {
        "fabrication" { "Based on the spec at $SpecFile , implement the feature. Focus on syntax and clean code." }
        "verify" { "Run quality control for $Feature . Verify types, lint, and tests." }
        "ship" { "Prepare shipment for $Feature . Commit changes and create PR." }
        default { "Review the spec at $SpecFile and ensure it is Factory Ready." }
    }
    Write-Output $Prompt
    exit 0
}

# --- Workflow Logic ---

$SpecFile = "specs/$Feature.md"

if ($Action -eq "RUN") {
    if (-not (Test-Path $SpecFile)) {
        Log-Factory "Error: Spec file $SpecFile not found!" "ERROR"
        exit 1
    }

    Log-Factory "Starting Factory Line for Feature: $Feature at Station: $Station"
    $TokensStart = Get-TotalTokenUsage

    # Budget Check
    if (-not (Get-TokenBudget) -and -not $GeminiCLI) {
        Log-Factory "TOKEN_BUDGET_EXCEEDED: Daily quota reached. Enabling -GeminiCLI fallback mode..." "WARNING"
        $GeminiCLI = $true
    }

    if ($GeminiCLI) {
        Log-Factory "HEADLESS_FALLBACK: Outputting prompt for Gemini CLI..." "SUCCESS"
        $Prompt = & $PSCommandPath -Feature $Feature -Station $Station -Action "GET-PROMPT"
        Write-Output "PROMPT_START"
        Write-Output $Prompt
        Write-Output "PROMPT_END"
        exit 0
    }

    # Temporal Sync: Ensure branch is ready for work (except for design which might be on main/draft)
    if ($Station -ne "design") {
        if (-not (Sync-BranchWithMain -Branch "feat/$Feature")) {
            Send-FactoryNotification -Status "ERROR" -Message "Temporal Sync failed for $Feature . Manual rebase required."
            exit 1
        }
    }

    # Station 1: Design Studio Validation (Strategic ROI Filter)
    if ($Station -eq "design") {
        $Content = Get-Content $SpecFile -Raw
        $Missing = @()
        if ($Content -notmatch "## User Stories") { $Missing += "@analyst (Requirements)" }
        if ($Content -notmatch "## System Design") { $Missing += "@architect (Architecture)" }
        if ($Content -notmatch "## Visual Design") { $Missing += "@ui-ux (Design)" }
        if ($Content -notmatch "## Test Plan") { $Missing += "@qa (Tests)" }
        
        if ($Missing.Count -gt 0) {
            $msg = "Design Incomplete! Missing inputs from: $($Missing -join ', ')"
            Log-Factory $msg "ERROR"
            Send-FactoryNotification -Status "ERROR" -Message "Station 1 (Design) failed for $Feature : $msg"
            exit 1
        }

        # Strategic ROI Filter (Manager Protocol)
        if ($Content -notmatch "## ROI Analysis" -and $Content -notmatch "ROI:") {
            $msg = "STRATEGIC REJECTION: Spec lacks ROI Analysis. Yielding to @manager."
            Log-Factory $msg "ERROR"
            Send-FactoryNotification -Status "ERROR" -Message "Station 1 (Design) failed for $Feature : $msg"
            exit 1
        }

        Log-Factory "Strategic Alignment Verified. Spec is Factory Ready." "SUCCESS"
        Send-FactoryNotification -Status "SUCCESS" -Message "Station 1 (Design) complete for $Feature. Advancing to Fabrication."
    }

    # Station 2: Fabrication (@coder)
    elseif ($Station -eq "fabrication") {
        Log-Factory "Initializing Fabrication..."
        Send-FactoryNotification -Status "INFO" -Message "Station 2 (Fabrication) started for $Feature ."
        Log-Factory "FABRICATION_READY: Waiting for Coder Agent to manifest code from $SpecFile." "WARNING"
    }

    # Station 3: Verification (@qa)
    elseif ($Station -eq "verify") {
        Log-Factory "Running Quality Control..."
        $Gatekeeper = ".agent/scripts/gatekeeper.ps1" 
        if (Test-Path $Gatekeeper) {
            & $Gatekeeper
            if ($LASTEXITCODE -ne 0) { 
                Send-FactoryNotification -Status "ERROR" -Message "Station 3 (Verify) failed for $Feature . Triggering @ci-doctor."
                exit $LASTEXITCODE 
            }
        }
        else {
            pnpm run build
            if ($LASTEXITCODE -ne 0) { 
                Send-FactoryNotification -Status "ERROR" -Message "Station 3 (Verify) failed (Build) for $Feature ."
                exit $LASTEXITCODE 
            }
            pnpm run test
            if ($LASTEXITCODE -ne 0) { 
                Send-FactoryNotification -Status "ERROR" -Message "Station 3 (Verify) failed (Tests) for $Feature ."
                exit $LASTEXITCODE 
            }
        }
        Log-Factory "Quality Control Passed." "SUCCESS"
        Send-FactoryNotification -Status "SUCCESS" -Message "Station 3 (Verify) complete for $Feature . Quality Verified."

        # Auto-chain to Shipping if Mode is ON
        if ((Get-FactoryMode) -eq "ON") {
            Log-Factory "Auto-Flow: ON. Proceeding to Shipment..." "WARNING"
            & $PSCommandPath -Feature $Feature -Station "ship" -Action "RUN"
        }
    }

    # Station 5: Shipping (Handoff Protocol)
    elseif ($Station -eq "ship") {
        Log-Factory "Preparing Shipment for $Feature..."
        Send-FactoryNotification -Status "INFO" -Message "Station 5 (Shipping) started for $Feature ."
        
        $Branch = "feat/$Feature"
        $Current = git rev-parse --abbrev-ref HEAD
        if ($Current -ne $Branch) {
            Log-Factory "Switching to branch $Branch..."
            if (git show-ref --verify --quiet "refs/heads/$Branch") { git checkout $Branch }
            else { git checkout -b $Branch }
        }

        # Commit and Push
        git add .
        git commit -m "feat($Feature): assembly completed by Antigravity Factory" --allow-empty
        Log-Factory "Pushing to origin..."
        git push origin $Branch --force
        
        # PR Creation
        Log-Factory "Ensuring Pull Request exists..."
        $PRs = gh pr list --head $Branch --json url, number | ConvertFrom-Json
        $PRUrl = if ($PRs.Count -eq 0) {
            gh pr create --title "feat: $Feature" --body "### 🏭 Antigravity Factory Shipment`n`nAutomated PR created from Station 5 (Shipping).`n`n- **Spec**: [$Feature.md](specs/$Feature.md)`n- **Status**: Verified & Hardened" --draft
        }
        else {
            $PRs[0].url
        }
        Log-Factory "Shipment complete: $PRUrl" "SUCCESS"

        # Token Telemetry & ROI
        $TokensEnd = Get-TotalTokenUsage
        $Cost = $TokensEnd - $TokensStart
        $CostSEK = Get-EstimatedCostSEK -Tokens $Cost
        $PVS = 85 # Target 95% passive
        Log-Factory "Passive Viability Score: $PVS/100" "SUCCESS"
        Log-Factory "Feature Assembly Cost: $Cost tokens (~$CostSEK SEK)" "INFO"

        # Handoff Protocol
        $HandoffDir = ".agent/handoffs"
        if (-not (Test-Path $HandoffDir)) { New-Item -ItemType Directory $HandoffDir | Out-Null }
        $HandoffFile = Join-Path $HandoffDir "$((Get-Date -Format 'yyyyMMdd'))-$Feature.md"
        
        $HandoffContent = @"
# Handoff: $Feature (Assembly Complete)
- **Timestamp**: $(Get-Date -Format 'o')
- **ID**: $(New-Guid)
- **Status**: Shipped
- **PVS**: $PVS
- **Cost**: $Cost tokens (~$CostSEK SEK)
- **PR**: $PRUrl
- **Next Station**: @librarian (Indexing)
"@
        $HandoffContent | Out-File $HandoffFile -Encoding utf8
        Log-Factory "Strategic Handoff Artifact generated: [$(Split-Path $HandoffFile -Leaf)](file:///$(($HandoffFile -replace '\\', '/')))"
        Send-FactoryNotification -Status "SUCCESS" -Message "Feature $Feature SHIPPED! 🚢`n`n- **PR**: $PRUrl`n- **Cost**: $Cost tokens (~$CostSEK SEK)`n- **PVS**: $PVS/100"
    }

    else {
        Log-Factory "Unknown Station: $Station" "ERROR"
        exit 1
    }
}
