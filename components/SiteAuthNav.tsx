"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * 顶部导航中的登录状态：未登录显示 Sign in；已登录显示 My listing、Sign out
 */
export function SiteAuthNav() {
  const supabase = useSupabaseBrowserClient();
  const [phase, setPhase] = useState<"loading" | "out" | "in">("loading");

  useEffect(() => {
    if (!supabase) {
      setPhase("out");
      return;
    }

    void supabase.auth.getUser().then(({ data }) => {
      setPhase(data.user ? "in" : "out");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setPhase(session?.user ? "in" : "out");
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  /**
   * 登出后整页刷新，避免 middleware 与客户端状态不一致
   */
  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (phase === "loading") {
    return (
      <span
        className="hidden h-4 w-14 animate-pulse rounded bg-near-black/10 sm:inline-block"
        aria-hidden
      />
    );
  }

  if (phase === "in") {
    return (
      <div className="flex items-center gap-1">
        <Link
          href="/my-anchor"
          className="rounded-md px-3 py-2 text-secondary transition-colors hover:bg-surface hover:text-near-black"
        >
          My listing
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-md border border-[#E2DDD4] bg-white px-3 py-2 text-sm font-semibold text-[#B47B2E] transition-colors hover:bg-surface hover:text-[#9A6825]"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-md border border-[#E2DDD4] bg-white px-3 py-2 text-sm font-semibold text-[#B47B2E] transition-colors hover:bg-surface hover:text-[#9A6825]"
    >
      Sign in
    </Link>
  );
}
