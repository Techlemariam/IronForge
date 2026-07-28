#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const RULES = [
  [/cannot connect to the docker daemon|is the docker daemon running/i, 'docker-daemon-unreachable'],
  [/permission denied[^\n]*docker\.sock|docker\.sock[^\n]*permission denied/i, 'docker-permission-denied'],
  [/no space left on device/i, 'docker-storage-exhausted'],
  [/failed to read dockerfile|dockerfile[^\n]*(not found|no such file)/i, 'dockerfile-unavailable'],
  [/dockerfile parse error|failed to parse dockerfile/i, 'dockerfile-parse-error'],
  [/failed to compute cache key|failed to calculate checksum/i, 'docker-build-context-invalid'],
  [/temporary failure in name resolution|could not resolve host|network is unreachable/i, 'docker-network-failure'],
  [/executor failed running|process .* did not complete successfully/i, 'docker-build-step-failed'],
  [/failed to solve/i, 'docker-build-failed'],
];

function classify(output) {
  return RULES.find(([pattern]) => pattern.test(output))?.[1] ?? 'docker-unknown-failure';
}

function lastStage(output) {
  const matches = [...output.matchAll(/#\d+\s+\[([A-Za-z0-9_.-]+)\s+(\d+\/\d+)\]/g)];
  const match = matches.at(-1);
  return match ? `${match[1]} ${match[2]}` : null;
}

function writeSummary(label, result, exitCode, category, stage) {
  const lines = [
    `## ${label.replace(/[\r\n]/g, ' ').slice(0, 120)}`,
    '',
    `- Result: \`${result}\``,
    `- Exit code: \`${exitCode ?? 'unavailable'}\``,
  ];

  if (result === 'failure') {
    lines.push(`- Classification: \`${category}\``);
    if (stage) lines.push(`- Last BuildKit stage: \`${stage}\``);
  }

  lines.push(
    '',
    'Raw output, URLs, credentials, hostnames, IP addresses and runner paths are intentionally omitted.'
  );
  const summary = lines.join('\n');
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`, 'utf8');
  }
}

function selfTest() {
  const checks = [
    classify('Cannot connect to the Docker daemon') === 'docker-daemon-unreachable',
    classify('failed: no space left on device') === 'docker-storage-exhausted',
    lastStage('#12 [builder 4/8] RUN pnpm build') === 'builder 4/8',
  ];

  if (checks.some((check) => !check)) throw new Error('Diagnostic self-test failed');
  console.log('Sanitized diagnostic self-test passed.');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--self-test')) {
    selfTest();
    return;
  }

  const separator = args.indexOf('--');
  const labelIndex = args.indexOf('--label');
  if (separator < 0 || !args[separator + 1]) throw new Error('Command missing after --');

  const label = labelIndex >= 0 ? args[labelIndex + 1] : 'Sanitized Docker diagnostic';
  const command = args[separator + 1];
  const commandArgs = args.slice(separator + 2);
  let output = '';
  let spawnFailed = false;

  const child = spawn(command, commandArgs, {
    env: process.env,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const capture = (chunk) => {
    output = (output + chunk.toString('utf8')).slice(-1024 * 1024);
  };

  child.stdout.on('data', capture);
  child.stderr.on('data', capture);
  child.once('error', () => {
    spawnFailed = true;
  });

  const heartbeat = setInterval(() => {
    console.log('Docker diagnostic is still running; raw output remains withheld.');
  }, 30_000);

  const exitCode = await new Promise((resolve) => child.once('close', resolve));
  clearInterval(heartbeat);

  const success = !spawnFailed && exitCode === 0;
  const category = spawnFailed ? 'docker-command-unavailable' : classify(output);
  writeSummary(label, success ? 'success' : 'failure', exitCode, category, lastStage(output));

  if (!success) process.exitCode = typeof exitCode === 'number' && exitCode !== 0 ? exitCode : 1;
}

main().catch(() => {
  writeSummary('Sanitized Docker diagnostic', 'failure', null, 'diagnostic-wrapper-failed', null);
  process.exitCode = 1;
});
