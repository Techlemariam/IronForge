import pg from 'pg';

const { Client } = pg;

const SAFE_SHADOW_DATABASE = /^ironforge_shadow_(?:pr|run)_[1-9][0-9]*$/;
const ALLOWED_ADMIN_HOSTS = new Set(['127.0.0.1', 'localhost', 'host.docker.internal']);
const PROTECTED_DATABASES = new Set([
  'postgres',
  'template0',
  'template1',
  'ironforge_test',
  'ironforge_e2e',
]);

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function maskedConnectionString(connectionString: string): string {
  const parsed = new URL(connectionString);
  if (parsed.password) {
    parsed.password = '****';
  }
  return parsed.toString();
}

function databaseNameFromUrl(connectionString: string | undefined): string | null {
  if (!connectionString) {
    return null;
  }

  const parsed = new URL(connectionString);
  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  return databaseName || null;
}

function resolveTargetDatabase(): string {
  const configuredTarget = process.env.TARGET_DB?.trim() || null;
  const shadowTarget = databaseNameFromUrl(process.env.SHADOW_DATABASE_URL);

  if (
    configuredTarget &&
    configuredTarget !== 'ironforge_shadow' &&
    shadowTarget &&
    configuredTarget !== shadowTarget
  ) {
    throw new Error('TARGET_DB and SHADOW_DATABASE_URL refer to different databases.');
  }

  const target =
    shadowTarget || (configuredTarget === 'ironforge_shadow' ? null : configuredTarget);

  if (!target) {
    throw new Error(
      'A run-scoped SHADOW_DATABASE_URL or TARGET_DB is required; static shadow database names are refused.'
    );
  }

  if (PROTECTED_DATABASES.has(target) || !SAFE_SHADOW_DATABASE.test(target)) {
    throw new Error(
      `Refusing unsafe database target "${target}". Expected ironforge_shadow_pr_<id> or ironforge_shadow_run_<id>.`
    );
  }

  return target;
}

function requireLocalAdminConnection(): string {
  const connectionString = process.env.ADMIN_DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error('ADMIN_DATABASE_URL is required; fallback credentials are not allowed.');
  }

  const parsed = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error('ADMIN_DATABASE_URL must use the PostgreSQL protocol.');
  }

  if (!ALLOWED_ADMIN_HOSTS.has(parsed.hostname)) {
    throw new Error(
      `Refusing non-local database admin host "${parsed.hostname}". This CI helper is local-only.`
    );
  }

  const adminDatabase = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  if (adminDatabase !== 'postgres') {
    throw new Error('ADMIN_DATABASE_URL must connect to the postgres maintenance database.');
  }

  return connectionString;
}

async function connectWithRetry(connectionString: string): Promise<pg.Client> {
  let retries = 5;
  let client: pg.Client | null = null;

  while (retries > 0) {
    try {
      client = new Client({ connectionString });
      await client.connect();
      console.log('✅ Connected to the local database server.');
      return client;
    } catch (error) {
      retries--;
      console.warn(`⚠️ Connection failed. Retries left: ${retries}. Error: ${errorMessage(error)}`);
      if (client) {
        await client.end().catch(() => undefined);
      }
      if (retries === 0) {
        throw new Error('Failed to connect to the local database server after all retries.');
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  throw new Error('Database client initialization failed.');
}

async function prepareDatabase(client: pg.Client, dbName: string): Promise<void> {
  console.log(`🔍 Checking run-scoped database "${dbName}"...`);
  const checkResult = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  const exists = Boolean(checkResult.rowCount && checkResult.rowCount > 0);

  if (exists) {
    console.log(`♻️ Dropping existing run-scoped database "${dbName}"...`);
    await client.query(`DROP DATABASE "${dbName}" WITH (FORCE)`);
    console.log(`✅ Database "${dbName}" dropped.`);
  }

  try {
    await client.query('ALTER DATABASE template1 REFRESH COLLATION VERSION');
  } catch (error) {
    console.warn(`⚠️ Could not refresh template1 collation version: ${errorMessage(error)}`);
  }

  console.log(`🏗️ Creating run-scoped database "${dbName}"...`);
  try {
    await client.query(`CREATE DATABASE "${dbName}"`);
  } catch (error) {
    console.warn(
      `⚠️ Standard CREATE DATABASE failed; retrying with C collation. Error: ${errorMessage(error)}`
    );
    await client.query(`CREATE DATABASE "${dbName}" LC_COLLATE = 'C' LC_CTYPE = 'C'`);
  }
  console.log(`✨ Database "${dbName}" created successfully.`);
}

async function setupDatabase(): Promise<void> {
  const dbName = resolveTargetDatabase();
  const connectionString = requireLocalAdminConnection();

  console.log(`🚀 Preparing run-scoped database: "${dbName}"`);
  console.log(`🔗 Connecting to: ${maskedConnectionString(connectionString)}`);

  const client = await connectWithRetry(connectionString);

  try {
    await prepareDatabase(client, dbName);
  } finally {
    await client.end();
  }
}

setupDatabase().catch((error) => {
  console.error(`❌ Database setup failed: ${errorMessage(error)}`);
  process.exitCode = 1;
});
