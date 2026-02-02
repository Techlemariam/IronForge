---
name: shadcn-theme-generator
description: Generates and validates Shadcn UI themes and CSS variables
version: 1.0.0
category: design
owner: "@ui-ux"
platforms: ["windows", "linux", "macos"]
requires: ["figma-bridge"]
context:
  primarySources:
    - src/app/globals.css
    - tailwind.config.ts
  references:
    - components.json
  patterns:
    - src/components/ui/
rules:
  - "Ensure contrast ratios verify WCAG AA"
  - "Map all semantic tokens (primary, secondary, accent, etc)"
  - "Support both light and dark modes"
  - "Consistent HSL format for variables"
edgeCases:
  - "Hardcoded hex values in components"
  - "Tailwind arbitrary values"
---

# 🎨 Shadcn Theme Generator

Automates the creation and maintenance of your design system tokens.

## Capabilities

- **Palette Generation**: Create harmonious color scales from a base color
- **Token Mapping**: Sync Figma colors to `globals.css` variables
- **Contrast Check**: Auto-validate accessibility of generated themes
- **Component Preview**: Generate a preview page for the new theme

## Usage

```powershell
# Generate theme from a primary color
@shadcn Generate a theme based on #FF4500 (Plasma Orange)

# Validate current theme accessibility
@shadcn Check contrast ratios in globals.css
```

## Integration

- **`ui-ux` workflow**: Core tool for design system updates
- **`figma-bridge`**: Consumes tokens extracted from Figma
