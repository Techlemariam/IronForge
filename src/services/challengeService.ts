import prisma from "@/lib/prisma";
import { ChallengeCriteria } from "@/actions/systems/challenges";

export async function processWorkoutLog(
  userId: string,
  weight: number,
  reps: number,
  distanceKm: number = 0,
  durationMin: number = 0
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
      } else if (criteria.metric === "distance_km") {
        increment = distanceKm;
      } else if (criteria.metric === "duration_min") {
        increment = durationMin;
      } else if (criteria.metric === "workouts") {
        // Only increment if this is the FIRST log of the day
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const uc = await prisma.userChallenge.findUnique({
          where: { userId_challengeId: { userId, challengeId: c.id } },
        });

        if (uc) {
          const lastUpdate = new Date(uc.updatedAt);
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
            },
          });
        } else {
          // Note: If no existing record, we start at 0 + increment.
          // Wait, existing check handles update.
          // Create below.
          await prisma.userChallenge.create({
            data: {
              userId,
              challengeId: c.id,
              progress: increment,
              completed: increment >= criteria.target,
            },
          });
        }

        // Check Completion (Simple)
        if (existing && newProgress >= criteria.target && !existing.completed) {
          await prisma.userChallenge.update({
            where: { userId_challengeId: { userId, challengeId: c.id } },
            data: { completed: true }
          });
        }
      }
    }
  } catch (error) {
    console.error("Challenge Processing Error:", error);
    // Silent fail to not block workout logging
  }
}
