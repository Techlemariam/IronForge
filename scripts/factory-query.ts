import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

/**
 * Utility script to interact with FactorySettings in the database.
 * Supports getting and setting the factory mode (ON, OFF, MANUAL).
 */
async function main() {
    const action = process.argv[2];
    const value = process.argv[3];

    switch (action) {
        case 'GET-MODE': {
            const settings = await prisma.factorySettings.findUnique({
                where: { id: 'global' },
            });
            console.log(settings?.mode || 'MANUAL');
            break;
        }
        case 'SET-MODE': {
            if (!value || !['ON', 'OFF', 'MANUAL'].includes(value)) {
                console.error(`Invalid mode value: ${value}. Must be ON, OFF, or MANUAL.`);
                process.exit(1);
            }
            const updated = await prisma.factorySettings.upsert({
                where: { id: 'global' },
                update: { mode: value },
                create: { id: 'global', mode: value },
            });
            console.log(`SUCCESS: MODE=${updated.mode}`);
            break;
        }
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
