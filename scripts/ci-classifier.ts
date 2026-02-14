#!/usr/bin/env npx tsx
/**
 * CI Error Classifier
 * 
 * Automatically classifies CI failure logs into known categories
 * based on pattern matching from 26+ historical failures.
 * 
 * Usage: npx ts-node scripts/ci-classifier.ts <log-file>
 */

import * as fs from 'fs';
import * as path from 'path';

// Pattern definitions based on historical failure analysis across 50+ runs
const ERROR_PATTERNS: Record<string, { pattern: RegExp; description: string; solution: string }> = {
    RACE_CONDITION: {
        pattern: /mock.*after.*mount|useEffect.*async|addInitScript.*after.*goto|__mock.*undefined.*render/i,
        description: 'Mock injected after component mounted',
        solution: 'Use addInitScript BEFORE page.goto() and lazy state initialization in hooks.',
    },
    SELECTOR_TIMEOUT: {
        pattern: /timeout.*waiting.*selector|locator.*toBeVisible.*timeout|expect.*toBeVisible.*timeout/i,
        description: 'Element selector timed out',
        solution: 'Add data-testid to component and use waitForSelector with increased timeout.',
    },
    TYPE_ERROR: {
        pattern: /TypeError|ReferenceError|Cannot read propert|is not a function|is not defined/i,
        description: 'JavaScript/TypeScript runtime error',
        solution: 'Run `pnpm run check-types` and check for null/undefined access patterns.',
    },
    NETWORK_HANG: {
        pattern: /net::ERR|fetch failed|ECONNREFUSED|ETIMEDOUT|socket hang up/i,
        description: 'Network request failed or timed out',
        solution: 'Mock all external API calls in test setup using addInitScript or Playwright router.',
    },
    MOCK_MISMATCH: {
        pattern: /__mock.*undefined|mock.*not defined|expected.*mock.*received.*undefined/i,
        description: 'Mock variable name mismatch',
        solution: 'Check tests/mocks/registry.ts for correct variable names.',
    },
    SYNTAX_ERROR: {
        pattern: /SyntaxError|Unexpected token|Declaration.*expected|',' expected/i,
        description: 'JavaScript syntax error',
        solution: 'Run `pnpm run lint --fix` to catch syntax issues.',
    },
    ASSERTION_MISMATCH: {
        pattern: /Expected.*Received|toBe.*received|toEqual.*received|AssertionError/i,
        description: 'Test assertion failed',
        solution: 'Check mock data matches expected values and verify component state.',
    },
    BUILD_ERROR: {
        pattern: /Module not found|Cannot find module|Failed to compile|Build failed/i,
        description: 'Build/compilation error',
        solution: 'Run `pnpm run build` locally to identify path or module issues.',
    },
    PRISMA_ERROR: {
        pattern: /PrismaClient|prisma.*error|database.*connection|migration|Shadow database/i,
        description: 'Database/Prisma error',
        solution: 'Run `npx prisma generate` and `npx prisma migrate dev`. Check shadow DB in CI.',
    },
    A11Y_FAIL: {
        pattern: /Axe: violations|accessibility.*fail|contrast.*ratio/i,
        description: 'Accessibility audit failure',
        solution: 'Run `/monitor-ui` or `/a11y-auditor` and fix markup (labels, contrast).',
    },
    PERF_DEGRADATION: {
        pattern: /Lighthouse: Performance|bundle size increased|gzip.*exceed/i,
        description: 'Performance or bundle size regression',
        solution: 'Run `/perf-profiler` or `/bundle-analyzer` to identify bloat.',
    },
    BIO_SYNC_FAIL: {
        pattern: /Intervals.*fail|Hevy.*fail|Garmin.*auth|sync.*timeout/i,
        description: 'Bio-data integration failure',
        solution: 'Run `/bio-validator` to check API health and credential validity.',
    },
    PLATFORM_COMPATIBILITY: {
        pattern: /Join-Path|'\\' is not recognized|PowerShell.*Linux/i,
        description: 'OS-specific path or shell error',
        solution: 'Check for backslashes (\) in paths; always use forward slashes (/) for universal compatibility.',
    }
};

interface ClassificationResult {
    category: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    solution: string;
    matchedText: string;
}

function classifyError(logContent: string): ClassificationResult[] {
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
        });
    }

    return results;
}

function formatResults(results: ClassificationResult[], jsonMode: boolean = false): string {
    if (jsonMode) {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            results: results.map(r => ({
                category: r.category,
                confidence: r.confidence,
                description: r.description,
                solution: r.solution.trim()
            }))
        }, null, 2);
    }

    let output = '\n╔══════════════════════════════════════════════════════════════╗\n';
    output += '║           🩺 CI DOCTOR - ERROR CLASSIFICATION                 ║\n';
    output += '╚══════════════════════════════════════════════════════════════╝\n\n';

    for (const result of results) {
        const icon = result.confidence === 'HIGH' ? '🔴' : result.confidence === 'MEDIUM' ? '🟡' : '⚪';

        output += `${icon} Category: ${result.category}\n`;
        output += `   Confidence: ${result.confidence}\n`;
        output += `   Description: ${result.description}\n`;
        if (result.matchedText) {
            output += `   Matched: "${result.matchedText}..."\n`;
        }
        output += `\n   Solution: ${result.solution.trim()}\n`;
        output += '─'.repeat(60) + '\n\n';
    }

    return output;
}


// Main execution
function main() {
    const args = process.argv.slice(2);
    const isJson = args.includes('--json');
    const filteredArgs = args.filter(a => a !== '--json');

    if (filteredArgs.length === 0) {
        console.log('Usage: npx ts-node scripts/ci-classifier.ts <log-file> [--json]');
        console.log('       npx ts-node scripts/ci-classifier.ts --stdin [--json]');
        process.exit(1);
    }

    let logContent: string;

    if (filteredArgs[0] === '--stdin') {
        // Read from stdin
        try {
            logContent = fs.readFileSync(0, 'utf-8');
        } catch (e) {
            console.error('Error reading from stdin');
            process.exit(1);
        }
    } else {
        // Read from file
        const logFile = path.resolve(filteredArgs[0]);
        if (!fs.existsSync(logFile)) {
            console.error(`Error: File not found: ${logFile}`);
            process.exit(1);
        }
        logContent = fs.readFileSync(logFile, 'utf-8');
    }

    const results = classifyError(logContent);
    console.log(formatResults(results, isJson));

    // Exit with error code if unknown
    if (results.length === 1 && results[0].category === 'UNKNOWN') {
        process.exit(1);
    }
}

main();
