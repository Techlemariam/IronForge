# 🌐 Workflow: Global Brotherhood Triage

This workflow is designed to give a high-level overview of all projects in the workspace and help the agent/user decide where to focus.

## 🏁 Purpose
- Get a "birds-eye view" of all git repositories.
- Identify which projects have uncommitted changes or are out of sync with remote.
- Facilitate switching between projects using standard domain sessions.

## 🛠️ Execution Steps

1. **Run Global Status**:
   Execute the global status script to see the state of all projects.
   ```powershell
   pwsh c:\Users\alexa\Workspaces\git-status-all.ps1
   ```

2. **Analyze Output**:
   - Identify **DIRTY** projects that need attention.
   - Check for **Ahead/Behind** status to ensure code is pushed/pulled.
   - Look for specific files changed to guess the current "context" of work.

3. **Provide Recommendation**:
   Based on the status, suggest the next step.
   - Example: *"Ligan is DIRTY with 5 files changed. Should we continue there?"*
   - Example: *"IronForge is behind remote. Should we pull and sync?"*

4. **Context Switch**:
   Once a project is chosen, the agent should:
   - Navigate to the project directory.
   - Run the relevant `/domain-session`.

## 📢 Output format
When this workflow is invoked, the agent should present a summary table of the triage results.

| Project | Branch | Status | Remote |
| :--- | :--- | :--- | :--- |
| <NAME> | <BRANCH> | <CLEAN/DIRTY> | <AHEAD/BEHIND> |

---
*Standardization v1.0.0*
