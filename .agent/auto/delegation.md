# Auto-Delegation Rules

## The Autonomous Forge Protocol (15/10)

When user provides a sprint goal, Manager follows this sequence:

```
[USER] → "Implementera X"
    ↓
[MANAGER] → Creates sprint in active.json
    ↓
[/analyst] → Defines requirements → task.md
    ↓
[/architect] → Creates plan → implementation_plan.md
    ↓ (User approval)
[/coder] → Implements → code changes
    ↓
[/qa] → Verifies → walkthrough.md
    ↓
[COMPLETE] → Sprint archived to history/
```

## Trigger Rules

| Phase Complete | Next Action |
|:---------------|:------------|
| Analyst done | Delegate to `/architect` |
| Architect done | Request user approval of plan |
| Coder done | Delegate to `/qa` |
| QA passes | Archive sprint, notify user |
| QA fails | Return to `/coder` with errors |

## Sprint Commands
- **Start:** `/manager new sprint: [goal]`
- **Status:** `/manager sprint status`
- **Skip phase:** `/manager skip [phase]`
