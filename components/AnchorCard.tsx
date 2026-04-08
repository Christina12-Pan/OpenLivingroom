"use client";

import React, { useEffect, useMemo, useState } from "react";
import CalendarStrip from "./CalendarStrip";
import RequestModal from "./RequestModal";
import { Users, Building2, MapPin } from "lucide-react";
import type { CityAnchorPayload } from "@/lib/queries/city";
import { useStayRequestsForAnchor } from "@/hooks/useStayRequestsForAnchor";
import { useSupabaseBrowserClient } from "@/lib/supabase/client";

interface AnchorCardProps {
  anchor: CityAnchorPayload;
  citySlug: string;
  cityLabel: string;
}

/**
 * 展示单个 Anchor 与实时日历条
 */
const AnchorCard = ({ anchor, citySlug, cityLabel }: AnchorCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const liveRequests = useStayRequestsForAnchor(anchor.id, anchor.requests);
  const supabase = useSupabaseBrowserClient();
  const [viewerGate, setViewerGate] = useState<
    "loading" | "anonymous" | "external" | "stanford"
  >("loading");

  useEffect(() => {
    if (!supabase) {
      setViewerGate("anonymous");
      return;
    }
    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      const email = data.user?.email?.toLowerCase() ?? "";
      if (!email) setViewerGate("anonymous");
      else if (email.endsWith("@stanford.edu")) setViewerGate("stanford");
      else setViewerGate("external");
    });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const displayName = useMemo(() => {
    return viewerGate === "stanford" ? anchor.name : "Anchor";
  }, [anchor.name, viewerGate]);

  const initials = useMemo(() => {
    if (viewerGate !== "stanford") return "A";
    return anchor.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
  }, [anchor.name, viewerGate]);

  const maxLabel =
    anchor.max_guests >= 99 ? "Flexible" : String(anchor.max_guests);
  const showInternship =
    !!anchor.internship && anchor.internship.trim() !== "—";
  const showNeighborhood =
    !!anchor.neighborhood && anchor.neighborhood.trim() !== "—";
  const showNotes = !!anchor.notes && anchor.notes.trim() !== "—";
  const canRequest = anchor.availability.length > 0;

  return (
    <>
      <div className="rounded-xl border border-[#E2DDD4] bg-[#FAF8F4] p-6 md:p-8 transition-colors hover:border-[#B47B2E]/40">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0EDE6] font-bold text-[#B47B2E]">
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-xl font-bold text-near-black">
                {displayName}
              </h3>
              {viewerGate !== "stanford" ? (
                <p className="mt-1 text-xs text-secondary">
                  Sign in with a <span className="font-semibold">@stanford.edu</span>{" "}
                  email to view Anchor details.
                </p>
              ) : null}
              <div className="flex items-center gap-2 text-sm text-secondary">
                <MapPin size={14} />
                <span className="truncate">
                  {cityLabel}
                  {showNeighborhood ? `, ${anchor.neighborhood}` : ""}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-[#F0EDE6] px-2.5 py-1 text-xs text-secondary">
            <Users size={14} />
            <span>{maxLabel} guest max</span>
          </div>
        </div>

        {showInternship ? (
          <div className="mb-4 flex items-center gap-2 text-sm text-secondary">
            <Building2 size={14} />
            <span>{anchor.internship}</span>
          </div>
        ) : null}
        {showNotes ? (
          <p className="mb-6 text-sm leading-relaxed text-secondary">
            {anchor.notes}
          </p>
        ) : null}

        <div className="mb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-near-black/40">
            Availability
          </p>
          <CalendarStrip
            availability={anchor.availability}
            requests={liveRequests}
          />
        </div>

        <button
          type="button"
          disabled={!canRequest}
          onClick={() => {
            if (!canRequest) return;
            setIsModalOpen(true);
          }}
          className={
            canRequest
              ? "w-full rounded-lg bg-[#B47B2E] py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              : "w-full cursor-not-allowed rounded-lg bg-near-black/5 py-3 font-bold text-secondary"
          }
        >
          Request to stay
        </button>

        {!canRequest ? (
          <p className="mt-3 text-xs leading-relaxed text-secondary">
            This Anchor has not added availability yet. Check back later or
            browse other Anchors.
          </p>
        ) : null}
      </div>

      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        anchor={anchor}
        citySlug={citySlug}
      />
    </>
  );
};

export default AnchorCard;
