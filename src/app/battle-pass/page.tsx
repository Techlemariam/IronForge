import {
  getActiveSeasonAction,
  getUserBattlePassProgressAction,
} from "@/actions/battle-pass";
import { BattlePassView } from "@/components/battle-pass/BattlePassView";
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
  const progress = await getUserBattlePassProgressAction(user.id);

  return (
    <div className="container mx-auto py-8">
      <BattlePassView initialData={progress} userId={user.id} />
    </div>
  );
}
