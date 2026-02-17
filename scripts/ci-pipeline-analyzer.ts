#!/usr/bin/env npx tsx
/**
 * CI Pipeline Analyzer v3.0
 *
 * Analyzes GitHub Actions workflow files for inefficiencies and suggests
 * optimizations: duplicate steps, cache misses, parallelization, redundant builds.
 *
 * Usage: npx tsx scripts/ci-pipeline-analyzer.ts [workflow-file]
 *        npx tsx scripts/ci-pipeline-analyzer.ts .github/workflows/ci-cd.yml
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml'; // Note: requires yaml dep or use simple parser

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Optimization {
    id: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    category: 'duplication' | 'cache' | 'parallelization' | 'timing' | 'cost' | 'security';
    title: string;
    description: string;
    currentState: string;
    suggestedFix: string;
    estimatedSavings: string;
}

interface PipelineReport {
    file: string;
    totalJobs: number;
    totalSteps: number;
    optimizations: Optimization[];
    score: number; // 0-100
}

// ---------------------------------------------------------------------------
// Analyzers
// ---------------------------------------------------------------------------

function analyzeDuplicateSteps(content: string): Optimization[] {
    const optimizations: Optimization[] = [];

    // Count occurrences of common setup patterns
    const checkoutCount = (content.match(/actions\/checkout@/g) || []).length;
    const pnpmSetupCount = (content.match(/pnpm\/action-setup@/g) || []).length;
    const nodeSetupCount = (content.match(/actions\/setup-node@/g) || []).length;
    const installCount = (content.match(/pnpm install --frozen-lockfile/g) || []).length;
    const prismaGenCount = (content.match(/prisma generate/g) || []).length;

    if (checkoutCount > 2) {
        optimizations.push({
            id: 'DUP_CHECKOUT',
            severity: 'MEDIUM',
            category: 'duplication',
            title: `Checkout repeated ${checkoutCount}x across jobs`,
            description: `actions/checkout appears ${checkoutCount} times. Each checkout adds ~5-15s.`,
            currentState: `${checkoutCount} separate checkout steps`,
            suggestedFix: 'Use a composite action or reusable workflow to share checkout + setup.',
            estimatedSavings: `~${(checkoutCount - 1) * 10}s`,
        });
    }

    if (installCount > 2) {
        optimizations.push({
            id: 'DUP_INSTALL',
            severity: 'HIGH',
            category: 'duplication',
            title: `pnpm install repeated ${installCount}x`,
            description: `Each pnpm install takes 30-90s even with cache. Total overhead: ${installCount * 60}s.`,
            currentState: `${installCount} separate install steps`,
            suggestedFix: 'Create composite action: checkout → pnpm → node → install → prisma generate. Reuse across jobs.',
            estimatedSavings: `~${(installCount - 1) * 45}s`,
        });
    }

    if (prismaGenCount > 2) {
        optimizations.push({
            id: 'DUP_PRISMA',
            severity: 'MEDIUM',
            category: 'duplication',
            title: `Prisma generate repeated ${prismaGenCount}x`,
            description: `npx prisma generate runs in ${prismaGenCount} jobs. Could generate once and share via artifact.`,
            currentState: `${prismaGenCount} separate prisma generate steps`,
            suggestedFix: 'Generate Prisma client once in first job, upload as artifact, download in other jobs.',
            estimatedSavings: `~${(prismaGenCount - 1) * 15}s`,
        });
    }

    return optimizations;
}

function analyzeCaching(content: string): Optimization[] {
    const optimizations: Optimization[] = [];

    // Check for turbo cache
    if (content.includes('turbo') && !content.includes('.turbo')) {
        optimizations.push({
            id: 'CACHE_TURBO_MISSING',
            severity: 'HIGH',
            category: 'cache',
            title: 'Turbo cache not configured',
            description: 'Turborepo is used but .turbo cache directory is not cached between runs.',
            currentState: 'No turbo cache',
            suggestedFix: 'Add actions/cache for .turbo directory with content-hash key.',
            estimatedSavings: '~60-120s on subsequent runs',
        });
    }

    // Check cache key strategy
    if (content.includes('github.sha') && content.includes('actions/cache')) {
        optimizations.push({
            id: 'CACHE_KEY_SHA',
            severity: 'LOW',
            category: 'cache',
            title: 'Cache key uses exact SHA (low hit rate)',
            description: 'Using github.sha as cache key means cache only hits on re-runs, not new commits.',
            currentState: `key: turbo-\${{ runner.os }}-\${{ github.sha }}`,
            suggestedFix: 'Use hashFiles for primary key, SHA for restore-keys fallback.',
            estimatedSavings: '~30-60s cache hit improvement',
        });
    }

    // Check playwright cache
    if (content.includes('playwright') && !content.includes('ms-playwright')) {
        optimizations.push({
            id: 'CACHE_PLAYWRIGHT_MISSING',
            severity: 'MEDIUM',
            category: 'cache',
            title: 'Playwright browsers not cached',
            description: 'Playwright browser download takes 60-120s. Should be cached.',
            currentState: 'No playwright cache',
            suggestedFix: 'Cache ~/.cache/ms-playwright with pnpm-lock.yaml hash key.',
            estimatedSavings: '~60-120s',
        });
    }

    return optimizations;
}

function analyzeParallelization(content: string): Optimization[] {
    const optimizations: Optimization[] = [];

    // Check if turbo steps are split
    const turboSteps = (content.match(/turbo run \w+/g) || []);
    if (turboSteps.length > 3) {
        optimizations.push({
            id: 'PARALLEL_TURBO_SPLIT',
            severity: 'MEDIUM',
            category: 'parallelization',
            title: `${turboSteps.length} separate turbo run commands`,
            description: `Each turbo run has startup overhead. Combine into single turbo pipeline.`,
            currentState: turboSteps.map(s => `  ${s}`).join('\n'),
            suggestedFix: 'Combine: npx turbo run lint check-types test build security --concurrency=100%',
            estimatedSavings: '~15-30s turbo startup overhead',
        });
    }

    // Check for sequential builds that could be parallel
    if (content.includes('needs:') && content.includes('perf-audit')) {
        // Check if perf-audit depends on verify or runs independently
        if (!content.match(/perf-audit[\s\S]*?needs.*verify/)) {
            optimizations.push({
                id: 'PARALLEL_PERF',
                severity: 'LOW',
                category: 'parallelization',
                title: 'perf-audit runs independently but rebuilds',
                description: 'perf-audit does its own build. Could reuse build artifact from verify job.',
                currentState: 'Independent build in perf-audit',
                suggestedFix: 'Upload build artifact from verify, download in perf-audit (skip duplicate build).',
                estimatedSavings: '~60-90s build time',
            });
        }
    }

    return optimizations;
}

function analyzeTiming(content: string): Optimization[] {
    const optimizations: Optimization[] = [];

    // Check for static sleep commands
    const sleepMatches = content.match(/sleep \d+/g) || [];
    if (sleepMatches.length > 0) {
        const totalSleep = sleepMatches.reduce((sum, s) => sum + parseInt(s.split(' ')[1], 10), 0);
        optimizations.push({
            id: 'TIMING_STATIC_SLEEP',
            severity: 'HIGH',
            category: 'timing',
            title: `${sleepMatches.length} static sleep commands (${totalSleep}s total)`,
            description: `Static sleeps waste time. Replace with health-check loops.`,
            currentState: sleepMatches.join(', '),
            suggestedFix: `Replace 'sleep N' with: while ! pg_isready -h 127.0.0.1 -U postgres; do sleep 2; done`,
            estimatedSavings: `Up to ~${Math.floor(totalSleep * 0.5)}s on average`,
        });
    }

    // Check timeout settings
    if (!content.includes('timeout-minutes')) {
        optimizations.push({
            id: 'TIMING_NO_TIMEOUT',
            severity: 'MEDIUM',
            category: 'timing',
            title: 'No job timeout configured',
            description: 'Jobs without timeout-minutes can run indefinitely on hung processes.',
            currentState: 'No timeout-minutes set',
            suggestedFix: 'Add timeout-minutes: 30 to each job to prevent runaway costs.',
            estimatedSavings: 'Prevents runaway billing',
        });
    }

    return optimizations;
}

function analyzeSecurity(content: string): Optimization[] {
    const optimizations: Optimization[] = [];

    // Check for pinned action versions
    const unpinnedActions = content.match(/uses: [^@]+@v\d+$/gm) || [];
    // Check for hash-pinned actions
    const hashPinned = content.match(/uses: [^@]+@[a-f0-9]{40}/gm) || [];

    if (unpinnedActions.length > 0 && hashPinned.length === 0) {
        optimizations.push({
            id: 'SEC_UNPINNED_ACTIONS',
            severity: 'LOW',
            category: 'security',
            title: 'Actions use tag versions instead of SHA pins',
            description: 'Tag-based versions (e.g., @v4) can be moved. SHA-pinning prevents supply chain attacks.',
            currentState: `${unpinnedActions.length} tag-versioned actions`,
            suggestedFix: 'Pin critical actions to SHA: e.g., actions/checkout@<sha>',
            estimatedSavings: 'Improved supply chain security',
        });
    }

    // Check for environment variable exposure
    if (content.includes('secrets.') && content.includes('echo')) {
        optimizations.push({
            id: 'SEC_SECRET_ECHO',
            severity: 'MEDIUM',
            category: 'security',
            title: 'Potential secret exposure in echo/log output',
            description: 'Secrets used near echo commands could be accidentally logged.',
            currentState: 'echo commands near secret references',
            suggestedFix: 'Use ::add-mask:: for dynamic secrets. Never echo ${{ secrets.* }}.',
            estimatedSavings: 'Prevents secret exposure',
        });
    }

    return optimizations;
}

// ---------------------------------------------------------------------------
// Main Analyzer
// ---------------------------------------------------------------------------

export function analyzeWorkflow(filePath: string): PipelineReport {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Count jobs and steps
    const jobMatches = content.match(/^\s{2}\w[\w-]*:/gm) || [];
    const stepMatches = content.match(/- name:/g) || [];

    const optimizations: Optimization[] = [
        ...analyzeDuplicateSteps(content),
        ...analyzeCaching(content),
        ...analyzeParallelization(content),
        ...analyzeTiming(content),
        ...analyzeSecurity(content),
    ];

    // Calculate score (100 = perfect, deduct for each issue)
    const deductions = optimizations.reduce((sum, opt) => {
        switch (opt.severity) {
            case 'HIGH': return sum + 15;
            case 'MEDIUM': return sum + 8;
            case 'LOW': return sum + 3;
            default: return sum;
        }
    }, 0);

    return {
        file: filePath,
        totalJobs: jobMatches.length,
        totalSteps: stepMatches.length,
        optimizations,
        score: Math.max(0, 100 - deductions),
    };
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function formatReport(report: PipelineReport): string {
    let output = '\n╔══════════════════════════════════════════════════════════════╗\n';
    output += '║        🏎️ CI PIPELINE OPTIMIZER — ANALYSIS REPORT            ║\n';
    output += '╚══════════════════════════════════════════════════════════════╝\n\n';

    output += `📂 File: ${report.file}\n`;
    output += `📊 Jobs: ${report.totalJobs} | Steps: ${report.totalSteps}\n`;
    output += `🏆 Pipeline Score: ${report.score}/100\n\n`;

    if (report.optimizations.length === 0) {
        output += '✅ No optimizations found. Pipeline is well-configured!\n';
        return output;
    }

    const byCategory = new Map<string, Optimization[]>();
    for (const opt of report.optimizations) {
        const list = byCategory.get(opt.category) || [];
        list.push(opt);
        byCategory.set(opt.category, list);
    }

    for (const [category, opts] of byCategory) {
        const icon = { duplication: '📋', cache: '💾', parallelization: '⚡', timing: '⏱️', cost: '💰', security: '🔒' }[category] || '📌';
        output += `${icon} ${category.toUpperCase()}\n`;
        output += '─'.repeat(60) + '\n';

        for (const opt of opts) {
            const sevIcon = opt.severity === 'HIGH' ? '🔴' : opt.severity === 'MEDIUM' ? '🟡' : '🟢';
            output += `  ${sevIcon} ${opt.title}\n`;
            output += `     Current: ${opt.currentState}\n`;
            output += `     Fix: ${opt.suggestedFix}\n`;
            output += `     Savings: ${opt.estimatedSavings}\n\n`;
        }
    }

    return output;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main() {
    const args = process.argv.slice(2);
    const jsonMode = args.includes('--json');
    const filteredArgs = args.filter(a => a !== '--json');

    // Default to ci-cd.yml if no file specified
    const targetFile = filteredArgs[0] || '.github/workflows/ci-cd.yml';
    const resolvedPath = path.resolve(targetFile);

    if (!fs.existsSync(resolvedPath)) {
        console.error(`Error: File not found: ${resolvedPath}`);
        process.exit(1);
    }

    const report = analyzeWorkflow(resolvedPath);

    if (jsonMode) {
        console.log(JSON.stringify(report, null, 2));
    } else {
        console.log(formatReport(report));
    }

    // Save report
    const reportDir = path.join(process.cwd(), '.agent', 'reports', 'ci-doctor');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    const reportFile = path.join(reportDir, `pipeline-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📁 Report saved: ${reportFile}`);

    // Exit with non-zero if score is below threshold
    if (report.score < 50) {
        process.exit(1);
    }
}

main();
