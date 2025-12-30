import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

      if (user) {
        // Check if user exists
        const { data: existingUser } = await supabase
          .from("User")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existingUser) {
          // Create new user record
          await supabase.from("User").insert({
            id: user.id,
            email: user.email,
            heroName: user.email?.split("@")[0] || "Hero",
            subscriptionTier: "FREE", // Default
            updatedAt: new Date().toISOString(),
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
