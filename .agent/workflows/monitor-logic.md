---
description: "Workflow for monitor-logic"
command: "/monitor-logic"
category: "monitoring"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@architect"
domain: "core"
---
# Logic Gap Monitoring

This workflow aggregates tools to identify "holes" in the codebase: missing types, unfinished implementations, silent failures, and untested code.

## 1. Safety Gaps (Type Analysis)
Identify places where type safety is bypassed, potentially hiding logic errors.

```bash
## Find usage of 'any' (Manual bypass of type system)
rg ": any|as any" src/

## Find TypeScript suppressions
rg "@ts-ignore|@ts-expect-error" src/
```
- **Config**: Add `rg` (ripgrep) to `.agent/config.json` if missing.

## 2. Implementation Gaps (Todos)
Find explicit markers of unfinished logic or pending fixes.

```bash
## List all TODOs and FIXMEs
rg "TODO|FIXME" src/
```

## 3. Resilience Gaps (Silent Failures)
Find catch blocks that might be swallowing non-trivial errors.

```bash
## Regex to find empty or near-empty catch blocks (requires multiline search supported by some shells or manual review)
## This simple grep finds 'catch' followed by empty braces on the same line:
rg "catch\s*\(\w+\)\s*\{\s*\}" src/
```

## 4. Verification Gaps (Coverage)
Check which parts of the codebase lack test coverage.

```bash
## Run coverage and show summary
npm run test:coverage
```

## 5. Game Data Integrity (Optional)
If you are working on game features, checks for missing data definitions.

```bash
## Example: Find items missing descriptions (if stored in JSON/TS objects)
rg "description:\s*\"\"" src/lib/game
```


## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata