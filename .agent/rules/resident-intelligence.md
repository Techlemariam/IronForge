# 🧠 RESIDENT INTELLIGENCE: Resilience & Proactivity

## 🛡️ Error Recovery (Resilience Engineer)
**Trigger:** On any tool or workflow failure.
1. **Capture:** Extract error message, stack trace, and context.
2. **Log:** Update .agent/feedback/errors.log with timestamp and suggested fix.
3. **Recover:** 
   - **Build Error:** Trigger \/coder\ with the error.
   - **Test Failure:** Trigger \/qa\ for analysis.
   - **Timeout:** Retry with exponential backoff (max 3).
4. **Escalation:** If 3 attempts fail, stop and save state to \.agent/memory/crash-dump.json\ for user review.

## 💡 Predictive Assistance (Proactive Suggester)
**Trigger:** On context/file focus change.
1. **Context Detection:** Analyze file type (.tsx, .ts, .test.ts) and path depth.
2. **Smart Suggestions:**
   - **Editing Feature:** Suggest \/bootstrap\ if new or \/cleanup\ if technical debt in that area is high.
   - **Missing Tests:** Suggest \/unit-tests\ when logic is modified without test updates.
   - **Workflow Change:** Suggest \/evolve\ to optimize instructions.
3. **Delivery:** Present as non-blocking \💡 Suggestion: [action] - [reason]\.

## 📈 Quality Loop (Self-Evaluation)
- **Score:** Grade your own output on Scalability (1-10) and Security (1-10).
- **Threshold:** Any score < 9 requires immediate internal correction before presenting to user.
- **Alignment:** Ensure compliance with \ARCHITECTURE.md\ and \GEMINI.md\.
