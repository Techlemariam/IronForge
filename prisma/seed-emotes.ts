import { PrismaClient } from '@prisma/client';
import { Pool as PgPool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
}

const pool = new PgPool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter: adapter as any });

const BATTLE_EMOTES = [
    // Taunts (Free)
    { name: 'Come At Me', category: 'taunt', gifPath: '/assets/emotes/taunts/come-at-me.gif', unlockLevel: 1 },
    { name: 'Too Easy', category: 'taunt', gifPath: '/assets/emotes/taunts/too-easy.gif', unlockLevel: 3 },
    { name: 'Laughing', category: 'taunt', gifPath: '/assets/emotes/taunts/laughing.gif', unlockLevel: 5 },
    { name: 'Nope', category: 'taunt', gifPath: '/assets/emotes/taunts/nope.gif', unlockLevel: 8 },
    { name: 'Bye Bye', category: 'taunt', gifPath: '/assets/emotes/taunts/bye-bye.gif', unlockLevel: 10 },

    // Flex (Free)
    { name: 'Muscle Pose', category: 'flex', gifPath: '/assets/emotes/flex/muscle-pose.gif', unlockLevel: 1 },
    { name: 'Victory Dance', category: 'flex', gifPath: '/assets/emotes/flex/victory-dance.gif', unlockLevel: 5 },
    { name: 'Champion', category: 'flex', gifPath: '/assets/emotes/flex/champion.gif', unlockLevel: 15 },

    // GG (Free)
    { name: 'Handshake', category: 'gg', gifPath: '/assets/emotes/gg/handshake.gif', unlockLevel: 1 },
    { name: 'Clapping', category: 'gg', gifPath: '/assets/emotes/gg/clapping.gif', unlockLevel: 1 },
    { name: 'Respect', category: 'gg', gifPath: '/assets/emotes/gg/respect.gif', unlockLevel: 5 },

    // Premium
    { name: 'Mic Drop', category: 'premium', gifPath: '/assets/emotes/premium/mic-drop.gif', unlockLevel: 1, isPremium: true },
    { name: 'Crown', category: 'premium', gifPath: '/assets/emotes/premium/crown.gif', unlockLevel: 1, isPremium: true },
    { name: 'Deal With It', category: 'premium', gifPath: '/assets/emotes/premium/deal-with-it.gif', unlockLevel: 1, isPremium: true },
    { name: 'Legendary', category: 'premium', gifPath: '/assets/emotes/premium/legendary.gif', unlockLevel: 1, isPremium: true },
    { name: 'Unstoppable', category: 'premium', gifPath: '/assets/emotes/premium/unstoppable.gif', unlockLevel: 1, isPremium: true },
];

async function seedBattleEmotes() {
    console.log('🎭 Seeding Battle Emotes...');

    for (const emote of BATTLE_EMOTES) {
        await prisma.battleEmote.upsert({
            where: { id: emote.name.toLowerCase().replace(/\s+/g, '-') },
            update: emote,
            create: {
                id: emote.name.toLowerCase().replace(/\s+/g, '-'),
                ...emote,
                isPremium: emote.isPremium ?? false,
            },
        });
    }

    console.log(`✅ Seeded ${BATTLE_EMOTES.length} battle emotes`);
}

seedBattleEmotes()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
