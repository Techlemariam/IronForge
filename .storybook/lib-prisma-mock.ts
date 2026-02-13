/**
 * Mock for @/lib/prisma to prevent browser-side importing of real client.
 */
import { PrismaClient } from './prisma-mock';

const prisma = new PrismaClient() as any;

export default prisma;
export { prisma };
