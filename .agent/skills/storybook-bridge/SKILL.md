---
name: storybook-bridge
description: Storybook development, visual testing, and component documentation
version: 2.0.0
category: utility
owner: "@ui-ux"
platforms: ["windows", "linux", "macos"]
requires: ["gatekeeper"]
context:
  primarySources:
    - .storybook/main.ts
    - .storybook/preview.ts
  references:
    - docs/ARCHITECTURE.md
    - brand_guidelines.md
  patterns:
    - src/stories/
    - src/components/ui/*.stories.tsx
rules:
  - "Every component MUST have a corresponding story"
  - "Include default, hover, disabled, and loading states"
  - "Verify accessibility with a11y addon (axe-core)"
  - "Add interaction tests for user flows"
  - "Use autodocs tag for automatic documentation"
edgeCases:
  - "Missing global styles → add decorators in preview.ts"
  - "Context providers → wrap in decorators"
  - "Next.js Image → mock with unoptimized prop"
  - "Server components → create client wrapper"
---

# 📚 Storybook Bridge v2.0

Live component development, documentation, and visual testing.

## Quick Start

```powershell
# Start Storybook
npm run storybook

# Build static site
npm run build-storybook

# Check coverage
pwsh .agent/skills/storybook-bridge/scripts/coverage-check.ps1

# Generate story for component
pwsh .agent/skills/storybook-bridge/scripts/generate-story.ps1 -ComponentPath src/components/ui/Badge.tsx

# Auto-generate stories for ALL missing components
pwsh .agent/skills/storybook-bridge/scripts/auto-generate-missing.ps1
```

## Directory Structure

```
storybook-bridge/
├── SKILL.md              # This file
├── scripts/
│   ├── generate-story.ps1    # Scaffold new stories
│   ├── coverage-check.ps1    # Verify story coverage
│   └── auto-generate-missing.ps1 # Bulk generation
└── examples/
    ├── Card.stories.tsx      # Card template
    └── Form.stories.tsx      # Form + interaction tests
```

## Coverage Requirements

| Threshold | Status |
|:----------|:-------|
| ≥80% | ✅ Production ready |
| 50-79% | ⚠️ Needs attention |
| <50% | ❌ Blocking |

## Story Anatomy

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Component } from './Component';

const meta: Meta<typeof Component> = {
  title: 'Category/Component',  // Sidebar organization
  component: Component,
  tags: ['autodocs'],           // Auto-generate docs
  parameters: {
    layout: 'centered',         // Canvas layout
    backgrounds: { default: 'dark' },
  },
  argTypes: {
    variant: { control: 'select', options: [...] },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Default: Story = {
  args: { /* props */ },
};

// Interaction test
export const WithInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(canvas.getByText('Clicked!')).toBeVisible();
  },
};
```

## Addons Configured

| Addon | Purpose |
|:------|:--------|
| `@storybook/addon-essentials` | Controls, actions, docs |
| `@storybook/addon-a11y` | Accessibility checks |
| `@storybook/addon-interactions` | Interaction testing |
| `@storybook/addon-designs` | Figma embeds (optional) |

## Workflow Integration

| Workflow | Usage |
|:---------|:------|
| `/ui-ux` | Primary component development |
| `/feature` | UI for new features |
| `/qa` | Visual regression checks |
| `/pre-pr` | Coverage verification |

## Best Practices

1. **Co-locate stories** with components when possible
2. **Test all states**: default, hover, focus, disabled, loading, error
3. **Use args** for dynamic props, not hardcoded values
4. **Add play functions** for interactive elements
5. **Document edge cases** in story descriptions

## Chromatic (Optional)

For visual regression testing in CI:

```yaml
# .github/workflows/chromatic.yml
- uses: chromaui/action@latest
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    buildScriptName: build-storybook
```
