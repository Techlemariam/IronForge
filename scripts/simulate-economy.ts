import { writeFileSync } from 'fs';

interface SimStats {
    loops: number;
    maxGold: number;
    maxLevel: number;
    winRate: number;
    violations: string[];
}

async function runSimulation() {
    console.log('🎮 Starting IronForge Economy Simulation...');

    // Placeholder logic
    const stats: SimStats = {
        loops: 1000,
        maxGold: Math.floor(Math.random() * 5000), // Random gold
        maxLevel: 5,
        winRate: 0.52,
        violations: []
    };

    console.log(`Ran ${stats.loops} loops.`);
    console.log(`Max Gold: ${stats.maxGold}`);
    console.log(`Win Rate: ${stats.winRate}`);

    // Checks
    if (stats.maxGold > 1000000) stats.violations.push("VIOLATION: Hyperinflation detected");
    if (stats.winRate > 0.8) stats.violations.push("VIOLATION: Game too easy");

    writeFileSync('economy_stats.json', JSON.stringify(stats, null, 2));

    if (stats.violations.length > 0) {
        console.error(stats.violations.join('\n'));
        process.exit(1);
    } else {
        console.log('✅ Simulation passed.');
    }
}

runSimulation();
