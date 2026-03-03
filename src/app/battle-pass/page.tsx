import {
  getUserBattlePassProgressAction,
} from "@/actions/systems/battle-pass";
import { BattlePassView } from "@/features/gamification/components/battle-pass/BattlePassView";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function BattlePassPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch data
  const progressRes = await getUserBattlePassProgressAction();
  const progress = progressRes?.data ?? null;

  return (
    <div className="container mx-auto py-8">
      <BattlePassView initialData={progress} userId={user.id} />
    </div>
  );
}
