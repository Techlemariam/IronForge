# 🧬 Evolution Report
**Analysis Period**: 2025-12-23 to 2025-12-25
**Generated**: 2025-12-25 00:27

---

## 📈 Metrics Summary

| Metric | Value |
|:-------|:------|
| Total Agent Executions | ~50 (estimated from conversation) |
| Success Rate | ~92% (few build/test failures resolved) |
| First-Try Success | ~75% (iterative fixes needed for mocks) |

---

## 🔍 Pattern Analysis

### Error Clustering

| Error Type | Frequency | Root Cause | Workflow |
|:-----------|:----------|:-----------|:---------|
| Mock type mismatch | 3 | Incorrect Prisma return types | `/qa` |
| Build failure | 2 | Missing imports, stale types | `/coder` |
| Async test failure | 2 | `getByText` vs `findByText` | `/qa` |
| Cypress binary | 1 | Environment, not code | `/qa` |

### Prompt Effectiveness

| Workflow | Issue | Suggestion |
|:---------|:------|:-----------|
| `/qa` | Mock return types often wrong on first try | Add rule: "Always check real function signature before mocking" |
| `/coder` | Sometimes forgets `prisma generate` | Add rule: "Run `npm run agent:types` after schema changes" |

---

## 🛠️ Improvement Suggestions

| Observation | Proposed Action | Priority |
|:------------|:----------------|:---------|
| Mock errors repeated 3x | Add mock template to `/qa` workflow | High |
| Prisma stale types 2x | Add `agent:types` check to `/coder` | High |
| Unused `/performance-coach` | Monitor usage; deprecate if unused in 30d | Low |
| `/health-check` has MCP reference | ✅ Already fixed | Resolved |

---

## 🗃️ Deprecation Candidates

| Workflow | Last Used | Recommendation |
|:---------|:----------|:---------------|
| `/performance-coach` | Never (in logs) | Monitor for 30 days |
| `/librarian` | Never (in logs) | Monitor for 30 days |
| `/refactor-tokens` | Never (in logs) | Consider merging into `/evolve` |

---

## 🧠 Self-Evaluation

| Dimension | Score | Notes |
|:----------|:-----:|:------|
| **Analysis Depth** | 7/10 | Limited by lack of execution history data |
| **Actionability** | 9/10 | Concrete, implementable suggestions |

---

## ✅ Next Steps (Auto-Apply Candidates)

1. Update `.agent/rules/ironforge-expert.md` to include mock template guidance.
2. Add `prisma generate` reminder to `/coder` workflow.
3. Archive unused workflows after 30-day monitoring.
