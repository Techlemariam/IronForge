---
description: "Workflow for domain-session"
command: "/domain-session"
category: "meta"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "meta"
---

# Domain Session Workflow

Start a focused development session for a specific domain of IronForge.

## Usage

```
/domain-session [domain]
```

**Domains:** `infra` | `game` | `sprint` | `qa` | `bio` | `business` | `api` | `meta`

---

## Step 1: Parse Domain & Load Context

Based on the domain argument, load relevant context:

| Domain     | Emoji | Primary Files                                                            | Workflows                                                                                         |
| ---------- | ----- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `infra`    | 🔧    | `.github/workflows/*`, `docker-compose.yml`, `next.config.ts`, `prisma/` | `/infrastructure`, `/pre-deploy`, `/deploy`, `/monitor-db`, `/triage`                             |
| `game`     | 🎮    | `src/services/progression*`, `src/actions/titan.ts`, `src/lib/game/*`    | `/game-designer`, `/architect`, `/coder`, `/writer`, `/monitor-game`, `/triage`                   |
| `sprint`   | 📋    | `.agent/sprints/current.md`, `roadmap.md`, `DEBT.md`                     | `/manager`, `/startup`, `/sprint-auto`, `/idea`, `/feature`, `/triage`                            |
| `qa`       | 🧪    | `tests/*`, `e2e/*`, `playwright.config.ts`                               | `/qa`, `/unit-tests`, `/stresstests`, `/ci-doctor`, `/monitor-tests`, `/monitor-logic`, `/triage` |
| `bio`      | 🧬    | `src/services/intervals*`, `src/services/hevy*`, `src/lib/bio-buffs*`    | `/titan-coach`, `/monitor-bio`, `/triage`                                                         |
| `business` | 💰    | `src/app/api/stripe/*`, `src/services/subscription*`, pricing configs    | `/analyst`, `/architect`, `/security`, `/idea`, `/strategist`, `/triage`                          |
| `api`      | 🔌    | `src/app/api/*`, `src/services/*`, external integrations                 | `/architect`, `/coder`, `/security`, `/platform`, `/triage`                                       |
| `meta`     | 🧠    | `.agent/workflows/*`, `GEMINI.md`, `.antigravityrules`                   | `/evolve`, `/librarian`, `/health-check`, `/triage`                                               |

// turbo
Run: `rg -l "" src/ --max-depth 2` to get a file overview if needed.

---

## Step 2: Load Domain-Specific Knowledge

1. Read `ARCHITECTURE.md` sections relevant to the domain
2. Check `knowledge/` for domain-specific nodes
3. Review `roadmap.md` for active items in this domain
4. Check `DEBT.md` for related technical debt

---

## Step 2.5: Load Domain Skills Bundle

Based on the domain, automatically load the relevant skills bundle:

| Domain | Bundle | Skills Activated |
|:-------|:-------|:-----------------|
| `infra` | [infrastructure](../skills/bundles/infrastructure.yaml) | coolify-deploy, prisma-migrator, env-validator, schema-guard |
| `game` | [titan-coach](../skills/bundles/titan-coach.yaml) | xp-calculator, balance-checker, combat-balancer |
| `sprint` | [feature-weaver](../skills/bundles/feature-weaver.yaml) | sprint-manager, sync-project, titan-slice-generator |
| `qa` | [quality-assurer](../skills/bundles/quality-assurer.yaml) | coverage-check, a11y-auditor, debt-scanner, gatekeeper |
| `bio` | [titan-coach](../skills/bundles/titan-coach.yaml) | bio-validator, titan-health |
| `business` | [guardian](../skills/bundles/guardian.yaml) | git-guard, gatekeeper, schema-guard, env-validator |
| `api` | [feature-weaver](../skills/bundles/feature-weaver.yaml) | titan-slice-generator, prisma-migrator |
| `meta` | [guardian](../skills/bundles/guardian.yaml) | git-guard, gatekeeper |

> **Skills are now active for this session.** Use them via:
>
> ```markdown
> > Execute Skill: [skill-name](.agent/skills/skill-name/SKILL.md)
> ```

---

## Step 3: Domain Status Brief

Present a brief summary:

```markdown
## [EMOJI] Domain Session: [DOMAIN_NAME]

### Active Roadmap Items

- [ ] Item 1
- [ ] Item 2

### Related Debt

- [ ] Debt item if any

### Unresolved Gaps (Domain Health)

- [ ] List any high-priority gaps found in recent monitor runs for this domain.
- **Tip:** Run `/triage [domain]` to check health for this domain specifically.

### Recent Changes

- Last 3 commits touching this domain

### Recommended Focus

Based on priority and dependencies, suggest what to work on.
```

---

## Step 4: Session Mode Selection

Ask the user:

> **What do you want to focus on in this session?**
>
> 1. 🆕 **New Feature** - Plan and implement something new
> 2. 🐛 **Bugfix/Debt** - Fix existing issues
> 3. 🎯 **Triage & Roadmap** - Audit gaps and update domain roadmap
> 4. 🔍 **Research** - Explore and understand the domain better
> 5. 📋 **Review** - Review and improve existing code

Based on selection, trigger appropriate sub-workflow.
**CRITICAL:** When starting the new workflow/task, the Task Name MUST be: `[DOMAIN] <Description>`

- Ny feature → `/feature [feature-name]`
- Bugfix → `/cleanup` → `/qa`
- Triage → `/triage` (filtered for this domain)
- Research → `/librarian`
- Review → `/qa` → `/polish`

---

## Step 5: Session Wrap-Up

Before ending the session:

### 5.0 Branch Validation

> **Execute Skill:** [git-guard](.agent/skills/git-guard/SKILL.md)

```bash
bash .agent/skills/git-guard/scripts/verify-branch.sh
```

> [!WARNING]
> **Direct pushes to `main` are blocked by pre-push hook.**
> If you haven't claimed this task via `/claim-task`, do so now to ensure proper coordination.

### 5.1 Update Documentation

1. Update `knowledge/` with any new insights
2. Update `DEBT.md` if new debt was discovered
3. Update `roadmap.md` if priorities changed

### 5.2 Commit Changes

**Pre-Commit Check:**

1. Verify you are NOT on `main`.
2. Verify you are on the branch you claimed.

```bash
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" = "main" ]; then
    echo "⛔ ERROR: You are on main. Switch to your feature branch!"
    exit 1
fi
```

Commit changes with domain-prefixed message: `[domain] description`

### 5.3 Run Gatekeeper (Local Verification)

Before pushing, you **MUST** run the gatekeeper locally to ensure quality and prevent CI failures.

```bash
/gatekeeper
```

> [!IMPORTANT]
> If gatekeeper fails, **DO NOT PUSH**. Fix the errors locally first.

### 5.4 Push & Create Pull Request

Once gatekeeper passes:

1. **Push** your branch: `git push origin [branch-name]`
2. **Create PR**:

   // turbo

   ```bash
   # Create PR
   pr_url=$(gh pr create --json url -q .url --draft \
     --title "[DOMAIN] $(git log -1 --pretty=%s)" \
     --body "## Summary

$(git log origin/main..HEAD --oneline)

## Domain

$(git rev-parse --abbrev-ref HEAD | cut -d'/' -f1)

## Verification

- [x] Gatekeeper passed locally
- [ ] CI checks pending
")

   echo "✅ PR created: $pr_url"

   ```

1. **Link to Project** (Execute Skill: [project-linker](.agent/skills/project-linker/SKILL.md)):

   ```powershell
   pwsh .agent/skills/project-linker/scripts/link-pr.ps1
   ```

2. **Monitor CI**: Ensure all checks pass on GitHub because **only CI-verified code can be merged**.

> [!TIP]
> Do NOT merge locally. Let the GitHub Pull Request process handle the merge to `main`.

---

## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
