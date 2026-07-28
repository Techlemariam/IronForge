import { execFile } from 'node:child_process';
import { lookup } from 'node:dns/promises';
import { Socket } from 'node:net';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type ProbeStatus =
  | 'failed'
  | 'invalid'
  | 'missing'
  | 'reachable'
  | 'refused'
  | 'resolved'
  | 'skipped'
  | 'timed-out'
  | 'unreachable'
  | 'valid';

export interface DatabasePreflightResult {
  classification: string;
  configuration: ProbeStatus;
  dns: ProbeStatus;
  schema: ProbeStatus;
  tcp: ProbeStatus;
}

function classifySocketError(error: unknown): ProbeStatus {
  if (!(error instanceof Error) || !('code' in error)) {
    return 'unreachable';
  }

  switch (String(error.code)) {
    case 'ECONNREFUSED':
      return 'refused';
    case 'ETIMEDOUT':
      return 'timed-out';
    default:
      return 'unreachable';
  }
}

async function validatePrismaSchema(): Promise<ProbeStatus> {
  const executable = process.platform === 'win32' ? 'npx.cmd' : 'npx';

  try {
    await execFileAsync(executable, ['prisma', 'validate'], {
      env: process.env,
      maxBuffer: 1024 * 1024,
      timeout: 15_000,
    });
    return 'valid';
  } catch {
    return 'invalid';
  }
}

async function probeTcp(host: string, port: number): Promise<ProbeStatus> {
  return await new Promise((resolve) => {
    const socket = new Socket();
    let settled = false;

    const finish = (status: ProbeStatus) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(status);
    };

    socket.setTimeout(3_000);
    socket.once('connect', () => finish('reachable'));
    socket.once('timeout', () => finish('timed-out'));
    socket.once('error', (error) => finish(classifySocketError(error)));
    socket.connect(port, host);
  });
}

function classifyResult(result: Omit<DatabasePreflightResult, 'classification'>): string {
  if (result.configuration === 'missing') return 'database-url-missing';
  if (result.configuration === 'invalid') return 'database-url-invalid';
  if (result.schema === 'invalid') return 'prisma-schema-invalid';
  if (result.dns === 'failed') return 'database-dns-resolution-failed';
  if (result.tcp === 'refused') return 'database-connection-refused';
  if (result.tcp === 'timed-out') return 'database-connection-timed-out';
  if (result.tcp === 'unreachable') return 'database-endpoint-unreachable';
  if (result.tcp === 'reachable') return 'database-endpoint-reachable';
  return 'database-preflight-incomplete';
}

export async function runDatabasePreflight(): Promise<DatabasePreflightResult> {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const schema = await validatePrismaSchema();

  if (!databaseUrl) {
    const result = {
      configuration: 'missing' as const,
      dns: 'skipped' as const,
      schema,
      tcp: 'skipped' as const,
    };
    return { ...result, classification: classifyResult(result) };
  }

  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !parsed.hostname) {
      throw new Error('Unsupported database URL');
    }
  } catch {
    const result = {
      configuration: 'invalid' as const,
      dns: 'skipped' as const,
      schema,
      tcp: 'skipped' as const,
    };
    return { ...result, classification: classifyResult(result) };
  }

  let dns: ProbeStatus = 'resolved';
  try {
    await lookup(parsed.hostname);
  } catch {
    dns = 'failed';
  }

  const tcp = dns === 'resolved' ? await probeTcp(parsed.hostname, Number(parsed.port || 5432)) : 'skipped';
  const result = {
    configuration: 'valid' as const,
    dns,
    schema,
    tcp,
  };

  return { ...result, classification: classifyResult(result) };
}

export function formatDatabasePreflightSummary(result: DatabasePreflightResult): string {
  return [
    '## Sanitized database preflight',
    '',
    `- Classification: \`${result.classification}\``,
    `- DATABASE_URL: \`${result.configuration}\``,
    `- Prisma schema: \`${result.schema}\``,
    `- DNS resolution: \`${result.dns}\``,
    `- TCP endpoint: \`${result.tcp}\``,
    '',
    'Endpoint values, credentials, database names and raw command output are intentionally omitted.',
  ].join('\n');
}
