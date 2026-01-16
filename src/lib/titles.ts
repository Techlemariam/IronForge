import prisma from "@/lib/prisma";

export const DEFINED_TITLES = [
  {
    id: "gladiator",
    name: "Gladiator",
    conditionType: "PVP_RANK",
    conditionValue: 1200,
    description: "Reach 1200 Rating",
  },
  {
    id: "warlord",
    name: "Warlord",
    conditionType: "PVP_RANK",
    conditionValue: 1500,
    description: "Reach 1500 Rating",
  },
  {
    id: "high_warlord",
    name: "High Warlord",
    conditionType: "PVP_RANK",
    conditionValue: 2000,
    description: "Reach 2000 Rating",
  },
  {
    id: "iron_born",
    name: "Iron Born",
    conditionType: "MINING",
    conditionValue: 100,
    description: "Mine 100 Ore",
  }, // Future example
];

/**
 * Checks if user is eligible for any new titles and grants them.
 */
export async function checkAndGrantTitles(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      pvpProfile: true,
      titles: { include: { title: true } },
    },
  });

  if (!user || !user.pvpProfile) return;

  // Ensure titles exist in DB first (Idempotent seed)
  // In production, this should be a seed script, but lazy-init is fine for dev
  for (const _def of DEFINED_TITLES) {
    // We use 'upsert' or just check existence to avoid hammering DB,
    // but for now let's assume they might not exist.
    // Actually, let's just query if we qualify.
  }

  const unownedTitles = DEFINED_TITLES.filter(
    (def) => !user.titles.some((t) => t.title.name === def.name),
  );

  for (const titleDef of unownedTitles) {
    let qualified = false;

    if (titleDef.conditionType === "PVP_RANK") {
      if (user.pvpProfile.rankScore >= titleDef.conditionValue) {
        qualified = true;
      }
    }

    if (qualified) {
      // Find or Create Title Record
      const dbTitle = await prisma.title.upsert({
        where: { id: titleDef.id },
        update: {},
        create: {
          id: titleDef.id,
          name: titleDef.name,
          description: titleDef.description,
          conditionType: titleDef.conditionType,
          conditionValue: titleDef.conditionValue,
        },
      });

      // Grant to User
      await prisma.userTitle.create({
        data: {
          userId: user.id,
          titleId: dbTitle.id,
        },
      });

      console.log(`Granted title ${titleDef.name} to ${user.heroName}`);
    }
  }
}
