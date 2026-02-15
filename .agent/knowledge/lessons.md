# Factory Lessons Learned

This document serves as a "Knowledge Base" for the IronForge Factory. By indexing errors and their solutions, we prevent regressions and improve future code generation quality.

## Error Log

| Date | Category | Error | Root Cause | Fix/Lesson |
| :--- | :--- | :--- | :--- | :--- |
| 2026-02-13 | **Schema** | `Object literal may only specify known properties, and 'defender' does not exist` | Missing relation in `TerritoryContest` model for the defender guild. | Always define explicit `@relation` for both sides of a contest/matchup in Prisma. |
| 2026-02-13 | **Config** | `remotion.config.ts` escaping error | Backslashes in paths (Windows) must be escaped (e.g., `\\`). | Use `path.join` or escape backslashes in config files. |
| 2026-02-13 | **Patterns** | `Date.prototype.getWeek` is not a function | Extending native prototypes is not type-safe in TypeScript without declarations. | Use `getISOWeek` from `date-fns` instead of prototype pollution. |
| 2026-02-13 | **Logic** | `this.getISOWeek(now)` in static method | Calling imported functions as if they were class methods. | Use the imported function directly. |

## Strategy for Avoidance

- **Librarian indexing**: Every `/pre-pr` or `/factory ship` should run a check for new "lessons" to add here.
- **Spec Validation**: Acceptance Criteria in `specs/` should now explicitly mention checking for these common patterns.
