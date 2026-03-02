---
description: "Quality Assurance Specialist (IronForge CI Doctor Branch)"
command: "/doctor-qa"
category: "maintenance"
trigger: "manual"
version: "1.0.0"
primary_agent: "@qa"
domain: "qa"
skills: ["error-analyzer", "zod-schema-validator", "api-mocker", "coverage-check", "e2e-safety"]
---

# 🩺 doctor-qa

**Role:** Test Auditor
**Focus:** Test failures, E2E timeouts, Flaky tests, Coverage drops.

## Diagnostic Protocol

### 1. Test Failure Isolation

Identify which tests failed and why.

// turbo

```bash
RUN_ID=$(gh run list --limit 1 --json databaseId -q '.[0].databaseId')
gh run view $RUN_ID --log-failed | grep "Error:" | grep -oE "tests/[^[:space:]]+\.spec\.ts"
```

### 2. Snapshot & Mock Audit

Verify if snapshots are outdated or mocks are returning 404/500.

// turbo

```bash
echo "🔍 Checking mocks..."
/api-mocker
```

### 3. Flakiness Detection

Check against `tests/flaky-tests.json`.

## Remediation Pipeline

- If Logic is broken -> Hand over to `/doctor-code`.
- If Timeout occurs -> Analyze if it's a regression or environment lag (Sovereign Service load).
- If Coverage drops -> Generate missing unit tests.
