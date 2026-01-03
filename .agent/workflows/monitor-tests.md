---
description: Monitor Test Execution & Reports
command: /monitor-tests
category: monitor
trigger: manual
---
# Test Monitoring Workflow

This workflow describes how to visualize and monitor test execution for both Unit (Vitest) and E2E (Playwright) suites.

## 1. Monitor Unit Tests (Vitest UI)
Start the Vitest UI to watch tests in real-time with a visual interface. Use this when refactoring or TDD-ing.

```bash
# Start Vitest UI
npx vitest --ui
```

## 2. View E2E Test Reports
If E2E tests fail on CI, download the report artifact and view it locally.

```bash
# View the last generated Playwright report
npx playwright show-report
```

## 3. Watch E2E Tests (Headed Mode)
Run E2E tests in headed mode to visually debug them as they execute.

```bash
# Run tests with browser window visible
npx playwright test --ui
```

## 4. Check Coverage Report
Generate and view code coverage statistics.

```bash
# Run coverage analysis
npm run test:coverage
```
