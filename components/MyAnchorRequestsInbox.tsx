"use client";

import { Calendar as CalendarIcon, CheckCircle, MapPin, XCircle } from "lucide-react";
import { format } from "date-fns";
import { FormSelect } from "@/components/FormSelect";
import type { DashboardStayRequest, MyAnchorDashboardData } from "@/lib/queries/myAnchorDashboardQuery";
import { cn } from "@/lib/utils";

export type InboxFilterValue = "all" | string;
export type InboxTab = "pending" | "confirmed" | "declined";

type InboxItem = {
  anchor_id: string;
  city: string;
  country: string;
  city_slug: string;
  request: DashboardStayRequest;
};

type MyAnchorRequestsInboxProps = {
  /** 全量 dashboard 数据（含 anchors、requests） */
  data: MyAnchorDashboardData;
  /** 是否允许执行 accept/decline */
  supabaseReady: boolean;
  /** 正在更新的 request id */
  requestBusyId: string | null;
  /** 当前筛选值：all 或 anchor_id */
  filterValue: InboxFilterValue;
  /** 更新筛选值 */
  onChangeFilterValue: (v: InboxFilterValue) => void;
  /** 当前 tab */
  tab: InboxTab;
  /** 切换 tab */
  onChangeTab: (t: InboxTab) => void;
  /** 更新 request 状态 */
  onSetStatus: (req: DashboardStayRequest, status: "confirmed" | "declined") => void;
};

/**
 * Dashboard：跨城市聚合的 pending requests inbox（PM 优先路径）
 */
export function MyAnchorRequestsInbox({
  data,
  supabaseReady,
  requestBusyId,
  filterValue,
  onChangeFilterValue,
  tab,
  onChangeTab,
  onSetStatus,
}: MyAnchorRequestsInboxProps) {
  const items = buildInboxItems(data);
  const byTab = items.filter((i) => i.request.status === tab);
  const filtered =
    filterValue === "all" ? byTab : byTab.filter((i) => i.anchor_id === filterValue);
  const counts = {
    pending: items.filter((i) => i.request.status === "pending").length,
    confirmed: items.filter((i) => i.request.status === "confirmed").length,
    declined: items.filter((i) => i.request.status === "declined").length,
  } satisfies Record<InboxTab, number>;
  const tabTotal = counts[tab];

  return (
    <section className="rounded-xl border border-[#E2DDD4] bg-[#FAF8F4] p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-near-black">Requests inbox</h2>
          <p className="mt-2 text-secondary">
            {counts.pending === 0 && counts.confirmed === 0 && counts.declined === 0
              ? "No requests yet. Share your listing with classmates."
              : tab === "pending"
                ? `You have ${counts.pending} pending request${counts.pending === 1 ? "" : "s"}.`
                : tab === "confirmed"
                  ? `You have ${counts.confirmed} confirmed request${counts.confirmed === 1 ? "" : "s"}.`
                  : `You have ${counts.declined} declined request${counts.declined === 1 ? "" : "s"}.`}
          </p>
        </div>

        <div className="w-full md:w-[280px]">
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-secondary">
            Filter by city
          </label>
          <FormSelect
            value={filterValue}
            onChange={(e) => onChangeFilterValue(e.target.value)}
          >
            <option value="all">All cities</option>
            {data.anchors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.city}, {a.country}
              </option>
            ))}
          </FormSelect>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            { id: "pending" as const, label: "Pending", count: counts.pending },
            { id: "confirmed" as const, label: "Confirmed", count: counts.confirmed },
            { id: "declined" as const, label: "Declined", count: counts.declined },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChangeTab(t.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              tab === t.id
                ? "border-[#B47B2E] bg-[#F0EDE6] text-[#B47B2E]"
                : "border-[#E2DDD4] bg-white text-secondary hover:bg-[#F0EDE6]"
            )}
          >
            {t.label}{" "}
            <span
              className={cn(
                "ml-1 rounded-full px-2 py-0.5 text-xs",
                tab === t.id ? "bg-white/60" : "bg-[#F0EDE6]"
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && tabTotal > 0 ? (
        <div className="mt-6 rounded-xl border border-[#E2DDD4] bg-white p-6 text-center text-secondary">
          No pending requests for this city.
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <div className="mt-6 space-y-4">
          {filtered.map((item) => (
            <div
              key={item.request.id}
              className="rounded-xl border border-near-black/5 bg-white p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-near-black">{item.request.roamer_name}</h3>
                    <span className="rounded-full bg-[#F0EDE6] px-2.5 py-1 text-xs font-medium text-secondary">
                      <MapPin className="mr-1 inline-block h-3.5 w-3.5 text-[#B47B2E]" />
                      {item.city}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-secondary">
                    <CalendarIcon size={14} />
                    <span>{formatStayRange(item.request.check_in, item.request.check_out)}</span>
                  </div>
                </div>

                {tab === "pending" ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!supabaseReady || requestBusyId === item.request.id}
                      onClick={() => onSetStatus(item.request, "confirmed")}
                      className="rounded-lg bg-[#2A9D6F] px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      title="Accept request"
                    >
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle size={18} />
                        Accept
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={!supabaseReady || requestBusyId === item.request.id}
                      onClick={() => onSetStatus(item.request, "declined")}
                      className="rounded-lg border border-[#E2DDD4] bg-white px-3 py-2 text-sm font-semibold text-near-black transition-colors hover:bg-[#F0EDE6] disabled:opacity-50"
                      title="Decline"
                    >
                      <span className="inline-flex items-center gap-2">
                        <XCircle size={18} className="text-[#D85A30]" />
                        Decline
                      </span>
                    </button>
                  </div>
                ) : null}
              </div>

              {item.request.roamer_blurb ? (
                <p className="mt-4 border-l-2 border-[#B47B2E]/20 py-1 pl-4 text-sm italic text-secondary">
                  &ldquo;{item.request.roamer_blurb}&rdquo;
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

/**
 * 构建 inbox：取所有 anchor 的 pending requests，按 created_at 倒序
 * @param data - dashboard 数据
 */
function buildInboxItems(data: MyAnchorDashboardData): InboxItem[] {
  const items: InboxItem[] = [];
  for (const a of data.anchors) {
    for (const r of a.requests) {
      // UI fallback for "48h auto-release":
      // if pending is older than 48 hours, hide it from the Pending tab.
      if (r.status === "pending") {
        const createdAt = new Date(r.created_at).getTime();
        const freshAfter = Date.now() - 48 * 60 * 60 * 1000;
        if (Number.isFinite(createdAt) && createdAt < freshAfter) continue;
      }
      items.push({
        anchor_id: a.id,
        city: a.city,
        country: a.country,
        city_slug: a.city_slug,
        request: r,
      });
    }
  }
  items.sort(
    (x, y) => new Date(y.request.created_at).getTime() - new Date(x.request.created_at).getTime()
  );
  return items;
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

