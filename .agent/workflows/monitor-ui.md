---
description: "Workflow for monitor-ui"
command: "/monitor-ui"
category: "monitoring"
trigger: "manual"
version: "2.0.0"
telemetry: "enabled"
primary_agent: "@ui-ux"
domain: "ui"
thresholds:
  a11y_score: 100
  perf_score: 90
  consistency_max_violations: 5
  responsive_coverage: 95
---

# 🎨 UI Monitor v2.0

**Role:** Frontend Health Inspector.
**Goal:** Monitor UI component quality, accessibility, performance, and consistency with quantified scoring.

---

## 🔧 Pre-Flight

```powershell
# Initialize report with timestamp
$ReportDate = Get-Date -Format "yyyy-MM-dd-HHmmss"
$ReportDir = ".agent/reports/ui"
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

$Report = @{
    timestamp = Get-Date -Format "o"
    version = "2.0.0"
    scores = @{}
    findings = @()
    status = "pending"
}
```

---

## Protocol

### 1. Component Inventory Scan

Take stock of the UI component library.

```powershell
# 1. Count UI components
$Components = Get-ChildItem -Path "src/components/ui" -Filter "*.tsx" -Recurse
$ComponentCount = $Components.Count
Write-Host "📦 Found $ComponentCount UI components"

# 2. Find components without proper TypeScript interfaces
$MissingTypes = rg "export (function|const)" src/components/ui/ --line-number | rg -v "interface|type"

# 3. Check for inline styles (should use Tailwind)
$InlineStyles = rg "style=\{" src/components/ --line-number --count
$InlineStyleCount = if ($InlineStyles) { ($InlineStyles | Measure-Object -Line).Lines } else { 0 }

$Report.scores["component_health"] = @{
    total = $ComponentCount
    inline_styles = $InlineStyleCount
    score = if ($InlineStyleCount -eq 0) { 100 } else { [math]::Max(0, 100 - ($InlineStyleCount * 5)) }
}
```

---

### 2. Accessibility Audit (Axe-Core)

Run real a11y testing with axe-core CLI.

```powershell
# Option A: Axe-core CLI (requires npm install -g @axe-core/cli)
# axe http://localhost:3000 --save ui-a11y-report.json

# Option B: Grep-based heuristics (fallback)
$A11yIssues = @()

# 2.1 Interactive elements without aria-labels
$MissingAriaLabels = rg "<(button|a|input)" src/components/ --line-number | rg -v "aria-label|aria-labelledby"
if ($MissingAriaLabels) {
    $A11yIssues += @{ type = "missing-aria-label"; count = ($MissingAriaLabels | Measure-Object -Line).Lines }
}

# 2.2 Images without alt text
$MissingAlt = rg "<img" src/ --line-number | rg -v 'alt='
if ($MissingAlt) {
    $A11yIssues += @{ type = "missing-alt"; count = ($MissingAlt | Measure-Object -Line).Lines }
}

# 2.3 Missing semantic HTML (div with onClick = needs button)
$DivClicks = rg "<div[^>]*onClick" src/components/ --line-number
if ($DivClicks) {
    $A11yIssues += @{ type = "non-semantic-interactive"; count = ($DivClicks | Measure-Object -Line).Lines }
}

# 2.4 Missing keyboard handlers
$ClickOnly = rg "onClick=" src/components/ --line-number | rg -v "onKeyDown|onKeyUp|onKeyPress|role="
if ($ClickOnly) {
    $A11yIssues += @{ type = "missing-keyboard-handler"; count = ($ClickOnly | Measure-Object -Line).Lines }
}

# 2.5 Color contrast (heuristic: check for low-contrast text classes)
$LowContrast = rg "text-gray-[3-4]00|text-slate-[3-4]00" src/components/ --line-number
if ($LowContrast) {
    $A11yIssues += @{ type = "potential-low-contrast"; count = ($LowContrast | Measure-Object -Line).Lines }
}

$TotalA11yIssues = ($A11yIssues | ForEach-Object { $_.count } | Measure-Object -Sum).Sum
$A11yScore = [math]::Max(0, 100 - ($TotalA11yIssues * 2))

$Report.scores["accessibility"] = @{
    issues = $A11yIssues
    total_issues = $TotalA11yIssues
    score = $A11yScore
    threshold = 100
    status = if ($A11yScore -ge 100) { "PASS" } else { "FAIL" }
}

Write-Host "♿ Accessibility Score: $A11yScore/100 $(if ($A11yScore -ge 100) { '✅' } else { '❌' })"
```

---

### 3. Dark Mode & Contrast Check

Verify dark mode implementation.

```powershell
# 3.1 Check for dark mode classes
$DarkModeUsage = rg "dark:" src/components/ --line-number --count
$DarkModeCount = if ($DarkModeUsage) { ($DarkModeUsage -split "`n").Count } else { 0 }

# 3.2 Find hardcoded colors that don't adapt to dark mode
$HardcodedColors = rg "#[0-9a-fA-F]{3,6}" src/components/ --line-number
$HardcodedCount = if ($HardcodedColors) { ($HardcodedColors | Measure-Object -Line).Lines } else { 0 }

# 3.3 Check for bg-white/bg-black without dark: variant
$MissingDarkVariant = rg "bg-white|bg-black|text-white|text-black" src/components/ --line-number | rg -v "dark:"
$MissingDarkCount = if ($MissingDarkVariant) { ($MissingDarkVariant | Measure-Object -Line).Lines } else { 0 }

$DarkModeScore = [math]::Max(0, 100 - ($HardcodedCount * 3) - ($MissingDarkCount * 5))

$Report.scores["dark_mode"] = @{
    dark_classes = $DarkModeCount
    hardcoded_colors = $HardcodedCount
    missing_dark_variant = $MissingDarkCount
    score = $DarkModeScore
    status = if ($DarkModeScore -ge 80) { "PASS" } else { "WARN" }
}

Write-Host "🌙 Dark Mode Score: $DarkModeScore/100 $(if ($DarkModeScore -ge 80) { '✅' } else { '⚠️' })"
```

---

### 4. Bundle & Performance Check

Monitor for performance anti-patterns.

```powershell
# 4.1 Heavy imports in app directory (should be dynamic)
$HeavyImports = rg "import .* from ['\"]framer-motion['\"]" src/app/ --line-number
$HeavyImportCount = if ($HeavyImports) { ($HeavyImports | Measure-Object -Line).Lines } else { 0 }

# 4.2 Count 'use client' markers
$UseClientCount = (rg "'use client'" src/components/ --count | Measure-Object -Sum).Sum

# 4.3 Components that could benefit from React.memo
$NonMemoizedExports = rg "export default function" src/components/ --line-number | rg -v "memo"
$NonMemoCount = if ($NonMemoizedExports) { ($NonMemoizedExports | Measure-Object -Line).Lines } else { 0 }

# 4.4 Check for large component files (>300 lines)
$LargeComponents = Get-ChildItem -Path "src/components" -Filter "*.tsx" -Recurse | 
    Where-Object { (Get-Content $_.FullName | Measure-Object -Line).Lines -gt 300 }

$PerfScore = [math]::Max(0, 100 - ($HeavyImportCount * 10) - ($LargeComponents.Count * 5))

$Report.scores["performance"] = @{
    heavy_imports = $HeavyImportCount
    use_client_count = $UseClientCount
    non_memoized = $NonMemoCount
    large_components = $LargeComponents.Count
    score = $PerfScore
    threshold = 90
    status = if ($PerfScore -ge 90) { "PASS" } else { "WARN" }
}

Write-Host "🚀 Performance Score: $PerfScore/100 $(if ($PerfScore -ge 90) { '✅' } else { '⚠️' })"
```

---

### 5. Design System Consistency

Ensure design system adherence.

```powershell
# 5.1 Find arbitrary Tailwind values (should use design tokens)
$ArbitraryValues = rg "\[(#|[0-9]+px|[0-9]+rem)\]" src/components/ --line-number
$ArbitraryCount = if ($ArbitraryValues) { ($ArbitraryValues | Measure-Object -Line).Lines } else { 0 }

# 5.2 Find hardcoded spacing (should use Tailwind classes)
$HardcodedSpacing = rg "padding:|margin:|gap:" src/components/ --line-number
$SpacingCount = if ($HardcodedSpacing) { ($HardcodedSpacing | Measure-Object -Line).Lines } else { 0 }

# 5.3 Non-standard z-index values
$ZIndexIssues = rg "z-\[" src/components/ --line-number
$ZIndexCount = if ($ZIndexIssues) { ($ZIndexIssues | Measure-Object -Line).Lines } else { 0 }

# 5.4 Magic numbers in sizing
$MagicNumbers = rg "w-\[|h-\[|max-w-\[|min-h-\[" src/components/ --line-number
$MagicCount = if ($MagicNumbers) { ($MagicNumbers | Measure-Object -Line).Lines } else { 0 }

$TotalViolations = $ArbitraryCount + $SpacingCount + $ZIndexCount + $MagicCount
$ConsistencyScore = [math]::Max(0, 100 - ($TotalViolations * 2))

$Report.scores["consistency"] = @{
    arbitrary_values = $ArbitraryCount
    hardcoded_spacing = $SpacingCount
    non_standard_z_index = $ZIndexCount
    magic_numbers = $MagicCount
    total_violations = $TotalViolations
    score = $ConsistencyScore
    threshold_max = 5
    status = if ($TotalViolations -le 5) { "PASS" } else { "FAIL" }
}

Write-Host "🎯 Consistency Score: $ConsistencyScore/100 $(if ($TotalViolations -le 5) { '✅' } else { '❌' })"
```

---

### 6. Animation & Motion Audit

Review animation quality and accessibility.

```powershell
# 6.1 Framer Motion usage count
$MotionUsage = rg "motion\." src/components/ --line-number --count
$MotionCount = if ($MotionUsage) { ($MotionUsage -split "`n").Count } else { 0 }

# 6.2 Check for prefers-reduced-motion support
$ReducedMotionSupport = rg "prefers-reduced-motion|useReducedMotion" src/ --line-number
$HasReducedMotion = if ($ReducedMotionSupport) { $true } else { $false }

# 6.3 CSS animations that could cause layout thrashing
$LayoutAnimations = rg "animate-.*width|animate-.*height|animate-.*top|animate-.*left" src/components/ --line-number
$LayoutAnimCount = if ($LayoutAnimations) { ($LayoutAnimations | Measure-Object -Line).Lines } else { 0 }

$AnimationScore = 100
if (-not $HasReducedMotion -and $MotionCount -gt 0) { $AnimationScore -= 20 }
$AnimationScore -= ($LayoutAnimCount * 10)
$AnimationScore = [math]::Max(0, $AnimationScore)

$Report.scores["animation"] = @{
    motion_components = $MotionCount
    has_reduced_motion_support = $HasReducedMotion
    layout_thrashing_risk = $LayoutAnimCount
    score = $AnimationScore
    status = if ($AnimationScore -ge 80) { "PASS" } else { "WARN" }
}

Write-Host "✨ Animation Score: $AnimationScore/100 $(if ($AnimationScore -ge 80) { '✅' } else { '⚠️' })"
```

---

### 7. Responsive Design & Platform Coverage

Verify responsive breakpoints and platform support.

```powershell
# 7.1 Count components with responsive classes
$ResponsiveComponents = rg "sm:|md:|lg:|xl:|2xl:" src/components/ --files-with-matches
$ResponsiveCount = if ($ResponsiveComponents) { ($ResponsiveComponents -split "`n").Count } else { 0 }

# 7.2 Components WITHOUT any responsive classes
$NonResponsive = rg "className=" src/components/ui/ --files-without-match "sm:|md:|lg:|xl:"
$NonResponsiveCount = if ($NonResponsive) { ($NonResponsive -split "`n").Count } else { 0 }

# 7.3 TV Mode coverage (per PLATFORM_MATRIX.md)
$TvModeRefs = rg "TvMode|tv-mode|tvMode|10-foot" src/ --line-number
$HasTvMode = if ($TvModeRefs) { $true } else { $false }

# 7.4 Mobile-first check (sm: should be rare, mobile is default)
$MobileFirst = rg "sm:" src/components/ --count
$SmCount = if ($MobileFirst) { ($MobileFirst | Measure-Object -Sum).Sum } else { 0 }

$ResponsiveCoverage = if ($ComponentCount -gt 0) { 
    [math]::Round(($ResponsiveCount / $ComponentCount) * 100) 
} else { 100 }

$Report.scores["responsive"] = @{
    responsive_components = $ResponsiveCount
    non_responsive_components = $NonResponsiveCount
    has_tv_mode = $HasTvMode
    mobile_first_violations = $SmCount
    coverage_percent = $ResponsiveCoverage
    threshold = 95
    status = if ($ResponsiveCoverage -ge 95) { "PASS" } else { "WARN" }
}

Write-Host "📱 Responsive Coverage: $ResponsiveCoverage% $(if ($ResponsiveCoverage -ge 95) { '✅' } else { '⚠️' })"
```

---

### 8. Visual Regression Placeholder (Storybook/Chromatic)

Future integration point for visual testing.

```powershell
# Check for Storybook configuration
$HasStorybook = Test-Path "*.stories.tsx" -PathType Leaf
$StorybookConfig = Test-Path ".storybook/main.ts" -PathType Leaf

$Report.scores["visual_regression"] = @{
    has_storybook = $StorybookConfig
    stories_count = if ($HasStorybook) { (Get-ChildItem -Path "src" -Filter "*.stories.tsx" -Recurse).Count } else { 0 }
    chromatic_enabled = $false
    status = if ($StorybookConfig) { "CONFIGURED" } else { "NOT_CONFIGURED" }
    note = "Run 'npx chromatic' for visual regression testing"
}

Write-Host "📸 Visual Regression: $(if ($StorybookConfig) { 'Storybook configured ✅' } else { 'Not configured ⚠️' })"
```

---

## 📊 Final Report & Scoring

```powershell
# Calculate overall score (weighted average)
$Weights = @{
    accessibility = 0.30
    performance = 0.20
    consistency = 0.20
    dark_mode = 0.10
    animation = 0.10
    responsive = 0.10
}

$OverallScore = 0
foreach ($key in $Weights.Keys) {
    if ($Report.scores[$key] -and $Report.scores[$key].score) {
        $OverallScore += $Report.scores[$key].score * $Weights[$key]
    }
}
$OverallScore = [math]::Round($OverallScore)

$Report.overall_score = $OverallScore
$Report.status = if ($OverallScore -ge 90) { "HEALTHY" } 
                 elseif ($OverallScore -ge 70) { "NEEDS_ATTENTION" } 
                 else { "CRITICAL" }

# Generate ASCII Report
Write-Host ""
Write-Host "┌────────────────────────────────────────────────────┐"
Write-Host "│ 🎨 UI MONITOR REPORT                                │"
Write-Host "├────────────────────────────────────────────────────┤"
Write-Host "│ Overall Score:    $OverallScore/100 $($Report.status.PadRight(20)) │"
Write-Host "├────────────────────────────────────────────────────┤"
Write-Host "│ ♿ Accessibility:  $($Report.scores.accessibility.score)/100        │"
Write-Host "│ 🚀 Performance:    $($Report.scores.performance.score)/100        │"
Write-Host "│ 🎯 Consistency:    $($Report.scores.consistency.score)/100        │"
Write-Host "│ 🌙 Dark Mode:      $($Report.scores.dark_mode.score)/100        │"
Write-Host "│ ✨ Animation:      $($Report.scores.animation.score)/100        │"
Write-Host "│ 📱 Responsive:     $($Report.scores.responsive.coverage_percent)%         │"
Write-Host "└────────────────────────────────────────────────────┘"

# Save JSON report
$ReportPath = "$ReportDir/ui-health-$ReportDate.json"
$Report | ConvertTo-Json -Depth 5 | Out-File -FilePath $ReportPath -Encoding utf8
Write-Host "📄 Report saved: $ReportPath"
```

---

## 🔴 Auto-Log Critical Findings to DEBT.md

```powershell
$CriticalFindings = @()

# A11y failures are always critical
if ($Report.scores.accessibility.score -lt 100) {
    foreach ($issue in $Report.scores.accessibility.issues) {
        $CriticalFindings += "| $(Get-Date -Format 'yyyy-MM-dd') | ``src/components/`` | [A11y] $($issue.type): $($issue.count) violations | @ui-ux | 🔴 Open |"
    }
}

# Consistency violations over threshold
if ($Report.scores.consistency.total_violations -gt 5) {
    $CriticalFindings += "| $(Get-Date -Format 'yyyy-MM-dd') | ``src/components/`` | [Consistency] $($Report.scores.consistency.total_violations) design system violations | @ui-ux | 🔴 Open |"
}

if ($CriticalFindings.Count -gt 0) {
    Write-Host "⚠️ Logging $($CriticalFindings.Count) critical findings to DEBT.md"
    Add-Content -Path "DEBT.md" -Value ($CriticalFindings -join "`n")
}
```

---

## 🔌 Lighthouse CI Integration

// turbo

```powershell
# Run Lighthouse CI (requires dev server running on localhost:3000)
if (Get-Process -Name "node" -ErrorAction SilentlyContinue) {
    npx lighthouse http://localhost:3000 --output=json --output-path="$ReportDir/lighthouse-$ReportDate.json" --chrome-flags="--headless"
    
    $LighthouseReport = Get-Content "$ReportDir/lighthouse-$ReportDate.json" | ConvertFrom-Json
    Write-Host "🔦 Lighthouse Scores:"
    Write-Host "   Performance:    $([math]::Round($LighthouseReport.categories.performance.score * 100))"
    Write-Host "   Accessibility:  $([math]::Round($LighthouseReport.categories.accessibility.score * 100))"
    Write-Host "   Best Practices: $([math]::Round($LighthouseReport.categories.'best-practices'.score * 100))"
    Write-Host "   SEO:            $([math]::Round($LighthouseReport.categories.seo.score * 100))"
} else {
    Write-Host "⏭️ Skipping Lighthouse (dev server not running)"
}
```

**Targets:**

- **Performance Score**: ≥ 90
- **Accessibility Score**: = 100
- **Best Practices Score**: ≥ 95
- **Largest Contentful Paint**: < 2.5s

---

## 🔧 Quick Fix Commands

For common issues, run these fixes:

```powershell
# Fix: Add aria-labels to buttons
# Manual review required - search for issues:
rg "<button" src/components/ --line-number | rg -v "aria-label"

# Fix: Run ESLint a11y plugin
npx eslint src/components/ --ext .tsx --plugin jsx-a11y

# Fix: Check contrast with axe
npx @axe-core/cli http://localhost:3000 --tags wcag2aa
```

---

## Version History

### 2.0.0 (2026-01-18)

- **BREAKING**: Complete rewrite with PowerShell-native commands
- **Scoring System**: Weighted overall score with pass/fail thresholds
- **Axe-Core Integration**: Real a11y testing support
- **Dark Mode Audit**: New section for theme compliance
- **Visual Regression**: Storybook/Chromatic placeholder
- **JSON Reports**: Machine-readable output for CI integration
- **Auto-DEBT Logging**: Critical findings automatically logged

### 1.0.0 (2026-01-18)

- Initial release with grep-based audits
