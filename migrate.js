const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Basic .env parser
function parseEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1'); // Remove quotes
            if (key && !key.startsWith('#')) {
                env[key] = value;
            }
        }
    });
    return env;
}

const envLocal = parseEnv(path.join(__dirname, '.env.local'));
const env = parseEnv(path.join(__dirname, '.env'));

// Merge envs, local takes precedence
const mergedEnv = { ...process.env, ...env, ...envLocal };

console.log('Running Prisma Push with loaded environment...');

try {
    execSync('npx prisma db push', {
        env: mergedEnv,
        stdio: 'inherit'
    });
    console.log('Migration Successful!');
} catch (error) {
    console.error('Migration Failed:', error.message);
    process.exit(1);
}
