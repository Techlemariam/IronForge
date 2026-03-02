---
description: "Security & Compliance Specialist (IronForge CI Doctor Branch)"
command: "/doctor-security"
category: "maintenance"
trigger: "manual"
version: "1.0.0"
primary_agent: "@security"
domain: "security"
skills: ["red-team", "dependabot-manager", "qodana-linter", "env-validator"]
---

# 🩺 doctor-security

**Role:** Security Auditor
**Focus:** Dependency vulnerabilities, Secret exposure, Snyk quotas, Qodana security gates.

## Diagnostic Protocol

### 1. External Service Limits

Check if Snyk or other external scanners are failing due to quota limits.

// turbo

```bash
echo "🔍 Checking Security Service Status..."
# Look for "used your limit" or "quota exceeded" in logs
gh run view --log-failed | grep -E "limit of private tests|quota exceeded" && {
  echo "⚠️ ALERT: Security service limit reached. Please check account tier."
}
```

### 2. Secret Exposure

Scan for unencrypted secrets in config files.

// turbo

```bash
echo "🔍 Scanning for secret leaks..."
git grep -E "sk_|key-|secret_" -- "*.json" "*.yml" "*.ps1"
```

### 3. Vulnerability Audit

Run a local audit to bypass CI quotas if possible.

// turbo

```bash
pnpm audit --audit-level high
```

## Phase 2: Proactive Sentinel Mode

**Goal:** Harden security even when checks are green.

### 1. GitGuardian Deep Dive

Even if GitGuardian is green, verify that no "low-risk" signals or "sensitive data patterns" are present.

// turbo

```bash
echo "🛡️ doctor-security: Running proactive sentinel scan..."
# Check for common non-secret but sensitive patterns
grep -rE "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}" . --exclude-dir=node_modules
```

### 2. Snyk Proactive Patching

Check for reachable vulnerabilities that might not be breaking CI yet.

// turbo

```bash
pnpm run security:proactive
```

## Remediation Pipeline

- If Snyk Limit Reached -> Advise user to upgrade or skip security check for this PR.
- If Secret Found -> Rotate secret and add to `.gitignore`.
