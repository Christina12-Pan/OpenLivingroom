"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// FormSelect is used inside MyAnchorRequestsInbox
import {
  useSupabaseBrowserClient,
  SUPABASE_BROWSER_CONFIG_HINT,
} from "@/lib/supabase/client";
import {
  loadMyAnchorDashboardWithClient,
  type MyAnchorDashboardData,
} from "@/lib/queries/myAnchorDashboardQuery";
import { MyAnchorRequestsInbox } from "@/components/MyAnchorRequestsInbox";
import { EditAvailabilityModal } from "@/components/EditAvailabilityModal";

type MyAnchorDashboardViewProps = {
  userId: string;
  initialData: MyAnchorDashboardData;
};

/**
 * Anchor 仪表盘：服务端首屏 + 浏览器挂载时用同一会话再拉取，避免嵌套查询或缓存导致列表不刷新
 */
export function MyAnchorDashboardView({
  userId,
  initialData,
}: MyAnchorDashboardViewProps) {
  const supabase = useSupabaseBrowserClient();
  const router = useRouter();
  const [data, setData] = useState<MyAnchorDashboardData>(initialData);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [requestBusyId, setRequestBusyId] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<"all" | string>("all");
  const [inboxTab, setInboxTab] = useState<"pending" | "confirmed" | "declined">("pending");
  const [editingAnchorId, setEditingAnchorId] = useState<string | null>(null);
  const [copiedAnchorId, setCopiedAnchorId] = useState<string | null>(null);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    void loadMyAnchorDashboardWithClient(supabase, userId).then((next) => {
      if (cancelled) return;
      setData(next);
    });
    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  const anchors = data.anchors;

  async function toggleActive() {
    // toggled per-listing now; handled inline
    return;
  }

  async function toggleActiveForAnchor(anchorId: string, next: boolean) {
    if (!supabase) return;
    setToggleBusy(true);
    const { error } = await supabase
      .from("anchors")
      .update({ is_active: next })
      .eq("id", anchorId);
    setToggleBusy(false);
    if (!error) {
      router.refresh();
      const fresh = await loadMyAnchorDashboardWithClient(supabase, userId);
      if (!fresh.error) setData(fresh);
    }
  }

  async function setRequestStatus(reqId: string, status: "confirmed" | "declined") {
    if (!supabase) return;
    setRequestBusyId(reqId);
    const { error } = await supabase
      .from("stay_requests")
      .update({ status })
      .eq("id", reqId);
    setRequestBusyId(null);
    if (!error) {
      router.refresh();
      const fresh = await loadMyAnchorDashboardWithClient(supabase, userId);
      if (!fresh.error) setData(fresh);
    }
  }

  /**
   * 复制 city listing 链接到剪贴板（用于分享给同学）。
   * @param citySlug - `anchors.city_slug`
   * @param anchorId - `anchors.id`（仅用于 UI 反馈）
   */
  async function copyListingLink(citySlug: string, anchorId: string) {
    const path = `/city/${citySlug}`;
    const url =
      typeof window === "undefined" ? path : `${window.location.origin}${path}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedAnchorId(anchorId);
      window.setTimeout(() => setCopiedAnchorId((v) => (v === anchorId ? null : v)), 1200);
    } catch {
      // Clipboard API may be unavailable in some browsers.
      window.prompt("Copy this link", url);
    }
  }

  if (data.error) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-[#D85A30]" role="alert">
          Could not load your dashboard right now.{" "}
          <span className="text-xs">Details: {data.error}</span>
        </p>
      </div>
    );
  }

  if (anchors.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="mb-2 font-serif text-4xl font-bold text-near-black">
          My Anchor Dashboard
        </h1>
        <p className="mb-8 text-lg text-secondary">
          Manage your availability and stay requests.
        </p>
        <div className="rounded-xl border border-[#E2DDD4] bg-[#FAF8F4] p-8 text-center">
          <p className="mb-6 text-secondary">
            You don&apos;t have a listing yet.
          </p>
          <Link
            href="/become-anchor"
            className="inline-block rounded-lg bg-[#B47B2E] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Open my livingroom
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {!supabase ? (
        <p className="mb-6 text-sm text-[#D85A30]" role="alert">
          {SUPABASE_BROWSER_CONFIG_HINT} Pause and request actions require a
          configured browser client.
        </p>
      ) : null}
      <div className="mb-12">
        <h1 className="mb-2 font-serif text-4xl font-bold text-near-black">
          My Anchor Dashboard
        </h1>
        <p className="text-lg text-secondary">
          Manage your availability and stay requests.
        </p>
        <p className="mt-4 text-sm text-secondary">
          {anchors.length} listing{anchors.length === 1 ? "" : "s"}
        </p>
      </div>

      <MyAnchorRequestsInbox
        data={data}
        supabaseReady={!!supabase}
        requestBusyId={requestBusyId}
        filterValue={cityFilter}
        onChangeFilterValue={setCityFilter}
        tab={inboxTab}
        onChangeTab={setInboxTab}
        onSetStatus={(req, status) => void setRequestStatus(req.id, status)}
      />

      <section className="mt-10 rounded-xl border border-[#E2DDD4] bg-[#F0EDE6] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-near-black">Your listings</h2>
            <p className="mt-2 text-secondary">
              Keep your listings active and share the link with classmates.
            </p>
          </div>
          <Link
            href="/become-anchor"
            className="inline-flex items-center justify-center rounded-lg bg-[#B47B2E] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Add another city
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {anchors.map((a) => (
            <div
              key={`listing-${a.id}`}
              className="rounded-xl border border-[#E2DDD4] bg-[#FAF8F4] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-near-black">
                    <span className="font-semibold">{a.city}</span>
                    <span className="text-secondary">, {a.country}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    <Link
                      href={`/city/${a.city_slug}`}
                      className="font-medium text-[#B47B2E] hover:underline"
                    >
                      View city listing
                    </Link>
                    <button
                      type="button"
                      onClick={() => void copyListingLink(a.city_slug, a.id)}
                      className="font-medium text-secondary hover:text-near-black"
                      title="Copy share link"
                    >
                      {copiedAnchorId === a.id ? "Copied" : "Copy link"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingAnchorId(a.id)}
                      className="font-medium text-secondary hover:text-near-black"
                    >
                      Edit availability
                    </button>
                    <span
                      className={
                        a.is_active
                          ? "rounded-full bg-[#2A9D6F]/15 px-2.5 py-1 text-xs font-medium text-[#2A9D6F]"
                          : "rounded-full bg-near-black/5 px-2.5 py-1 text-xs font-medium text-secondary"
                      }
                    >
                      {a.is_active ? "Active" : "Paused"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!supabase || toggleBusy}
                  onClick={() => void toggleActiveForAnchor(a.id, !(a.is_active ?? false))}
                  className="shrink-0 rounded-lg border border-[#E2DDD4] bg-white px-3 py-2 text-sm font-medium text-near-black transition-colors hover:bg-[#F0EDE6] disabled:opacity-50"
                >
                  {(a.is_active ?? false) ? "Pause" : "Resume"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <EditAvailabilityModal
        isOpen={editingAnchorId != null}
        onClose={() => setEditingAnchorId(null)}
        anchorId={editingAnchorId ?? ""}
        cityLabel={
          editingAnchorId
            ? anchors.find((a) => a.id === editingAnchorId)?.city ?? "This city"
            : "This city"
        }
        initialRanges={
          editingAnchorId
            ? anchors.find((a) => a.id === editingAnchorId)?.availability ?? []
            : []
        }
        onSaved={async () => {
          if (!supabase) return;
          const fresh = await loadMyAnchorDashboardWithClient(supabase, userId);
          if (!fresh.error) setData(fresh);
        }}
      />
    </div>
  );
}
