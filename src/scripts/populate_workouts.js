const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '../data');
const OUT_FILE = path.join(__dirname, '../data/workouts.ts');

const processDuration = (dur) => {
    const d = dur.toString().toLowerCase();
    if (d.includes('mi')) {
        // Estimate 10 min/mile for generic calculation
        return { mins: parseFloat(d) * 10, label: dur };
    }
    if (d.includes('min') || !isNaN(parseFloat(d))) {
        return { mins: parseFloat(d), label: dur.includes('min') ? dur : `${dur} min` };
    }
    // Swim distance? Assume meters/yards. roughly 2:00/100m = 30 min for 1500
    if (!isNaN(parseFloat(d)) && parseFloat(d) > 100) {
        return { mins: (parseFloat(d) / 100) * 2, label: `${dur}m` };
    }
    return { mins: 60, label: dur }; // Default fallback
};

const determineIntensity = (name, code) => {
    const n = name.toUpperCase();
    const c = code.toUpperCase();
    if (n.includes('RECOVERY') || n.includes('FOUNDATION')) return 'LOW';
    if (n.includes('TEMPO') || n.includes('CRUISE') || c.startsWith('CT') || c.startsWith('CCI')) return 'MEDIUM';
    return 'HIGH'; // Intervals, Speed Play, etc.
};

const calculateResourceCost = (type, intensity, durationMin) => {
    const cost = { CNS: 0, MUSCULAR: 0, METABOLIC: 0 };
    const factor = durationMin / 60; // Normalize to hour

    if (intensity === 'LOW') {
        cost.CNS = 20 * factor;
        cost.MUSCULAR = 30 * factor;
        cost.METABOLIC = 40 * factor;
    } else if (intensity === 'MEDIUM') {
        cost.CNS = 40 * factor;
        cost.MUSCULAR = 50 * factor;
        cost.METABOLIC = 60 * factor;
    } else { // HIGH
        cost.CNS = 70 * factor;
        cost.MUSCULAR = 60 * factor;
        cost.METABOLIC = 80 * factor;
    }

    // Type adjustments
    if (type === 'RUN') {
        cost.MUSCULAR += 10; // Impact
        cost.CNS += 10;
    } else if (type === 'SWIM') {
        cost.MUSCULAR += 5;
    }

    return {
        CNS: Math.round(Math.min(100, cost.CNS)),
        MUSCULAR: Math.round(Math.min(100, cost.MUSCULAR)),
        METABOLIC: Math.round(Math.min(100, cost.METABOLIC))
    };
};

const processFile = (filename, type) => {
    const rawPath = path.join(RAW_DIR, filename);
    if (!fs.existsSync(rawPath)) return [];

    const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
    return raw.map(item => {
        const { mins, label } = processDuration(item.duration);
        const intensity = determineIntensity(item.name, item.code);
        const cost = calculateResourceCost(type, intensity, mins);

        return {
            id: `${type.toLowerCase()}_${item.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            code: item.code,
            name: item.name,
            description: item.description,
            type: type,
            durationMin: Math.round(mins),
            durationLabel: label,
            intensity: intensity,
            resourceCost: cost,
            recommendedPaths: ['ENGINE', 'HYBRID_WARDEN'] // Defaults
        };
    });
};

const run = processFile('raw_run.json', 'RUN');
const bike = processFile('raw_bike.json', 'BIKE');
const swim = processFile('raw_swim.json', 'SWIM');

const allWorkouts = [...run, ...bike, ...swim];

const fileContent = `import { WorkoutDefinition } from '../types/training';

export const WORKOUT_LIBRARY: WorkoutDefinition[] = ${JSON.stringify(allWorkouts, null, 4)};
`;

fs.writeFileSync(OUT_FILE, fileContent);
console.log(`Generated ${allWorkouts.length} workouts in ${OUT_FILE}`);
