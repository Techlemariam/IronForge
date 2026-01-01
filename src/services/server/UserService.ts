import prisma from "@/lib/prisma";
import { AppSettings, Equipment } from "@/types";

export const UserService = {
  /**
   * Get or create a user by email (or just get the first user for single-player migration)
   */
  async getOrCreateUser(email?: string) {
    if (email) {
      let user = await prisma.user.findUnique({
        where: { email },
        include: {
          // settings: true, // Removed: settings are fields on User, not a relation
          equipment: true,
          skills: true,
          achievements: true,
          unlockedMonsters: true,
        },
      });
      if (!user) {
        user = await prisma.user.create({
          data: { email },
          include: {
            equipment: true,
            skills: true,
            achievements: true,
            unlockedMonsters: true,
          },
        });
      }
      return user;
    } else {
      // Single player mode fallback: get the first user
      const users = await prisma.user.findMany({
        take: 1,
        include: {
          equipment: true,
          skills: true,
          achievements: true,
          unlockedMonsters: true,
        },
      });
      if (users.length > 0) return users[0];

      // Create default user
      return await prisma.user.create({
        data: { heroName: "IronLegend" },
        include: {
          equipment: true,
          skills: true,
          achievements: true,
          unlockedMonsters: true,
        },
      });
    }
  },

  async getUser(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        equipment: true,
        skills: true,
        achievements: true,
        unlockedMonsters: true,
      },
    });
  },

  async updateSettings(userId: string, settings: Partial<AppSettings>) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        intervalsApiKey: settings.intervalsApiKey,
        intervalsAthleteId: settings.intervalsAthleteId,
        hevyApiKey: settings.hevyApiKey,
        prioritizeHyperPro: settings.prioritizeHyperPro,
        // Map other settings as needed
      },
    });
  },

  async updateGold(userId: string, amount: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { gold: amount },
    });
  },

  async updateEquipment(userId: string, equipment: Equipment[]) {
    // This is a sync operation. Ideally we diff, but for now we can upsert.
    // Simplifying for migration:
    const operations = equipment.map((eq) =>
      prisma.userEquipment.upsert({
        where: { userId_equipmentId: { userId, equipmentId: eq.id } },
        create: { userId, equipmentId: eq.id, isOwned: eq.isOwned },
        update: { isOwned: eq.isOwned },
      }),
    );
    return prisma.$transaction(operations);
  },
};
