'use server'

import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function sendChatAction(message: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Get Hero Name from DB
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { heroName: true }
    });

    const userName = dbUser?.heroName || 'Unknown Hero';

    // Insert via Prisma to ensure types/schema validity
    // Alternatively can use Supabase client directly but Prisma is our ORM.
    // However, for Realtime to trigger, we just need to insert into the table.
    // Prisma inserts trigger Supabase Realtime if Replication is on.

    return prisma.chatMessage.create({
        data: {
            userName: userName,
            message: message.trim().slice(0, 255), // Limit length
            type: 'CHAT'
        }
    });
}

export async function attackBossAction(bossId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // 1. Get Boss
    const boss = await prisma.raidBoss.findUnique({
        where: { id: bossId }
    });

    if (!boss || !boss.isActive) {
        throw new Error("Boss not found or inactive");
    }

    if (boss.currentHp <= 0) {
        return { message: "Boss is already defeated!" };
    }

    // 2. Performance Coach Check: Kinetic Energy
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { heroName: true, kineticEnergy: true }
    });

    const currentEnergy = dbUser?.kineticEnergy || 0;
    const ENERGY_COST = 5; // Configurable cost per click

    if (currentEnergy < ENERGY_COST) {
        throw new Error("Insufficient Kinetic Energy. Go lift something!");
    }

    // 3. Calculate Damage
    // Base damage + Energy Bonus? For now, flat random.
    const damage = Math.floor(Math.random() * 100) + 50;
    const newHp = boss.currentHp - BigInt(damage);
    const finalHp = newHp < 0 ? BigInt(0) : newHp;

    // 4. Update Boss
    await prisma.raidBoss.update({
        where: { id: bossId },
        data: { currentHp: finalHp }
    });

    // 5. Deduct Kinetic Energy (Performance Coach)
    // We already decremented in memory but need to persist to User.
    // Actually, we should do this transactionally if possible, but for now separate updates.
    await prisma.user.update({
        where: { id: user.id },
        data: { kineticEnergy: { decrement: ENERGY_COST } }
    });

    // 4. Log Attack
    // We can allow the client to infer the attack from the boss HP update, 
    // OR we can insert a log message.
    // Let's insert a log message for "Critical Hits" only to avoid spam?
    // Or just return the damage for the client to show a number flyout.

    // Let's log it to chat if it's a kill
    if (finalHp === BigInt(0)) {
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { heroName: true }
        });
        await prisma.chatMessage.create({
            data: {
                userName: 'System',
                message: `${dbUser?.heroName || 'A Hero'} dealt the killing blow to ${boss.name}!`,
                type: 'LOG'
            }
        });
    }

    return { damage: damage, newHp: finalHp.toString(), defeated: finalHp === BigInt(0) };
}

export async function getUserStatsAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { heroName: true, kineticEnergy: true }
    });

    return dbUser;
}
