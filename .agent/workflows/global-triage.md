# 🌐 Workflow: Global Brotherhood Triage (v1.1.0)

This workflow provides a high-level operational overview of the Brotherhood ecosystem.

## 🏁 Purpose
- Real-time visibility into branch status, dirty/clean states, and project health.
- Alignment on active domains and ChatId ownership to prevent conflicts.

## 🛠️ Execution Steps

1. **Run Global Triage**:
   `powershell
   pwsh c:\Users\alexa\Workspaces\git-status-all.ps1
   `

2. **Verify Branch Guard**:
   Before starting work, ensure you are in the correct worktree and have "claimed" the session:
   `powershell
   pwsh c:\Users\alexa\Workspaces\verify-branch-guard.ps1 -ExpectedChatId "YOUR_CHAT_ID"
   `

3. **Update Dashboard**:
   After a task or domain switch, update your status:
   `powershell
   pwsh c:\Users\alexa\Workspaces\update-agent-status.ps1 -Domain "YOUR_DOMAIN" -Health "pass" -ChatId "YOUR_CHAT_ID"
   `

## 📊 Dashboard Reference
The dashboard is maintained at: c:\Users\alexa\Workspaces\BROTHERHOOD.md

---
*Brotherhood Operational Maturity - 10/10 Standardization*
