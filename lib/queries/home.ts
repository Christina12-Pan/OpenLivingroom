import { createSupabaseServerClient } from "@/lib/supabase/server";
import { summarizeCityMarkerStatus } from "@/lib/calendar/dayStatus";
import { getCityCoordinates } from "@/lib/data/cityCoordinates";
import type { StayRequestStatus } from "@/lib/types/database";

export type HomeMapMarker = {
  city: string;
  slug: string;
  coordinates: [number, number];
  status: "available" | "pending" | "booked";
};

type RawRequest = {
  check_in: string;
  check_out: string;
  status: StayRequestStatus;
};

type RawAnchor = {
  city: string;
  city_slug: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  availability: { start_date: string; end_date: string }[] | null;
  stay_requests: RawRequest[] | null;
};

/**
 * 加载首页：活跃 Anchor、按城市聚合的地图标记与统计
 */
const CONFIG_ERROR =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to valid values in .env.local (https://…supabase.co).";

export async function loadHomePageData(): Promise<{
  markers: HomeMapMarker[];
  cityCards: {
    city: string;
    slug: string;
    country: string;
    anchorCount: number;
    status: "available" | "pending" | "booked";
  }[];
  stats: { anchors: number; cities: number };
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      markers: [],
      cityCards: [],
      stats: { anchors: 0, cities: 0 },
      error: CONFIG_ERROR,
    };
  }

  const { data, error } = await supabase
    .from("anchors")
    .select(
      `
      city,
      city_slug,
      country,
      latitude,
      longitude,
      availability (start_date, end_date),
      stay_requests (check_in, check_out, status)
    `
    )
    .eq("is_active", true);

  if (error) {
    return {
      markers: [],
      cityCards: [],
      stats: { anchors: 0, cities: 0 },
      error: error.message,
    };
  }

  const rows = (data ?? []) as unknown as RawAnchor[];
  const anchors = rows.length;
  const bySlug = new Map<
    string,
    {
      city: string;
      country: string;
      /** 任一行带经纬度时用于地图（优先手动打点） */
      coords: [number, number] | null;
      anchors: { availability: { start_date: string; end_date: string }[]; requests: RawRequest[] }[];
    }
  >();

  for (const row of rows) {
    const slug = row.city_slug;
    const availability = row.availability ?? [];
    const stay_requests = row.stay_requests ?? [];
    if (!bySlug.has(slug)) {
      bySlug.set(slug, {
        city: row.city,
        country: row.country,
        coords: null,
        anchors: [],
      });
    }
    const group = bySlug.get(slug)!;
    if (
      group.coords == null &&
      row.latitude != null &&
      row.longitude != null &&
      Number.isFinite(row.latitude) &&
      Number.isFinite(row.longitude)
    ) {
      group.coords = [row.longitude, row.latitude];
    }
    group.anchors.push({
      availability,
      requests: stay_requests,
    });
  }

  const markers: HomeMapMarker[] = [];
  const cityCards: {
    city: string;
    slug: string;
    country: string;
    anchorCount: number;
    status: "available" | "pending" | "booked";
  }[] = [];

  for (const [slug, group] of bySlug) {
    const status = summarizeCityMarkerStatus(group.anchors, 120);
    if (!status) continue;
    const coords =
      group.coords ?? getCityCoordinates(slug, group.country);
    markers.push({
      city: group.city,
      slug,
      coordinates: coords,
      status,
    });
    cityCards.push({
      city: group.city,
      slug,
      country: group.country,
      anchorCount: group.anchors.length,
      status,
    });
  }

  cityCards.sort((a, b) => a.city.localeCompare(b.city));

  return {
    markers,
    cityCards,
    stats: { anchors, cities: bySlug.size },
    error: null,
  };
}
