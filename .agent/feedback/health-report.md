# 🏥 Health Report
**Date**: 2025-12-29
**Auditor**: Lead SRE Agent

## 📊 Dashboard

| Module | Status | Risk | Notes |
|:-------|:-------|:-----|:------|
| **Core Actions** (`src/actions`) | 🟢 PASS | Low | Tests exist (`__tests__`), Types verified. |
| **Training UI** (`src/features/training`) | 🟠 WARNING | Medium | Logic inside UI components (`IronMines`, `TvMode`). No unit tests. |
| **Documentation** | 🟢 PASS | Low | `api-reference.md` aligned with codebase (recent fix). |
| **Knowledge Graph** | 🟢 PASS | Low | Regenerated. 299 Nodes. |
| **E2E Tests** | 🟢 PASS | Low | Critical flows covered (settings, game-systems, tv-mode). |

## 🚨 Critical Items
1.  **UI Component Complexity**: `IronMines.tsx` is 375+ lines. Needs hook extraction (`useSetLogging`).
2.  **Missing Unit Tests**: `TvMode.tsx` relies solely on E2E. Logic edge cases (Bluetooth failure) harder to test via E2E.

## 🛠️ Remediation Plan
1.  **Refactor**: Extract `useMiningSession` from `IronMines.tsx`.
2.  **Test**: Add `TvMode.test.tsx` mocking Bluetooth hooks.
3.  **Process**: Enforce `colocated-tests` rule for new features.

**Audit Precision**: 9/10. (Missed deep analysis of `src/services` mocking).
