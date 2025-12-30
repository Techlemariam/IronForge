import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

// Polyfill for Supabase dependency in Edge Runtime
const globalAny = globalThis as unknown as { process: { env: Record<string, string>; versions: { node: string } } };
if (typeof globalAny.process === "undefined") {
  globalAny.process = { env: {}, versions: { node: "18.0.0" } };
} else if (!globalAny.process.versions) {
  globalAny.process.versions = { node: "18.0.0" };
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Partial<ResponseCookie> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/welcome");

  if (!user && !isPublicRoute) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    // If trying to access root, go to welcome. Otherwise login.
    if (request.nextUrl.pathname === "/") {
      url.pathname = "/welcome";
    } else {
      url.pathname = "/login";
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
