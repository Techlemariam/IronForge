---
description: "Meta & Governance Specialist (IronForge CI Doctor Branch)"
command: "/doctor-meta"
category: "maintenance"
trigger: "manual"
version: "1.0.0"
primary_agent: "@manager"
domain: "meta"
skills: ["git-guard", "issue-template-validator", "doc-generator"]
---

# 🩺 doctor-meta

**Role:** Process Architect
**Focus:** PR Labeler, Release Drafter, Governance Guard, Workflow configuration.

## Diagnostic Protocol

### 0. Doppler Pre-flight Check

Ensure the environment is secured and Doppler is active.

// turbo

```bash
doppler run -- echo "🔐 Doppler Protected Execution Active"
```

### 1. Workflow Configuration Scan

Check for syntax or permission errors in meta-workflows.

// turbo

```bash
echo "🔍 Checking Meta-Workflow integrity..."
# Check for common path-ignore or pull_request_target issues
doppler run -- gh run list --limit 1 --json name,conclusion > /dev/null
ls .github/workflows/labeler.yml .github/workflows/release-drafter.yml > /dev/null || echo "⚠️ Missing meta-configs."
```

### 2. Service-Specific Configs

Check `.deepsource.toml`, `release-drafter.yml`, etc.

// turbo

```bash
if [ -f ".deepsource.toml" ]; then
  echo "🔍 DeepSource Config Check..."
  # Simple validation for common misconfigurations
  grep -q "analyzers:" .deepsource.toml || echo "⚠️ DeepSource misconfigured: No analyzers found."
fi
```

### 3. Release Continuity

Verify if Release Drafter can generate a draft.

## Remediation Pipeline

- If Labeler fails -> Verify `labeler.yml` paths match current src structure.
- If DeepSource fails -> Cross-reference config with DeepSource docs.
