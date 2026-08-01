#!/usr/bin/env node

import { appendFileSync, readFileSync } from 'node:fs';

const exactControlPlanePaths = new Set([
  '.snyk',
  'docker/Dockerfile.panopticon-runner',
  'scripts/app-intelligence.ts',
]);

const controlPlanePrefixes = [
  '.github/',
  '.agent/',
  'docs/',
  'scripts/ci/',
];

export function normalizeRepositoryPath(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().replaceAll('\\', '/').replace(/^\.\//, '');
  if (
    normalized.length === 0 ||
    normalized.startsWith('/') ||
    /^[A-Za-z]:\//.test(normalized) ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.includes('/../')
  ) {
    return null;
  }

  return normalized;
}

export function isControlPlanePath(value) {
  const repositoryPath = normalizeRepositoryPath(value);
  if (!repositoryPath) {
    return false;
  }

  if (repositoryPath.toLowerCase().endsWith('.md')) {
    return true;
  }

  if (exactControlPlanePaths.has(repositoryPath)) {
    return true;
  }

  return controlPlanePrefixes.some((prefix) => repositoryPath.startsWith(prefix));
}

export function classifyE2EImpact(values) {
  const normalizedPaths = [];
  let invalidPathCount = 0;

  for (const value of values ?? []) {
    const repositoryPath = normalizeRepositoryPath(value);
    if (!repositoryPath) {
      invalidPathCount += 1;
      continue;
    }

    if (!normalizedPaths.includes(repositoryPath)) {
      normalizedPaths.push(repositoryPath);
    }
  }

  if (normalizedPaths.length === 0) {
    return {
      runE2E: true,
      classification: invalidPathCount > 0 ? 'invalid_or_empty_fail_closed' : 'empty_fail_closed',
      changedPathCount: 0,
      controlPlanePathCount: 0,
      runtimePathCount: invalidPathCount,
    };
  }

  const runtimePathCount =
    normalizedPaths.filter((repositoryPath) => !isControlPlanePath(repositoryPath)).length +
    invalidPathCount;
  const controlPlanePathCount = normalizedPaths.length - (runtimePathCount - invalidPathCount);

  return {
    runE2E: runtimePathCount > 0,
    classification: runtimePathCount > 0 ? 'runtime_or_unknown' : 'control_plane_only',
    changedPathCount: normalizedPaths.length + invalidPathCount,
    controlPlanePathCount,
    runtimePathCount,
  };
}

function parseArguments(argv) {
  const options = {
    filesFrom: '',
    githubOutput: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--files-from') {
      options.filesFrom = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (argument === '--github-output') {
      options.githubOutput = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  if (!options.filesFrom) {
    throw new Error('--files-from is required');
  }

  return options;
}

function runCli() {
  const options = parseArguments(process.argv.slice(2));
  const changedPaths = readFileSync(options.filesFrom, 'utf8').split(/\r?\n/);
  const result = classifyE2EImpact(changedPaths);

  console.log(`IRONFORGE_E2E_IMPACT_CLASSIFICATION=${result.classification}`);
  console.log(`IRONFORGE_E2E_IMPACT_CHANGED_PATH_COUNT=${result.changedPathCount}`);
  console.log(`IRONFORGE_E2E_IMPACT_CONTROL_PLANE_PATH_COUNT=${result.controlPlanePathCount}`);
  console.log(`IRONFORGE_E2E_IMPACT_RUNTIME_PATH_COUNT=${result.runtimePathCount}`);
  console.log(`IRONFORGE_E2E_IMPACT_RUN_E2E=${String(result.runE2E)}`);

  if (options.githubOutput) {
    appendFileSync(
      options.githubOutput,
      [
        `run-e2e=${String(result.runE2E)}`,
        `classification=${result.classification}`,
        `changed-path-count=${result.changedPathCount}`,
        `runtime-path-count=${result.runtimePathCount}`,
        '',
      ].join('\n'),
      'utf8',
    );
  }
}

if (process.argv[1]?.endsWith('classify-e2e-impact.mjs')) {
  try {
    runCli();
  } catch (error) {
    console.error('IRONFORGE_E2E_IMPACT_CLASSIFICATION=error_fail_closed');
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
