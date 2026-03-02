---
description: "UI/UX & Design Specialist (IronForge CI Doctor Branch)"
command: "/doctor-ui-ux"
category: "maintenance"
trigger: "manual"
version: "1.0.0"
primary_agent: "@ui-ux"
domain: "ui"
skills: ["monitor-ui", "a11y-auditor", "performance-profiler", "storybook-bridge"]
---

# 🩺 doctor-ui-ux

**Role:** Design Guardian
**Focus:** Accessibility (A11y), Visual Regressions, Storybook build, Performance (Lighthouse).

## Diagnostic Protocol

### 0. Doppler Pre-flight Check

Ensure the environment is secured and Doppler is active.

// turbo

```bash
doppler run -- echo "🔐 Doppler Protected Execution Active"
```

### 1. A11y Audit

Check for ARIA/Contrast violations.

// turbo

```bash
doppler run -- /a11y-auditor
```

### 2. Visual Regression Check

Check Chromatic or Storybook status.

// turbo

```bash
echo "🔍 Checking Storybook/ui-ux health..."
/storybook-bridge
```

### 3. Performance Degradation

Identify heavy assets or layout shifts.

// turbo

```bash
/performance-profiler
```

## Remediation Pipeline

- If A11y fails -> Apply suggested ARIA fixes.
- If Storybook fails -> Fix broken component exports or aliases.
