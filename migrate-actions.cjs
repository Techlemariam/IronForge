
const fs = require('fs');
const path = require('path');

const migrationMap = {
    '@/actions/user': '@/actions/user/core',
    '@/actions/account': '@/actions/user/account',
    '@/actions/settings': '@/actions/user/settings',
    '@/actions/notification-preferences': '@/actions/user/notification-preferences',
    '@/actions/onboarding': '@/actions/user/onboarding',
    '@/actions/login-rewards': '@/actions/user/login-rewards',
    '@/actions/referral-system': '@/actions/user/referral',
    '@/actions/progression': '@/actions/progression/core',
    '@/actions/prestige-system': '@/actions/progression/prestige',
    '@/actions/achievements': '@/actions/progression/achievements',
    '@/actions/milestone-rewards': '@/actions/progression/milestones',
    '@/actions/mastery-tracks': '@/actions/progression/mastery',
    '@/actions/forge': '@/actions/economy/forge',
    '@/actions/inventory': '@/actions/economy/inventory',
    '@/actions/shop-system': '@/actions/economy/shop',
    '@/actions/item-enchanting': '@/actions/economy/enchanting',
    '@/actions/equipment-upgrade': '@/actions/economy/upgrade',
    '@/actions/crafting-system': '@/actions/economy/crafting',
    '@/actions/reward-crates': '@/actions/economy/crates',
    '@/actions/gold-multipliers': '@/actions/economy/gold-multipliers',
    '@/actions/resource-generation': '@/actions/economy/resources',
    '@/actions/social': '@/actions/social/core',
    '@/actions/social-feed': '@/actions/social/feed',
    '@/actions/friend-system': '@/actions/social/friends',
    '@/actions/friend-challenges': '@/actions/social/friend-challenges',
    '@/actions/rival-system': '@/actions/social/rivals',
    '@/actions/global-announcements': '@/actions/social/announcements',
    '@/actions/live-feed': '@/actions/social/live-feed',
    '@/actions/bestiary': '@/actions/systems/bestiary',
    '@/actions/lore-system': '@/actions/systems/lore',
    '@/actions/world': '@/actions/systems/world',
    '@/actions/territories': '@/actions/systems/territories',
    '@/actions/territory': '@/actions/systems/territory',
    '@/actions/daily-quests': '@/actions/systems/daily-quests',
    '@/actions/challenges': '@/actions/systems/challenges',
    '@/actions/weekly-challenges': '@/actions/systems/weekly-challenges',
    '@/actions/battle-pass': '@/actions/systems/battle-pass',
    '@/actions/gameplay': '@/actions/systems/gameplay',
    '@/actions/titan': '@/actions/titan/core',
    '@/actions/titan-customization': '@/actions/titan/customization',
    '@/actions/titan-comparison': '@/actions/titan/comparison',
    '@/actions/power-rating': '@/actions/titan/power-rating',
    '@/actions/xp-multiplier': '@/actions/titan/xp-multiplier',
    '@/actions/stat-overrides': '@/actions/titan/stat-overrides',
    '@/actions/body-metrics': '@/actions/titan/body-metrics',
    '@/actions/progress-photos': '@/actions/titan/photos',
    '@/actions/muscle-heatmap': '@/actions/titan/muscle-heatmap',
    '@/actions/skill-presets': '@/actions/titan/skill-presets',
    '@/actions/oracle': '@/actions/oracle/core',
    '@/actions/oracle-chat': '@/actions/oracle/chat',
    '@/actions/oracle-seed': '@/actions/oracle/seed',
    '@/actions/notifications': '@/actions/notifications/core',
    '@/actions/push-notifications': '@/actions/notifications/push',
    '@/actions/pr-notifications': '@/actions/notifications/pr',
    '@/actions/coach-subscription': '@/actions/user/subscription',
    '@/actions/companion-system': '@/actions/systems/companion',
    '@/actions/recovery-lock': '@/actions/training/recovery',
    '@/actions/anti-grind': '@/actions/training/anti-grind',
    '@/actions/analytics-dashboard': '@/actions/user/analytics',
    '@/actions/data-backup': '@/actions/user/backup',
    '@/actions/demo': '@/actions/user/demo',
    '@/actions/logger': '@/actions/user/logger',
    '@/actions/program': '@/actions/training/program',
    '@/actions/programs': '@/actions/training/programs',
    '@/actions/statistics-dashboard': '@/actions/user/statistics',
    '@/actions/streak': '@/actions/user/streak',
    '@/actions/tournament-brackets': '@/actions/pvp/tournaments',
    '@/actions/duel-leaderboard': '@/actions/pvp/duel-leaderboard',
    '@/actions/segment-leaderboard': '@/actions/pvp/segment-leaderboard',
    '@/actions/dungeon-floors': '@/actions/training/dungeon-floors',
    '@/actions/dungeon-gating': '@/actions/training/dungeon-gating',
    '@/actions/armory': '@/actions/economy/armory',
    '@/actions/hevy': '@/actions/integrations/hevy',
    '@/actions/intervals': '@/actions/integrations/intervals',
    '@/actions/strava': '@/actions/integrations/strava',
    '@/actions/garmin': '@/actions/integrations/garmin',
    '@/actions/apple-watch': '@/actions/integrations/apple-watch',
    '@/actions/integrations': '@/actions/integrations/core',
    '@/actions/training': '@/actions/training/core',
    '@/actions/leaderboards': '@/actions/pvp/leaderboards',
    '@/actions/combat': '@/actions/combat/core',
    '@/actions/boss-mechanics': '@/actions/combat/boss',
    '@/actions/battle-emotes': '@/actions/combat/emotes',
    '@/actions/pvp-ranking': '@/actions/pvp/ranking',
    '@/actions/iron-leagues': '@/actions/pvp/leagues',
    '@/actions/titan-combat': '@/actions/pvp/titan',
    '@/actions/guild': '@/actions/guild/core',
    '@/actions/guild-creation': '@/actions/guild/creation',
    '@/actions/guild-quests': '@/actions/guild/quests',
    '@/actions/guild-raids': '@/actions/guild/raids',
    '@/actions/guild-rewards': '@/actions/guild/rewards',
    '@/actions/pvp-ranked': '@/actions/pvp/ranked',
    '@/actions/duel': '@/actions/pvp/duel',
    '@/actions/pvp-segment': '@/actions/pvp/segment',
    '@/actions/gauntlet': '@/actions/training/gauntlet',
    '@/actions/overtraining': '@/actions/training/overtraining',
    '@/actions/periodization': '@/actions/training/periodization',
    '@/actions/strength': '@/actions/training/strength',
    '@/actions/volume-l4': '@/actions/training/volume',
    // Reverse mappings for relative imports
    './user': '@/actions/user/core',
    './account': '@/actions/user/account',
    './settings': '@/actions/user/settings',
    './notification-preferences': '@/actions/user/notification-preferences',
    './onboarding': '@/actions/user/onboarding',
    './login-rewards': '@/actions/user/login-rewards',
    './referral-system': '@/actions/user/referral',
    './progression': '@/actions/progression/core',
    './achievements': '@/actions/progression/achievements',
    './forge': '@/actions/economy/forge',
    './inventory': '@/actions/economy/inventory',
    './social': '@/actions/social/core',
    './bestiary': '@/actions/systems/bestiary',
    './lore-system': '@/actions/systems/lore',
    './world': '@/actions/systems/world',
    './territories': '@/actions/systems/territories',
    './territory': '@/actions/systems/territory',
    './daily-quests': '@/actions/systems/daily-quests',
    './challenges': '@/actions/systems/challenges',
    './battle-pass': '@/actions/systems/battle-pass',
    './titan': '@/actions/titan/core',
    './power-rating': '@/actions/titan/power-rating',
    './xp-multiplier': '@/actions/titan/xp-multiplier',
    './streak': '@/actions/user/streak',
    './overtraining': '@/actions/training/overtraining',
    './periodization': '@/actions/training/periodization',
    './combat': '@/actions/combat/core',
    './training': '@/actions/training/core',
    './intervals': '@/actions/integrations/intervals',
    './hevy': '@/actions/integrations/hevy',
    './strava': '@/actions/integrations/strava',
    './integrations': '@/actions/integrations/core',
    './guild': '@/actions/guild/core',
    './guild-raids': '@/actions/guild/raids',
};

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                walk(fullPath, callback);
            }
        } else {
            callback(fullPath);
        }
    });
}

const targetDirs = ['src', 'tests'];

targetDirs.forEach(targetDir => {
    const absoluteTargetDir = path.resolve(__dirname, targetDir);
    if (fs.existsSync(absoluteTargetDir)) {
        walk(absoluteTargetDir, (filePath) => {
            if (!['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(filePath))) return;

            let content = fs.readFileSync(filePath, 'utf8');
            let changed = false;

            // Handle @/actions imports
            const sortedKeys = Object.keys(migrationMap).sort((a, b) => b.length - a.length);

            for (const key of sortedKeys) {
                const regex = new RegExp(`(['"])(${key})(['"])`, 'g');
                if (regex.test(content)) {
                    content = content.replace(regex, `$1${migrationMap[key]}$3`);
                    changed = true;
                }
            }

            // Handle relative imports in src/actions especially
            if (filePath.includes(path.join('src', 'actions'))) {
                // Special handling for ./ and ../ in actions
                // If it's a relative import like ./power-rating, and we are in a subdomain, it might need updating
                // But the migrationMap above already covers './power-rating' -> '@/actions/titan/power-rating'
            }

            if (changed) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated: ${filePath}`);
            }
        });
    }
});
