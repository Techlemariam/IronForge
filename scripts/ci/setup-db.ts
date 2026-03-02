import pg from 'pg';
const { Client } = pg;

async function setupDatabase() {
    const dbName = process.env.TARGET_DB || 'ironforge_shadow';
    const connectionString = process.env.ADMIN_DATABASE_URL || 'postgresql://postgres:password@127.0.0.1:5432/postgres';

    console.log(`🚀 Setting up database: "${dbName}"`);
    console.log(`🔗 Connecting to: ${connectionString.replace(/:([^:@]+)@/, ':****@')}`);

    let retries = 5;
    let connected = false;
    let client: pg.Client | null = null;

    while (retries > 0 && !connected) {
        try {
            client = new Client({ connectionString });
            await client.connect();
            connected = true;
            console.log('✅ Connected to database server.');
        } catch (err) {
            retries--;
            console.warn(`⚠️ Connection failed. Retries left: ${retries}. Error: ${err instanceof Error ? err.message : String(err)}`);
            if (client) {
                await client.end().catch(() => { });
            }
            if (retries === 0) {
                console.error('❌ Failed to connect to database server after all retries.');
                process.exit(1);
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    if (!client) {
        console.error('❌ Client initialization failed.');
        process.exit(1);
    }

    try {
        // Check if database exists
        console.log(`🔍 Checking if database "${dbName}" exists...`);
        const checkRes = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
        const exists = checkRes.rowCount && checkRes.rowCount > 0;

        if (exists) {
            console.log(`♻️ Database "${dbName}" already exists. Dropping for a clean slate...`);
            // Quote identifier to handle any special characters and ensure precision
            await client.query(`DROP DATABASE "${dbName}" WITH (FORCE)`);
            console.log(`✅ Database "${dbName}" dropped.`);
        } else {
            console.log(`ℹ️ Database "${dbName}" does not exist.`);
        }

        try {
            console.log(`🔄 Attempting to refresh collation version for template1...`);
            await client.query(`ALTER DATABASE template1 REFRESH COLLATION VERSION`);
        } catch (collationError) {
            console.warn(`⚠️ Could not refresh collation version for template1:`, collationError instanceof Error ? collationError.message : String(collationError));
        }

        // Create database
        console.log(`🏗️ Creating database "${dbName}"...`);
        await client.query(`CREATE DATABASE "${dbName}" LC_COLLATE 'C' LC_CTYPE 'C'`);
        console.log(`✨ Database "${dbName}" created successfully.`);
    } catch (error) {
        console.error('❌ Error setting up database:', error);
        // Log more PG-specific details if available
        if (typeof error === 'object' && error !== null) {
            console.error('Debug details:', JSON.stringify(error, null, 2));
        }
        process.exit(1);
    } finally {
        if (connected) {
            await client.end();
        }
    }
}

setupDatabase();
