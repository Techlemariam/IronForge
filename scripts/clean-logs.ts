import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'src', 'logs');
const MAX_AGE_DAYS = 7;
const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

async function cleanLogs() {
    if (!fs.existsSync(LOG_DIR)) {
        console.log('No log directory found at', LOG_DIR);
        return;
    }

    const files = await fs.promises.readdir(LOG_DIR);
    const now = Date.now();
    let deletedCount = 0;

    for (const file of files) {
        const filePath = path.join(LOG_DIR, file);
        const stats = await fs.promises.stat(filePath);

        if (now - stats.mtimeMs > MAX_AGE_MS) {
            await fs.promises.unlink(filePath);
            console.log(`Deleted old log: ${file}`);
            deletedCount++;
        }
    }

    if (deletedCount > 0) {
        console.log(`\n🧹 Cleaned up ${deletedCount} old log files.`);
    } else {
        console.log('\n✨ Logs are clean.');
    }
}

cleanLogs().catch(console.error);
