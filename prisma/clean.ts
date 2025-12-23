
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    // Delete in order to avoid FK errors
    await prisma.unlockedMonster.deleteMany({})
    await prisma.raidBoss.deleteMany({})
    await prisma.worldRegion.deleteMany({})
    console.log('Cleaned DB')
}
main()
