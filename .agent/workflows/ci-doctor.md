---
description: "Comprehensive CI failure prevention and resolution (v3.2)"
command: "/ci-doctor"
category: "maintenance"
trigger: "manual"
version: "3.2.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
domain: "ci"
skills: ["error-analyzer", "gatekeeper", "dependabot-manager", "env-validator", "linter-fixer", "schema-guard", "qodana-linter", "performance-profiler", "zod-schema-validator", "api-mocker", "bio-validator", "prisma-migrator", "a11y-auditor", "coverage-check", "bundle-analyzer", "git-guard", "supabase-inspector", "storybook-bridge", "coolify-deploy", "doc-generator", "red-team", "clean-code-pro"]
---

# 🩺 CI Doctor (Orchestrator v3.3)

**Role:** Medical Board Chair / Triage Lead
**Goal:** Orchestrate specialized diagnostics AND proactive optimization across the full PR lifecycle.

---

## Phase 0: Triage (Board-Level Lifecycle)

CI Doctor now analyzes BOTH failures and successes to ensure a "Golden Path" of code quality.

// turbo

```bash
echo "🩺 CI Doctor: Initiating Full-Lifecycle Triage..."

# --- FAILURE TRIAGE (Diagnostic Mode) ---

# [Existing Failure Sensors 1-4 from v3.2...]
# (Infra, Security Limits, Meta, Build/Logic)

# --- SUCCESS TRIAGE (Optimizer Mode) ---

# 1. Proactive Code Strategy (doctor-code --optimize)
if gh pr view --json reviews -q '.reviews[].author.login' | grep -q "coderabbit"; then
  echo "🤖 SUCCESS SENSOR: CodeRabbit active on green PR. Dispatching Optimizer..."
  /doctor-code --mode=optimize
fi

# 2. Proactive Security Hardening (doctor-security --sentinel)
if gh run list --workflow "GitGuardian" --limit 1 -q '.[0].conclusion' | grep -q "success"; then
   echo "🛡️ SUCCESS SENSOR: Security green. Dispatching Sentinel for hardening..."
   /doctor-security --mode=sentinel
fi

# 3. Proactive QA/Perf Validation (doctor-qa --verify)
if [ -d ".next" ]; then
   echo "📊 SUCCESS SENSOR: Build green. Checking performance budgets..."
   /perf
fi
```

## Phase 1: Specialized Consultation

Doctors now support two modes:

* **🚨 Diagnostic**: Emergency repair of failures.
* **✨ Optimizer**: Proactive strengthening of green builds.
