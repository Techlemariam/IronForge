---
description: "Delegate tasks from Antigravity to Jules for async autonomous execution"
command: "/jules-handoff"
category: "execution"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "meta"
skills: ["remote-trigger"]
flags:
  - "--dry-run"
  - "--api-only"
  - "--bridge-only"
---

# 🤖 Jules Handoff

**Role:** Antigravity → Jules delegation bridge.
**Goal:** Prepare, validate, and dispatch well-scoped tasks to Google Jules for autonomous async execution.

---

## Prerequisites

- **Jules API Key** in Doppler (`JULES_API_KEY`) OR Jules Bridge VS Code extension installed
- Clean git state (no uncommitted changes)
- Task must be isolated and well-scoped

---

## Usage

```text
/jules-handoff [task-source] [task-id]
/jules-handoff debt D-12          # Delegate a specific debt item
/jules-handoff sprint S-03        # Delegate a sprint task
/jules-handoff roadmap R-05       # Delegate a roadmap feature
/jules-handoff prompt "Write unit tests for TitanService"
```

---

## Tier 1 Templates (Ready to Dispatch)

> Use pre-built templates instead of writing prompts from scratch.
> Located in `.agent/jules/templates/` — see [README](../jules/templates/README.md).

| Template | Command | Input needed |
| :--- | :--- | :--- |
| `cleanup.md` | `/cleanup` | `[TARGET_FILE]` |
| `debt-attack.md` | `/debt-attack` | `[DEBT_ID]` |
| `unit-tests.md` | `/unit-tests` | `[TARGET_SOURCE_FILE]` |
| `polish.md` | `/polish` | None — fully autonomous |
| `autonomous-gardener.md` | `/autonomous-gardener` | None — fully autonomous |
| `spec.md` | `/spec` | `[FEATURE_NAME]`, `[FEATURE_ID]` |

```bash
# Quick dispatch using a template:
cp .agent/jules/templates/debt-attack.md .agent/jules/pending/D-12.md
# Edit pending/D-12.md: set [DEBT_ID] = D-12
# Then: /jules-handoff prompt ".agent/jules/pending/D-12.md"
```

---

## Step 1: Validate Delegation Eligibility

### 1.1 Git State Check

// turbo

```bash
# Must be clean
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Working directory not clean. Commit or stash changes first."
  exit 1
fi
```

### 1.2 Task Resolution

Resolve the task from source files:

| Source | File | Lookup |
| :--- | :--- | :--- |
| `debt` | `DEBT.md` | Match by ID (e.g., `D-12`) |
| `sprint` | `.agent/sprints/current.md` | Match by ID (e.g., `S-03`) |
| `roadmap` | `roadmap.md` | Match by ID (e.g., `R-05`) |
| `prompt` | N/A | Free-text prompt (skip lookup) |

**Extract:**

- Task title/description
- Referenced files
- Priority level
- Acceptance criteria (if documented)

### 1.3 Scope Guard

**REJECT** the delegation if:

1. Task touches > 5 files across > 2 directories (too sprawling)
2. Task involves database migrations (requires human review)
3. Task modifies auth/security logic (requires `/security` review)
4. Task changes CI/CD configuration (requires `/infrastructure` review)

> [!CAUTION]
> Jules works best on **isolated, well-defined** tasks. If scope guard rejects, consider splitting the task first.

### 1.4 Conflict Check (via claim-task logic)

// turbo

```bash
# Check for overlapping branches/PRs
gh pr list --state open --json headRefName,files --jq '.[].files[].path' 2>/dev/null
git branch -r --list 'origin/feat/*' 'origin/fix/*' 'origin/chore/*'
```

Cross-reference PR/branch file paths against the task's referenced files.
**IF OVERLAP**: Warn and ask for confirmation before proceeding.

---

## Step 2: Build Jules Context Package

### 2.1 Gather Context

Assemble a context package from available artifacts:

```text
CONTEXT_PACKAGE:
├── git_diff      → `git diff HEAD~5..HEAD -- [relevant-files]`
├── file_outlines → File outlines of files Jules will modify
├── task_spec     → Extracted task description + acceptance criteria
├── architecture  → Relevant section from ARCHITECTURE.md
├── conventions   → Key coding conventions (from .eslintrc, tsconfig)
└── test_patterns → Example test file from same module
```

### 2.2 Generate Jules Prompt

Build a structured prompt using this template:

```markdown
## Task
[Task title from source]

## Context
[Architecture context, relevant patterns]

## Files to Modify
[List of files with brief description of needed changes]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] All existing tests pass (`pnpm test`)
- [ ] No new TypeScript errors (`pnpm typecheck`)
- [ ] ESLint clean (`pnpm lint`)

## Constraints
- Follow existing patterns in the codebase
- Use Zod for all new validation schemas
- Prefer composition over inheritance
- Keep changes minimal and focused

## Reference Files
[Inline key reference files or file outlines for context]
```

---

## Step 3: Dispatch to Jules

### Option A: Jules Bridge (VS Code Extension)

1. Save the prompt to `.agent/jules/pending/[task-id].md`
2. Instruct user: **"Open Jules Bridge in VS Code and select the pending task"**
3. Jules Bridge reads git state + prompt and creates the session

### Option B: Jules API (if `JULES_API_KEY` available)

```bash
# Create Jules session via API
doppler run --project ironforge --config dev -- \
  curl -X POST https://jules.google.com/api/v1alpha/sessions \
  -H "Authorization: Bearer $JULES_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "Techlemariam/IronForge",
    "branch": "jules/[task-id]",
    "prompt": "[generated-prompt]",
    "context": {
      "files": ["[relevant-file-paths]"]
    }
  }'
```

Store the session ID from the response.

---

## Step 4: Track Delegation

### 4.1 Mark in Source File

Update the source file with a Jules delegation marker:

```diff
- [ ] [D-12] Remove deprecated HeveService methods
+ [🤖] [D-12] Remove deprecated HeveService methods → Jules (#session-id)
```

### 4.2 Create Tracking Entry

Write to `.agent/jules/active.json`:

```json
{
  "sessions": [
    {
      "id": "[session-id]",
      "task_id": "D-12",
      "source": "debt",
      "dispatched_at": "2026-03-04T22:00:00Z",
      "status": "pending",
      "branch": "jules/D-12-hevy-cleanup"
    }
  ]
}
```

### 4.3 Notify

```text
✅ Task [D-12] dispatched to Jules
   Session: #[session-id]
   Branch:  jules/D-12-hevy-cleanup
   Status:  Pending

   📡 Monitor: /jules-status D-12
   🔄 When complete: Jules will create a PR for review
```

---

## Step 5: Post-Completion (When Jules PR arrives)

When Jules completes work and opens a PR:

1. **Auto-label** the PR: `jules`, `automated`
2. **Run** `/qa` on the PR branch for validation
3. **Run** `/gatekeeper` for lint/type/test checks
4. **Request review** from appropriate agent (`@coder` or `@manager`)
5. **Update** source file: `[🤖]` → `[x]` on merge

---

## Integration Points

| Workflow | Integration |
| :--- | :--- |
| `/claim-task` | Check Jules active sessions before claiming |
| `/night-shift` | Optional: delegate safe debt items to Jules |
| `/debt-attack` | Alternative: dispatch to Jules instead of local fix |
| `/pre-pr` | Jules PRs go through same validation pipeline |
| `/qa` | Auto-triggered on Jules PR branches |

---

## Version History

### 1.0.0 (2026-03-04)

- Initial release
- Support for debt, sprint, roadmap, and free-text task delegation
- Dual dispatch: Jules Bridge (VS Code) and Jules API
- Scope guard + conflict check safety rails
- Tracking via `.agent/jules/active.json`
