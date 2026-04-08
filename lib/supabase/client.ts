import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/publicEnv";

export {
  SupabaseBrowserProvider,
  useSupabaseBrowserClient,
} from "@/lib/supabase/SupabaseBrowserProvider";

/** 客户端可见的配置说明（勿与密钥一起打日志） */
export const SUPABASE_BROWSER_CONFIG_HINT =
  "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (project root), then restart `npm run dev`.";

/**
 * 非 React 场景或 Provider 外的兜底：从 `process.env` 解析并创建浏览器客户端。
 * 在 App 内请优先使用 {@link useSupabaseBrowserClient}（由根 layout 注入环境变量）。
 * @returns 配置无效时返回 null
 */
export function createSupabaseBrowserClient(): SupabaseClient | null {
  const publicEnv = getSupabasePublicEnv();
  if (!publicEnv) {
    return null;
  }
  try {
    return createBrowserClient(publicEnv.url, publicEnv.anonKey);
  } catch {
    return null;
  }
}
