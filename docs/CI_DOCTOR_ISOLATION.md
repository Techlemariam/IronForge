# Docker Isolation & Specialized Doctors

This document explains the relationship between the specialized CI doctors and the multi-container architecture.

## 🐳 Fault Isolation Architecture

By using separate networks and containers for testing (`docker-compose.test.yml`), we achieve:

1. **Environment Parity**: The `/doctor-infra` agent can spin up a pristine environment that exactly matches the GitHub runner, eliminating "it works on my machine" bugs.
2. **Noise Reduction**: Tests run in isolation don't compete for resources with the main development DB, making `/doctor-qa`'s flakiness detection more accurate.
3. **Sub-Second Triage**: Aggressive healthchecks (interval: 2s) allow the `ci-doctor` orchestrator to fail-fast if the infrastructure is the root cause.

## 🩺 Specialist Mapping

| Specialty | Doctor Workflow | Trigger | Agent |
| :--- | :--- | :--- | :--- |
| **Ground Health** | `/doctor-infra` | Infra failures, DB sync | `@infrastructure` |
| **Logic/Build** | `/doctor-code` | Type errors, linting | `@coder` |
| **Quality/Tests** | `/doctor-qa` | Test fails, coverage | `@qa` |

## 🚀 Execution Strategy

When a CI failure occurs:

1. `ci-doctor` runs a triage.
2. If DB is down, `/doctor-infra` runs `docker-compose -f docker-compose.test.yml up`.
3. If build fails, `/doctor-code` analyzes the `gh run view` logs.
4. If tests fail, `/doctor-qa` isolates the specific spec files.
