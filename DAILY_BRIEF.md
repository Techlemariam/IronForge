# Night Shift: Daily Brief (2026-02-15)

This report summarizes the findings from the automated nightly maintenance workflow.

## 1. Security Audit (`pnpm audit --audit-level=high`)

No high-severity vulnerabilities were found. The audit did identify the following lower-severity issues:

- **3 Moderate**
- **1 Low**

| Package | Severity | CVE | Details |
|---|---|---|---|
| `lodash-es` | moderate | CVE-2025-13465 | Prototype Pollution |
| `lodash` | moderate | CVE-2025-13465 | Prototype Pollution |
| `markdown-it` | moderate | CVE-2026-2327 | ReDoS |
| `qs` | low | CVE-2026-2391 | DoS |

*Action: These do not require immediate action based on the `--audit-level=high` rule, but should be reviewed.*

---

## 2. Codebase Audit (`.\scripts\audit-codebase.ps1`)

The codebase audit revealed several areas for improvement.

| Metric | Count |
|---|---|
| **Source Files** | 594 |
| **Story Files** | 133 |
| **Logic Gaps (TODO/FIXME)** | 144 |
| **Type Safety Bypasses (any/@ts-ignore)** | 329 |
| **Missing Tests** | 594 |
| **Missing Docs (README.md)** | 594 |
| **Workflows Missing Schema** | 60 |

**Key Takeaways:**

-   **Critical Test & Doc Debt:** A significant number of source files lack corresponding tests and documentation. This is the most urgent issue.
-   **Code Quality:** The high number of `TODO/FIXME` markers and type safety bypasses indicates a need for a focused code quality sprint.
-   **Workflow Standardization:** A large number of agent workflows are missing formal input/output schemas, which could lead to unpredictable behavior.

*Action: A new branch has been created to address these issues. A follow-up PR will be created.*

---

## 3. Outdated Dependencies (`npm outdated`)

The following dependencies are outdated:

| Package | Current | Wanted | Latest |
|---|---|---|---|
| `@ai-sdk/google` | 3.0.26 | 3.0.29 | 3.0.29 |
| `@ai-sdk/react` | 3.0.84 | 3.0.88 | 3.0.88 |
| `@remotion/cli` | 4.0.421 | 4.0.422 | 4.0.422 |
| `@serwist/next` | 9.5.5 | 9.5.6 | 9.5.6 |
| `ai` | 6.0.82 | 6.0.86 | 6.0.86 |
| `dotenv` | 17.2.4 | 17.3.1 | 17.3.1 |
| `jsdom` | 28.0.0 | 28.1.0 | 28.1.0 |
| `lucide-react` | 0.563.0 | 0.563.0 | 0.564.0 |
| `remotion` | 4.0.421 | 4.0.422 | 4.0.422 |
| `serwist` | 9.5.5 | 9.5.6 | 9.5.6 |
| `turbo` | 2.8.7 | 2.8.9 | 2.8.9 |
| `typedoc` | 0.28.16 | 0.28.17 | 0.28.17 |

*Action: An update of these packages should be planned to ensure the project stays current and secure.*
