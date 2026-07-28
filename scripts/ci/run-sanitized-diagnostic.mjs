#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { appendFile } from 'node:fs/promises';

const MAX_CAPTURE = 1024 * 1024;

const DOCKER_RULES = [
  {
    pattern: /cannot connect to the docker daemon|is the docker daemon running/i,
    category: 'docker-daemon-unreachable',
    guidance: 'The Docker daemon could not be reached from the runner.',
  },
  {
    pattern: /permission denied[^\n]*docker\.sock|docker\.sock[^\n]*permission denied/i,
    category: 'docker-daemon-permission-denied',
    guidance: 'The runner identity cannot access the Docker socket.',
  },
  {
    pattern: /no space left on device/i,
    category: 'docker-runner-storage-exhausted',
    guidance: 'The runner or Docker storage backend has insufficient free space.',
  },
  {
    pattern: /failed to read dockerfile|dockerfile[^\n]*(not found|no such file)/i,
    category: 'dockerfile-unavailable',
    guidance: 'The Dockerfile could not be read from the build context.',
  },
  {
    pattern: /dockerfile parse error|failed to parse dockerfile/i,
    category: 'dockerfile-parse-error',
    guidance: 'Docker could not parse the Dockerfile.',
  },
  {
    pattern: /failed to compute cache key|failed to calculate checksum/i,
    category: 'docker-build-context-invalid',
    guidance: 'A referenced build-context file or cache input could not be resolved.',
  },
  {
    pattern: /temporary failure in name resolution|could not resolve host|network is unreachable/i,
    category: 'docker-build-network-failure',
    guidance: 'The build failed while resolving or reaching an external dependency.',
  },
  {
    pattern: /context canceled|operation was canceled/i,
    category: 'docker-build-cancelled',
    guidance: 'The Docker build was cancelled before completion.',
  },
  {
    pattern: /executor failed running|process .* did not complete successfully/i,
    category: 'docker-build-step-failed',
    guidance: 'A Dockerfile build step returned a non-zero exit status.',
  },
  {
    pattern: /failed to solve/i,
    category: 'docker-build-failed',
    guidance: 'BuildKit reported a build failure that did not match a narrower category.',
  },
];

function appendRolling(buffer, chunk) {
  const combined = buffer + chunk.toString('utf8');
  return combined.length > MAX_CAPTURE ? combined.slice(-MAX_CAPTURE) : combined;
}

function parseArguments(argv) {
  if (argv.includes('--self-test')) {
    return { selfTest: true };
  }

  const separator = argv.indexOf('--');
  if (separator === -1 || separator === argv.length - 1) {
    throw new Error('Expected command after --');
  }

  const options = argv.slice(0, separator);
  const command = argv[separator + 1];
  const commandArgs = argv.slice(separator + 2);
  const kindIndex = options.indexOf('--kind');
  const labelIndex = options.indexOf('--label');

  if (kindIndex === -1 || !options[kindIndex + 1]) {
    throw new Error('Expected --kind');
  }

  return {
    selfTest: false,
    kind: options[kindIndex + 1],
    label: labelIndex === -1 ? 'CI diagnostic command' : options[labelIndex + 1],
    command,
    commandArgs,
  };
}

function dockerStage(output) {
  const matches = [...output.matchAll(/#\d+\s+\[([A-Za-z0-9_.-]+)\s+(\d+\/\d+)\]/g)];
  const match = matches.at(-1);
  return match ? `${match[1]} ${match[2]}` : null;
}

export function classifyDiagnostic(kind, output, spawnError = null) {
  if (spawnError) {
    return {
      category: 'diagnostic-command-unavailable',
      guidance: 'The requested diagnostic command could not be started.',
      stage: null,
    };
  }

  if (kind === 'docker') {
    const rule = DOCKER_RULES.find((candidate) => candidate.pattern.test(output));
    return {
      category: rule?.category ?? 'docker-build-unknown-failure',
      guidance:
        rule?.guidance ??
        'The raw build output was withheld because no safe diagnostic category matched.',
      stage: dockerStage(output),
    };
  }

  return {
    category: 'unsupported-diagnostic-kind',
    guidance: 'No classifier exists for this diagnostic kind.',
    stage: null,
  };
}

function safeLabel(label) {
  return String(label).replace(/[\r\n]/g, ' ').slice(0, 120);
}

function formatSummary({ label, success, exitCode, diagnostic }) {
  const lines = [
    `## ${safeLabel(label)}`,
    '',
    `- Result: \`${success ? 'success' : 'failure'}\``,
    `- Exit code: \`${exitCode ?? 'unavailable'}\``,
  ];

  if (!success) {
    lines.push(`- Classification: \`${diagnostic.category}\``);
    if (diagnostic.stage) lines.push(`- Last BuildKit stage: \`${diagnostic.stage}\``);
    lines.push(`- Guidance: ${diagnostic.guidance}`);
  }

  lines.push(
    '',
    'Raw command output, URLs, credentials, hostnames, IP addresses and runner paths are intentionally omitted.'
  );
  return lines.join('\n');
}

async function writeSummary(summary) {
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`, 'utf8');
  }
}

function runSelfTest() {
  const daemon = classifyDiagnostic('docker', 'Cannot connect to the Docker daemon');
  const storage = classifyDiagnostic('docker', 'failed: no space left on device');
  const stage = classifyDiagnostic('docker', '#12 [builder 4/8] RUN pnpm build\nfailed to solve');

  if (daemon.category !== 'docker-daemon-unreachable') throw new Error('daemon classifier failed');
  if (storage.category !== 'docker-runner-storage-exhausted') throw new Error('storage classifier failed');
  if (stage.stage !== 'builder 4/8') throw new Error('stage classifier failed');

  console.log('Sanitized diagnostic self-test passed.');
}

async function main() {
  const parsed = parseArguments(process.argv.slice(2));
  if (parsed.selfTest) {
    runSelfTest();
    return;
  }

  let output = '';
  let spawnError = null;
  const child = spawn(parsed.command, parsed.commandArgs, {
    env: process.env,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => {
    output = appendRolling(output, chunk);
  });
  child.stderr.on('data', (chunk) => {
    output = appendRolling(output, chunk);
  });
  child.once('error', (error) => {
    spawnError = error;
  });

  const heartbeat = setInterval(() => {
    console.log('Diagnostic command is still running; raw output remains withheld.');
  }, 30_000);

  const exitCode = await new Promise((resolve) => {
    child.once('close', (code) => resolve(code));
  });
  clearInterval(heartbeat);

  const success = !spawnError && exitCode === 0;
  const diagnostic = classifyDiagnostic(parsed.kind, output, spawnError);
  const summary = formatSummary({
    label: parsed.label,
    success,
    exitCode,
    diagnostic,
  });
  await writeSummary(summary);

  if (!success) process.exitCode = typeof exitCode === 'number' && exitCode !== 0 ? exitCode : 1;
}

main().catch(async () => {
  await writeSummary(
    [
      '## Sanitized CI diagnostic',
      '',
      '- Result: `failure`',
      '- Classification: `diagnostic-wrapper-failed`',
      '',
      'No raw exception details were emitted.',
    ].join('\n')
  );
  process.exitCode = 1;
});
