---
description: "Code & Logic Specialist (IronForge CI Doctor Branch)"
command: "/doctor-code"
category: "maintenance"
trigger: "manual"
version: "1.0.0"
primary_agent: "@coder"
domain: "code"
skills: ["error-analyzer", "linter-fixer", "clean-code-pro", "dependabot-manager"]
---

# 🩺 doctor-code

**Role:** Logic Surgeon
**Focus:** Syntax, Type Safety, Dependency Integrity, Lint regressions.

## Diagnostic Protocol

### 1. Build & Type Integrity

Check if the code compiles and passes TS check.

// turbo

```bash
echo "🔍 Checking types..."
pnpm run check-types || exit 1
```

### 2. Lint & Style

Check for syntax errors and style violations.

// turbo

```bash
echo "🔍 Running linter..."
pnpm run lint || {
  echo "⚠️ Lint failures detected. Attempting auto-fix..."
  /linter-fixer
}
```

### 3. Dependency Audit

Check lockfile sync and vulnerability status.

// turbo

```bash
echo "🔍 Checking dependency integrity..."
pnpm install --frozen-lockfile --dry-run || exit 1
pnpm audit --audit-level high
```

## Phase 2: Proactive Optimization (Optimizer Mode)

**Goal:** Improve code even when CI is green.

### 1. CodeRabbit Autopilot

If CodeRabbit has posted suggestions, `doctor-code` should proactively apply them.

// turbo

```bash
echo "🤖 doctor-code: Scanning for CodeRabbit suggestions..."
# Use GitHub API to fetch comments from CodeRabbit
gh pr view $PR_NUMBER --comments --json body | grep "CodeRabbit" && {
  echo "🔬 CodeRabbit suggestions found. Initiating Autopilot refactors..."
}
```

### 2. Clean Code Audit

Run `clean-code-pro` skill even on successful builds.

// turbo

```bash
/clean-code-pro --audit
```

## Remediation Pipeline

- If Typescript fails -> Analyze stack trace and apply hotfix.
- If Lint fails -> Run `eslint --fix`.
- If Lockfile is out of sync -> Run `pnpm install` and update `pnpm-lock.yaml`.
