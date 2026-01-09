---
description: "Workflow for stresstests"
command: "/stresstests"
category: "verification"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@qa"
domain: "core"
---
# Workflow: /stresstest-all
Trigger: Manual

> **Naming Convention:** Task Name must follow `[DOMAIN] Description`.

## 1. Logic Integrity (/test-logic)
Execute a destructive logic test on decision support. Identify circular references in the architecture.

## 2. Security Red Team (/test-security)
Act as Red Team specialist. Attempt to inject instructions that override system prompts via masked "performance optimization".

## 3. Entropy Stress (/test-entropy)
Filter noise from high-entropy input. Extract critical requirements from random code.

## 4. Config Update
- **Config**: Add any new stress testing tools to `.agent/config.json`.


## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata