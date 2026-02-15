import { prisma } from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function sync() {
    const recoveryPath = path.join(process.cwd(), '.agent/factory/recovery-status.json');
    let data = null;

    if (fs.existsSync(recoveryPath)) {
        try {
            data = JSON.parse(fs.readFileSync(recoveryPath, 'utf8'));
        } catch (e) {
            console.error('Failed to parse recovery status file:', e);
        }
    }

    try {
        console.log(`📡 Syncing recovery status to database (Station: recovery)...`);

        const metadata = data || {};
        const health = data ? 50 : 100;

        await prisma.factoryStatus.upsert({
            where: { station: 'recovery' },
            create: {
                station: 'recovery',
                metadata: metadata as any,
                health: health,
            },
            update: {
                metadata: metadata as any,
                health: health,
            },
        });
        console.log('✅ Sync complete.');
    } catch (error) {
        console.error('❌ Failed to sync to database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

sync();
