
import { PrismaClient } from '@prisma/client';
import { MOBILITY_EXERCISES } from '../src/data/mobilityExercises';

const prisma = new PrismaClient();

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
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
