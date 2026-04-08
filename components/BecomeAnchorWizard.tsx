"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Calendar,
  Check,
  FileText,
  MapPin,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useSupabaseBrowserClient,
  SUPABASE_BROWSER_CONFIG_HINT,
} from "@/lib/supabase/client";
import {
  FALLBACK_LOCATION_CATALOG,
  type CountryRegionOption,
} from "@/lib/data/locationCatalog";
import { getCityCoordinates } from "@/lib/data/cityCoordinates";
import { GEOGRAPHIC_ATTRIBUTION_DETAIL } from "@/lib/data/geographicAttribution";
import {
  anchorFullSchema,
  type AnchorFullFormValues,
} from "@/lib/schemas/anchorRegistration";
import { FormSelect } from "@/components/FormSelect";
import { cn, slugify } from "@/lib/utils";
import type { AnchorLocationSource } from "@/lib/types/database";

const AUTH_REJECT =
  "Open Livingroom is only available to Stanford GSB students.";

/**
 * 手动地理编码后的唯一 city_slug（避免与目录冲突）
 * @param cityLabel - 解析得到的城市名
 * @param countryLabel - 国家/地区名
 */
function buildManualCitySlug(cityLabel: string, countryLabel: string): string {
  const core = slugify(`${cityLabel}-${countryLabel}`).slice(0, 80);
  const rand =
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID().slice(0, 10)
      : String(Date.now());
  return `geo-${core}-${rand}`;
}

/**
 * 多步注册 Anchor：写入 anchors + availability，成功后跳转城市页
 */
export function BecomeAnchorWizard() {
  const supabase = useSupabaseBrowserClient();
  const router = useRouter();
  const [step, setStep] = useState(1);
  /** loading：尚未拿到 getUser；anonymous：未登录；signed_in：已登录 */
  const [authPhase, setAuthPhase] = useState<
    "loading" | "anonymous" | "signed_in"
  >("loading");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [supabaseEnvError, setSupabaseEnvError] = useState<string | null>(null);
  const [locationCatalog, setLocationCatalog] = useState<CountryRegionOption[]>(
    []
  );
  const [locationCatalogReady, setLocationCatalogReady] = useState(false);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AnchorFullFormValues>({
    resolver: zodResolver(anchorFullSchema),
    defaultValues: {
      location_mode: "manual",
      country_region: "",
      state_province: "",
      city: "",
      city_slug: "",
      manual_query: "",
      manual_city_label: "",
      manual_country_label: "",
      manual_display_name: "",
      geocode_lat: undefined,
      geocode_lng: undefined,
      ranges: [{ start_date: "", end_date: "" }],
      max_guests: 1,
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ranges",
  });

  const maxGuests = watch("max_guests");
  const selectedCountryRegion = watch("country_region");
  const selectedState = watch("state_province");
  const selectedCitySlug = watch("city_slug");
  const locationMode = watch("location_mode");
  const prevLocationMode = useRef(locationMode);

  useEffect(() => {
    if (prevLocationMode.current === locationMode) return;
    prevLocationMode.current = locationMode;
    if (locationMode === "manual") {
      setValue("country_region", "");
      setValue("state_province", "");
      setValue("city", "");
      setValue("city_slug", "");
    } else {
      setValue("manual_query", "");
      setValue("manual_city_label", "");
      setValue("manual_country_label", "");
      setValue("manual_display_name", "");
      setValue("geocode_lat", undefined);
      setValue("geocode_lng", undefined);
      setGeocodeError(null);
    }
  }, [locationMode, setValue]);

  const countryRegionOptions = locationCatalog.map((c) => c.country_or_region);
  const stateOptions = useMemo(() => {
    const region = locationCatalog.find(
      (c) => c.country_or_region === selectedCountryRegion
    );
    return region?.states ?? [];
  }, [selectedCountryRegion, locationCatalog]);
  const cityOptions = useMemo(() => {
    const state = stateOptions.find((s) => s.state_province === selectedState);
    return state?.cities ?? [];
  }, [selectedState, stateOptions]);

  useEffect(() => {
    const region = locationCatalog.find(
      (c) => c.country_or_region === selectedCountryRegion
    );
    const validStates = region?.states ?? [];
    const stillValidState = validStates.some(
      (s) => s.state_province === selectedState
    );
    if (!stillValidState) {
      setValue("state_province", "");
      setValue("city", "");
      setValue("city_slug", "");
    }
  }, [selectedCountryRegion, selectedState, setValue, locationCatalog]);

  useEffect(() => {
    const state = stateOptions.find((s) => s.state_province === selectedState);
    const validCities = state?.cities ?? [];
    const stillValidCity = validCities.some((c) => c.city_slug === selectedCitySlug);
    if (!stillValidCity) {
      setValue("city", "");
      setValue("city_slug", "");
    }
  }, [selectedState, selectedCitySlug, setValue, stateOptions]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/locations/catalog")
      .then((res) => res.json())
      .then(
        (data: {
          catalog: CountryRegionOption[] | null;
          error?: string | null;
        }) => {
          if (cancelled) return;
          if (data.catalog && data.catalog.length > 0) {
            setLocationCatalog(data.catalog);
          } else {
            setLocationCatalog(FALLBACK_LOCATION_CATALOG);
          }
          setLocationCatalogReady(true);
        }
      )
      .catch(() => {
        if (!cancelled) {
          setLocationCatalog(FALLBACK_LOCATION_CATALOG);
          setLocationCatalogReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      setSupabaseEnvError(SUPABASE_BROWSER_CONFIG_HINT);
      setAuthPhase("anonymous");
      return;
    }
    setSupabaseEnvError(null);
    setAuthPhase("loading");
    void supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? null;
      setUserEmail(email);
      setAuthPhase(email ? "signed_in" : "anonymous");
    });
  }, [supabase]);

  async function nextFromStep2() {
    const mode = getValues("location_mode");
    const ok =
      mode === "catalog"
        ? await trigger([
            "location_mode",
            "country_region",
            "state_province",
            "city",
            "city_slug",
          ])
        : await trigger([
            "location_mode",
            "manual_query",
            "geocode_lat",
            "geocode_lng",
            "manual_city_label",
            "manual_country_label",
          ]);
    if (ok) setStep(3);
  }

  /**
   * 调用服务端 Nominatim 代理，将查询串解析为坐标与展示标签
   */
  async function runManualGeocode() {
    const q = getValues("manual_query")?.trim() ?? "";
    setGeocodeError(null);
    if (q.length < 3) {
      setGeocodeError("Enter at least 3 characters.");
      return;
    }
    setGeocodeLoading(true);
    try {
      const res = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        lat?: number;
        lng?: number;
        cityLabel?: string;
        countryLabel?: string;
        displayName?: string;
      };
      if (!res.ok || !data.ok || data.lat == null || data.lng == null) {
        setGeocodeError(data.error ?? "Lookup failed. Try adding the country.");
        setValue("geocode_lat", undefined);
        setValue("geocode_lng", undefined);
        setValue("manual_city_label", "");
        setValue("manual_country_label", "");
        setValue("manual_display_name", "");
        return;
      }
      setValue("geocode_lat", data.lat, { shouldValidate: true });
      setValue("geocode_lng", data.lng, { shouldValidate: true });
      setValue("manual_city_label", data.cityLabel ?? "", { shouldValidate: true });
      setValue("manual_country_label", data.countryLabel ?? "", {
        shouldValidate: true,
      });
      setValue("manual_display_name", data.displayName ?? "", {
        shouldValidate: true,
      });
    } catch {
      setGeocodeError("Network error. Try again.");
    } finally {
      setGeocodeLoading(false);
    }
  }

  async function nextFromStep3() {
    const ok = await trigger(["ranges", "max_guests"]);
    if (ok) setStep(4);
  }

  async function onSubmit(values: AnchorFullFormValues) {
    setSubmitError(null);
    if (!supabase) {
      setSubmitError(SUPABASE_BROWSER_CONFIG_HINT);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id || !user.email) {
      setSubmitError("Sign in is required.");
      return;
    }
    if (!user.email.toLowerCase().endsWith("@stanford.edu")) {
      setSubmitError(AUTH_REJECT);
      return;
    }

    const displayName =
      (user.user_metadata?.full_name as string | undefined)?.trim() ||
      user.email.split("@")[0] ||
      "GSB Student";

    const isManual = values.location_mode === "manual";
    let citySlug: string;
    let cityDisplay: string;
    let country: string;
    let neighborhood: string | null;
    let latitude: number | null = null;
    let longitude: number | null = null;
    let locationSource: AnchorLocationSource = "catalog";

    if (isManual) {
      cityDisplay = values.manual_city_label?.trim() ?? "";
      country = values.manual_country_label?.trim() ?? "";
      neighborhood = null;
      latitude = values.geocode_lat ?? null;
      longitude = values.geocode_lng ?? null;
      locationSource = "geocoded_manual";
      citySlug = buildManualCitySlug(cityDisplay, country);
    } else {
      citySlug = values.city_slug?.trim() ?? "";
      cityDisplay = values.city?.trim() ?? "";
      country = values.country_region?.trim() ?? "";
      neighborhood = values.state_province?.trim() || null;
    }

    if (!citySlug || !cityDisplay || !country) {
      setSubmitError("Complete the location step.");
      return;
    }

    if (!isManual) {
      /**
       * Catalog mode: geocode selected city/country to improve map precision.
       * Fallback to static coordinates map if geocoding fails.
       */
      try {
        const query = `${cityDisplay}, ${country}`;
        const res = await fetch("/api/geocode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          lat?: number;
          lng?: number;
        };
        if (
          res.ok &&
          data.ok &&
          Number.isFinite(data.lat) &&
          Number.isFinite(data.lng)
        ) {
          latitude = data.lat as number;
          longitude = data.lng as number;
        }
      } catch {
        // Ignore network failures; fallback below.
      }

      if (latitude == null || longitude == null) {
        const [lng, lat] = getCityCoordinates(citySlug, country);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          latitude = lat;
          longitude = lng;
        }
      }
    }

    if (
      isManual &&
      (latitude == null ||
        longitude == null ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude))
    ) {
      setSubmitError("Confirm your place with Look up before submitting.");
      return;
    }

    const maxGuestsDb = values.max_guests === 99 ? 99 : values.max_guests;

    // De-dup guide: if the user already created a listing for this city_slug,
    // give them a chance to open the existing listing instead of creating duplicates.
    const { data: existingRows } = await supabase
      .from("anchors")
      .select("id")
      .eq("user_id", user.id)
      .eq("city_slug", citySlug)
      .limit(1);
    const hasExisting = (existingRows?.length ?? 0) > 0;
    if (hasExisting) {
      const openExisting = window.confirm(
        `You already have a listing in this city. Click OK to open it instead, or Cancel to create another listing.`
      );
      if (openExisting) {
        router.push(`/city/${citySlug}`);
        router.refresh();
        return;
      }
    }

    const { data: anchorRow, error: anchorErr } = await supabase
      .from("anchors")
      .insert({
        user_id: user.id,
        name: displayName,
        city: cityDisplay,
        city_slug: citySlug,
        country,
        neighborhood,
        internship: null,
        max_guests: maxGuestsDb,
        notes: values.notes?.trim() || null,
        is_active: true,
        contact_email: user.email,
        latitude,
        longitude,
        location_source: locationSource,
      })
      .select("id")
      .single();

    if (anchorErr || !anchorRow) {
      console.error("[anchors][insert] failed", {
        citySlug,
        isManual,
        error: anchorErr?.message ?? "unknown",
      });
      setSubmitError(anchorErr?.message ?? "Could not create listing.");
      return;
    }

    const rows = values.ranges.map((r) => ({
      anchor_id: anchorRow.id,
      start_date: r.start_date,
      end_date: r.end_date,
    }));

    const { error: availErr } = await supabase
      .from("availability")
      .insert(rows);

    if (availErr) {
      console.error("[availability][insert] failed", {
        anchorId: anchorRow.id,
        count: rows.length,
        error: availErr.message,
      });
      setSubmitError(availErr.message);
      return;
    }

    router.push(`/city/${citySlug}`);
    router.refresh();
  }

  const steps = [
    { id: 1, name: "Verify identity", icon: UserCheck },
    { id: 2, name: "Location", icon: MapPin },
    { id: 3, name: "Availability", icon: Calendar },
    { id: 4, name: "House notes", icon: FileText },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {supabaseEnvError ? (
        <div
          className="mb-8 rounded-xl border border-[#D85A30]/40 bg-[#F0EDE6] p-4 text-sm text-[#1A1A18]"
          role="alert"
        >
          <p className="font-semibold">Supabase is not configured in the browser bundle.</p>
          <p className="mt-2 text-secondary">{supabaseEnvError}</p>
        </div>
      ) : null}

      <div className="mb-12">
        <h1 className="mb-6 text-center font-serif text-4xl font-bold text-near-black">
          Open your livingroom
        </h1>

        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 top-1/2 -z-10 h-px w-full bg-near-black/10" />
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border transition-all",
                  step === s.id
                    ? "scale-110 border-[#B47B2E] bg-[#B47B2E] text-white"
                    : step > s.id
                      ? "border-[#2A9D6F] bg-[#2A9D6F] text-white"
                      : "border-near-black/10 bg-white text-secondary"
                )}
              >
                {step > s.id ? <Check size={20} /> : <s.icon size={20} />}
              </div>
              <span
                className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  step === s.id ? "text-[#B47B2E]" : "text-secondary"
                )}
              >
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#E2DDD4] bg-[#FAF8F4] p-8 shadow-sm">
        {step === 1 && (
          <div className="py-8 text-center">
            <h2 className="mb-4 font-serif text-2xl font-bold">
              Welcome, Class of 2027
            </h2>
            <p className="mb-6 text-secondary">
              You must use a Stanford Google account (@stanford.edu).
            </p>
            {authPhase === "loading" ? (
              <p className="mb-8 text-sm text-secondary">Loading session…</p>
            ) : null}
            {authPhase === "anonymous" ? (
              <div className="mb-8 space-y-4">
                <p className="text-sm text-near-black">
                  Sign in with Google to list your place. Use your @stanford.edu
                  account.
                </p>
                <Link
                  href="/login?next=/become-anchor"
                  className="inline-flex rounded-lg bg-[#B47B2E] px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Sign in with Google
                </Link>
              </div>
            ) : null}
            {authPhase === "signed_in" && userEmail ? (
              <p className="mb-8 text-sm text-near-black">
                Signed in as <strong>{userEmail}</strong>
              </p>
            ) : null}
            <button
              type="button"
              disabled={authPhase !== "signed_in" || !userEmail}
              onClick={() => setStep(2)}
              className="mx-auto rounded-lg bg-[#B47B2E] px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="mb-4 font-serif text-2xl font-bold">
              Where are you staying?
            </h2>
            <input type="hidden" value="manual" {...register("location_mode")} />
            <input
              type="hidden"
              {...register("geocode_lat", {
                setValueAs: (v: unknown) => {
                  if (v === "" || v === undefined || v === null) return undefined;
                  const n = typeof v === "number" ? v : Number(v);
                  return Number.isFinite(n) ? n : undefined;
                },
              })}
            />
            <input
              type="hidden"
              {...register("geocode_lng", {
                setValueAs: (v: unknown) => {
                  if (v === "" || v === undefined || v === null) return undefined;
                  const n = typeof v === "number" ? v : Number(v);
                  return Number.isFinite(n) ? n : undefined;
                },
              })}
            />
            <input type="hidden" {...register("manual_city_label")} />
            <input type="hidden" {...register("manual_country_label")} />
            <input type="hidden" {...register("manual_display_name")} />

            <div className="space-y-4 rounded-lg border border-[#E2DDD4] bg-white p-4">
              <p className="text-sm text-secondary">
                Type a place name (city and country). We use OpenStreetMap search
                to place the map pin—add the country if results are ambiguous.
              </p>
              <div className="space-y-2">
                <label
                  htmlFor="manual_query"
                  className="text-sm font-bold uppercase tracking-wider text-secondary"
                >
                  Search
                </label>
                <input
                  id="manual_query"
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. Porto, Portugal"
                  className="w-full rounded-lg border border-[#E2DDD4] bg-white px-3 py-3 text-sm text-near-black outline-none transition-colors focus:border-[#B47B2E] focus:ring-1 focus:ring-[#B47B2E]/30"
                  {...register("manual_query")}
                />
                {errors.manual_query && (
                  <p className="text-sm text-[#D85A30]">
                    {errors.manual_query.message}
                  </p>
                )}
                {geocodeError ? (
                  <p className="text-sm text-[#D85A30]">{geocodeError}</p>
                ) : null}
              </div>
              <button
                type="button"
                disabled={geocodeLoading}
                onClick={() => void runManualGeocode()}
                className="rounded-md border border-[#B47B2E] bg-[#F0EDE6] px-4 py-2 text-sm font-semibold text-[#B47B2E] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {geocodeLoading ? "Looking up…" : "Look up"}
              </button>
              {watch("manual_display_name") ? (
                <div className="rounded-md bg-[#F0EDE6]/80 p-3 text-sm text-near-black">
                  <p className="font-medium">Resolved place</p>
                  <p className="mt-1 text-secondary">{watch("manual_display_name")}</p>
                  <p className="mt-2 font-mono text-xs text-secondary">
                    {watch("geocode_lat") != null && watch("geocode_lng") != null
                      ? `${Number(watch("geocode_lat")).toFixed(5)}, ${Number(watch("geocode_lng")).toFixed(5)}`
                      : null}
                  </p>
                </div>
              ) : null}
            </div>

            <p className="text-[11px] leading-relaxed text-secondary">
              {GEOGRAPHIC_ATTRIBUTION_DETAIL}
            </p>
            <button
              type="button"
              onClick={() => void nextFromStep2()}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#B47B2E] py-4 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Continue <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="mb-4 font-serif text-2xl font-bold">
              When is your room available?
            </h2>
            <p className="text-secondary">
              Add one or more date ranges when you can welcome a classmate.
            </p>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 gap-4 rounded-lg border border-[#E2DDD4] p-4 md:grid-cols-2"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-secondary">
                    Start
                  </label>
                  <input
                    type="date"
                    {...register(`ranges.${index}.start_date`)}
                    className="w-full rounded-md border border-[#E2DDD4] p-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-secondary">
                    End
                  </label>
                  <input
                    type="date"
                    {...register(`ranges.${index}.end_date`)}
                    className="w-full rounded-md border border-[#E2DDD4] p-2"
                  />
                </div>
                {fields.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-sm text-[#D85A30] md:col-span-2"
                  >
                    Remove range
                  </button>
                ) : null}
              </div>
            ))}
            {errors.ranges && (
              <p className="text-sm text-[#D85A30]">
                {errors.ranges.message ||
                  errors.ranges.root?.message ||
                  "Check your date ranges."}
              </p>
            )}

            <button
              type="button"
              onClick={() =>
                append({ start_date: "", end_date: "" }, { shouldFocus: false })
              }
              className="text-sm font-medium text-[#B47B2E]"
            >
              + Add another range
            </button>

            <div className="space-y-2">
              <p className="text-sm font-bold uppercase tracking-wider text-secondary">
                Max guests
              </p>
              <div className="grid grid-cols-3 gap-4">
                {(
                  [
                    { v: 1 as const, label: "1" },
                    { v: 2 as const, label: "2" },
                    { v: 99 as const, label: "Flexible" },
                  ] as const
                ).map(({ v, label }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValue("max_guests", v)}
                    className={cn(
                      "rounded-md border p-4 font-bold transition-colors",
                      maxGuests === v
                        ? "border-[#B47B2E] bg-[#F0EDE6] text-[#B47B2E]"
                        : "border-[#E2DDD4] hover:border-[#B47B2E]"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {errors.max_guests && (
                <p className="text-sm text-[#D85A30]">
                  {errors.max_guests.message}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => void nextFromStep3()}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#B47B2E] py-4 font-bold text-white transition-opacity hover:opacity-90"
            >
              Continue <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 4 && (
          <form
            onSubmit={(e) => {
              void handleSubmit(onSubmit)(e);
            }}
            className="space-y-6"
          >
            <h2 className="mb-4 font-serif text-2xl font-bold">House notes</h2>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-secondary">
                What should Roamers know?
              </label>
              <textarea
                {...register("notes")}
                className="h-40 w-full rounded-md border border-[#E2DDD4] p-4 outline-none focus:border-[#B47B2E]"
                placeholder="Pets, house rules, neighborhood tips, notice required..."
              />
            </div>
            {submitError ? (
              <p className="text-sm text-[#D85A30]">{submitError}</p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-[#B47B2E] py-4 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? "Saving…" : "List my livingroom"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
