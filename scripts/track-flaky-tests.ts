/**
 * Track Flaky Tests
 *
 * Parses Vitest/Playwright JSON output and maintains a stability history.
 * Tests that fail >20% of the time are flagged as flaky.
 *
 * Usage: npx tsx scripts/track-flaky-tests.ts [--vitest path/to/results.json] [--playwright path/to/results.json]
 */

import fs from "fs";
import path from "path";

interface TestResult {
    name: string;
    suite: string;
    passed: boolean;
    duration: number;
}

interface TestHistory {
    name: string;
    suite: string;
    runs: number;
    failures: number;
    failRate: number;
    lastFailed: string | null;
    isFlaky: boolean;
}

interface StabilityReport {
    lastUpdated: string;
    totalTests: number;
    flakyTests: number;
    tests: Record<string, TestHistory>;
}

const REPORT_PATH = path.resolve(
    process.cwd(),
    ".agent/reports/test-stability.json"
);
const FLAKY_THRESHOLD = 0.2; // 20% failure rate

function loadReport(): StabilityReport {
    if (fs.existsSync(REPORT_PATH)) {
        return JSON.parse(fs.readFileSync(REPORT_PATH, "utf-8"));
    }
    return { lastUpdated: "", totalTests: 0, flakyTests: 0, tests: {} };
}

function saveReport(report: StabilityReport): void {
    const dir = path.dirname(REPORT_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
}

function parseVitestResults(filePath: string): TestResult[] {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const results: TestResult[] = [];

    for (const file of raw.testResults || []) {
        for (const test of file.assertionResults || []) {
            results.push({
                name: test.fullName || test.title,
                suite: file.name || "unknown",
                passed: test.status === "passed",
                duration: test.duration || 0,
            });
        }
    }
    return results;
}

function parsePlaywrightResults(filePath: string): TestResult[] {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const results: TestResult[] = [];

    for (const suite of raw.suites || []) {
        for (const spec of suite.specs || []) {
            for (const test of spec.tests || []) {
                results.push({
                    name: `${suite.title} > ${spec.title}`,
                    suite: suite.file || "unknown",
                    passed: test.status === "expected",
                    duration: test.results?.[0]?.duration || 0,
                });
            }
        }
    }
    return results;
}

function updateReport(results: TestResult[]): StabilityReport {
    const report = loadReport();
    const now = new Date().toISOString();

    for (const result of results) {
        const key = `${result.suite}::${result.name}`;
        if (!report.tests[key]) {
            report.tests[key] = {
                name: result.name,
                suite: result.suite,
                runs: 0,
                failures: 0,
                failRate: 0,
                lastFailed: null,
                isFlaky: false,
            };
        }

        const entry = report.tests[key];
        entry.runs++;
        if (!result.passed) {
            entry.failures++;
            entry.lastFailed = now;
        }
        entry.failRate = entry.failures / entry.runs;
        entry.isFlaky = entry.runs >= 3 && entry.failRate >= FLAKY_THRESHOLD;
    }

    report.lastUpdated = now;
    report.totalTests = Object.keys(report.tests).length;
    report.flakyTests = Object.values(report.tests).filter(
        (t) => t.isFlaky
    ).length;

    return report;
}

// Main
const args = process.argv.slice(2);
const vitestIdx = args.indexOf("--vitest");
const playwrightIdx = args.indexOf("--playwright");

let allResults: TestResult[] = [];

if (vitestIdx !== -1 && args[vitestIdx + 1]) {
    console.log(`📊 Parsing Vitest results: ${args[vitestIdx + 1]}`);
    allResults = allResults.concat(parseVitestResults(args[vitestIdx + 1]));
}

if (playwrightIdx !== -1 && args[playwrightIdx + 1]) {
    console.log(`📊 Parsing Playwright results: ${args[playwrightIdx + 1]}`);
    allResults = allResults.concat(
        parsePlaywrightResults(args[playwrightIdx + 1])
    );
}

if (allResults.length === 0) {
    console.log("ℹ️ No test results provided. Usage:");
    console.log(
        "  npx tsx scripts/track-flaky-tests.ts --vitest results.json --playwright results.json"
    );
    process.exit(0);
}

const report = updateReport(allResults);
saveReport(report);

console.log(`\n📊 Test Stability Report`);
console.log(`  Total tests tracked: ${report.totalTests}`);
console.log(`  Flaky tests (>${FLAKY_THRESHOLD * 100}% fail rate): ${report.flakyTests}`);

if (report.flakyTests > 0) {
    console.log(`\n⚠️ Flaky Tests:`);
    Object.values(report.tests)
        .filter((t) => t.isFlaky)
        .sort((a, b) => b.failRate - a.failRate)
        .forEach((t) => {
            console.log(
                `  🔴 ${t.name} — ${(t.failRate * 100).toFixed(0)}% fail rate (${t.failures}/${t.runs} runs)`
            );
        });
}

console.log(`\n✅ Report saved to ${REPORT_PATH}`);
