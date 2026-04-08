"use client";

import { Calendar as CalendarIcon, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import type { DashboardStayRequest } from "@/lib/queries/myAnchorDashboardQuery";

type MyAnchorStayRequestsSectionProps = {
  pendingRequests: DashboardStayRequest[];
  totalRequestCount: number;
  supabaseReady: boolean;
  requestBusyId: string | null;
  onSetStatus: (
    req: DashboardStayRequest,
    status: "confirmed" | "declined"
  ) => void;
};

/**
 * Dashboard：待处理 stay 请求列表与空状态（规则内英文文案）
 */
export function MyAnchorStayRequestsSection({
  pendingRequests,
  totalRequestCount,
  supabaseReady,
  requestBusyId,
  onSetStatus,
}: MyAnchorStayRequestsSectionProps) {
  return (
    <div className="space-y-8 lg:col-span-2">
      <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
        Stay requests{" "}
        <span className="rounded-full bg-[#E8C97A]/30 px-2 py-0.5 font-sans text-sm font-normal text-[#6B4800]">
          {pendingRequests.length}
        </span>
      </h2>

      {pendingRequests.length === 0 ? (
        <div className="rounded-xl border border-[#E2DDD4] bg-[#FAF8F4] p-8 text-center">
          <p className="text-secondary">
            {totalRequestCount === 0
              ? "No requests yet. Share your listing with classmates."
              : "No pending requests."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="rounded-lg border border-near-black/5 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h3 className="mb-1 text-xl font-bold text-near-black">
                    {req.roamer_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <CalendarIcon size={14} />
                    <span>{formatStayRange(req.check_in, req.check_out)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!supabaseReady || requestBusyId === req.id}
                    onClick={() => onSetStatus(req, "confirmed")}
                    className="rounded-md p-2 text-[#2A9D6F] transition-colors hover:bg-[#2A9D6F]/10"
                    title="Accept request"
                  >
                    <CheckCircle size={24} />
                  </button>
                  <button
                    type="button"
                    disabled={!supabaseReady || requestBusyId === req.id}
                    onClick={() => onSetStatus(req, "declined")}
                    className="rounded-md p-2 text-[#D85A30] transition-colors hover:bg-[#D85A30]/10"
                    title="Decline"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>
              {req.roamer_blurb ? (
                <p className="border-l-2 border-[#B47B2E]/20 py-1 pl-4 text-sm italic text-secondary">
                  &ldquo;{req.roamer_blurb}&rdquo;
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * @param checkIn - YYYY-MM-DD
 * @param checkOut - YYYY-MM-DD
 */
function formatStayRange(checkIn: string, checkOut: string): string {
  const a = new Date(`${checkIn}T12:00:00`);
  const b = new Date(`${checkOut}T12:00:00`);
  return `${format(a, "MMM d")} – ${format(b, "MMM d")}`;
}
