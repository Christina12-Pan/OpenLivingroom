import type {
  CityOption,
  CountryRegionOption,
  StateOption,
} from "@/lib/data/locationCatalog";

/** geo_city_options 表行（与迁移一致） */
export type GeoCityOptionRow = {
  country_or_region: string;
  state_province: string;
  city: string;
  city_slug: string;
  sort_order: number;
};

/**
 * 将扁平表行聚合为三级联动所需结构
 * @param rows - 来自 `geo_city_options` 或静态导出
 */
export function buildLocationCatalogFromRows(
  rows: GeoCityOptionRow[]
): CountryRegionOption[] {
  const byCountry = new Map<string, Map<string, CityOption[]>>();

  const sorted = [...rows].sort((a, b) => {
    const c = a.country_or_region.localeCompare(b.country_or_region);
    if (c !== 0) return c;
    const s = a.state_province.localeCompare(b.state_province);
    if (s !== 0) return s;
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.city.localeCompare(b.city);
  });

  for (const r of sorted) {
    if (!byCountry.has(r.country_or_region)) {
      byCountry.set(r.country_or_region, new Map());
    }
    const byState = byCountry.get(r.country_or_region)!;
    if (!byState.has(r.state_province)) {
      byState.set(r.state_province, []);
    }
    byState.get(r.state_province)!.push({
      city: r.city,
      city_slug: r.city_slug,
    });
  }

  const result: CountryRegionOption[] = [];
  for (const [country_or_region, stateMap] of byCountry) {
    const states: StateOption[] = [];
    for (const [state_province, cities] of stateMap) {
      states.push({ state_province, cities });
    }
    states.sort((a, b) => a.state_province.localeCompare(b.state_province));
    result.push({ country_or_region, states });
  }
  result.sort((a, b) =>
    a.country_or_region.localeCompare(b.country_or_region)
  );
  return result;
}
