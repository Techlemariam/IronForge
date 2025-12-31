import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsPage } from "@/features/settings/SettingsPage";

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
      pocketCastsEnabled: true,
      faction: true,
    },
  });

  if (!dbUser) {
    // Should not happen if auth is valid but handle edge case
    return <div>User not found</div>;
  }

  return (
    <SettingsPage
      userId={dbUser.id}
      hevyConnected={!!dbUser.hevyApiKey}
      intervalsConnected={!!dbUser.intervalsApiKey}
      stravaConnected={!!dbUser.stravaAccessToken}
      pocketCastsConnected={dbUser.pocketCastsEnabled}
      initialFaction={dbUser.faction}
      isDemoMode={false}
    />
  );
}
