import { NextResponse } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/publicEnv";

/**
 * 服务端发起 Google OAuth，避免浏览器端卡在 signInWithOAuth Promise。
 */
export async function GET(request: Request) {
  const publicEnv = getSupabasePublicEnv();
  const { searchParams, origin } = new URL(request.url);

  const rawNext = searchParams.get("next") ?? "/";
  const safeNext = rawNext.startsWith("/") ? rawNext : "/";

  if (!publicEnv) {
    return NextResponse.redirect(
      `${origin}/login?error=missing_env&error_description=${encodeURIComponent(
        "Supabase public env is not configured."
      )}`
    );
  }

  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
  const authorizeUrl = new URL("/auth/v1/authorize", publicEnv.url);
  authorizeUrl.searchParams.set("provider", "google");
  authorizeUrl.searchParams.set("redirect_to", redirectTo);

  return NextResponse.redirect(authorizeUrl.toString());
}

