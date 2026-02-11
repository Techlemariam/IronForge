# 🧠 TITAN INTELLIGENCE: IronForge Core

> **Standard:** All operations must prioritize "Titan-Tier" quality and domain alignment.

## 🛡️ Error Recovery (Resilience Engineer)

**Trigger:** On any tool or workflow failure.

1. **Capture:** Extract error message, stack trace, and context.
2. **Log:** Update `.agent/feedback/errors.log`.
3. **Recover:**
   - **Build Error:** Trigger `/coder` with the error.
   - **Test Failure:** Trigger `/qa` for analysis.
   - **Bio-Sync Failure:** Trigger `/infrastructure` to check webhook/n8n status.
4. **Escalation:** If 3 attempts fail, save state to `.agent/memory/crash-dump.json`.

## 🧠 Neural Router (Domain-Aware Routing)

**Trigger:** On every prompt. Match context to IronForge specialists.

| Context / Keywords | System 1 (Fast) | System 2 (Deep) |
| :--- | :--- | :--- |
| `bio`, `hrv`, `sleep`, `recovery`, `oracle` | `/titan-coach` | `bio-validator` + `titan-health` |
| `combat`, `loot`, `xp`, `mobs`, `level` | `/game-designer` | `combat-balancer` + `xp-calculator` |
| `css`, `style`, `color`, `look`, `ui`, `titan-app` | `/ui-ux` | `/ui-ux-pro-max` (if feature/redesign) |
| `db`, `prisma`, `schema`, `migration` | `/schema` | `/architect` |
| `automation`, `webhook`, `n8n`, `coolify` | `/infrastructure` | `n8n-monitor` + `coolify-deploy` |
| `error`, `bug`, `broken` | `/debug` | `/qa` |

## 💡 Titan Proactivity (Domain Loops)

**Trigger:** On context/file focus change.

1. **Bio-Game Bridge:** If editing `src/services/oracle.ts` or bio-logic, ALWAYS suggest running `bio-validator`.
2. **Game Balance:** If modifying XP or combat stats, ALWAYS suggest `combat-balancer` or `xp-calculator`.
3. **Retention Loop:** If adding new features, suggest `hook-loop-designer` or `variable-reward-system`.
4. **Aesthetics Guard:** If in `src/app/(titan)`, suggest `/ui-ux-pro-max` for all UI modifications.
5. **Debt Scanner:** Suggest `/cleanup` if technical debt in the current domain is > 5 items.

## 📈 Quality Loop & Governance

- **Strict Compliance:** All code edits MUST be vetted by the `clean-code-pro` skill.
- **Security Guard:** All sensitive logic (Auth/API) MUST be vetted by the `red-team` skill.
- **Score:** Grade yourself on **Domain Alignment (1-10)** and **Scalability (1-10)**. Score < 9 requires internal correction.
