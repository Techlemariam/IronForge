import React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { StrengthContainer } from "@/features/strength/StrengthContainer";

export default async function StrengthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure user exists in Prisma
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    // Handle sync edge case or wait
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <StrengthContainer userId={user.id} />
    </div>
  );
}
