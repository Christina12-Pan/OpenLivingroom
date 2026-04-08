import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildLocationCatalogFromRows } from "@/lib/location/buildLocationCatalog";

export const dynamic = "force-dynamic";

/**
 * 返回国家/地区 → 州省 → 城市 三级目录（来自 `geo_city_options`）
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured.", catalog: null },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("geo_city_options")
    .select("country_or_region, state_province, city, city_slug, sort_order")
    .order("country_or_region", { ascending: true })
    .order("state_province", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("city", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message, catalog: null },
      { status: 500 }
    );
  }

  const catalog = buildLocationCatalogFromRows(
    (data ?? []) as Parameters<typeof buildLocationCatalogFromRows>[0]
  );

  return NextResponse.json({ catalog, error: null });
}
