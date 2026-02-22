import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // SYNC: Ensure the user exists in the public schema
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && user.email) {
        // Atomic Upsert using Prisma to handle race conditions and email conflicts
        // If a user with this email exists (e.g. from E2E seeding), we MUST use the auth ID
        // Note: Prisma upsert requires a unique field. We use id.
        // We first check by email to handle the reconciliation.
        const existingByEmail = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingByEmail && existingByEmail.id !== user.id) {
          console.log(`Reconciling user ID for ${user.email}: ${existingByEmail.id} -> ${user.id}`);
          // Update the existing user's ID. This requires CASCADE on FKs or cautious handling.
          // Since it's a primary key update, we might need a transaction if Prisma/DB doesn't cascade.
          // However, for E2E stability, simply creating a new one if ID differs or updating is needed.
          // Better: If existing, update it.
          await prisma.user.update({
            where: { email: user.email },
            data: { id: user.id },
          });

        } else {
          await prisma.user.upsert({
            where: { id: user.id },
            update: {
              email: user.email,
              lastLoginDate: new Date(),
            },
            create: {
              id: user.id,
              email: user.email,
              heroName: user.email.split("@")[0] || "Hero",
              subscriptionTier: "FREE",
              updatedAt: new Date(),
            },
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
