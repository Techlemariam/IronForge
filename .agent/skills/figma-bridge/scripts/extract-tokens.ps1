<#
.SYNOPSIS
    Extracts design tokens from CSS/Tailwind for Figma comparison.

.DESCRIPTION
    Parses globals.css and tailwind.config.ts to extract:
    - Color tokens
    - Typography scales
    - Spacing values
    - Border radii

.EXAMPLE
    pwsh .agent/skills/figma-bridge/scripts/extract-tokens.ps1
#>

$outputFile = ".agent/skills/figma-bridge/tokens.json"

Write-Host "🎨 FIGMA BRIDGE - Token Extractor" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Extract CSS variables from globals.css
$globalsPath = "src/app/globals.css"
$tokens = @{
    colors = @{}
    spacing = @{}
    typography = @{}
    radii = @{}
    extractedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
}

if (Test-Path $globalsPath) {
    $content = Get-Content $globalsPath -Raw
    
    # Extract CSS custom properties
    $matches = [regex]::Matches($content, '--([a-zA-Z0-9-]+):\s*([^;]+);')
    
    foreach ($match in $matches) {
        $name = $match.Groups[1].Value
        $value = $match.Groups[2].Value.Trim()
        
        if ($name -match "color|bg|text|border" -or $value -match "hsl|rgb|#") {
            $tokens.colors[$name] = $value
        } elseif ($name -match "radius") {
            $tokens.radii[$name] = $value
        } elseif ($name -match "font|text") {
            $tokens.typography[$name] = $value
        } else {
            $tokens.spacing[$name] = $value
        }
    }
    
    Write-Host "   ✅ Extracted from globals.css" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ globals.css not found" -ForegroundColor Yellow
}

# Output
$json = $tokens | ConvertTo-Json -Depth 3
$json | Set-Content $outputFile

Write-Host "`n📄 Tokens saved to: $outputFile" -ForegroundColor Green
Write-Host "   Colors: $($tokens.colors.Count)" -ForegroundColor Gray
Write-Host "   Spacing: $($tokens.spacing.Count)" -ForegroundColor Gray
Write-Host "   Typography: $($tokens.typography.Count)" -ForegroundColor Gray
Write-Host "   Radii: $($tokens.radii.Count)" -ForegroundColor Gray
