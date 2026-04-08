import { redirect } from "next/navigation";
import { MyAnchorDashboardView } from "@/components/MyAnchorDashboardView";
import { loadMyAnchorDashboard } from "@/lib/queries/myAnchorDashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Anchor 仪表盘：服务端拉取当前用户的 listing 与请求
 */
export default async function MyAnchorPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-[#D85A30]" role="alert">
          Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.
        </p>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/my-anchor");
  }

  const initialData = await loadMyAnchorDashboard(user.id);
  return (
    <MyAnchorDashboardView userId={user.id} initialData={initialData} />
  );
}
