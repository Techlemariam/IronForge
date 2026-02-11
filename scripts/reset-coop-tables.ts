
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.error('No database connection string found in .env');
    process.exit(1);
}

const client = new pg.Client({
    connectionString: connectionString.replace('?pgbouncer=true', ''), // Use direct connection if possible
});

async function reset() {
    try {
        console.log('Connecting to database...');
        await client.connect();

        console.log('Dropping session_participants table...');
        await client.query('DROP TABLE IF EXISTS "session_participants" CASCADE;');

        console.log('Dropping active_sessions table...');
        await client.query('DROP TABLE IF EXISTS "active_sessions" CASCADE;');

        console.log('Dropping InventorySlot table (untracked drift)...');
        await client.query('DROP TABLE IF EXISTS "InventorySlot" CASCADE;');

        console.log('Dropping _prisma_migrations for co-op tables if exists (to be safe)...');
        // Note: Prisma tracks this in _prisma_migrations. If it's not applied, we don't need to delete it.

        console.log('Database cleanup complete.');
    } catch (err) {
        console.error('Error during reset:', err);
    } finally {
        await client.end();
    }
}

reset();
