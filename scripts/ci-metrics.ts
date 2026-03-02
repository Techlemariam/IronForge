/**
 * CI Metrics Dashboard
 *
 * Collects CI run metrics from GitHub Actions API and calculates KPIs:
 * - MTTR (Mean Time To Recovery)
 * - Auto-fix success rate
 * - Failure frequency per specialist
 *
 * Usage: npx tsx scripts/ci-metrics.ts
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface CIRun {
    databaseId: number;
    name: string;
    conclusion: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    headBranch: string;
}

interface MetricsReport {
    lastUpdated: string;
    totalRuns: number;
    successRate: number;
    failureRate: number;
    avgDurationMinutes: number;
    mttrMinutes: number | null;
    autoFixCount: number;
    failuresByJob: Record<string, number>;
    recentRuns: Array<{
        id: number;
        conclusion: string;
        branch: string;
        date: string;
    }>;
}

const REPORT_PATH = path.resolve(
    process.cwd(),
    ".agent/reports/ci-metrics.json"
);

function fetchRuns(limit = 50): CIRun[] {
    try {
        const output = execSync(
            `gh run list --workflow "IronForge CI/CD" --limit ${limit} --json databaseId,name,conclusion,status,createdAt,updatedAt,headBranch`,
            { encoding: "utf-8" }
        );
        return JSON.parse(output);
    } catch {
        console.log("⚠️ Could not fetch GHA runs. Is `gh` authenticated?");
        return [];
    }
}

function countAutoFixes(): number {
    try {
        const output = execSync(
            `gh search commits "fix(ci): auto-fix" --repo Techlemariam/IronForge --limit 20 --json sha`,
            { encoding: "utf-8" }
        );
        return JSON.parse(output).length;
    } catch {
        return 0;
    }
}

function calculateMTTR(runs: CIRun[]): number | null {
    const completed = runs.filter((r) => r.conclusion);
    const recoveries: number[] = [];

    for (let i = 0; i < completed.length - 1; i++) {
        if (
            completed[i].conclusion === "success" &&
            completed[i + 1].conclusion === "failure"
        ) {
            const failTime = new Date(completed[i + 1].createdAt).getTime();
            const fixTime = new Date(completed[i].updatedAt).getTime();
            const mttr = (fixTime - failTime) / 1000 / 60; // minutes
            if (mttr > 0 && mttr < 1440) {
                // max 24h
                recoveries.push(mttr);
            }
        }
    }

    if (recoveries.length === 0) return null;
    return Math.round(
        recoveries.reduce((a, b) => a + b, 0) / recoveries.length
    );
}

function buildReport(runs: CIRun[]): MetricsReport {
    const completed = runs.filter((r) => r.conclusion);
    const successes = completed.filter((r) => r.conclusion === "success");
    const failures = completed.filter((r) => r.conclusion === "failure");

    // Calculate average duration
    const durations = completed
        .map((r) => {
            const start = new Date(r.createdAt).getTime();
            const end = new Date(r.updatedAt).getTime();
            return (end - start) / 1000 / 60;
        })
        .filter((d) => d > 0 && d < 120); // Filter outliers

    const avgDuration =
        durations.length > 0
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : 0;

    // Failure by job (approximate from name)
    const failuresByJob: Record<string, number> = {};
    for (const run of failures) {
        const key = run.name || "unknown";
        failuresByJob[key] = (failuresByJob[key] || 0) + 1;
    }

    return {
        lastUpdated: new Date().toISOString(),
        totalRuns: completed.length,
        successRate:
            completed.length > 0
                ? Math.round((successes.length / completed.length) * 100)
                : 0,
        failureRate:
            completed.length > 0
                ? Math.round((failures.length / completed.length) * 100)
                : 0,
        avgDurationMinutes: avgDuration,
        mttrMinutes: calculateMTTR(runs),
        autoFixCount: countAutoFixes(),
        failuresByJob,
        recentRuns: completed.slice(0, 10).map((r) => ({
            id: r.databaseId,
            conclusion: r.conclusion,
            branch: r.headBranch,
            date: r.createdAt,
        })),
    };
}

// Main
console.log("📊 Collecting CI Metrics...");
const runs = fetchRuns();

if (runs.length === 0) {
    console.log("❌ No runs found. Exiting.");
    process.exit(1);
}

const report = buildReport(runs);

// Save
const dir = path.dirname(REPORT_PATH);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

// Display
console.log(`\n📊 CI Metrics Dashboard`);
console.log(`  Total runs: ${report.totalRuns}`);
console.log(`  Success rate: ${report.successRate}%`);
console.log(`  Failure rate: ${report.failureRate}%`);
console.log(`  Avg duration: ${report.avgDurationMinutes} min`);
console.log(
    `  MTTR: ${report.mttrMinutes !== null ? `${report.mttrMinutes} min` : "N/A"}`
);
console.log(`  Auto-fixes: ${report.autoFixCount}`);

if (Object.keys(report.failuresByJob).length > 0) {
    console.log(`\n  Failures by workflow:`);
    Object.entries(report.failuresByJob)
        .sort(([, a], [, b]) => b - a)
        .forEach(([job, count]) => {
            console.log(`    ${job}: ${count}`);
        });
}

console.log(`\n✅ Report saved to ${REPORT_PATH}`);
