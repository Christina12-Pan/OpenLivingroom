import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/supabase/publicEnv";

/**
 * Server Components / Route Handlers 使用的 Supabase 客户端（会话通过 cookie 传递）
 * @returns 环境变量无效时返回 null（页面应展示配置错误而非抛错）
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const publicEnv = getSupabasePublicEnv();
  if (!publicEnv) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(publicEnv.url, publicEnv.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component 中 set 可能不可用；middleware / Route Handler 会刷新会话
        }
      },
    },
  });
}
