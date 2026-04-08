import { NextResponse } from "next/server";
import { nominatimSearch } from "@/lib/geocoding/nominatim";

export const dynamic = "force-dynamic";

/**
 * 服务端地理编码（Nominatim）。勿在前端直连第三方，避免密钥与滥用。
 */
export async function POST(request: Request) {
  let body: { query?: string };
  try {
    body = (await request.json()) as { query?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query : "";
  const result = await nominatimSearch(query);

  if ("error" in result) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
  }

  return NextResponse.json({
    ok: true,
    lat: result.lat,
    lng: result.lng,
    displayName: result.displayName,
    cityLabel: result.cityLabel,
    countryLabel: result.countryLabel,
  });
}
