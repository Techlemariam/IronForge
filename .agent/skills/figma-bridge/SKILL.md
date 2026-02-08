---
name: figma-bridge
description: Bi-directional Figma design integration via MCP
version: 1.0.0
category: domain
owner: "@ui-ux"
platforms: ["windows", "linux", "macos"]
requires: []
context:
  primarySources:
    - src/components/ui/
    - src/app/globals.css
  references:
    - docs/ARCHITECTURE.md
    - .vscode/mcp.json
  patterns:
    - src/components/
    - src/features/
rules:
  - "Extract design tokens before generating components"
  - "Use Tailwind classes matching Figma styles"
  - "Maintain component naming consistency"
  - "Preserve accessibility from design specs"
edgeCases:
  - "Complex nested auto-layouts"
  - "Missing font fallbacks"
  - "Figma variants vs React props mapping"
---

# 🎨 Figma Bridge

Bi-directional design-to-code integration using Framelink MCP.

## Prerequisites

1. **Figma API Key** in `.env.local`:

   ```
   FIGMA_API_KEY=figd_xxxxxxxxxxxxx
   ```

2. **MCP Server** configured in `.vscode/mcp.json`

## Context

| Source | Purpose |
|:-------|:--------|
| `src/components/ui/` | Existing UI components |
| `globals.css` | Design tokens / CSS variables |
| Figma MCP | Live design data |

## Workflows

### Figma → Code (Design Implementation)

1. **Paste Figma link** in chat:

   ```
   Implement this design: https://figma.com/file/xxx/Frame-Name
   ```

2. **Agent fetches**:
   - Layout structure
   - Colors, typography, spacing
   - Component hierarchy

3. **Generates**:
   - React component with Tailwind
   - Design tokens if new
   - Accessibility attributes

### Code → Figma (Design Sync)

1. **Extract tokens** from existing components:

   ```powershell
   pwsh .agent/skills/figma-bridge/scripts/extract-tokens.ps1
   ```

2. **Compare** with Figma design tokens

3. **Report** drift between design and code

## Usage Examples

### Implement a Figma Frame

```
@figma Implement this card component: [paste Figma link]
Use our existing Button and Badge components from src/components/ui/
```

### Extract Design Tokens

```
@figma Extract the color palette from: [paste Figma link]
Update globals.css with any new tokens
```

### Check Design Drift

```
@figma Compare our Button component with the Figma source
Report any visual differences
```

## Integration with Workflows

| Workflow | Usage |
|:---------|:------|
| `/ui-ux` | Primary design implementation |
| `/feature` | UI components from specs |
| `/domain-session game` | Game UI assets |

## Tips

- **Share specific frames**, not entire files (faster, less context)
- **Name layers properly** in Figma for clean component names
- **Use Auto Layout** in Figma for responsive components
