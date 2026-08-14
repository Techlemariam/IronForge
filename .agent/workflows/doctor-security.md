---
description: "Security & Compliance Specialist (IronForge CI Doctor Branch)"
command: "/doctor-security"
category: "maintenance"
trigger: "manual"
version: "1.1.0"
primary_agent: "@security"
domain: "security"
skills: ["red-team", "dependabot-manager", "qodana-linter", "env-validator"]
---

# 🩺 doctor-security

**Role:** Security Auditor
**Focus:** Dependency vulnerabilities, secret exposure, GitHub-native security signals, and Qodana security gates.

## Diagnostic Protocol

### 0. Doppler Pre-flight Check

Ensure the environment is secured and Doppler is active.

// turbo

```bash
doppler run -- echo "🔐 Doppler Protected Execution Active"
```

### 1. Security Gate Status

Inspect failed security-related checks without relying on a third-party scanner token.

// turbo

```bash
echo "🔍 Checking security gate status..."
doppler run -- gh run view --log-failed | grep -Ei "security|dependency|vulnerability|secret|qodana|codeql|scorecard" || true
```

### 2. Secret Exposure

Scan for unencrypted secrets in config files.

// turbo

```bash
echo "🔍 Scanning for secret leaks..."
git grep -E "sk_|key-|secret_" -- "*.json" "*.yml" "*.ps1"
```

### 3. Vulnerability Audit

Run the repository-native dependency audit.

// turbo

```bash
doppler run -- pnpm audit --audit-level high
```

## Phase 2: Proactive Sentinel Mode

**Goal:** Harden security even when checks are green.

### 1. GitGuardian Deep Dive

Even if GitGuardian is green, verify that no low-risk signals or sensitive-data patterns are present.

// turbo

```bash
echo "🛡️ doctor-security: Running proactive sentinel scan..."
grep -rE "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}" . --exclude-dir=node_modules
```

### 2. Dependency Remediation

Review outdated packages and high-severity advisories before proposing upgrades.

// turbo

```bash
pnpm outdated || true
pnpm audit --audit-level high
```

## Remediation Pipeline

- If a dependency advisory is found -> identify the smallest compatible upgrade and verify with the normal CI gates.
- If a secret is found -> stop, rotate it through the approved secrets workflow, and add the source file to the appropriate ignore policy.
- If a GitHub-native security gate fails -> preserve fail-closed behavior and route the exact finding to the owning specialist.
