#!/usr/bin/env npx tsx
/**
 * CI Doctor — GitHub Integration v3.0
 *
 * Posts CI Doctor results directly to GitHub:
 * - PR comment summaries
 * - Check annotations (inline file errors)
 * - Auto-creates issues for recurring failures
 *
 * Usage:
 *   npx tsx scripts/ci-doctor-github.ts --report <report.json> --pr <number>
 *   npx tsx scripts/ci-doctor-github.ts --report <report.json> --annotate --sha <commit-sha>
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RepairResult {
    protocol: string;
    success: boolean;
    risk: string;
    action: string;
    output: string;
    durationMs: number;
    requiresHumanReview: boolean;
}

interface ClassificationResult {
    category: string;
    confidence: string;
    description: string;
    solution: string;
    matchedText: string;
    autoFixable: boolean;
    risk: string;
    protocol: string;
}

interface CIDoctorReport {
    timestamp: string;
    classifications: ClassificationResult[];
    results: RepairResult[];
}

// ---------------------------------------------------------------------------
// GitHub API helpers (via gh CLI)
// ---------------------------------------------------------------------------

function ghExec(args: string): string {
    try {
        return execSync(`gh ${args}`, { encoding: 'utf-8', timeout: 30_000 }).trim();
    } catch (error: unknown) {
        const err = error as { stderr?: string; message?: string };
        console.error(`gh CLI error: ${err.stderr || err.message}`);
        return '';
    }
}

// ---------------------------------------------------------------------------
// PR Comment
// ---------------------------------------------------------------------------

export function postPRComment(prNumber: number, report: CIDoctorReport): void {
    const fixed = report.results.filter(r => r.success && !r.requiresHumanReview);
    const manual = report.results.filter(r => r.requiresHumanReview);
    const failed = report.results.filter(r => !r.success && !r.requiresHumanReview);

    let body = '## 🩺 CI Doctor Report (v3.0)\n\n';
    body += `| Metric | Count |\n|:--|:--|\n`;
    body += `| Issues Found | ${report.classifications.length} |\n`;
    body += `| ✅ Auto-Fixed | ${fixed.length} |\n`;
    body += `| 🟡 Needs Review | ${manual.length} |\n`;
    body += `| ❌ Failed | ${failed.length} |\n\n`;

    if (fixed.length > 0) {
        body += '<details><summary>✅ Auto-Fixed Issues</summary>\n\n';
        for (const r of fixed) {
            body += `- **${r.protocol}**: ${r.action} (${r.durationMs}ms)\n`;
        }
        body += '\n</details>\n\n';
    }

    if (manual.length > 0) {
        body += '<details><summary>🟡 Requires Human Review</summary>\n\n';
        for (const r of manual) {
            body += `- **${r.protocol}**: ${r.action}\n`;
        }
        body += '\n</details>\n\n';
    }

    if (failed.length > 0) {
        body += '### ❌ Failed Repairs\n\n';
        for (const r of failed) {
            body += `- **${r.protocol}**: ${r.output.substring(0, 200)}\n`;
        }
        body += '\n';
    }

    body += `\n---\n*Generated at ${report.timestamp}*`;

    // Write to temp file and post
    const tmpFile = path.join(process.cwd(), '.agent', 'tmp-ci-doctor-comment.md');
    fs.writeFileSync(tmpFile, body);
    ghExec(`pr comment ${prNumber} --body-file "${tmpFile}"`);
    fs.unlinkSync(tmpFile);

    console.log(`✅ Posted CI Doctor report to PR #${prNumber}`);
}

// ---------------------------------------------------------------------------
// Issue Creation (Recurring Failures)
// ---------------------------------------------------------------------------

export function createRecurringIssue(category: string, count: number, lastOccurrence: string): void {
    const title = `🩺 Recurring CI Failure: ${category} (${count}x in 7 days)`;
    const body = `## Recurring CI Failure Pattern

| Detail | Value |
|:--|:--|
| Category | \`${category}\` |
| Occurrences | ${count} in last 7 days |
| Last seen | ${lastOccurrence} |

### Action Required
This failure pattern has recurred ${count}+ times. Please investigate the root cause.

### CI Doctor Classification
See \`.agent/reports/ci-doctor/\` for detailed reports.

---
*Auto-created by CI Doctor v3.0*`;

    ghExec(`issue create --title "${title}" --body "${body}" --label "ci,bug,automated"`);
    console.log(`📋 Created issue for recurring failure: ${category}`);
}

// ---------------------------------------------------------------------------
// Trend Analysis
// ---------------------------------------------------------------------------

export function analyzeTrends(): Map<string, number> {
    const reportDir = path.join(process.cwd(), '.agent', 'reports', 'ci-doctor');
    if (!fs.existsSync(reportDir)) return new Map();

    const files = fs.readdirSync(reportDir)
        .filter(f => f.startsWith('repair-') && f.endsWith('.json'))
        .sort()
        .slice(-10); // Last 10 reports

    const categoryCount = new Map<string, number>();

    for (const file of files) {
        try {
            const report = JSON.parse(fs.readFileSync(path.join(reportDir, file), 'utf-8'));
            for (const cls of report.classifications || []) {
                categoryCount.set(cls.category, (categoryCount.get(cls.category) || 0) + 1);
            }
        } catch {
            // Skip malformed reports
        }
    }

    // Flag recurring patterns
    for (const [category, count] of categoryCount) {
        if (count >= 3) {
            console.log(`⚠️ RECURRING: ${category} appeared ${count} times in last 10 runs`);
        }
    }

    return categoryCount;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main() {
    const args = process.argv.slice(2);

    const reportIdx = args.indexOf('--report');
    const prIdx = args.indexOf('--pr');
    const trendMode = args.includes('--trends');

    if (trendMode) {
        const trends = analyzeTrends();
        console.log('\n📊 Failure Trends (last 10 runs):');
        for (const [category, count] of [...trends.entries()].sort((a, b) => b[1] - a[1])) {
            const bar = '█'.repeat(count);
            console.log(`  ${category}: ${bar} (${count})`);
        }

        // Auto-create issues for 3+ occurrences
        for (const [category, count] of trends) {
            if (count >= 3) {
                createRecurringIssue(category, count, new Date().toISOString());
            }
        }
        return;
    }

    if (reportIdx < 0) {
        console.log('Usage:');
        console.log('  npx tsx scripts/ci-doctor-github.ts --report <report.json> --pr <number>');
        console.log('  npx tsx scripts/ci-doctor-github.ts --trends');
        process.exit(1);
    }

    const reportFile = args[reportIdx + 1];
    if (!reportFile || !fs.existsSync(reportFile)) {
        console.error(`Error: Report file not found: ${reportFile}`);
        process.exit(1);
    }

    const report: CIDoctorReport = JSON.parse(fs.readFileSync(reportFile, 'utf-8'));

    if (prIdx >= 0) {
        const prNumber = parseInt(args[prIdx + 1], 10);
        postPRComment(prNumber, report);
    } else {
        console.log('No --pr specified. Printing report to stdout.');
        console.log(JSON.stringify(report, null, 2));
    }
}

main();
