---
name: error-analyzer
description: Stack trace parsing, log analysis, and root cause identification
version: 1.0.0
category: debugging
owner: "@debug"
platforms: ["windows", "linux", "macos"]
requires: []
context:
  primarySources:
    - debug-storybook.log
    - .next/server/
  references:
    - docs/TROUBLESHOOTING.md
  patterns:
    - "*.log"
    - "error"
rules:
  - "Parse stack traces to identify file and line"
  - "Classify errors by type (syntax, runtime, network)"
  - "Suggest fixes based on error patterns"
  - "Check for known issues in DEBT.md"
---

# 🔍 Error Analyzer

Systematic error analysis for build, test, and runtime failures.

## Capabilities

- **Stack Trace Parser**: Extract file, line, and function from errors
- **Error Classifier**: Categorize by type (TypeScript, ESLint, Runtime)
- **Pattern Matcher**: Identify known error patterns and their fixes
- **Log Aggregator**: Parse multiple log files for related errors

## Usage

```powershell
# Analyze a specific error
@debug Analyze this error: [paste error]

# Parse log file
@debug Parse errors from debug-storybook.log

# Find root cause
@debug Why is the build failing?
```

## Error Categories

| Category | Examples |
|:---------|:---------|
| **Syntax** | Missing semicolon, unexpected token |
| **Type** | Property does not exist, type mismatch |
| **Import** | Module not found, circular dependency |
| **Runtime** | Cannot read undefined, null reference |
| **Network** | Fetch failed, timeout, CORS |

## Integration

- **`debug.md`**: Primary workflow
- **`ci-doctor.md`**: CI failure analysis
