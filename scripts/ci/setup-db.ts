import pg from 'pg';
const { Client } = pg;

async function setupDatabase() {
    const dbName = process.env.TARGET_DB || 'ironforge_shadow';
    const connectionString = process.env.ADMIN_DATABASE_URL || 'postgresql://postgres:password@127.0.0.1:5432/postgres';

    console.log(`🚀 Setting up database: ${dbName}`);
    console.log(`🔗 Connecting to: ${connectionString.replace(/:([^:@]+)@/, ':****@')}`);

    const client = new Client({ connectionString });

    try {
        await client.connect();

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
        await client.end();
    }
}

setupDatabase();
