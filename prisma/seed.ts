
import { prisma } from '../src/lib/prisma';
import { MOBILITY_EXERCISES } from '../src/data/mobilityExercises';


async function main() {
    console.log('Seeding mobility exercises...');

    for (const exercise of MOBILITY_EXERCISES) {
        await prisma.mobilityExercise.upsert({
            where: { id: exercise.id },
            update: {
                name: exercise.name,
                source: exercise.source,
                difficulty: exercise.difficulty,
                durationSecs: exercise.durationSecs,
                videoUrl: exercise.videoUrl,
                instructions: exercise.instructions,
                costCns: exercise.resourceCost.cns,
                costMuscular: exercise.resourceCost.muscular,
                costMetabolic: exercise.resourceCost.metabolic,
                targetRegions: exercise.targetRegions as any, // JSON array
            },
            create: {
                id: exercise.id,
                name: exercise.name,
                source: exercise.source,
                difficulty: exercise.difficulty,
                durationSecs: exercise.durationSecs,
                videoUrl: exercise.videoUrl,
                instructions: exercise.instructions,
                costCns: exercise.resourceCost.cns,
                costMuscular: exercise.resourceCost.muscular,
                costMetabolic: exercise.resourceCost.metabolic,
                targetRegions: exercise.targetRegions as any, // JSON array
            },
        });
    }

    console.log(`Seeded ${MOBILITY_EXERCISES.length} mobility exercises.`);

    // --- SEED WORLD REGIONS ---
    console.log('Seeding World Regions...');
    const regions = [
        {
            id: 'iron_peaks',
            name: 'Iron Peaks',
            description: 'The rugged mountains where Titans are forged.',
            levelReq: 1,
            coordX: 50,
            coordY: 20
        },
        {
            id: 'circuit_plains',
            name: 'Circuit Plains',
            description: 'A vast digital expanse of endless cardio potential.',
            levelReq: 10,
            coordX: 20,
            coordY: 50
        }
    ];

    for (const r of regions) {
        await prisma.worldRegion.upsert({
            where: { id: r.id },
            update: r,
            create: r
        });
    }

    // --- SEED TERRITORIES ---
    console.log('Seeding Territories...');
    const territories = [
        // Iron Peaks
        { name: "Mount Olympus", region: "iron_peaks", type: "TRAINING_GROUNDS", coordX: 52, coordY: 22, bonuses: { xpBonus: 0.1 } },
        { name: "The Forge", region: "iron_peaks", type: "RESOURCE_NODE", coordX: 48, coordY: 18, bonuses: { goldBonus: 0.1 } },

        // Circuit Plains
        { name: "Velocity Track", region: "circuit_plains", type: "TRAINING_GROUNDS", coordX: 22, coordY: 48, bonuses: { xpBonus: 0.05, speedBonus: 0.1 } },
        { name: "Server Farm", region: "circuit_plains", type: "FORTRESS", coordX: 18, coordY: 52, bonuses: { defenseBonus: 0.1 } }
    ];

    for (const t of territories) {
        // Use name as pseudo-unique key for seeding since ID is cuid
        const existing = await prisma.territory.findFirst({ where: { name: t.name } });
        if (!existing) {
            await prisma.territory.create({
                data: {
                    name: t.name,
                    region: t.region,
                    type: t.type as any,
                    bonuses: t.bonuses,
                    coordX: t.coordX,
                    coordY: t.coordY
                }
            });
        }
    }
    console.log(`Seeded ${territories.length} territories.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
