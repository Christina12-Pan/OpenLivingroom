/**
 * OpenStreetMap Nominatim 搜索（免费，有使用政策：限流、需可识别 User-Agent）。
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */

export type NominatimLookupSuccess = {
  lat: number;
  lng: number;
  displayName: string;
  cityLabel: string;
  countryLabel: string;
};

export type NominatimLookupError = {
  error: string;
};

/**
 * 将自然语言地点描述解析为坐标（服务端调用）
 * @param query - 例如 "Hangzhou, Zhejiang, China"
 */
export async function nominatimSearch(
  query: string
): Promise<NominatimLookupSuccess | NominatimLookupError> {
  const q = query.trim();
  if (q.length < 3) {
    return { error: "Enter at least 3 characters." };
  }

  const contact =
    process.env.NOMINATIM_CONTACT_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    "openlivingroom@localhost";

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", q);
  /** Force English labels (otherwise OSM returns local names, e.g. 阜阳市 for Fuyang). */
  url.searchParams.set("accept-language", "en");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      /** Redundant with query param; both satisfy Nominatim language rules. */
      "Accept-Language": "en",
      "User-Agent": `OpenLivingroom/1.0 (${contact})`,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return { error: `Geocoder returned ${res.status}.` };
  }

  const data = (await res.json()) as {
    lat?: string;
    lon?: string;
    display_name?: string;
    address?: Record<string, string>;
  }[];

  const first = data[0];
  if (!first?.lat || !first?.lon) {
    return { error: "No results. Try a larger nearby city or add the country." };
  }

  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { error: "Invalid coordinates from geocoder." };
  }

  const addr = first.address ?? {};
  const cityLabel =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.county ||
    first.display_name?.split(",")[0]?.trim() ||
    "Unknown";

  const countryLabel = addr.country || "";

  return {
    lat,
    lng,
    displayName: first.display_name ?? cityLabel,
    cityLabel,
    countryLabel: countryLabel || "Unknown",
  };
}
