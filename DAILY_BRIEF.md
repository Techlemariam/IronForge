# Night Shift Maintenance Report - 2026-02-17

This autonomous report summarizes the findings of the nightly maintenance workflow.

## 🛡️ Security Audit

Found **2 high-severity** vulnerabilities.

| Package | Severity | Recommendation |
| --- | --- | --- |
| @modelcontextprotocol/sdk | high | Upgrade to version 1.24.0 or later |
| @modelcontextprotocol/sdk | high | Upgrade to version 1.25.2 or later |

## 🏗️ Codebase Audit

| Category | Count |
| --- | --- |
| Source Files | 600 |
| Story Files | 134 |
| Missing Tests | 600 |
| Missing Docs | 600 |
| Logic Gaps (TODO/FIXME) | 146 |
| Type Safety Bypasses | 4 |
| Workflows w/o Schema | 60 |

**Action Required:** 60 workflows require attention to add schema definitions.

## 📦 Outdated Dependencies

| Package | Current | Wanted | Latest |
| --- | --- | --- | --- |
| @ai-sdk/google | 3.0.26 | 3.0.29 | 3.0.29 |
| @ai-sdk/react | 3.0.84 | 3.0.88 | 3.0.88 |
| @remotion/cli | 4.0.421 | 4.0.423 | 4.0.423 |
| @sentry/nextjs | 10.38.0 | 10.39.0 | 10.39.0 |
| @serwist/next | 9.5.5 | 9.5.6 | 9.5.6 |
| @typescript-eslint/eslint-plugin | 8.55.0 | 8.55.0 | 8.56.0 |
| @typescript-eslint/parser | 8.55.0 | 8.55.0 | 8.56.0 |
| ai | 6.0.82 | 6.0.86 | 6.0.86 |
| dotenv | 17.2.4 | 17.3.1 | 17.3.1 |
| jsdom | 28.0.0 | 28.1.0 | 28.1.0 |
| lucide-react | 0.563.0 | 0.563.0 | 0.568.0 |
| remotion | 4.0.421 | 4.0.423 | 4.0.423 |
| serwist | 9.5.5 | 9.5.6 | 9.5.6 |
| tailwind-merge | 3.4.0 | 3.4.1 | 3.4.1 |
| turbo | 2.8.7 | 2.8.9 | 2.8.9 |
| typedoc | 0.28.16 | 0.28.17 | 0.28.17 |

---
*Report generated automatically.*
