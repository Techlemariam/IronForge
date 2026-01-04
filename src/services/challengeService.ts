import prisma from "@/lib/prisma";
import { ChallengeCriteria } from "@/actions/systems/challenges";

export async function processWorkoutLog(
  userId: string,
  weight: number,
  reps: number,
) {
  try {
    const now = new Date();
    const active = await prisma.challenge.findMany({
      where: {
        endDate: { gt: now },
        startDate: { lte: now },
      },
    });

    if (active.length === 0) return;

    for (const c of active) {
      const criteria = c.criteria as unknown as ChallengeCriteria;
      let increment = 0;

      if (criteria.metric === "volume_kg") {
        increment = weight * reps;
      } else if (criteria.metric === "workouts") {
        // Only increment if this is the FIRST log of the day
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // We assume this runs AFTER the log is created, so count should be >= 1
        // If count is exactly 1, it means this was the first log.
        // However, Prisma might be slow to index.
        // Safer check: Checks logs from today. If count <= 1, grant credit.
        // Actually, if we use a boolean flag on User or UserChallenge?
        // Or just check if 'lastUpdated' was today?
        // UserChallenge 'updatedAt' is useful.

        const uc = await prisma.userChallenge.findUnique({
          where: { userId_challengeId: { userId, challengeId: c.id } },
        });

        if (uc) {
          const lastUpdate = new Date(uc.updatedAt);
          // If not updated today, allow increment
          // BUT volume updates also update 'updatedAt'.
          // So we can't rely solely on updatedAt if mixed metrics exist (unlikely for one challenge).
          // For a "Workouts" challenge, progress only increments by 1 per day.
          const isToday =
            lastUpdate.getDate() === now.getDate() &&
            lastUpdate.getMonth() === now.getMonth() &&
            lastUpdate.getFullYear() === now.getFullYear();

          if (!isToday || uc.progress === 0) {
            increment = 1;
          }
        } else {
          increment = 1;
        }
      }

      if (increment > 0) {
        // Upsert logic
        // If new, create.
        // If exists, increment.
        // We handle creation explicitly to avoid complex update where clauses logic
        const existing = await prisma.userChallenge.findUnique({
          where: { userId_challengeId: { userId, challengeId: c.id } },
        });

        let newProgress = increment;
        if (existing) {
          newProgress = existing.progress + increment;
          await prisma.userChallenge.update({
            where: { userId_challengeId: { userId, challengeId: c.id } },
            data: {
              progress: { increment: increment },
              // We will check completion in next step or use atomic if possible
              // But 'completed' is boolean.
            },
          });
        } else {
          await prisma.userChallenge.create({
            data: {
              userId,
              challengeId: c.id,
              progress: increment,
              completed: increment >= criteria.target,
            },
          });
        }

        // Check Completion
        // Re-fetch to be sure (or calc locally)
        // Local calc is safer for performance
        if (newProgress >= criteria.target) {
          await prisma.userChallenge.update({
            where: { userId_challengeId: { userId, challengeId: c.id } },
            data: { completed: true },
          });
        }
      }
    }
  } catch (error) {
    console.error("Challenge Processing Error:", error);
    // Silent fail to not block workout logging
  }
}
