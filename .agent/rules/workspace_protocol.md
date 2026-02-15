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
