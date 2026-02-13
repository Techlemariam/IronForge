# Daily Briefing - Night Shift Maintenance (2026-02-13)

## Security Audit
No high-severity vulnerabilities were found.
(Note: 1 low and 2 moderate vulnerabilities were detected, but the audit level was set to 'high'.)

## Codebase Audit
The codebase audit script encountered issues with the `Select-String` command, specifically regarding the `-Recurse` parameter, leading to incomplete results for logic and safety gaps.

### Summary
- **Source Files:** 563
- **Story Files:** 126
- **Missing Tests:** 563 (All source files are missing corresponding test files)
- **Missing Documentation:** 563 (All source files are missing corresponding README.md in their directories)
- **Logic Gaps (TODO/FIXME):** Incomplete (due to `Select-String` error)
- **Type Safety Bypasses (: any|as any|@ts-ignore):** Incomplete (due to `Select-String` error)
- **Workflow Issues (missing schema definitions):** 62

### Workflows Requiring Attention (missing schema definitions)
- analyst.md
- architect.md
- autonomous-gardener.md
- autonomous-sim.md
- ci-doctor.md
- claim-task.md
- cleanup.md
- coder.md
- debt-attack.md
- debug.md
- deploy.md
- domain-session.md
- e2e-safety.md
- evolve.md
- feature.md
- game-designer.md
- git-hygiene.md
- GRAPH.md
- health-check.md
- idea.md
- INDEX.md
- infrastructure.md
- librarian.md
- MANUAL.md
- METADATA.md
- monitor-all.md
- monitor-bio.md
- monitor-ci.md
- monitor-db.md
- monitor-debt.md
- monitor-deploy.md
- monitor-game.md
- monitor-growth.md
- monitor-logic.md
- monitor-strategy.md
- monitor-tests.md
- monitor-ui.md
- night-shift-permissions.md
- night-shift.md
- perf.md
- platform.md
- polish.md
- pre-deploy.md
- pre-pr.md
- qa.md
- rollback.md
- schema.md
- security.md
- spec.md
- sprint-auto.md
- sprint-plan.md
- startup.md
- strategist.md
- stresstests.md
- switch-branch.md
- sync-project.md
- sync-roadmap.md
- titan-coach.md
- triage.md
- ui-ux.md
- unit-tests.md
- writer.md

## Outdated Dependencies
The following dependencies are outdated:

| Package               | Current Version | Wanted Version | Latest Version |
| :-------------------- | :-------------- | :------------- | :------------- |
| @ai-sdk/google        | 3.0.22          | 3.0.29         | 3.0.29         |
| @ai-sdk/react         | 3.0.79          | 3.0.87         | 3.0.87         |
| @capacitor/android    | 8.0.2           | 8.1.0          | 8.1.0          |
| @capacitor/cli        | 8.0.2           | 8.1.0          | 8.1.0          |
| @capacitor/core       | 8.0.2           | 8.1.0          | 8.1.0          |
| @chromatic-com/storybook | 5.0.0           | 5.0.1          | 5.0.1          |
| @google/genai         | 1.40.0          | 1.41.0         | 1.41.0         |
| @prisma/adapter-neon  | 7.3.0           | 7.4.0          | 7.4.0          |
| @prisma/adapter-pg    | 7.3.0           | 7.4.0          | 7.4.0          |
| @prisma/client        | 7.3.0           | 7.4.0          | 7.4.0          |
| @storybook/addon-a11y | 10.2.7          | 10.2.8         | 10.2.8         |
| @storybook/addon-docs | 10.2.7          | 10.2.8         | 10.2.8         |
| @storybook/addon-onboarding | 10.2.7          | 10.2.8         | 10.2.8         |
| @storybook/addon-vitest | 10.2.7          | 10.2.8         | 10.2.8         |
| @storybook/nextjs-vite | 10.2.7          | 10.2.8         | 10.2.8         |
| @types/node           | 25.2.2          | 25.2.3         | 25.2.3         |
| @types/react          | 19.2.13         | 19.2.14        | 19.2.14        |
| @typescript-eslint/eslint-plugin | 8.54.0          | 8.55.0         | 8.55.0         |
| @typescript-eslint/parser | 8.54.0          | 8.55.0         | 8.55.0         |
| @vitejs/plugin-react  | 5.1.3           | 5.1.4          | 5.1.4          |
| ai                    | 6.0.77          | 6.0.85         | 6.0.85         |
| chromatic             | 15.0.0          | 15.1.0         | 15.1.0         |
| dotenv                | 17.2.4          | 17.3.1         | 17.3.1         |
| eslint-plugin-storybook | 10.2.7          | 10.2.8         | 10.2.8         |
| framer-motion         | 12.33.0         | 12.34.0        | 12.34.0        |
| maplibre-gl           | 5.17.0          | 5.18.0         | 5.18.0         |
| msw                   | 2.12.9          | 2.12.10        | 2.12.10        |
| pino                  | 10.3.0          | 10.3.1         | 10.3.1         |
| prisma                | 7.3.0           | 7.4.0          | 7.4.0          |
| react-dropzone        | 14.4.0          | 15.0.0         | 15.0.0         |
| storybook             | 10.2.7          | 10.2.8         | 10.2.8         |
| turbo                 | 2.8.3           | 2.8.7          | 2.8.7          |