"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

export type BestiaryMonster = {
  id: string;
  name: string;
  title: string;
  difficulty: string;
  type: string;
  description: string;
  stats: any; // JSON
  weakness: string | null;
  defeated: boolean;
};

export const getBestiaryData = cache(async (): Promise<BestiaryMonster[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Fetch all monsters
  const allMonsters = await prisma.monster.findMany({
    orderBy: { difficulty: "asc" }, // Or name? Let's use difficulty for now, maybe map difficulty text to number later if sorting matters
  });

  // Fetch user's unlocked monsters (kills)
  const unlocked = await prisma.unlockedMonster.findMany({
    where: { userId: user.id },
    select: { monsterId: true },
  });

  const unlockedIds = new Set(unlocked.map((u) => u.monsterId));

  return allMonsters.map((monster) => ({
    ...monster,
    defeated: unlockedIds.has(monster.id),
  }));
});
