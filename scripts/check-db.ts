import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Basic Database Health Check
 * Used by CI/CD and local runners to verify connectivity.
 */
async function checkDatabase() {
    console.log('🔍 Checking Database Connectivity...');

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('❌ ERROR: DATABASE_URL environment variable is not set.');
        process.exit(1);
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        // Simple query to verify connection
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connection successful.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

checkDatabase().catch((err) => {
    console.error('💥 Fatal error during DB check:', err);
    process.exit(1);
});
