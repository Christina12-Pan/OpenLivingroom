import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  loadMyAnchorDashboardWithClient,
  type MyAnchorDashboardData,
} from "@/lib/queries/myAnchorDashboardQuery";

export * from "@/lib/queries/myAnchorDashboardQuery";

const CONFIG_ERROR =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.";

/**
 * 服务端入口：创建 server client 再加载
 * @param userId - auth.users.id
 */
export async function loadMyAnchorDashboard(
  userId: string
): Promise<MyAnchorDashboardData> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      anchors: [],
      error: CONFIG_ERROR,
    };
  }
  return loadMyAnchorDashboardWithClient(supabase, userId);
}
