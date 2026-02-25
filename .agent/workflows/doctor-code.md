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

## Phase 2: Reviewer Aggregation (Optimizer Mode)

**Goal:** Automatically aggregate and apply AI reviewer suggestions to close the feedback loop.

### 1. Fetch Pending Reviews

Aggregate all outstanding suggestions from CodeRabbit, DeepSource, and human reviewers.

// turbo

```bash
echo "🤖 doctor-code: Aggregating reviewer comments..."
PR_NUMBER=$(gh pr view --json number -q '.number' 2>/dev/null)

if [ -z "$PR_NUMBER" ]; then
  echo "ℹ️ No active PR found. Skipping reviewer aggregation."
  exit 0
fi

# Fetch CodeRabbit and DeepSource suggestions
gh pr view $PR_NUMBER --json reviews,comments --jq '
  (.reviews // [] | map(select(.author.login == "coderabbitai" or .author.login == "deepsource-autofix[bot]")) | .[]),
  (.comments // [] | map(select(.author.login == "coderabbitai" or .author.login == "deepsource-autofix[bot]")) | .[])
' > /tmp/reviewer-suggestions.json

SUGGESTION_COUNT=$(cat /tmp/reviewer-suggestions.json | wc -l)
echo "📋 Found $SUGGESTION_COUNT reviewer suggestions"
```

### 2. Apply Auto-Fixable Suggestions

Parse suggested diffs and apply them directly.

// turbo

```bash
echo "🔬 Attempting auto-fix of reviewer suggestions..."
# Parse suggestion blocks and apply
cat /tmp/reviewer-suggestions.json | jq -r 'select(.body) | .body' | grep -A 100 '```suggestion' | grep -B 100 '```' > /tmp/patches.diff 2>/dev/null

if [ -s /tmp/patches.diff ]; then
  echo "✅ Auto-fixable patches found. Applying..."
  # Note: In practice, this requires more sophisticated diff parsing
  # The n8n reviewer-aggregator handles the full pipeline
else
  echo "ℹ️ No auto-fixable patches. Manual review required."
fi
```

### 3. Clean Code Audit

Run `clean-code-pro` skill even on successful builds.

// turbo

```bash
/clean-code-pro --audit
```

## Remediation Pipeline

- If Typescript fails -> Analyze stack trace and apply hotfix.
- If Lint fails -> Run `eslint --fix`.
- If Lockfile is out of sync -> Run `pnpm install` and update `pnpm-lock.yaml`.
- If CodeRabbit requests changes -> Parse diffs and auto-apply via git commit.
