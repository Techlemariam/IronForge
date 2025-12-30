import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
    console.log('Migrating Intervals keys from env to DB...')

    const apiKey = process.env.INTERVALS_API_KEY || process.env.VITE_INTERVALS_API_KEY
    const athleteId = process.env.INTERVALS_ATHLETE_ID || process.env.VITE_INTERVALS_ATHLETE_ID || process.env.INTERVALS_USER_ID

    if (!apiKey || !athleteId) {
        console.error('No keys found in environment variables.')
        return
    }

    console.log(`Found API Key: ${apiKey.substring(0, 5)}...`)
    console.log(`Found Athlete ID: ${athleteId}`)

    const user = await prisma.user.findFirst()

    if (!user) {
        console.error('No user found in database to attach keys to.')
        return
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            intervalsApiKey: apiKey,
            intervalsAthleteId: athleteId
        }
    })

    console.log(`Successfully updated user ${user.heroName || user.email} (${user.id}) with Intervals keys.`)
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
