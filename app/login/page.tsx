"use client";

import {
  useSupabaseBrowserClient,
  SUPABASE_BROWSER_CONFIG_HINT,
} from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

/**
 * Google 登录页（受保护路由会重定向至此并带上 next）
 */
function LoginForm() {
  const supabase = useSupabaseBrowserClient();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const callbackError = searchParams.get("error");
  const callbackErrorCode = searchParams.get("error_code");
  const callbackErrorDescription = searchParams.get("error_description");
  const safeNext = next.startsWith("/") ? next : "/";
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setConfigError(SUPABASE_BROWSER_CONFIG_HINT);
    } else {
      setConfigError(null);
    }
  }, [supabase]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-serif text-3xl font-bold text-[#1A1A18]">Sign in</h1>
      <p className="mt-2 text-sm text-[#6B6658]">
        Use your Google account linked to Stanford.
      </p>
      {configError ? (
        <p className="mt-6 text-sm text-[#D85A30]" role="alert">
          {configError}
        </p>
      ) : null}
      {callbackError ? (
        <p className="mt-3 text-sm text-[#D85A30]" role="alert">
          Sign-in callback failed
          {callbackErrorCode ? ` (${callbackErrorCode})` : ""}.{" "}
          {callbackErrorDescription ?? callbackError}
        </p>
      ) : null}
      {authError ? (
        <p className="mt-3 text-sm text-[#D85A30]" role="alert">
          Could not start Google sign-in. {authError}
        </p>
      ) : null}
      <form
        action="/api/auth/google/start"
        method="GET"
        className="mt-8"
        onSubmit={() => {
          setLoading(true);
          setAuthError(null);
        }}
      >
        <input type="hidden" name="next" value={safeNext} />
        <button
          type="submit"
          disabled={loading || !!configError}
          className="w-full rounded-lg bg-[#B47B2E] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9A6825] disabled:opacity-60"
        >
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="px-6 py-16 text-center text-[#6B6658]">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
