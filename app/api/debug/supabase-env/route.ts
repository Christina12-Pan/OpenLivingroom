import { NextResponse } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/publicEnv";

export const dynamic = "force-dynamic";

/**
 * Supabase 环境变量诊断接口（不返回完整密钥）
 *
 * 用于快速确认 Next 运行时到底读到了什么值，避免被缓存或占位符误导。
 */
export async function GET() {
  const env = getSupabasePublicEnv();

  const rawUrl =
    process.env["NEXT_PUBLIC_SUPABASE_URL"]?.trim() ||
    process.env["SUPABASE_URL"]?.trim() ||
    "";
  const rawAnon =
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]?.trim() ||
    process.env["SUPABASE_ANON_KEY"]?.trim() ||
    "";

  let urlHost: string | null = null;
  try {
    if (rawUrl) {
      urlHost = new URL(rawUrl).host;
    }
  } catch {
    urlHost = null;
  }

  const looksPlaceholderUrl = /your-project-url/i.test(rawUrl);
  const looksPlaceholderAnon = /your-anon-key/i.test(rawAnon);

  return NextResponse.json({
    configured: Boolean(env),
    url: {
      present: Boolean(rawUrl),
      host: urlHost,
      looksPlaceholder: looksPlaceholderUrl,
      startsWithHttps: rawUrl.startsWith("https://"),
    },
    anonKey: {
      present: Boolean(rawAnon),
      looksPlaceholder: looksPlaceholderAnon,
      length: rawAnon.length,
      prefix: rawAnon ? `${rawAnon.slice(0, 8)}...` : null,
    },
  });
}
