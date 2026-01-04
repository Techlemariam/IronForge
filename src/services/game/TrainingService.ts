import prisma from "@/lib/prisma";

export class TrainingService {
    /**
     * Logs a single set to the ExerciseLog table.
     * Calculates E1RM and creates the log entry.
     */
    static async logSet(
        userId: string,
        exerciseId: string,
        reps: number,
        weight: number,
        rpe: number
    ) {
        // Calculate E1RM for the log
        const rir = 10 - rpe;
        const e1rm = weight * (1 + (reps + rir) / 30);

        return await prisma.exerciseLog.create({
            data: {
                userId,
                exerciseId,
                sets: [
                    {
                        reps,
                        weight,
                        rpe,
                        isWarmup: false,
                    },
                ],
                weight: weight,
                reps: reps,
                isPersonalRecord: rpe >= 9,
                date: new Date(),
            },
        });
    }
}
