# IronForge Codex Operating Policy

This policy governs the behavior, permissions, and validation steps for Codex and other AI agents operating within the IronForge repository under Panopticon coordination.

---

## 🔒 Safety Boundaries

### 1. Small Pull Requests (PRs) Only
* AI agents **MUST NOT** push directly to the `main` branch.
* All changes must be packaged into small, task-specific feature branches.
* Keep edits highly cohesive and minimal. Avoid sweeping refactors unless explicitly instructed.

### 2. Prohibited Work Scopes
Unless explicitly authorized by a dedicated, pre-approved issue, AI agents **MUST NOT**:
* Modify environment variables, Doppler configs, or database production secrets.
* Alter GitHub Actions workflows under `.github/workflows/` (restricted to `/infrastructure` agent role).
* Modify core host configs, tailscale setups, or runner environments.
* Integrate live external providers (e.g. Stripe checkout, Garmin OAuth production endpoints).

### 3. Secret & Data Leakage Prevention
* Never print or store API credentials, system environment logs, database connection URIs, private IPs, or provider payloads.
* All test runs must use local mocks or simulated database states.

---

## 🛠️ Operating Rules & Branch Protocol

1. **Task Claiming:** Read `task.md` or local roadmaps to identify tasks. Assign issues to yourself on GitHub before starting.
2. **Branch Naming:** Use descriptive names prefixing the category, e.g. `feat/panopticon-manifest` or `fix/e2e-seed-id`.
3. **Commit Messages:** Follow conventional commit guidelines (`feat:`, `fix:`, `docs:`, `chore:`).
4. **Pull Request Format:**
   * **Title:** Match task summary or issue name.
   * **Body Template:**
     ```markdown
     ## Purpose
     [Describe what change this PR introduces and why]

     ## Checklist
     - [ ] Local tests passed (`pnpm test`)
     - [ ] TypeScript types validated (`tsc --noEmit`)
     - [ ] Linting checked (`pnpm lint`)
     - [ ] Checked for secrets / credentials
     ```

---

## 🧪 Validation Checklist
Before submitting any changes, agents must verify that:
1. `pnpm test` executes successfully.
2. `tsc --noEmit` runs with zero compilation errors.
3. Git working directory has no unstaged files that were modified by accident.

---
*Aligns with: [docs/CODEX_AUTOMATIONS.md](file:///c:/Users/alexa/Workspaces/IronForge/docs/CODEX_AUTOMATIONS.md)*
*Related Trackers: #369, #370.*
