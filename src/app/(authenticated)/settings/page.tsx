import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsPage } from "@/features/settings/SettingsPage";

import { getDemoModeStatus } from "@/actions/demo";
import { getUserPreferencesAction } from "@/actions/settings";

export default async function SettingsRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      hevyApiKey: true,
      intervalsApiKey: true,
      stravaAccessToken: true,
      pocketCastsToken: true,
      pocketCastsEnabled: true,
      garminConnected: true,
      faction: true,
      archetype: true,
    },
  });

  if (!dbUser) {
    // Should not happen if auth is valid but handle edge case
    return <div>User not found</div>;
  }

  const isDemoMode = await getDemoModeStatus();
  const preferences = await getUserPreferencesAction(dbUser.id);

  return (
    <SettingsPage
      userId={dbUser.id}
      hevyConnected={!!dbUser.hevyApiKey}
      intervalsConnected={!!dbUser.intervalsApiKey}
      stravaConnected={!!dbUser.stravaAccessToken}
      pocketCastsConnected={!!dbUser.pocketCastsToken}
      garminConnected={dbUser.garminConnected}
      initialFaction={dbUser.faction}
      initialArchetype={dbUser.archetype as any}
      isDemoMode={isDemoMode}
      initialLiteMode={preferences.liteMode ?? false}
    />
  );
}
