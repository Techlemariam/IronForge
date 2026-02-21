import pg from 'pg';
const { Client } = pg;

async function setupDatabase() {
    const dbName = process.env.TARGET_DB || 'ironforge_shadow';
    const connectionString = process.env.ADMIN_DATABASE_URL || 'postgresql://postgres:password@127.0.0.1:5432/postgres';

    console.log(`🚀 Setting up database: ${dbName}`);
    console.log(`🔗 Connecting to: ${connectionString.replace(/:([^:@]+)@/, ':****@')}`);

    const client = new Client({ connectionString });
    let retries = 5;
    let connected = false;

    while (retries > 0 && !connected) {
        try {
            await client.connect();
            connected = true;
            console.log('✅ Connected to database server.');
        } catch (err) {
            retries--;
            console.warn(`⚠️ Connection failed. Retries left: ${retries}. Error: ${err instanceof Error ? err.message : String(err)}`);
            if (retries === 0) {
                console.error('❌ Failed to connect to database server after all retries.');
                process.exit(1);
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    try {
        // Check if database exists
        const checkRes = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);

        if (checkRes.rowCount && checkRes.rowCount > 0) {
            console.log(`✅ Database ${dbName} already exists.`);
        } else {
            // Create database
            // Note: CREATE DATABASE cannot be executed in a transaction block
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`✨ Database ${dbName} created successfully.`);
        }
    } catch (error) {
        console.error('❌ Error setting up database:', error);
        process.exit(1);
    } finally {
        if (connected) {
            await client.end();
        }
    }
}

setupDatabase();
