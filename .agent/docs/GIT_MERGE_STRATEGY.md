# IronForge Git Merge Protocol

**Status**: Active strategy for all development.

---

## 🛡️ Core Philosophy

1. **Main is Sacred**: logic on the `main` branch must *always* be deployable.
2. **Pull Request First**: No direct pushes to `main`. All changes must go through a PR.
3. **CI/CD Verification**: Code is only merged after automated tests, build, and lint checks pass in the cloud.
4. **Local Hygiene**: Developers must run `/gatekeeper` locally to catch issues *before* pushing, to save CI minutes and reduce noise.

---

## 🔄 The Protocol

### 1. Branching Strategy

Create focused branches for your units of work:

- `feat/[name]`: New features
- `fix/[name]`: Bug fixes
- `chore/[name]`: Maintenance, docs, configs
- `refactor/[name]`: Code restructuring without behavior changes

### 2. The Development Loop

1. **Claim**: Start your domain session or task.
2. **Code**: Implement your changes.
3. **Verify Locally (`/gatekeeper`)**:
    - **CRITICAL**: You MUST run `npm run gatekeeper` (or the `/gatekeeper` command) locally.
    - Fix any errors locally. Do not push broken code.
4. **Commit**: Use descriptive messages.
5. **Push**: Push your branch to origin.

### 3. The Merge Process

1. **Create Pull Request**:
    - Use GitHub CLI (`gh pr create`) or the Web UI.
    - Title should clearly describe the value (e.g., "feat: Add territory control service").
2. **CI/CD Checks**:
    - Wait for GitHub Actions to run.
    - Required checks: `Lint`, `Type Check`, `Unit Tests`, `Build`.
3. **Review & Merge**:
    - If CI passes: Merge the PR (Squash & Merge recommended for cleaner history).
    - If CI fails: Fix locally, push updates to the *same branch*, and wait for re-run.

### 4. Special Rules

#### 🔒 Session Isolation

- **Rule**: Each chat session works **exclusively** on its claimed task.
- **Why**: Prevents "pollution" of PRs with unrelated fixes (which makes review impossible).
- **Enforcement**:
  - Do not fix unrelated typos in other files.
  - Do not "just quickly fix" a bug you see in another module. Create a new task/branch instead.

#### ↩️ Context Restoration

- **Rule**: If you switch branches to check something (e.g., `git checkout main` to see latest state), you **MUST** switch back to your feature branch before ending the turn or pushing.
- **Why**: Prevents accidental commits to `main` or the wrong branch.

---

## 🚫 Forbidden Actions

- ❌ **Direct Push to Main**: This bypasses safety checks.
- ❌ **Merging Locally**: Do not run `git merge` into main locally and push. Let GitHub handle the merge.
- ❌ **Identifying as "Done" without CI**: A task is only done when the code is safe in `main`.

---

## 🛠️ CLI Reference

```bash
# 1. Verify locally
npm run gatekeeper

# 2. Push branch
git push origin feat/my-feature

# 3. Create PR
gh pr create --title "feat: My feature" --body "Description of changes..." --web
```
