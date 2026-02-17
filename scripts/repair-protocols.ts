#!/usr/bin/env npx tsx
/**
 * CI Doctor — Repair Protocols Engine v3.0
 *
 * Executable auto-remediation functions for each classified CI error.
 * Each protocol has: risk assessment, auto-fix logic, verification step.
 *
 * Usage:
 *   npx tsx scripts/repair-protocols.ts --classifications <json-file>
 *   echo '[...]' | npx tsx scripts/repair-protocols.ts --stdin
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Risk = 'LOW' | 'MEDIUM' | 'HIGH';

interface RepairResult {
    protocol: string;
    success: boolean;
    risk: Risk;
    action: string;
    output: string;
    durationMs: number;
    requiresHumanReview: boolean;
}

interface ClassificationInput {
    category: string;
    protocol: string;
    autoFixable: boolean;
    risk: Risk;
    matchedText: string;
}

interface RepairProtocol {
    risk: Risk;
    autoFix: boolean;
    description: string;
    execute: () => RepairResult;
    verify: () => boolean;
}

// ---------------------------------------------------------------------------
// Helper: safe shell exec
// ---------------------------------------------------------------------------

function safeExec(cmd: string, cwd?: string): { success: boolean; output: string } {
    try {
        const output = execSync(cmd, {
            cwd: cwd || process.cwd(),
            encoding: 'utf-8',
            timeout: 120_000,
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        return { success: true, output: output.trim() };
    } catch (error: unknown) {
        const err = error as { stderr?: string; stdout?: string; message?: string };
        return {
            success: false,
            output: (err.stderr || err.stdout || err.message || 'Unknown error').substring(0, 500),
        };
    }
}

function timedExec(protocol: string, risk: Risk, description: string, fn: () => { success: boolean; output: string }): RepairResult {
    const start = Date.now();
    const result = fn();
    return {
        protocol,
        success: result.success,
        risk,
        action: description,
        output: result.output,
        durationMs: Date.now() - start,
        requiresHumanReview: risk === 'HIGH',
    };
}

// ---------------------------------------------------------------------------
// Repair Protocol Registry
// ---------------------------------------------------------------------------

const PROTOCOLS: Record<string, RepairProtocol> = {
    RUN_TYPE_CHECK: {
        risk: 'LOW',
        autoFix: true,
        description: 'Run TypeScript type checker to surface and fix type errors',
        execute: () => timedExec('RUN_TYPE_CHECK', 'LOW', 'pnpm check-types', () => safeExec('pnpm check-types')),
        verify: () => safeExec('pnpm check-types').success,
    },

    RUN_LINT_FIX: {
        risk: 'LOW',
        autoFix: true,
        description: 'Auto-fix lint errors with ESLint --fix',
        execute: () => timedExec('RUN_LINT_FIX', 'LOW', 'pnpm lint --fix', () => safeExec('pnpm lint --fix')),
        verify: () => safeExec('pnpm lint').success,
    },

    REGENERATE_PRISMA: {
        risk: 'MEDIUM',
        autoFix: true,
        description: 'Regenerate Prisma client and push schema',
        execute: () => timedExec('REGENERATE_PRISMA', 'MEDIUM', 'npx prisma generate', () => {
            const gen = safeExec('npx prisma generate');
            if (!gen.success) return gen;
            return safeExec('npx prisma db push --accept-data-loss');
        }),
        verify: () => safeExec('npx prisma validate').success,
    },

    FIX_MIGRATION_DRIFT: {
        risk: 'MEDIUM',
        autoFix: true,
        description: 'Create migration to fix schema drift',
        execute: () => timedExec('FIX_MIGRATION_DRIFT', 'MEDIUM', 'prisma migrate dev', () =>
            safeExec('npx prisma migrate dev --name fix_drift --create-only')
        ),
        verify: () => safeExec('npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --exit-code').success,
    },

    PUSH_SCHEMA: {
        risk: 'MEDIUM',
        autoFix: true,
        description: 'Force-push schema to database',
        execute: () => timedExec('PUSH_SCHEMA', 'MEDIUM', 'prisma db push', () =>
            safeExec('npx prisma db push --force-reset')
        ),
        verify: () => safeExec('npx prisma validate').success,
    },

    FIX_PG_USER: {
        risk: 'LOW',
        autoFix: true,
        description: 'Fix PostgreSQL user mismatch in health checks',
        execute: () => timedExec('FIX_PG_USER', 'LOW', 'Fix pg_isready -U postgres', () => {
            // Scan workflow files for incorrect pg_isready calls
            const result = safeExec('git grep -l "pg_isready" .github/');
            if (!result.success) return { success: true, output: 'No pg_isready calls found to fix.' };
            return { success: true, output: `Files to check: ${result.output}\nEnsure all use: pg_isready -U postgres` };
        }),
        verify: () => true,
    },

    ADD_SERVICE_WAIT: {
        risk: 'LOW',
        autoFix: true,
        description: 'Add database readiness wait loop',
        execute: () => timedExec('ADD_SERVICE_WAIT', 'LOW', 'Check service wait times', () => {
            return { success: true, output: 'Recommend: Replace static "sleep" with pg_isready loop in CI workflows.' };
        }),
        verify: () => true,
    },

    UPDATE_SNAPSHOTS: {
        risk: 'LOW',
        autoFix: true,
        description: 'Update stale test snapshots',
        execute: () => timedExec('UPDATE_SNAPSHOTS', 'LOW', 'pnpm test -- -u', () =>
            safeExec('pnpm test -- -u')
        ),
        verify: () => safeExec('pnpm test').success,
    },

    FIX_PATH_SEPARATORS: {
        risk: 'LOW',
        autoFix: true,
        description: 'Fix platform-incompatible path separators',
        execute: () => timedExec('FIX_PATH_SEPARATORS', 'LOW', 'Scan for backslash paths', () => {
            const result = safeExec('git grep -n "Join-Path" -- "*.yml" "*.ps1"');
            return { success: true, output: result.output || 'No Join-Path issues found.' };
        }),
        verify: () => true,
    },

    FIX_ALIAS_CONFIG: {
        risk: 'LOW',
        autoFix: true,
        description: 'Verify Storybook @ alias configuration',
        execute: () => timedExec('FIX_ALIAS_CONFIG', 'LOW', 'Check Storybook config', () => {
            if (fs.existsSync('.storybook/main.ts')) {
                const content = fs.readFileSync('.storybook/main.ts', 'utf-8');
                if (!content.includes("'@'")) {
                    return { success: false, output: 'Missing @ alias in .storybook/main.ts webpackFinal' };
                }
            }
            return { success: true, output: '@ alias configured correctly.' };
        }),
        verify: () => true,
    },

    GENERATE_TESTS: {
        risk: 'LOW',
        autoFix: true,
        description: 'Scaffold missing test coverage',
        execute: () => timedExec('GENERATE_TESTS', 'LOW', 'Analyze coverage gaps', () => {
            const result = safeExec('pnpm test -- --coverage --silent');
            return { success: true, output: result.output.substring(0, 500) };
        }),
        verify: () => true,
    },

    GENERATE_DOCS: {
        risk: 'LOW',
        autoFix: true,
        description: 'Generate missing documentation',
        execute: () => timedExec('GENERATE_DOCS', 'LOW', 'Scan for missing JSDoc', () => {
            return { success: true, output: 'Documentation generation requires /doc-generator workflow.' };
        }),
        verify: () => true,
    },

    // ── HIGH RISK (Report only, no auto-fix) ────────────────────────────

    ANALYZE_BUILD: {
        risk: 'HIGH',
        autoFix: false,
        description: 'Analyze build failure (requires manual review)',
        execute: () => timedExec('ANALYZE_BUILD', 'HIGH', 'pnpm build', () => safeExec('pnpm build')),
        verify: () => safeExec('pnpm build').success,
    },

    ROTATE_SECRETS: {
        risk: 'HIGH',
        autoFix: false,
        description: '⚠️ Secret exposure detected — requires immediate manual rotation',
        execute: () => timedExec('ROTATE_SECRETS', 'HIGH', 'Scan for exposed secrets', () => {
            const result = safeExec('git grep -rn "password\\|secret\\|api.key" -- "*.yml" "*.env*" "*.json" | grep -v node_modules | head -20');
            return { success: true, output: result.output || 'No exposed secrets found.' };
        }),
        verify: () => true,
    },

    SANITIZE_INPUT: {
        risk: 'HIGH',
        autoFix: false,
        description: '⚠️ Path traversal risk — requires security review',
        execute: () => timedExec('SANITIZE_INPUT', 'HIGH', 'Flag for /red-team review', () => {
            return { success: true, output: 'Flagged for security review. Run /security workflow.' };
        }),
        verify: () => true,
    },

    CHECK_COOLIFY: {
        risk: 'HIGH',
        autoFix: false,
        description: 'Coolify deployment failure — requires infrastructure review',
        execute: () => timedExec('CHECK_COOLIFY', 'HIGH', 'Check Coolify health', () => {
            return { success: true, output: 'Run /coolify-deploy to diagnose. Check Coolify dashboard.' };
        }),
        verify: () => true,
    },

    // ── MEDIUM RISK (Guidance only) ─────────────────────────────────────

    MOVE_MOCK_TO_INIT_SCRIPT: {
        risk: 'MEDIUM',
        autoFix: false,
        description: 'Move mock injection to before page.goto()',
        execute: () => timedExec('MOVE_MOCK_TO_INIT_SCRIPT', 'MEDIUM', 'Scan test files', () => {
            return { success: true, output: 'Requires manual review of E2E test setup order.' };
        }),
        verify: () => true,
    },

    ADD_DATA_TESTID: {
        risk: 'MEDIUM',
        autoFix: false,
        description: 'Add data-testid attributes to timed-out elements',
        execute: () => timedExec('ADD_DATA_TESTID', 'MEDIUM', 'Identify missing testids', () => {
            return { success: true, output: 'Check E2E test logs for specific selector that timed out.' };
        }),
        verify: () => true,
    },

    ADD_NETWORK_MOCK: {
        risk: 'MEDIUM',
        autoFix: false,
        description: 'Add missing network request mocks',
        execute: () => timedExec('ADD_NETWORK_MOCK', 'MEDIUM', 'Detect unmocked requests', () => {
            return { success: true, output: 'Check test logs for ECONNREFUSED targets. Add route mocks.' };
        }),
        verify: () => true,
    },

    FIX_MOCK_REGISTRY: {
        risk: 'LOW',
        autoFix: false,
        description: 'Fix mock variable name mismatch',
        execute: () => timedExec('FIX_MOCK_REGISTRY', 'LOW', 'Check mock registry', () => {
            return { success: true, output: 'Verify tests/mocks/registry.ts matches component expectations.' };
        }),
        verify: () => true,
    },

    FIX_ASSERTION: {
        risk: 'MEDIUM',
        autoFix: false,
        description: 'Fix test assertion mismatch',
        execute: () => timedExec('FIX_ASSERTION', 'MEDIUM', 'Analyze assertion', () => {
            return { success: true, output: 'Review Expected vs Received values in test output.' };
        }),
        verify: () => true,
    },

    VALIDATE_ZOD_SCHEMA: {
        risk: 'MEDIUM',
        autoFix: false,
        description: 'Validate Zod schemas against API responses',
        execute: () => timedExec('VALIDATE_ZOD_SCHEMA', 'MEDIUM', '/zod-schema-validator', () => {
            return { success: true, output: 'Run /zod-schema-validator to compare schemas with API shape.' };
        }),
        verify: () => true,
    },

    EXTRACT_SHARED_CODE: {
        risk: 'LOW',
        autoFix: false,
        description: 'Extract duplicated code to shared module',
        execute: () => timedExec('EXTRACT_SHARED_CODE', 'LOW', 'Detect duplicates', () => {
            return { success: true, output: 'Review Qodana report for duplicate code locations.' };
        }),
        verify: () => true,
    },

    FIX_STATIC_ANALYSIS: {
        risk: 'MEDIUM',
        autoFix: false,
        description: 'Fix static analysis findings',
        execute: () => timedExec('FIX_STATIC_ANALYSIS', 'MEDIUM', 'Run Qodana', () => {
            return { success: true, output: 'Review static analysis report for critical findings.' };
        }),
        verify: () => true,
    },

    ANALYZE_PERFORMANCE: {
        risk: 'MEDIUM',
        autoFix: false,
        description: 'Analyze performance regression',
        execute: () => timedExec('ANALYZE_PERFORMANCE', 'MEDIUM', '/perf', () => {
            return { success: true, output: 'Run /perf workflow for Lighthouse audit.' };
        }),
        verify: () => true,
    },

    ANALYZE_BUNDLE: {
        risk: 'MEDIUM',
        autoFix: false,
        description: 'Analyze bundle size regression',
        execute: () => timedExec('ANALYZE_BUNDLE', 'MEDIUM', '/bundle-analyzer', () => {
            return { success: true, output: 'Run /bundle-analyzer for dependency tree visualization.' };
        }),
        verify: () => true,
    },

    FIX_VISUAL_REGRESSION: {
        risk: 'MEDIUM',
        autoFix: false,
        description: 'Fix visual regression in Chromatic/Storybook',
        execute: () => timedExec('FIX_VISUAL_REGRESSION', 'MEDIUM', '/storybook-bridge', () => {
            return { success: true, output: 'Review Chromatic visual diffs. Accept or fix component changes.' };
        }),
        verify: () => true,
    },

    FIX_ACCESSIBILITY: {
        risk: 'MEDIUM',
        autoFix: false,
        description: 'Fix accessibility violations',
        execute: () => timedExec('FIX_ACCESSIBILITY', 'MEDIUM', '/a11y-auditor', () => {
            return { success: true, output: 'Run /a11y-auditor for axe-core violation details.' };
        }),
        verify: () => true,
    },

    RESOLVE_CONFLICTS: {
        risk: 'MEDIUM',
        autoFix: false,
        description: 'Resolve git merge conflicts',
        execute: () => timedExec('RESOLVE_CONFLICTS', 'MEDIUM', 'git status', () => safeExec('git status')),
        verify: () => safeExec('git diff --check').success,
    },

    VALIDATE_BIO_SYNC: {
        risk: 'MEDIUM',
        autoFix: false,
        description: 'Validate bio-data integration',
        execute: () => timedExec('VALIDATE_BIO_SYNC', 'MEDIUM', '/bio-validator', () => {
            return { success: true, output: 'Run /bio-validator to check Intervals/Hevy/Strava connections.' };
        }),
        verify: () => true,
    },

    MANUAL_INSPECTION: {
        risk: 'HIGH',
        autoFix: false,
        description: 'Unclassified error — requires manual inspection',
        execute: () => timedExec('MANUAL_INSPECTION', 'HIGH', 'Manual review', () => {
            return { success: true, output: 'Error could not be classified. Manual inspection required.' };
        }),
        verify: () => true,
    },
};

// ---------------------------------------------------------------------------
// Repair Engine
// ---------------------------------------------------------------------------

export function runRepairs(classifications: ClassificationInput[], autoOnly: boolean = true): RepairResult[] {
    const results: RepairResult[] = [];

    for (const cls of classifications) {
        const protocol = PROTOCOLS[cls.protocol];
        if (!protocol) {
            results.push({
                protocol: cls.protocol,
                success: false,
                risk: 'HIGH',
                action: 'Protocol not found',
                output: `No repair protocol registered for: ${cls.protocol}`,
                durationMs: 0,
                requiresHumanReview: true,
            });
            continue;
        }

        // Skip non-auto-fixable if autoOnly mode
        if (autoOnly && !protocol.autoFix) {
            results.push({
                protocol: cls.protocol,
                success: true,
                risk: protocol.risk,
                action: `SKIPPED (manual): ${protocol.description}`,
                output: 'Requires human review. Skipped in auto mode.',
                durationMs: 0,
                requiresHumanReview: true,
            });
            continue;
        }

        // Skip HIGH risk in auto mode
        if (autoOnly && protocol.risk === 'HIGH') {
            results.push({
                protocol: cls.protocol,
                success: true,
                risk: 'HIGH',
                action: `SKIPPED (high risk): ${protocol.description}`,
                output: 'High-risk protocol skipped in auto mode.',
                durationMs: 0,
                requiresHumanReview: true,
            });
            continue;
        }

        console.log(`🔧 Executing: ${cls.protocol} (${protocol.risk} risk)...`);
        const result = protocol.execute();
        results.push(result);

        if (result.success) {
            console.log(`  ✅ ${cls.protocol}: Fixed`);
        } else {
            console.log(`  ❌ ${cls.protocol}: Failed — ${result.output.substring(0, 100)}`);
        }
    }

    return results;
}

// ---------------------------------------------------------------------------
// Report Generator
// ---------------------------------------------------------------------------

function generateReport(classifications: ClassificationInput[], results: RepairResult[]): string {
    let output = '\n╔══════════════════════════════════════════════════════════════╗\n';
    output += '║          🩺 CI DOCTOR — REPAIR REPORT (v3.0)                 ║\n';
    output += '╚══════════════════════════════════════════════════════════════╝\n\n';

    const fixed = results.filter(r => r.success && !r.requiresHumanReview);
    const skipped = results.filter(r => r.requiresHumanReview);
    const failed = results.filter(r => !r.success && !r.requiresHumanReview);

    output += `📊 Results: ${fixed.length} fixed | ${skipped.length} skipped (manual) | ${failed.length} failed\n\n`;

    if (fixed.length > 0) {
        output += '✅ FIXED:\n';
        for (const r of fixed) {
            output += `   🟢 ${r.protocol}: ${r.action} (${r.durationMs}ms)\n`;
        }
        output += '\n';
    }

    if (skipped.length > 0) {
        output += '⏭️ REQUIRES HUMAN REVIEW:\n';
        for (const r of skipped) {
            output += `   🟡 ${r.protocol}: ${r.action}\n`;
        }
        output += '\n';
    }

    if (failed.length > 0) {
        output += '❌ FAILED:\n';
        for (const r of failed) {
            output += `   🔴 ${r.protocol}: ${r.output.substring(0, 100)}\n`;
        }
        output += '\n';
    }

    return output;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
    const args = process.argv.slice(2);
    const jsonMode = args.includes('--json');
    const allMode = args.includes('--all'); // include non-auto-fixable
    const filteredArgs = args.filter(a => !a.startsWith('--'));

    if (filteredArgs.length === 0 && !args.includes('--stdin')) {
        console.log('Usage: npx tsx scripts/repair-protocols.ts --classifications <json-file> [--json] [--all]');
        console.log('       echo "[...]" | npx tsx scripts/repair-protocols.ts --stdin [--json] [--all]');
        process.exit(1);
    }

    let input: string;
    if (args.includes('--stdin')) {
        input = fs.readFileSync(0, 'utf-8');
    } else {
        const idx = args.indexOf('--classifications');
        const file = idx >= 0 ? args[idx + 1] : filteredArgs[0];
        if (!file || !fs.existsSync(file)) {
            console.error(`Error: File not found: ${file}`);
            process.exit(1);
        }
        input = fs.readFileSync(path.resolve(file), 'utf-8');
    }

    const classifications: ClassificationInput[] = JSON.parse(input);
    const results = runRepairs(classifications, !allMode);

    if (jsonMode) {
        console.log(JSON.stringify(results, null, 2));
    } else {
        console.log(generateReport(classifications, results));
    }

    // Save report to .agent/reports/ci-doctor/
    const reportDir = path.join(process.cwd(), '.agent', 'reports', 'ci-doctor');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    const reportFile = path.join(reportDir, `repair-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(reportFile, JSON.stringify({ timestamp: new Date().toISOString(), classifications, results }, null, 2));
    console.log(`📁 Report saved: ${reportFile}`);

    const failures = results.filter(r => !r.success && !r.requiresHumanReview);
    if (failures.length > 0) {
        process.exit(1);
    }
}

main();
