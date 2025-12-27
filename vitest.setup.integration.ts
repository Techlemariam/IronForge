import { PrismaClient } from '@prisma/client';
import { beforeEach, afterAll, beforeAll } from 'vitest';

const prisma = new PrismaClient();

beforeAll(async () => {
    // Ensure connection
    await prisma.$connect();
});

beforeEach(async () => {
    // Clean database before each test
    // Truncate all tables in specific order or cascade
    const tablenames = await prisma.$queryRaw<
        Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
        .map(({ tablename }) => tablename)
        .filter((name) => name !== '_prisma_migrations')
        .map((name) => `"public"."${name}"`)
        .join(', ');

    if (tables.length > 0) {
        try {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
        } catch (error) {
            console.log({ error });
        }
    }
});

afterAll(async () => {
    await prisma.$disconnect();
});
