import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StayRequestStatus } from "@/lib/types/database";

/** 城市页 Anchor 卡片所需字段 */
export type CityAnchorPayload = {
  id: string;
  name: string;
  internship: string | null;
  neighborhood: string | null;
  max_guests: number;
  notes: string | null;
  /** 登记时的 @stanford.edu，供 Roamer 邮件联系 */
  contact_email: string | null;
  availability: { start_date: string; end_date: string }[];
  requests: { check_in: string; check_out: string; status: StayRequestStatus }[];
};

type RawRow = {
  id: string;
  name: string;
  city: string;
  country: string;
  neighborhood: string | null;
  internship: string | null;
  max_guests: number | null;
  notes: string | null;
  contact_email: string | null;
  availability: { start_date: string; end_date: string }[] | null;
  stay_requests: {
    check_in: string;
    check_out: string;
    status: StayRequestStatus;
  }[] | null;
};

/**
 * 按 city_slug 加载活跃 Anchors 及嵌套的 availability、stay_requests
 * @param slug - URL 中的 city slug
 */
const CONFIG_ERROR =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.";

export async function loadCityBySlug(slug: string): Promise<{
  cityLabel: string;
  country: string | null;
  anchors: CityAnchorPayload[];
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      cityLabel: formatSlugAsTitle(slug),
      country: null,
      anchors: [],
      error: CONFIG_ERROR,
    };
  }

  const { data, error } = await supabase
    .from("anchors")
    .select(
      `
      id,
      name,
      city,
      country,
      neighborhood,
      internship,
      max_guests,
      notes,
      contact_email,
      availability (start_date, end_date),
      stay_requests (check_in, check_out, status)
    `
    )
    .eq("city_slug", slug)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      cityLabel: formatSlugAsTitle(slug),
      country: null,
      anchors: [],
      error: error.message,
    };
  }

  const rows = (data ?? []) as unknown as RawRow[];
  const cityLabel =
    rows.length > 0 ? rows[0].city : formatSlugAsTitle(slug);
  const country = rows.length > 0 ? rows[0].country : null;

  const anchors: CityAnchorPayload[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    internship: row.internship,
    neighborhood: row.neighborhood,
    max_guests: row.max_guests ?? 1,
    notes: row.notes,
    contact_email: row.contact_email,
    availability: row.availability ?? [],
    requests: row.stay_requests ?? [],
  }));

  return { cityLabel, country, anchors, error: null };
}

/**
 * 将 slug 转为标题展示（无数据时的 fallback）
 * @param slug - city_slug
 */
function formatSlugAsTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
