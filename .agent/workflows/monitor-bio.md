---
description: "Workflow for monitor-bio"
command: "/monitor-bio"
category: "monitoring"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@titan-coach"
domain: "bio"
---
# Bio Integration Monitoring Workflow

This workflow audits the health of bio-integrations (Intervals.icu, Hevy) including Zod validation, API endpoints, and error handling.

## 1. External API Endpoints
List all external API URLs being called.

```bash
## Find all external API URLs
rg "https://" src/lib/hevy.ts src/lib/intervals.ts src/services/bio/
```

## 2. Zod Schema Coverage
Verify that API responses are validated with Zod.

```bash
## Check for Zod validation usage
rg "safeParse|\.parse\(" src/lib/hevy.ts src/lib/intervals.ts

## List all Zod schemas defined
rg "z\.object|z\.array|Schema\s*=" src/lib/hevy.ts src/lib/intervals.ts
```

## 3. Error Handling Audit
Find catch blocks and ensure errors are properly handled.

```bash
## Find catch blocks
rg "catch\s*\(" src/lib/hevy.ts src/lib/intervals.ts src/services/bio/

## Find throw statements (should exist in catch blocks)
rg "throw new Error|throw error" src/lib/hevy.ts src/lib/intervals.ts
```

## 4. Bio-Specific TODOs
List unfinished bio integration work.

```bash
rg "TODO|FIXME" src/lib/hevy.ts src/lib/intervals.ts src/services/bio/
```

## 5. Recovery Service Thresholds
Audit recovery logic thresholds and fatigue calculations.

```bash
## Find threshold definitions
rg "threshold|fatigue|recovery|hrv|readiness" src/services/bio/RecoveryService.ts
```

## 6. API Key Handling
Verify API keys are handled securely.

```bash
## Find API key references (ensure no hardcoded keys)
rg "apiKey|api_key|API_KEY" src/lib/hevy.ts src/lib/intervals.ts
```
- **Config**: Add `rg` (ripgrep) to `.agent/config.json`.


## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata