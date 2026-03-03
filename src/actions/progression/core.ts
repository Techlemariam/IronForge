"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { ProgressionService } from "@/services/progression";
import { AwardGoldSchema } from "@/types/schemas";

export const getProgressionAction = authActionClient
  .schema(z.object({}))
  .action(async ({ ctx: { userId } }) => {
    return await ProgressionService.getProgressionState(userId);
  });

export const awardGoldAction = authActionClient
  .schema(AwardGoldSchema)
  .action(async ({ parsedInput: { amount }, ctx: { userId } }) => {
    return await ProgressionService.awardGold(userId, amount);
  });
