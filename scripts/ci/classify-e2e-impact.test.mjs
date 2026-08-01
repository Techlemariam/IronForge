import assert from 'node:assert/strict';
import test from 'node:test';

import {
  classifyE2EImpact,
  isControlPlanePath,
  normalizeRepositoryPath,
} from './classify-e2e-impact.mjs';

test('normalizes repository-relative paths', () => {
  assert.equal(normalizeRepositoryPath('./.github/workflows/ci-cd.yml'), '.github/workflows/ci-cd.yml');
  assert.equal(normalizeRepositoryPath('docs\\operations\\runbook.md'), 'docs/operations/runbook.md');
});

test('rejects absolute and traversal paths', () => {
  assert.equal(normalizeRepositoryPath('/tmp/file'), null);
  assert.equal(normalizeRepositoryPath('C:/temp/file'), null);
  assert.equal(normalizeRepositoryPath('../outside'), null);
  assert.equal(normalizeRepositoryPath('docs/../src/app.ts'), null);
});

test('recognizes only explicit control-plane paths', () => {
  assert.equal(isControlPlanePath('.github/workflows/ci-cd.yml'), true);
  assert.equal(isControlPlanePath('.agent/workflows/ci-doctor.md'), true);
  assert.equal(isControlPlanePath('docs/adr/example.md'), true);
  assert.equal(isControlPlanePath('SYSTEM_HEALTH.md'), true);
  assert.equal(isControlPlanePath('docker/Dockerfile.panopticon-runner'), true);
  assert.equal(isControlPlanePath('scripts/app-intelligence.ts'), true);
  assert.equal(isControlPlanePath('scripts/ci/helper.mjs'), true);
  assert.equal(isControlPlanePath('src/features/training/SetRow.tsx'), false);
  assert.equal(isControlPlanePath('prisma/schema.prisma'), false);
  assert.equal(isControlPlanePath('package.json'), false);
});

test('classifies a workflow-only PR as control-plane-only', () => {
  const result = classifyE2EImpact([
    '.github/workflows/dependabot-auto-merge.yml',
    'docs/operations/dependabot.md',
  ]);

  assert.deepEqual(result, {
    runE2E: false,
    classification: 'control_plane_only',
    changedPathCount: 2,
    controlPlanePathCount: 2,
    runtimePathCount: 0,
  });
});

test('classifies the Snyk removal scope as control-plane-only', () => {
  const result = classifyE2EImpact([
    '.agent/skills/security-auditor/SKILL.md',
    '.github/workflows/ci-cd.yml',
    '.github/workflows/nightly-maintenance.yml',
    '.github/workflows/snyk-security.yml',
    '.snyk',
    'SYSTEM_HEALTH.md',
    'architecture.md',
    'docker/Dockerfile.panopticon-runner',
    'docs/adr/001-standardized-panopticon-runner.md',
    'scripts/app-intelligence.ts',
    'task.md',
  ]);

  assert.equal(result.runE2E, false);
  assert.equal(result.classification, 'control_plane_only');
  assert.equal(result.runtimePathCount, 0);
});

test('requires E2E for application, database, test and dependency changes', () => {
  for (const repositoryPath of [
    'src/features/training/SetRow.tsx',
    'apps/discord-bot/src/index.ts',
    'prisma/schema.prisma',
    'tests/e2e/progression.spec.ts',
    'package.json',
    'pnpm-lock.yaml',
  ]) {
    const result = classifyE2EImpact([repositoryPath]);
    assert.equal(result.runE2E, true, repositoryPath);
    assert.equal(result.classification, 'runtime_or_unknown', repositoryPath);
  }
});

test('fails closed when any unknown path is mixed with control-plane paths', () => {
  const result = classifyE2EImpact([
    '.github/workflows/ci-cd.yml',
    'config/runtime-policy.json',
  ]);

  assert.equal(result.runE2E, true);
  assert.equal(result.runtimePathCount, 1);
});

test('fails closed for empty or invalid input', () => {
  assert.equal(classifyE2EImpact([]).runE2E, true);
  assert.equal(classifyE2EImpact(['', '../outside']).runE2E, true);
});

test('deduplicates normalized paths', () => {
  const result = classifyE2EImpact([
    './docs/runbook.md',
    'docs/runbook.md',
  ]);

  assert.equal(result.changedPathCount, 1);
  assert.equal(result.controlPlanePathCount, 1);
  assert.equal(result.runE2E, false);
});
