import type { SupabaseClient } from "@supabase/supabase-js";
import type { StayRequestStatus } from "@/lib/types/database";

/** Dashboard 上展示的 stay request */
export type DashboardStayRequest = {
  id: string;
  roamer_name: string;
  check_in: string;
  check_out: string;
  status: StayRequestStatus;
  roamer_blurb: string | null;
  created_at: string;
};

export type MyAnchorDashboardAnchor = {
  id: string;
  name: string;
  city: string;
  city_slug: string;
  country: string;
  neighborhood: string | null;
  is_active: boolean | null;
  max_guests: number | null;
  notes: string | null;
  created_at: string;
};

export type MyAnchorDashboardData = {
  anchors: (MyAnchorDashboardAnchor & {
    availability: { id: string; start_date: string; end_date: string }[];
    requests: DashboardStayRequest[];
  })[];
  error: string | null;
};

/**
 * 使用已有 Supabase 客户端加载仪表盘（服务端 / 浏览器共用，勿从此文件再 import server）。
 * 分步查询避免嵌套 select + maybeSingle 在 PostgREST 下的边界问题。
 * @param supabase - Supabase 客户端
 * @param userId - auth.users.id
 */
export async function loadMyAnchorDashboardWithClient(
  supabase: SupabaseClient,
  userId: string
): Promise<MyAnchorDashboardData> {
  const { data: anchorRows, error: anchorError } = await supabase
    .from("anchors")
    .select(
      "id, name, city, city_slug, country, neighborhood, is_active, max_guests, notes, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (anchorError) {
    return {
      anchors: [],
      error: anchorError.message,
    };
  }

  const anchorsBase = (anchorRows ?? []) as MyAnchorDashboardAnchor[];
  if (anchorsBase.length === 0) {
    return {
      anchors: [],
      error: null,
    };
  }

  // Stabilize order even if backend changes default ordering.
  anchorsBase.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const anchorIds = anchorsBase.map((a) => a.id);

  const [availRes, reqRes] = await Promise.all([
    supabase
      .from("availability")
      .select("id, anchor_id, start_date, end_date")
      .in("anchor_id", anchorIds),
    supabase
      .from("stay_requests")
      .select(
        "id, anchor_id, roamer_name, check_in, check_out, status, roamer_blurb, created_at"
      )
      .in("anchor_id", anchorIds)
      .order("created_at", { ascending: false }),
  ]);

  const subErr = availRes.error?.message || reqRes.error?.message;
  if (subErr) {
    return {
      anchors: [],
      error: subErr,
    };
  }

  const availabilityRows = (availRes.data ?? []) as {
    id: string;
    anchor_id: string;
    start_date: string;
    end_date: string;
  }[];
  const requestRows = (reqRes.data ?? []) as (DashboardStayRequest & {
    anchor_id: string;
  })[];

  const availabilityByAnchor = new Map<
    string,
    { id: string; start_date: string; end_date: string }[]
  >();
  for (const row of availabilityRows) {
    const list = availabilityByAnchor.get(row.anchor_id) ?? [];
    list.push({ id: row.id, start_date: row.start_date, end_date: row.end_date });
    availabilityByAnchor.set(row.anchor_id, list);
  }

  const requestsByAnchor = new Map<string, DashboardStayRequest[]>();
  for (const row of requestRows) {
    const list = requestsByAnchor.get(row.anchor_id) ?? [];
    list.push({
      id: row.id,
      roamer_name: row.roamer_name,
      check_in: row.check_in,
      check_out: row.check_out,
      status: row.status,
      roamer_blurb: row.roamer_blurb,
      created_at: row.created_at,
    });
    requestsByAnchor.set(row.anchor_id, list);
  }

  return {
    anchors: anchorsBase.map((a) => ({
      ...a,
      availability: availabilityByAnchor.get(a.id) ?? [],
      requests: requestsByAnchor.get(a.id) ?? [],
    })),
    error: null,
  };
}
