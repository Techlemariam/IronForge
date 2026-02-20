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

// Pattern definitions based on 26 CI run failure analysis
const ERROR_PATTERNS: Record<string, { pattern: RegExp; description: string; solution: string }> = {
    RACE_CONDITION: {
        pattern: /mock.*after.*mount|useEffect.*async|addInitScript.*after.*goto|__mock.*undefined.*render/i,
        description: 'Mock injected after component mounted',
        solution: `
FIX: Use addInitScript BEFORE page.goto():
  await page.addInitScript(() => { window.__mockUser = {...} });
  await page.goto('/dashboard');

AND: Use lazy state initialization in hooks:
  const [user] = useState(() => window.__mockUser || null);
`,
    },

    SELECTOR_TIMEOUT: {
        pattern: /timeout.*waiting.*selector|locator.*toBeVisible.*timeout|expect.*toBeVisible.*timeout/i,
        description: 'Element selector timed out',
        solution: `
FIX: Add data-testid to component and use waitForSelector:
  const el = await page.waitForSelector('[data-testid="my-element"]', { timeout: 15000 });
  await el.evaluate(el => el.click()); // Bypasses overlays
`,
    },

    TYPE_ERROR: {
        pattern: /TypeError|ReferenceError|Cannot read propert|is not a function|is not defined/i,
        description: 'JavaScript/TypeScript runtime error',
        solution: `
FIX: Run type check and fix errors:
  npm run check-types
  
Check for null/undefined access patterns.
`,
    },

    NETWORK_HANG: {
        pattern: /net::ERR|fetch failed|ECONNREFUSED|ETIMEDOUT|socket hang up/i,
        description: 'Network request failed or timed out',
        solution: `
FIX: Mock all external API calls in test setup:
  await page.addInitScript(() => {
    window.__mockSessions = [];
    window.__mockUser = { id: 'test', heroName: 'Test' };
  });
`,
    },

    MOCK_MISMATCH: {
        pattern: /__mock.*undefined|mock.*not defined|expected.*mock.*received.*undefined/i,
        description: 'Mock variable name mismatch',
        solution: `
FIX: Check tests/mocks/registry.ts for correct variable names.
Ensure test uses exact same key as component expects.
`,
    },

    SYNTAX_ERROR: {
        pattern: /SyntaxError|Unexpected token|Declaration.*expected|',' expected/i,
        description: 'JavaScript syntax error',
        solution: `
FIX: Run linter to catch syntax issues:
  npm run lint --fix
`,
    },

    ASSERTION_MISMATCH: {
        pattern: /Expected.*Received|toBe.*received|toEqual.*received|AssertionError/i,
        description: 'Test assertion failed',
        solution: `
FIX: Check mock data matches expected values.
Verify component renders expected state.
`,
    },

    BUILD_ERROR: {
        pattern: /Module not found|Cannot find module|Failed to compile|Build failed/i,
        description: 'Build/compilation error',
        solution: `
FIX: Run build locally to identify issue:
  npm run build
  
Check imports and module paths.
`,
    },

    PRISMA_ERROR: {
        pattern: /PrismaClient|prisma.*error|database.*connection|migration/i,
        description: 'Database/Prisma error',
        solution: `
FIX: Generate Prisma client and check migrations:
  npx prisma generate
  npx prisma migrate dev
`,
    },
};

interface ClassificationResult {
    category: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    solution: string;
    matchedText: string;
    location?: { file: string; line: number; column: number };
}

function classifyError(logContent: string, source: 'logs' | 'playwright' | 'turbo' = 'logs'): ClassificationResult[] {
    if (source === 'playwright') {
        try {
            const data = JSON.parse(logContent);
            const results: ClassificationResult[] = [];

            // Extract from Playwright errors array
            if (data.errors) {
                data.errors.forEach((err: any) => {
                    results.push({
                        category: 'E2E_FAILURE',
                        confidence: 'HIGH',
                        description: 'Playwright test failure detected in JSON report.',
                        solution: 'Check the location mapping and fix the specific test case.',
                        matchedText: err.message.substring(0, 200),
                        location: err.location
                    });
                });
            }
            return results;
        } catch (e) {
            return [{ category: 'UNPARSEABLE_JSON', confidence: 'LOW', description: 'Failed to parse Playwright JSON', solution: 'Fall back to log investigation', matchedText: '' }];
        }
    }

    if (source === 'turbo') {
        try {
            const data = JSON.parse(logContent);
            const results: ClassificationResult[] = [];
            if (data.tasks) {
                data.tasks.forEach((task: any) => {
                    if (task.execution.exitCode !== 0) {
                        results.push({
                            category: `TURBO_FAIL_${task.task.toUpperCase()}`,
                            confidence: 'HIGH',
                            description: `Turbo task ${task.task} failed.`,
                            solution: `Run 'npx turbo run ${task.task}' locally to debug.`,
                            matchedText: `Exit code: ${task.execution.exitCode}`
                        });
                    }
                });
            }
            return results;
        } catch (e) {
            return [{ category: 'UNPARSEABLE_JSON', confidence: 'LOW', description: 'Failed to parse Turbo JSON', solution: 'Fall back to log investigation', matchedText: '' }];
        }
    }

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

function formatResults(results: ClassificationResult[]): string {
    let output = '\n╔══════════════════════════════════════════════════════════════╗\n';
    output += '║           🩺 CI DOCTOR - ERROR CLASSIFICATION                 ║\n';
    output += '╚══════════════════════════════════════════════════════════════╝\n\n';

    for (const result of results) {
        const icon = result.confidence === 'HIGH' ? '🔴' : result.confidence === 'MEDIUM' ? '🟡' : '⚪';

        output += `${icon} Category: ${result.category}\n`;
        output += `   Confidence: ${result.confidence}\n`;
        output += `   Description: ${result.description}\n`;
        if (result.location) {
            output += `   Location: ${result.location.file}:${result.location.line}:${result.location.column}\n`;
        }
        if (result.matchedText) {
            output += `   Matched: "${result.matchedText}..."\n`;
        }
        output += `\n   Solution:${result.solution}\n`;
        output += '─'.repeat(60) + '\n\n';
    }

    return output;
}

// Main execution
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: npx ts-node scripts/ci-classifier.ts <log-file>');
        console.log('       npx ts-node scripts/ci-classifier.ts --stdin [--source logs|playwright|turbo]');
        process.exit(1);
    }

    let logContent: string;
    let source: 'logs' | 'playwright' | 'turbo' = 'logs';

    const sourceIdx = args.indexOf('--source');
    if (sourceIdx !== -1 && args[sourceIdx + 1]) {
        source = args[sourceIdx + 1] as any;
    }

    if (args.includes('--stdin')) {
        // Read from stdin
        logContent = fs.readFileSync(0, 'utf-8');
    } else {
        // Read from file
        const logFile = path.resolve(args[0]);
        if (!fs.existsSync(logFile)) {
            console.error(`Error: File not found: ${logFile}`);
            process.exit(1);
        }
        logContent = fs.readFileSync(logFile, 'utf-8');
    }

    const results = classifyError(logContent, source);
    console.log(formatResults(results));

    // Exit with error code if unknown or failure found
    if (results.length > 0 && results[0].category !== 'UNKNOWN') {
        process.exit(0);
    }
    process.exit(1);
}

main();
