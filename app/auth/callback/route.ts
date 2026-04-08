import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/publicEnv";

/**
 * OAuth 回调：用授权码交换会话并写 cookie
 */
export async function GET(request: Request) {
  const publicEnv = getSupabasePublicEnv();
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") ? rawNext : "/";

  if (code && publicEnv) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      publicEnv.url,
      publicEnv.anonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    const qs = new URLSearchParams({
      error: "auth",
      error_code: "exchange_failed",
      error_description: error.message,
    });
    return NextResponse.redirect(`${origin}/login?${qs.toString()}`);
  }

  const qs = new URLSearchParams({
    error: "auth",
    error_code: "missing_code_or_env",
    error_description:
      "Missing OAuth code or Supabase env is not configured on the server.",
  });
  return NextResponse.redirect(`${origin}/login?${qs.toString()}`);
}
