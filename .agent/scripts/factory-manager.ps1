param (
    [string]$Feature,
    [string]$Station = "design"
)

# -----------------------------------------------------------------------------
# 🏭 FACTORY MANAGER v1.0
# The Foreman of the Antigravity Factory.
# -----------------------------------------------------------------------------

$SpecFile = "specs/$Feature.md"

function Log-Factory {
    param ([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$Timestamp] [FACTORY] [$Level] $Message"
}

if (-not (Test-Path $SpecFile)) {
    Log-Factory "Error: Spec file $SpecFile not found!" "ERROR"
    exit 1
}

Log-Factory "Starting Factory Line for Feature: $Feature at Station: $Station"

# -----------------------------------------------------------------------------
# Station 1: Design Studio Validation
# -----------------------------------------------------------------------------
if ($Station -eq "design") {
    $Content = Get-Content $SpecFile -Raw
    
    $Missing = @()
    if ($Content -notmatch "## User Stories") { $Missing += "@analyst" }
    if ($Content -notmatch "## System Design") { $Missing += "@architect" }
    if ($Content -notmatch "## Visual Design") { $Missing += "@ui-ux" }
    if ($Content -notmatch "## Test Plan") { $Missing += "@qa" }
    
    if ($Missing.Count -gt 0) {
        Log-Factory "Design Incomplete! Missing inputs from: $($Missing -join ', ')" "ERROR"
        exit 1
    }
    
    Log-Factory "Design Studio Complete. Spec is Factory Ready." "SUCCESS"
    # Future: Trigger Station 2 automatically
}

# -----------------------------------------------------------------------------
# Station 2: Fabrication (@coder)
# -----------------------------------------------------------------------------
elseif ($Station -eq "fabrication") {
    Log-Factory "Initializing Fabrication..."
    # Placeholder: Call LLM with Spec
    Write-Host "TODO: Invoke AI Agent with context: $SpecFile"
}

# -----------------------------------------------------------------------------
# Station 3: Verification (@qa)
# -----------------------------------------------------------------------------
elseif ($Station -eq "verify") {
    Log-Factory "Running Quality Control..."
    
    # Run Gatekeeper
    # Convert POSIX path to Windows if needed
    $Gatekeeper = ".agent/scripts/gatekeeper.ps1" 
    if (Test-Path $Gatekeeper) {
        Invoke-Expression $Gatekeeper
    }
    else {
        # Fallback to manual checks
        npm run build
        npm run test
    }
}

# -----------------------------------------------------------------------------
# Station 6: Shipping (@delivery)
# -----------------------------------------------------------------------------
elseif ($Station -eq "ship") {
    Log-Factory "Preparing Shipment..."
    # PR Creation logic here
}

else {
    Log-Factory "Unknown Station: $Station" "ERROR"
    exit 1
}
