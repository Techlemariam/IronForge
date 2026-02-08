---
name: responsive-tester
description: Viewport testing, TV mode validation, and cross-device analysis
version: 1.0.0
category: testing
owner: "@platform"
platforms: ["windows", "linux", "macos"]
requires: ["storybook-bridge"]
context:
  primarySources:
    - src/features/dashboard/
    - src/features/training/TvMode.tsx
  references:
    - docs/PLATFORM_MATRIX.md
  patterns:
    - src/**/*.tsx
rules:
  - "Test all breakpoints: mobile, tablet, desktop, TV"
  - "Verify touch targets are 44px minimum"
  - "Check TV mode has 10-foot UI principles"
  - "Validate focus states for remote control"
---

# 📱 Responsive Tester

Cross-device and viewport validation for IronForge platforms.

## Target Devices

| Platform | Viewport | Special Considerations |
|:---------|:---------|:-----------------------|
| **Mobile** | 375x667 | Touch, bottom nav |
| **Tablet** | 768x1024 | Split view, stylus |
| **Desktop** | 1440x900 | Mouse, keyboard |
| **TV** | 1920x1080 | Remote, 10-foot UI |

## Capabilities

- **Viewport Snapshots**: Capture at each breakpoint
- **Touch Target Audit**: Verify 44px minimum
- **Focus Management**: Check keyboard/remote navigation
- **TV Mode Validation**: Large text, high contrast

## Usage

```powershell
# Test specific component at all breakpoints
@platform Test Button component responsiveness

# Validate TV mode
@platform Audit TvMode.tsx for 10-foot UI

# Check touch targets
@platform Find touch targets smaller than 44px
```

## Integration

- **`platform.md`**: Primary workflow
- **`monitor-ui.md`**: UI health checks
