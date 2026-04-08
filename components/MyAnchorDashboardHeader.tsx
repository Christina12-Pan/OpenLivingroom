"use client";

import Link from "next/link";
import { Power } from "lucide-react";
import { cn } from "@/lib/utils";

type MyAnchorDashboardHeaderProps = {
  city: string;
  country: string;
  citySlug: string;
  isActive: boolean;
  supabaseReady: boolean;
  toggleBusy: boolean;
  onToggleActive: () => void;
};

/**
 * Dashboard 顶栏：城市信息与 listing 开/关
 */
export function MyAnchorDashboardHeader({
  city,
  country,
  citySlug,
  isActive,
  supabaseReady,
  toggleBusy,
  onToggleActive,
}: MyAnchorDashboardHeaderProps) {
  return (
    <div className="mb-12 flex flex-col items-start justify-between gap-8 md:flex-row">
      <div>
        <h1 className="mb-2 font-serif text-4xl font-bold text-near-black">
          My Anchor Dashboard
        </h1>
        <p className="text-lg text-secondary">
          Manage your availability and stay requests.
        </p>
        <p className="mt-4 text-near-black">
          <span className="font-semibold">{city}</span>
          <span className="text-secondary">, {country}</span>
        </p>
        <Link
          href={`/city/${citySlug}`}
          className="mt-2 inline-block text-sm font-medium text-[#B47B2E] hover:underline"
        >
          View city listing
        </Link>
      </div>
      <div className="flex items-center gap-4 rounded-lg border border-near-black/5 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-3 w-3 rounded-full",
              isActive ? "bg-[#2A9D6F]" : "bg-near-black/20"
            )}
          />
          <span className="text-sm font-bold uppercase tracking-wider">
            {isActive ? "Listing active" : "Listing paused"}
          </span>
        </div>
        <button
          type="button"
          disabled={!supabaseReady || toggleBusy}
          onClick={() => onToggleActive()}
          className={cn(
            "rounded-md p-2 transition-all",
            isActive
              ? "bg-[#F0EDE6] text-near-black hover:bg-near-black/10"
              : "bg-[#B47B2E] text-white hover:opacity-90"
          )}
          aria-label={isActive ? "Pause listing" : "Resume listing"}
        >
          <Power size={20} />
        </button>
      </div>
    </div>
  );
}
