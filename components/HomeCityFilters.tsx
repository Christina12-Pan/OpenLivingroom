"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FormSelect } from "@/components/FormSelect";
import { cn } from "@/lib/utils";

export type HomeCityCard = {
  city: string;
  slug: string;
  country: string;
  anchorCount: number;
  status: "available" | "pending" | "booked";
};

type HomeCityFiltersProps = {
  cityCards: HomeCityCard[];
  hasLoadError: boolean;
};

/**
 * 首页城市卡片筛选：状态 + 国家（不含关键词搜索）
 */
export function HomeCityFilters({ cityCards, hasLoadError }: HomeCityFiltersProps) {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "pending" | "booked"
  >("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");

  const countries = useMemo(() => {
    const values = Array.from(new Set(cityCards.map((c) => c.country)));
    values.sort((a, b) => a.localeCompare(b));
    return values;
  }, [cityCards]);

  const filteredCards = useMemo(() => {
    return cityCards.filter((c) => {
      const statusOk = statusFilter === "all" || c.status === statusFilter;
      const countryOk = countryFilter === "all" || c.country === countryFilter;
      return statusOk && countryOk;
    });
  }, [cityCards, statusFilter, countryFilter]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 rounded-xl border border-[#E2DDD4] bg-[#FAF8F4] p-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-secondary">
            Filter by status
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "all", label: "All" },
                { id: "available", label: "Available" },
                { id: "pending", label: "Pending" },
                { id: "booked", label: "Booked" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatusFilter(s.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                  statusFilter === s.id
                    ? "border-[#B47B2E] bg-[#F0EDE6] text-[#B47B2E]"
                    : "border-[#E2DDD4] bg-white text-secondary hover:bg-[#F0EDE6]"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full sm:w-64">
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-secondary">
            Country
          </label>
          <FormSelect
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
          >
            <option value="all">All countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </FormSelect>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!hasLoadError && cityCards.length === 0 ? (
          <p className="col-span-full rounded-xl border border-[#E2DDD4] bg-[#FAF8F4] p-6 text-center text-secondary">
            No Anchors yet. Be the first.
          </p>
        ) : null}

        {!hasLoadError && cityCards.length > 0 && filteredCards.length === 0 ? (
          <p className="col-span-full rounded-xl border border-[#E2DDD4] bg-[#FAF8F4] p-6 text-center text-secondary">
            No cities match this filter yet.
          </p>
        ) : null}

        {filteredCards.map((c) => (
          <Link
            key={c.slug}
            href={`/city/${c.slug}`}
            className="rounded-xl border border-[#E2DDD4] bg-[#FAF8F4] p-4 transition-colors hover:border-[#B47B2E]"
          >
            <p className="font-serif text-lg font-semibold text-near-black">{c.city}</p>
            <p className="text-sm text-secondary">{c.country}</p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={
                  c.status === "available"
                    ? "rounded-full bg-[#2A9D6F]/15 px-2 py-0.5 text-[11px] font-semibold text-[#2A9D6F]"
                    : c.status === "pending"
                      ? "rounded-full bg-[#E8C97A]/15 px-2 py-0.5 text-[11px] font-semibold text-[#6B4800]"
                      : "rounded-full bg-[#D85A30]/15 px-2 py-0.5 text-[11px] font-semibold text-[#D85A30]"
                }
              >
                {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
              </span>
              <span className="text-xs text-secondary">
                {c.anchorCount} listing{c.anchorCount === 1 ? "" : "s"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

