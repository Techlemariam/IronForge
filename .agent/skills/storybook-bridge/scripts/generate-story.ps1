<#
.SYNOPSIS
    Generates a Storybook story file for a React component.

.PARAMETER ComponentPath
    Path to the component file (e.g., src/components/ui/Button.tsx)

.EXAMPLE
    .\generate-story.ps1 -ComponentPath src/components/ui/Card.tsx
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$ComponentPath
)

$ErrorActionPreference = "Stop"

# Parse component info
$componentFile = Get-Item $ComponentPath
$componentName = $componentFile.BaseName
if ($componentName -match "-") {
    # Convert kebab-case to PascalCase (e.g. scroll-area -> ScrollArea)
    $componentNamePascal = (Get-Culture).TextInfo.ToTitleCase($componentName.Replace('-', ' ')).Replace(' ', '')
} else {
    $componentNamePascal = $componentName
}

$componentDir = $componentFile.DirectoryName
$storyPath = Join-Path $componentDir "$componentName.stories.tsx"

# Check if story already exists
if (Test-Path $storyPath) {
    Write-Host "⚠️  Story already exists: $storyPath" -ForegroundColor Yellow
    exit 0
}

# Determine relative import path
$relativePath = "./$componentName"

# Generate story content
$storyContent = @"
import type { Meta, StoryObj } from '@storybook/react';
import { $componentNamePascal } from '$relativePath';

const meta: Meta<typeof $componentNamePascal> = {
  title: 'Components/$componentNamePascal',
  component: $componentNamePascal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof $componentNamePascal>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};

export const Variant: Story = {
  args: {
    // Add variant props here
  },
};
"@

# Write story file
Set-Content -Path $storyPath -Value $storyContent -Encoding UTF8

Write-Host "✅ Generated story: $storyPath" -ForegroundColor Green
Write-Host "   Edit the file to add proper props and variants." -ForegroundColor Cyan
