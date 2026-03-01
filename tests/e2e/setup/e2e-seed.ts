import { prisma } from '../../../src/lib/prisma';
import { Faction, Archetype } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

async function main() {
    const redactedUrl = (process.env.DATABASE_URL || '').replace(/:[^:@]+@/, ':****@');
    console.log(`🌱 Starting E2E Database Seeding with URL: ${redactedUrl}`);

    // Robust connection retry logic
    let retries = 5;
    let connected = false;
    while (retries > 0 && !connected) {
        try {
            await prisma.$connect();
            connected = true;
            console.log('✅ Connected to database server via Prisma.');
        } catch (err) {
            retries--;
            console.warn(`⚠️ Prisma connection failed. Retries left: ${retries}. Error: ${err instanceof Error ? err.message : String(err)}`);
            if (retries === 0) {
                console.error('❌ Failed to connect to database server after all retries.');
                process.exit(1);
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    // Authenticate with Supabase to get the REAL User ID
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const testEmail = process.env.TEST_USER_EMAIL || 'alexander.teklemariam@gmail.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'IronForge2025!';

    let userId: string | undefined;

    if (supabaseUrl && supabaseKey) {
        console.log(`🔐 Authenticating with Supabase to sync User ID for ${testEmail}...`);
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
        });

        if (error) {
            console.warn(`⚠️ Failed to sign in with Supabase: ${error.message}. User ID might be mismatched.`);
        } else if (data.user) {
            userId = data.user.id;
            console.log(`✅ Retrieved Supabase User ID: ${userId}`);
        }
    } else {
        console.warn('⚠️ Missing Supabase credentials in env. Skipping ID sync.');
    }

    // 1. Seed Battle Pass Season
    const seasonCode = 'S1';
    console.log(`Checking Battle Pass Season: ${seasonCode}`);

    const season = await prisma.battlePassSeason.upsert({
        where: { code: seasonCode },
        update: {},
        create: {
            name: 'Season 1: Genesis',
            code: seasonCode,
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
            isActive: true,
            tiers: {
                create: Array.from({ length: 50 }).map((_, i) => ({
                    tierLevel: i + 1,
                    requiredXp: (i + 1) * 1000,
                    freeRewardData: { type: 'GOLD', amount: 100 },
                    premiumRewardData: { type: 'ITEM', itemId: `reward-${i + 1}` }
                }))
            }
        }
    });
    console.log(`✅ Battle Pass Season ensured: ${season.id}`);

    // Seed PVP Season for Ranked Arena
    const pvpSeason = await prisma.pvpSeason.upsert({
        where: { id: 'e2e-season-1' },
        update: { isActive: true },
        create: {
            id: 'e2e-season-1',
            name: 'Genesis',
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            isActive: true,
            rewards: []
        }
    });
    console.log(`✅ PVP Season ensured: ${pvpSeason.id}`);

    // 2. Seed Mock Opponents for Duels
    // Create a few users with Titans of different levels
    const opponents = [
        { email: 'opponent1@ironforge.gg', name: 'Iron Breaker', level: 5, power: 500 },
        { email: 'opponent2@ironforge.gg', name: 'Steel Viper', level: 10, power: 1200 },
        { email: 'opponent3@ironforge.gg', name: 'Shadow Walker', level: 15, power: 1800 },
        { email: 'opponent4@ironforge.gg', name: 'Blade Master', level: 8, power: 850 }
    ];

    for (const opp of opponents) {
        const user = await prisma.user.upsert({
            where: { email: opp.email },
            update: {
                titan: {
                    update: {
                        level: opp.level,
                        powerRating: opp.power,
                        currentHp: 100,
                        maxHp: 100,
                        strength: 10 + opp.level,
                        endurance: 10 + opp.level
                    }
                }
            },
            create: {
                email: opp.email,
                heroName: opp.name,
                level: opp.level,
                faction: Faction.HORDE,
                archetype: Archetype.JUGGERNAUT,
                titan: {
                    create: {
                        name: `${opp.name}'s Titan`,
                        level: opp.level,
                        powerRating: opp.power,
                        strength: 10 + opp.level,
                        endurance: 10 + opp.level
                    }
                }
            }
        });
        console.log(`✅ Ensured opponent: ${opp.name} (Lvl ${opp.level}) - ID: ${user.id}`);
    }

    // 3. Seed Main Test User (Hunter) to prevent Onboarding Overlay in E2E
    // Use the retrieved userId if available, otherwise let Prisma generate one (start of problem) or update existing

    // First, check if user exists by email to get their existing ID if we failed to fetch from Supabase
    let existingUser = await prisma.user.findUnique({ where: { email: testEmail } });

    // If we have a Supabase ID, we MUST ensure the user record uses THAT ID.
    // If a user exists with that email but DIFFERENT ID, we have a conflict.
    if (userId && existingUser && existingUser.id !== userId) {
        console.log(`⚠️ User exists with email ${testEmail} but different ID (${existingUser.id} vs ${userId}). Updating ID...`);
        // We can't easily update ID in Prisma if there are foreign keys. 
        // Best approach for seeding: Delete and Recreate if safe, OR try to update if supported.
        // Assuming cascade delete is not always safe, but for E2E user it might be.
        // Let's try to update user ID using raw query or delete-create method if needed. 
        // Prisma update of ID is tricky.
        // Simpler: Just delete the old record.
        try {
            await prisma.user.delete({ where: { email: testEmail } });
            existingUser = null; // Forces recreate below
            console.log('✅ Deleted mismatched ID user.');
        } catch (e) {
            console.error('Failed to delete mismatched user:', e);
        }
    }

    const startData = {
        email: testEmail,
        heroName: 'E2E Hunter',
        level: 10,
        gold: 5000,
        faction: Faction.HORDE,
        archetype: Archetype.PATHFINDER,
        hasCompletedOnboarding: true,
        intervalsApiKey: 'mock-e2e-api-key',
        intervalsAthleteId: 'i123456',
    };

    const titanData = {
        name: 'E2E Titan',
        level: 10,
        powerRating: 800,
        strength: 20,
        endurance: 20,
        agility: 20,
        vitality: 20,
        willpower: 20
    };

    // Use upsert with the CORRECT ID
    // If userId is known, we want to create with that ID.
    // upsert requires 'where' to be unique. Email is unique.

    // Construct create data
    const createData: any = {
        ...startData,
        titan: {
            create: titanData
        }
    };

    const effectiveId = userId || 'e2e-test-user-id';

    const testUser = await prisma.user.upsert({
        where: { email: testEmail },
        update: {
            id: effectiveId,
            heroName: 'E2E Hunter',
            hasCompletedOnboarding: true,
            level: 10,
            gold: 5000,
        },
        create: {
            ...createData,
            id: effectiveId
        }
    });

    console.log(`✅ Ensured Test User: ${testUser.heroName} (Onboarding Completed) with ID: ${testUser.id}`);

    // 4. Seed E2E Guild + Territory so /territory page renders TerritoryStats
    // getUserTerritoryStats() returns null if user has no guildId — causing 'Owned Tiles' to not render
    console.log('🏰 Seeding E2E Guild and Territory...');
    const e2eGuildId = 'e2e-guild-id';

    const e2eGuild = await prisma.guild.upsert({
        where: { id: e2eGuildId },
        update: {
            leaderId: testUser.id,
        },
        create: {
            id: e2eGuildId,
            name: 'E2E Iron Vanguard',
            tag: 'E2EV',
            leaderId: testUser.id,
            isPublic: true,
            xp: 1000,
            level: 3,
            gold: 5000,
        },
    });
    console.log(`✅ Ensured E2E Guild: ${e2eGuild.name} (${e2eGuild.id})`);

    // Assign guild to the test user
    await prisma.user.update({
        where: { id: testUser.id },
        data: { guildId: e2eGuild.id },
    });
    console.log(`✅ Assigned guild ${e2eGuild.tag} to test user.`);

    // Create a territory controlled by the E2E guild
    await prisma.territory.upsert({
        where: { name: 'E2E Iron Peaks' },
        update: { controlledById: e2eGuild.id },
        create: {
            name: 'E2E Iron Peaks',
            region: 'Nordheim',
            type: 'TRAINING_GROUNDS',
            bonuses: { goldPerDay: 100, xpPerDay: 50 },
            coordX: 10,
            coordY: 10,
            controlledById: e2eGuild.id,
            controlledAt: new Date(),
        },
    });
    console.log('✅ Seeded E2E territory controlled by guild.');

    console.log('🌱 Seeding completed successfully.');
}

// Export as default for Playwright globalSetup
export default async function globalSetup() {
    try {
        await main();
    } catch (e) {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Allow standalone execution
if (process.argv[1] && process.argv[1].includes('e2e-seed.ts')) {
    globalSetup();
}
