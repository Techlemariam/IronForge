import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
    const action = process.argv[2];
    const value = process.argv[3];

    switch (action) {
        case 'GET-MODE':
            const settings = await prisma.factorySettings.findUnique({
                where: { id: 'global' },
            });
            console.log(settings?.mode || 'MANUAL');
            break;
        case 'SET-MODE':
            const updated = await prisma.factorySettings.upsert({
                where: { id: 'global' },
                update: { mode: value },
                create: { id: 'global', mode: value },
            });
            console.log(`SUCCESS: MODE=${updated.mode}`);
            break;
        default:
            console.error('Unknown action');
            process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
