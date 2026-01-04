# 🏥 Health Report
**Date**: 2026-01-04
**Auditor**: Lead SRE Agent

## 📊 Dashboard

| Module | Status | Risk | Notes |
|:-------|:-------|:-----|:------|
| **Core Actions** (`src/actions`) | 🟢 PASS | Low | Rich feature set (96 actions). Types verified. |
| **Documentation** | 🔴 FAIL | High | **Major Drift**. Only ~20% of actions are documented in `api-reference.md`. Missing: `battle-pass`, `power-rating`, `territory`, `shop-system`, etc. |
| **Test Structure** (`tests/unit`) | 🔴 FAIL | High | `tests/unit` appears empty of directories. Does not mirror `src/` structure. Violates "Structure Compliance". |
| **Test Health** | 🟠 WARNING | Medium | Recent errors in `test-results`. Unit test coverage likely very low given the folder structure. |
| **Knowledge Graph** | 🟢 PASS | Low | Comprehensive (299 Nodes). |

## 🚨 Critical Items
1.  **Documentation Gap**: `src/actions` has grown to 96 files, but `api-reference.md` only covers a fraction. This makes it hard for new agents to know what capabilities exist.
2.  **Missing Unit Test Scaffolding**: No `tests/unit/actions` or `tests/unit/services` directories found. Tests may be missing or misplaced.
3.  **Action Bloat**: 96 files in `src/actions`. Consider grouping into folders (e.g. `src/actions/features/`).

## 🛠️ Remediation Plan
1.  **Docs**: Run `/librarian` to batch-update `api-reference.md` with the 70+ missing actions.
2.  **Scaffold**: Create `tests/unit/actions`, `tests/unit/services`, `tests/unit/utils` and move/create tests.
3.  **Refactor**: Group `src/actions` into subdomains (Combat, Social, Training) to reduce root clutter.

**Audit Precision**: 8/10. (Confirmed file counts and structure, inferred test coverage from directory state).
