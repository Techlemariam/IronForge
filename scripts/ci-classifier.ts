#!/usr/bin/env npx tsx
/**
 * CI Error Classifier v3.0
 *
 * Automatically classifies CI failure logs into known categories
 * based on pattern matching from 26+ historical failures.
 * Outputs structured JSON for the repair engine or formatted text for humans.
 *
 * Usage:
 *   npx tsx scripts/ci-classifier.ts <log-file>
 *   npx tsx scripts/ci-classifier.ts --stdin
 *   npx tsx scripts/ci-classifier.ts --stdin --json
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Risk = 'LOW' | 'MEDIUM' | 'HIGH';
type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';

interface ErrorPattern {
    pattern: RegExp;
    description: string;
    solution: string;
    autoFixable: boolean;
    risk: Risk;
    protocol: string; // maps to repair-protocols.ts
}

export interface ClassificationResult {
    category: string;
    confidence: Confidence;
    description: string;
    solution: string;
    matchedText: string;
    autoFixable: boolean;
    risk: Risk;
    protocol: string;
}

// ---------------------------------------------------------------------------
// Pattern definitions — synced with ci-doctor.md Classification Matrix
// ---------------------------------------------------------------------------

const ERROR_PATTERNS: Record<string, ErrorPattern> = {
    // ── E2E / Playwright ────────────────────────────────────────────────
    RACE_CONDITION: {
        pattern: /mock.*after.*mount|useEffect.*async|addInitScript.*after.*goto|__mock.*undefined.*render/i,
        description: 'Mock injected after component mounted',
        solution: 'Use addInitScript BEFORE page.goto(). Use lazy state initialization in hooks.',
        autoFixable: false,
        risk: 'MEDIUM',
        protocol: 'MOVE_MOCK_TO_INIT_SCRIPT',
    },

    SELECTOR_TIMEOUT: {
        pattern: /timeout.*waiting.*selector|locator.*toBeVisible.*timeout|expect.*toBeVisible.*timeout/i,
        description: 'Element selector timed out',
        solution: 'Add data-testid to component. Use waitForSelector with 15s timeout.',
        autoFixable: false,
        risk: 'MEDIUM',
        protocol: 'ADD_DATA_TESTID',
    },

    // ── Runtime Errors ──────────────────────────────────────────────────
    TYPE_ERROR: {
        pattern: /TypeError|ReferenceError|Cannot read propert|is not a function|is not defined/i,
        description: 'JavaScript/TypeScript runtime error',
        solution: 'Run pnpm check-types. Check for null/undefined access patterns.',
        autoFixable: true,
        risk: 'LOW',
        protocol: 'RUN_TYPE_CHECK',
    },

    SYNTAX_ERROR: {
        pattern: /SyntaxError|Unexpected token|Declaration.*expected|',' expected/i,
        description: 'JavaScript syntax error',
        solution: 'Run pnpm lint --fix to catch and fix syntax issues.',
        autoFixable: true,
        risk: 'LOW',
        protocol: 'RUN_LINT_FIX',
    },

    // ── Network / Mock ──────────────────────────────────────────────────
    NETWORK_HANG: {
        pattern: /net::ERR|fetch failed|ECONNREFUSED|ETIMEDOUT|socket hang up/i,
        description: 'Network request failed or timed out',
        solution: 'Mock all external API calls in test setup via addInitScript.',
        autoFixable: false,
        risk: 'MEDIUM',
        protocol: 'ADD_NETWORK_MOCK',
    },

    MOCK_MISMATCH: {
        pattern: /__mock.*undefined|mock.*not defined|expected.*mock.*received.*undefined/i,
        description: 'Mock variable name mismatch',
        solution: 'Check tests/mocks/registry.ts for correct variable names.',
        autoFixable: false,
        risk: 'LOW',
        protocol: 'FIX_MOCK_REGISTRY',
    },

    STALE_MOCK: {
        pattern: /mock.*outdated|snapshot.*mismatch|obsolete.*fixture|toMatchSnapshot.*failed/i,
        description: 'Mock data or snapshot is outdated',
        solution: 'Update mock data to match current API responses. Run pnpm test -- -u for snapshots.',
        autoFixable: true,
        risk: 'LOW',
        protocol: 'UPDATE_SNAPSHOTS',
    },

    // ── Assertion ───────────────────────────────────────────────────────
    ASSERTION_MISMATCH: {
        pattern: /Expected.*Received|toBe.*received|toEqual.*received|AssertionError/i,
        description: 'Test assertion failed',
        solution: 'Verify mock data matches expected values. Check component renders expected state.',
        autoFixable: false,
        risk: 'MEDIUM',
        protocol: 'FIX_ASSERTION',
    },

    // ── Build ───────────────────────────────────────────────────────────
    BUILD_ERROR: {
        pattern: /Module not found|Cannot find module|Failed to compile|Build failed/i,
        description: 'Build/compilation error',
        solution: 'Run pnpm build locally. Check imports and module paths.',
        autoFixable: false,
        risk: 'HIGH',
        protocol: 'ANALYZE_BUILD',
    },

    ALIAS_MISSING: {
        pattern: /Module.*not found.*@\/|Cannot.*resolve.*@\/|Can't resolve '@\//i,
        description: 'Path alias @ not resolved (Storybook/Webpack)',
        solution: 'Verify @ alias in .storybook/main.ts webpackFinal config.',
        autoFixable: true,
        risk: 'LOW',
        protocol: 'FIX_ALIAS_CONFIG',
    },

    // ── Database / Prisma ───────────────────────────────────────────────
    PRISMA_ERROR: {
        pattern: /PrismaClient|prisma.*error|database.*connection refused/i,
        description: 'Prisma client or connection error',
        solution: 'Run npx prisma generate && npx prisma db push.',
        autoFixable: true,
        risk: 'MEDIUM',
        protocol: 'REGENERATE_PRISMA',
    },

    DB_MIGRATION_FAIL: {
        pattern: /migrate.*failed|migration.*error|drift.*detected|prisma migrate diff/i,
        description: 'Database migration failed or drift detected',
        solution: 'Run npx prisma migrate dev to create migration. Use /schema-guard.',
        autoFixable: true,
        risk: 'MEDIUM',
        protocol: 'FIX_MIGRATION_DRIFT',
    },

    DB_OUT_OF_SYNC: {
        pattern: /relation ".*" does not exist|column ".*" does not exist|table.*not found/i,
        description: 'Database schema out of sync with code',
        solution: 'Run npx prisma db push --force-reset in CI. Add ?schema=public to DATABASE_URL.',
        autoFixable: true,
        risk: 'MEDIUM',
        protocol: 'PUSH_SCHEMA',
    },

    POSTGRES_USER_MISMATCH: {
        pattern: /role "root" does not exist|pg_isready.*role|FATAL.*role.*does not exist/i,
        description: 'PostgreSQL user mismatch (root vs postgres)',
        solution: 'Use -U postgres in pg_isready health checks. Set POSTGRES_USER=postgres.',
        autoFixable: true,
        risk: 'LOW',
        protocol: 'FIX_PG_USER',
    },

    SERVICE_RACE_CONDITION: {
        pattern: /Connection timeout.*Prisma|ECONNREFUSED.*5432|Can't reach database/i,
        description: 'Database service not ready when Prisma connects',
        solution: 'Add health-check wait loop before prisma commands. Increase sleep or use pg_isready.',
        autoFixable: true,
        risk: 'LOW',
        protocol: 'ADD_SERVICE_WAIT',
    },

    // ── Schema Validation ───────────────────────────────────────────────
    SCHEMA_MISMATCH: {
        pattern: /ZodError|zod.*validation|expected.*received.*at path|invalid_type/i,
        description: 'Zod schema validation error',
        solution: 'Check Zod schema matches API response shape. Use /zod-schema-validator.',
        autoFixable: false,
        risk: 'MEDIUM',
        protocol: 'VALIDATE_ZOD_SCHEMA',
    },

    // ── Platform Compatibility ──────────────────────────────────────────
    PLATFORM_COMPATIBILITY: {
        pattern: /Join-Path|\\.*not found|backslash.*path|The term.*is not recognized/i,
        description: 'Windows/Linux path compatibility issue',
        solution: 'Use forward slashes (/) in all paths. Avoid Join-Path in cross-platform scripts.',
        autoFixable: true,
        risk: 'LOW',
        protocol: 'FIX_PATH_SEPARATORS',
    },

    // ── Security ────────────────────────────────────────────────────────
    SECURITY_BREACH: {
        pattern: /hardcoded.*password|secret.*exposed|api.key.*plain|credential.*leak/i,
        description: 'Hardcoded secret or credential exposure',
        solution: 'Replace with ${{ secrets.MY_KEY }} or env vars. Run git grep to verify.',
        autoFixable: false,
        risk: 'HIGH',
        protocol: 'ROTATE_SECRETS',
    },

    SECURE_INPUT_FAIL: {
        pattern: /path traversal|directory traversal|\.\.\/.*escape|unsanitized.*input/i,
        description: 'Potential path traversal or input sanitization issue',
        solution: 'Sanitize all user inputs. Use path.resolve and validate against allowlist.',
        autoFixable: false,
        risk: 'HIGH',
        protocol: 'SANITIZE_INPUT',
    },

    // ── Static Analysis / Quality ───────────────────────────────────────
    DRY_VIOLATION: {
        pattern: /duplicated code|Qodana.*duplicate|identical.*block.*found/i,
        description: 'Code duplication detected by static analysis',
        solution: 'Extract shared logic to src/lib/utils.ts or shared component.',
        autoFixable: false,
        risk: 'LOW',
        protocol: 'EXTRACT_SHARED_CODE',
    },

    STATIC_ANALYSIS_FAIL: {
        pattern: /Qodana.*critical|CodeFactor.*issue|static analysis.*fail/i,
        description: 'Static analysis tool found critical issues',
        solution: 'Review Qodana/CodeFactor report. Fix critical-level findings.',
        autoFixable: false,
        risk: 'MEDIUM',
        protocol: 'FIX_STATIC_ANALYSIS',
    },

    // ── Performance ─────────────────────────────────────────────────────
    PERF_DEGRADATION: {
        pattern: /lighthouse.*below|performance.*budget|LCP.*exceeded|CLS.*exceeded|bundle.*size.*exceeded/i,
        description: 'Performance regression detected',
        solution: 'Run /perf to profile. Check for large dependencies or unoptimized images.',
        autoFixable: false,
        risk: 'MEDIUM',
        protocol: 'ANALYZE_PERFORMANCE',
    },

    BUNDLE_BLOAT: {
        pattern: /gzip.*size.*increase|bundle.*too.*large|chunk.*exceeded.*limit/i,
        description: 'Bundle size exceeds threshold',
        solution: 'Run /bundle-analyzer. Check for lodash vs lodash-es, heavy icon imports.',
        autoFixable: false,
        risk: 'MEDIUM',
        protocol: 'ANALYZE_BUNDLE',
    },

    // ── Coverage & Visuals ──────────────────────────────────────────────
    COVERAGE_DROP: {
        pattern: /coverage.*below|patch coverage.*missing|insufficient.*coverage|codecov.*decrease/i,
        description: 'Test coverage dropped below threshold',
        solution: 'Write unit tests for new logic. Use /unit-tests to scaffold missing tests.',
        autoFixable: true,
        risk: 'LOW',
        protocol: 'GENERATE_TESTS',
    },

    VISUAL_REGRESSION: {
        pattern: /chromatic.*change|visual.*diff|storybook.*build.*fail|snapshot.*differ/i,
        description: 'Visual regression or Storybook build failure',
        solution: 'Run /storybook-bridge to validate stories. Accept or fix visual diffs.',
        autoFixable: false,
        risk: 'MEDIUM',
        protocol: 'FIX_VISUAL_REGRESSION',
    },

    // ── Accessibility ───────────────────────────────────────────────────
    ACCESSIBILITY_FAIL: {
        pattern: /axe.*violation|aria.*missing|contrast.*ratio.*fail|a11y.*error/i,
        description: 'Accessibility violation detected',
        solution: 'Run /a11y-auditor. Fix ARIA labels, contrast ratios, and keyboard nav.',
        autoFixable: false,
        risk: 'MEDIUM',
        protocol: 'FIX_ACCESSIBILITY',
    },

    // ── Deployment ──────────────────────────────────────────────────────
    COOLIFY_DOWN: {
        pattern: /coolify.*deploy.*fail|502 bad gateway|health.*check.*fail.*deploy/i,
        description: 'Coolify deployment or health check failure',
        solution: 'Check Coolify dashboard. Use /coolify-deploy to verify instance health.',
        autoFixable: false,
        risk: 'HIGH',
        protocol: 'CHECK_COOLIFY',
    },

    // ── Git / Merge ─────────────────────────────────────────────────────
    MERGE_CONFLICT: {
        pattern: /merge conflict|CONFLICT.*in|Automatic merge failed|needs merge/i,
        description: 'Merge conflicts detected',
        solution: 'Run git rebase origin/main. Resolve conflicts manually.',
        autoFixable: false,
        risk: 'MEDIUM',
        protocol: 'RESOLVE_CONFLICTS',
    },

    // ── Bio Integration ─────────────────────────────────────────────────
    BIO_SYNC_FAIL: {
        pattern: /intervals.*error|hevy.*sync.*fail|garmin.*timeout|strava.*api.*error/i,
        description: 'Bio-data integration sync failure',
        solution: 'Check API credentials. Use /bio-validator to diagnose sync issues.',
        autoFixable: false,
        risk: 'MEDIUM',
        protocol: 'VALIDATE_BIO_SYNC',
    },

    // ── Documentation ───────────────────────────────────────────────────
    DOCSTRING_FAIL: {
        pattern: /insufficient.*docstring|missing.*jsdoc|documentation.*required/i,
        description: 'Missing or insufficient documentation',
        solution: 'Use /doc-generator to auto-generate JSDoc/TSDoc comments.',
        autoFixable: true,
        risk: 'LOW',
        protocol: 'GENERATE_DOCS',
    },
};

// ---------------------------------------------------------------------------
// Classifier
// ---------------------------------------------------------------------------

export function classifyError(logContent: string): ClassificationResult[] {
    const results: ClassificationResult[] = [];

    for (const [category, config] of Object.entries(ERROR_PATTERNS)) {
        const match = logContent.match(config.pattern);
        if (match) {
            results.push({
                category,
                confidence: 'HIGH',
                description: config.description,
                solution: config.solution,
                matchedText: match[0].substring(0, 100),
                autoFixable: config.autoFixable,
                risk: config.risk,
                protocol: config.protocol,
            });
        }
    }

    if (results.length === 0) {
        results.push({
            category: 'UNKNOWN',
            confidence: 'LOW',
            description: 'Could not automatically classify this error',
            solution: 'Manual inspection required. Check /ci-doctor Phase 1 for classification table.',
            matchedText: '',
            autoFixable: false,
            risk: 'HIGH',
            protocol: 'MANUAL_INSPECTION',
        });
    }

    return results;
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function formatResults(results: ClassificationResult[]): string {
    let output = '\n╔══════════════════════════════════════════════════════════════╗\n';
    output += '║           🩺 CI DOCTOR - ERROR CLASSIFICATION (v3.0)         ║\n';
    output += '╚══════════════════════════════════════════════════════════════╝\n\n';

    const autoFixable = results.filter(r => r.autoFixable);
    const manual = results.filter(r => !r.autoFixable);

    if (autoFixable.length > 0) {
        output += '🔧 AUTO-FIXABLE:\n';
        output += '─'.repeat(60) + '\n';
        for (const result of autoFixable) {
            output += formatSingle(result);
        }
    }

    if (manual.length > 0) {
        output += '🔍 MANUAL REVIEW REQUIRED:\n';
        output += '─'.repeat(60) + '\n';
        for (const result of manual) {
            output += formatSingle(result);
        }
    }

    output += `\n📊 Summary: ${results.length} issue(s) found`;
    output += ` | ${autoFixable.length} auto-fixable`;
    output += ` | ${manual.length} manual\n`;

    return output;
}

function formatSingle(result: ClassificationResult): string {
    const riskIcon = result.risk === 'HIGH' ? '🔴' : result.risk === 'MEDIUM' ? '🟡' : '🟢';
    let out = '';
    out += `  ${riskIcon} ${result.category} [${result.risk}]\n`;
    out += `     ${result.description}\n`;
    if (result.matchedText) {
        out += `     Matched: "${result.matchedText}"\n`;
    }
    out += `     Fix: ${result.solution}\n`;
    out += `     Protocol: ${result.protocol}\n\n`;
    return out;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
    const args = process.argv.slice(2);
    const jsonMode = args.includes('--json');
    const filteredArgs = args.filter(a => a !== '--json');

    if (filteredArgs.length === 0) {
        console.log('Usage: npx tsx scripts/ci-classifier.ts <log-file> [--json]');
        console.log('       npx tsx scripts/ci-classifier.ts --stdin [--json]');
        process.exit(1);
    }

    let logContent: string;

    if (filteredArgs[0] === '--stdin') {
        logContent = fs.readFileSync(0, 'utf-8');
    } else {
        const logFile = path.resolve(filteredArgs[0]);
        if (!fs.existsSync(logFile)) {
            console.error(`Error: File not found: ${logFile}`);
            process.exit(1);
        }
        logContent = fs.readFileSync(logFile, 'utf-8');
    }

    const results = classifyError(logContent);

    if (jsonMode) {
        console.log(JSON.stringify(results, null, 2));
    } else {
        console.log(formatResults(results));
    }

    if (results.length === 1 && results[0].category === 'UNKNOWN') {
        process.exit(1);
    }
}

main();
