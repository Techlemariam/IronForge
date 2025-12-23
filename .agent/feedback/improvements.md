# Prompt Improvement Suggestions

> Based on error patterns, these improvements should be added to agent prompts.

---

## `/coder`
- ✅ Added: CVP compliance reference
- ✅ Added: DEBT.md logging instruction
- 🔄 Consider: "If Prisma types fail, try type assertion as workaround"

## `/manager`
- ✅ Added: Memory Protocol
- ✅ Added: Handoff Protocol
- 🔄 Consider: "Review errors.log at session start"

## `/cleanup`
- ✅ Ready: Autonomous debt resolution
- 🔄 Consider: "Prioritize build-blocking items first"

---

## How to Apply
When a pattern emerges in `errors.log`:
1. Identify root cause
2. Add instruction to relevant workflow
3. Mark as Applied in errors.log
