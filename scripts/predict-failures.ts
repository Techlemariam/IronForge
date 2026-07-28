/**
 * Predict Failures
 *
 * Analyzes git diff to predict which CI specialists will likely be needed.
 * Runs as a pre-step in l1-verify to give early warnings.
 *
 * Usage: npx tsx scripts/predict-failures.ts
 */

import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import {
  formatDatabasePreflightSummary,
  runDatabasePreflight,
} from './ci/database-preflight.js';

interface RiskArea {
  specialist: string;
  risk: 'high' | 'medium' | 'low';
  reason: string;
  matchedFiles: string[];
}

const RISK_PATTERNS: {
  pattern: RegExp;
  specialist: string;
  risk: 'high' | 'medium';
  reason: string;
}[] = [
  {
    pattern: /prisma\/schema\.prisma/,
    specialist: 'doctor-infra',
    risk: 'high',
    reason: 'Prisma schema changed — DB Guard will verify drift',
  },
  {
    pattern: /prisma\/migrations\//,
    specialist: 'doctor-infra',
    risk: 'high',
    reason: 'Migration files modified — shadow DB validation required',
  },
  {
    pattern: /tests\/e2e\//,
    specialist: 'doctor-qa',
    risk: 'medium',
    reason: 'E2E test files changed — Playwright suite may be affected',
  },
  {
    pattern: /\.github\/workflows\//,
    specialist: 'doctor-meta',
    risk: 'high',
    reason: 'CI workflow files changed — Governance Guard will validate',
  },
  {
    pattern: /docker-compose|Dockerfile/,
    specialist: 'doctor-infra',
    risk: 'high',
    reason: 'Docker config changed — container build may break',
  },
  {
    pattern: /src\/components\//,
    specialist: 'doctor-ui-ux',
    risk: 'medium',
    reason: 'UI components changed — visual/a11y regression possible',
  },
  {
    pattern: /package\.json|pnpm-lock/,
    specialist: 'doctor-code',
    risk: 'medium',
    reason: 'Dependencies changed — lockfile sync and audit needed',
  },
  {
    pattern: /src\/app\/api\//,
    specialist: 'doctor-code',
    risk: 'medium',
    reason: 'API routes changed — type safety and Zod validation at risk',
  },
  {
    pattern: /\.env|secrets/i,
    specialist: 'doctor-security',
    risk: 'high',
    reason: 'Environment/secret files touched — exposure risk',
  },
];

function getChangedFiles(): string[] {
  try {
    const diff = execSync('git diff --name-only HEAD~1 HEAD', {
      encoding: 'utf-8',
    }).trim();
    if (!diff) return [];
    return diff.split('\n').filter(Boolean);
  } catch {
    try {
      const diff = execSync('git diff --name-only main...HEAD', {
        encoding: 'utf-8',
      }).trim();
      return diff ? diff.split('\n').filter(Boolean) : [];
    } catch {
      console.log('⚠️ Could not determine changed files');
      return [];
    }
  }
}

function analyzeRisks(files: string[]): RiskArea[] {
  const risks: RiskArea[] = [];

  for (const rule of RISK_PATTERNS) {
    const matched = files.filter((file) => rule.pattern.test(file));
    if (matched.length > 0) {
      risks.push({
        specialist: rule.specialist,
        risk: rule.risk,
        reason: rule.reason,
        matchedFiles: matched,
      });
    }
  }

  return risks;
}

function writeJobSummary(summary: string): void {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`, 'utf8');
}

function reportRiskAnalysis(files: string[]): void {
  console.log('\n🔮 Predictive Failure Analysis');
  console.log(`  Files changed: ${files.length}`);

  if (files.length === 0) {
    console.log('  ℹ️ No changed files detected. Skipping diff analysis.');
    return;
  }

  const risks = analyzeRisks(files);
  if (risks.length === 0) {
    console.log('  ✅ No high-risk areas detected. Low failure probability.');
    return;
  }

  const highRisks = risks.filter((risk) => risk.risk === 'high');
  const mediumRisks = risks.filter((risk) => risk.risk === 'medium');

  console.log(`\n  🔴 High-risk areas: ${highRisks.length}`);
  console.log(`  🟡 Medium-risk areas: ${mediumRisks.length}`);

  for (const risk of risks) {
    const icon = risk.risk === 'high' ? '🔴' : '🟡';
    console.log(`\n  ${icon} ${risk.specialist}: ${risk.reason}`);
    risk.matchedFiles.forEach((file) => console.log(`     → ${file}`));
  }

  if (process.env.GITHUB_ACTIONS) {
    for (const risk of highRisks) {
      console.log(
        `::warning title=Predictive Analysis::${risk.specialist}: ${risk.reason} (${risk.matchedFiles.length} files)`
      );
    }
  }
}

async function main(): Promise<void> {
  const databasePreflight = await runDatabasePreflight();
  const databaseSummary = formatDatabasePreflightSummary(databasePreflight);

  console.log(`\nDatabase preflight: ${databasePreflight.classification}`);
  console.log('Database endpoint values and raw diagnostics are intentionally omitted.');
  writeJobSummary(databaseSummary);

  reportRiskAnalysis(getChangedFiles());
}

main().catch(() => {
  console.log('::warning title=Database Preflight::Sanitized database preflight could not complete.');
  console.log('No raw exception details were emitted.');
});
