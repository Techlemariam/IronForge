# Rule: Shared Workspace Protocol

This rule defines how Gemini Brotherhood agents must operate within the shared technical environment (local workspace, git branches, and locks) to prevent state conflict and work loss between different active chats.

## 1. Branch Awareness & Coordination

- **Check Current Branch**: Every session MUST start by verifying the active git branch (`git branch --show-current`).
- **Communicate Context**: If you discover you are on a different branch than expected (due to another chat switching it), notify the user immediately before proceeding.
- **Switching Branches**: Only switch branches when explicitly part of the task. Use `/switch-branch` or manual git commands with caution.

## 2. Persistence First (Anti-Regression)

- **Push Often**: Do not keep large changes locally for long. Commit and push to the remote feature branch frequently to ensure 'moln-stabilitet' (cloud stability).
- **Reflog Recovery**: If local changes seem lost, check `git reflog` to recover orphaned commits.

## 3. Git Lock Management

- **Lock Detection**: If a git command fails with a `.lock` error (e.g., `index.lock` or `config.lock`), investigate if another agent is currently running a command.
- **Safe Cleanup**: On Windows/PowerShell, clear locks using:

  ```powershell
  if (Test-Path .git/index.lock) { rm .git/index.lock -Force }
  ```

- **Concurrency**: Avoid running long-running git operations in parallel across different terminals if possible.

## 4. Federated Alignment

- **Shared State**: Remember that the filesystem is a shared resource. Files like `task.md` or `.agent/tasks/current.md` might be modified by other agents.
- **Conflict Resolution**: If a file you are editing has changed externally, re-read it before applying your changes.

## 5. Optimal PNPM Commands for Autonomous Flows

To ensure efficiency and stability in autonomous/headless environments:

- **Strict Installation**: Use the standardized agent script to prevent lockfile changes.

  ```powershell
  pnpm run agent:install
  ```

- **Recursive Execution**: Run commands across all workspace packages.
  - `pnpm -r run build` (sequentially respects dependencies)
  - `pnpm -r --parallel run build` (maximum speed for independent tasks)
- **Filtered Actions**: Target specific areas to save time/resources.
  - `pnpm --filter ./mcp/* run test`
- **Ghost Dependency Check**: Use `pnpm list --depth 0` regularly to verify workspace health.
- **Store Pruning**: Use the standardized agent script to clear unused content.

  ```powershell
  pnpm run agent:clean
  ```

## 6. Achieving 10/10: God-Mode Automation

To elevate this environment from 'Stable' to 'Radical Independence':

1. **Pre-Flight Validation**: Always run `infra:check` or equivalent before major operations.
2. **Strict PR Hygiene**: Every push should trigger the `/gatekeeper` to prevent CI back-and-forth.
3. **Ghost Dependency Guard**: pnpm workspaces must never have dependencies in packages that aren't declared in the root or package-level `package.json`.
4. **Lockfile as Truth**: Never `pnpm install` without `--frozen-lockfile` in automated scripts to prevent "phantom config drift".
5. **Zero-Touch Auth**: Ensure GitHub tokens and API keys are loaded via `.env` with no interactive prompts.
