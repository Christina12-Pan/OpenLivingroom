"use client";

import React, { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { X, Calendar as CalendarIcon, Send, Info } from "lucide-react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import {
  isBefore,
  isWithinInterval,
  parseISO,
  format,
  startOfDay,
} from "date-fns";
import {
  useSupabaseBrowserClient,
  SUPABASE_BROWSER_CONFIG_HINT,
} from "@/lib/supabase/client";
import {
  stayRequestFormSchema,
  type StayRequestFormValues,
} from "@/lib/schemas/stayRequest";
import type { CityAnchorPayload } from "@/lib/queries/city";
import Link from "next/link";

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  anchor: CityAnchorPayload;
  citySlug: string;
}

/**
 * 申请入住：RHF + zod，日期限制在 Anchor 可用区间内，提交写入 stay_requests
 */
const RequestModal = ({
  isOpen,
  onClose,
  anchor,
  citySlug,
}: RequestModalProps) => {
  const supabase = useSupabaseBrowserClient();
  const loginHref = `/login?next=${encodeURIComponent(`/city/${citySlug}`)}`;

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hostRole, setHostRole] = useState<"loading" | "host" | "roamer">(
    "loading"
  );
  const [viewerEmailGate, setViewerEmailGate] = useState<
    "loading" | "anonymous" | "external" | "stanford"
  >("loading");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StayRequestFormValues>({
    resolver: zodResolver(stayRequestFormSchema),
    defaultValues: {
      check_in: "",
      check_out: "",
    },
  });

  const checkIn = watch("check_in");
  const checkOut = watch("check_out");

  const selectedRange: DateRange | undefined = useMemo(() => {
    if (!checkIn) return undefined;
    const from = parseISO(checkIn);
    if (Number.isNaN(from.getTime())) return undefined;
    return {
      from,
      to: checkOut ? parseISO(checkOut) : undefined,
    };
  }, [checkIn, checkOut]);

  useEffect(() => {
    if (isOpen) {
      reset();
      setSubmitError(null);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (!isOpen) return;
    if (!supabase) {
      setHostRole("loading");
      setViewerEmailGate("loading");
      return;
    }

    void supabase.auth.getUser().then(({ data }) => {
      const userEmail = data.user?.email?.toLowerCase() ?? "";
      const hostEmail = anchor.contact_email?.toLowerCase() ?? "";
      const isHost = Boolean(
        userEmail && hostEmail && userEmail === hostEmail
      );
      setHostRole(isHost ? "host" : "roamer");

      if (!userEmail) {
        setViewerEmailGate("anonymous");
      } else if (userEmail.endsWith("@stanford.edu")) {
        setViewerEmailGate("stanford");
      } else {
        setViewerEmailGate("external");
      }
    });
  }, [isOpen, supabase, anchor.contact_email]);

  const disabledMatchers = useMemo(() => {
    return (date: Date) => {
      if (hostRole !== "roamer") return true;

      const d = startOfDay(date);
      const today = startOfDay(new Date());
      if (isBefore(d, today)) return true;
      const inWindow = anchor.availability.some((r) =>
        isWithinInterval(d, {
          start: parseISO(r.start_date),
          end: parseISO(r.end_date),
        })
      );
      return !inWindow;
    };
  }, [anchor.availability, hostRole]);

  async function onSubmit(values: StayRequestFormValues) {
    if (hostRole === "host") {
      setSubmitError(
        "You are the Anchor for this listing. Roamers can send requests to you."
      );
      return;
    }

    if (!supabase) {
      setSubmitError(SUPABASE_BROWSER_CONFIG_HINT);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      setSubmitError("You must be signed in to request a stay.");
      return;
    }

    const name =
      (user.user_metadata?.full_name as string | undefined)?.trim() ||
      user.email.split("@")[0] ||
      "Guest";

    const { error } = await supabase
      .from("stay_requests")
      .insert({
      anchor_id: anchor.id,
      roamer_user_id: user.id,
      roamer_name: name,
      roamer_email: user.email,
      roamer_blurb: null,
      check_in: values.check_in,
      check_out: values.check_out,
      status: "pending",
      })

    if (error) {
      console.error("[request][insert] failed", {
        anchorId: anchor.id,
        check_in: values.check_in,
        check_out: values.check_out,
        status: "pending",
        error: error.message,
      });
      setSubmitError("Could not send your request. Please try again in a moment.");
      return;
    }

    reset();
    onClose();
  }

  if (!isOpen) return null;

  if (anchor.availability.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-near-black/40 p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-md rounded-xl border border-[#E2DDD4] bg-[#FAF8F4] p-8 shadow-sm">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-secondary"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <p className="pr-8 text-secondary">
            This Anchor has not added availability yet. Check back later or browse
            other Anchors.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-near-black/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-[#E2DDD4] bg-[#FAF8F4] shadow-sm">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-secondary transition-colors hover:text-near-black"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <h2 className="mb-2 font-serif text-3xl font-bold text-near-black">
            Stay with {anchor.name}
          </h2>
          <p className="mb-8 text-secondary">
            Request dates for your summer internship stay.
          </p>

          <form
            onSubmit={(e) => {
              void handleSubmit(onSubmit)(e);
            }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
          >
            <input type="hidden" {...register("check_in")} />
            <input type="hidden" {...register("check_out")} />
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-secondary">
                <CalendarIcon size={14} />
                Select dates
              </label>
              <div className="rounded-lg border border-[#E2DDD4] bg-[#F0EDE6] p-2">
                <DayPicker
                  mode="range"
                  numberOfMonths={1}
                  selected={selectedRange}
                  onSelect={(range) => {
                    if (range?.from) {
                      setValue("check_in", format(range.from, "yyyy-MM-dd"), {
                        shouldValidate: true,
                      });
                    } else {
                      setValue("check_in", "");
                    }
                    if (range?.to) {
                      setValue("check_out", format(range.to, "yyyy-MM-dd"), {
                        shouldValidate: true,
                      });
                    } else {
                      setValue("check_out", "");
                    }
                  }}
                  disabled={disabledMatchers}
                  className="mx-auto"
                />
              </div>
              {errors.check_in && (
                <p className="text-sm text-[#D85A30]">{errors.check_in.message}</p>
              )}
              {errors.check_out && (
                <p className="text-sm text-[#D85A30]">{errors.check_out.message}</p>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-bold uppercase tracking-wider text-secondary">
                  Contact the Anchor
                </p>
                {viewerEmailGate === "stanford" ? (
                  anchor.contact_email ? (
                    <a
                      href={`mailto:${anchor.contact_email}`}
                      className="inline-block break-all rounded-lg border border-[#E2DDD4] bg-white px-4 py-3 text-sm font-medium text-[#B47B2E] transition-colors hover:bg-[#F0EDE6]"
                    >
                      {anchor.contact_email}
                    </a>
                  ) : (
                    <p className="text-sm text-secondary">
                      Anchor email is not on file for this listing yet.
                    </p>
                  )
                ) : (
                  <div className="rounded-lg border border-[#E2DDD4] bg-white px-4 py-3 text-sm text-secondary">
                    Sign in with a <span className="font-semibold">@stanford.edu</span>{" "}
                    account to view Anchor contact details.
                  </div>
                )}
                <p className="text-xs leading-relaxed text-secondary">
                  Everyone signs in with a Stanford Google account. Use your
                  @stanford.edu email to coordinate directly with this Anchor.
                </p>
              </div>

              <div className="flex gap-3 rounded-lg border border-[#E2DDD4] bg-[#F0EDE6] p-4">
                <Info size={20} className="shrink-0 text-[#B47B2E]" />
                <p className="text-xs leading-relaxed text-secondary">
                  Your request sets these dates to{" "}
                  <span className="font-bold text-[#E8C97A]">pending</span>. The
                  Anchor will be notified and can accept or decline.
                </p>
              </div>

              {hostRole === "host" ? (
                <div className="flex gap-3 rounded-lg border border-[#E2DDD4] bg-white p-4">
                  <Info size={20} className="shrink-0 text-[#B47B2E]" />
                  <p className="text-xs leading-relaxed text-secondary">
                    You're viewing your own listing. Roamers can send requests
                    here; manage your availability in{" "}
                    <Link href="/my-anchor" className="font-semibold text-[#B47B2E] hover:underline">
                      My Anchor
                    </Link>
                    .
                  </p>
                </div>
              ) : null}

              {submitError ? (
                <p className="text-sm text-[#D85A30]">{submitError}</p>
              ) : null}

              <AuthSubmitBlock
                loginHref={loginHref}
                isSubmitting={isSubmitting}
                isOpen={isOpen}
                hostRole={hostRole}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * 登录检测与提交按钮（需登录才能插入 stay_requests）
 */
function AuthSubmitBlock({
  loginHref,
  isSubmitting,
  isOpen,
  hostRole,
}: {
  loginHref: string;
  isSubmitting: boolean;
  isOpen: boolean;
  hostRole: "loading" | "host" | "roamer";
}) {
  const supabase = useSupabaseBrowserClient();
  const [gate, setGate] = useState<
    "loading" | "missing_env" | "anonymous" | "signed_in"
  >("loading");
  const [isStanford, setIsStanford] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (!supabase) {
      setGate("missing_env");
      return;
    }
    void supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? "";
      if (!email) {
        setGate("anonymous");
        setIsStanford(null);
        return;
      }
      setGate("signed_in");
      setIsStanford(email.toLowerCase().endsWith("@stanford.edu"));
    });
  }, [isOpen, supabase]);

  if (gate === "missing_env") {
    return (
      <p className="text-sm text-[#D85A30]" role="alert">
        {SUPABASE_BROWSER_CONFIG_HINT}
      </p>
    );
  }

  if (gate === "anonymous") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-secondary">Sign in to send a request.</p>
        <Link
          href={loginHref}
          className="inline-block rounded-lg bg-[#B47B2E] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9A6825]"
        >
          Sign in with Google
        </Link>
      </div>
    );
  }

  if (gate === "signed_in" && isStanford === false) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-secondary">
          This beta is limited to Stanford GSB students. Please sign in with
          your <span className="font-semibold">@stanford.edu</span> account to
          request a stay.
        </p>
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-md bg-[#E2DDD4] py-3 text-sm font-semibold text-secondary disabled:cursor-not-allowed"
        >
          Requesting is unavailable for this email
        </button>
      </div>
    );
  }

  if (hostRole === "host") {
    return (
      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-md bg-[#E2DDD4] py-4 font-bold text-secondary transition-opacity disabled:cursor-not-allowed"
      >
        You can't request your own listing
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={isSubmitting || gate === "loading"}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-[#B47B2E] py-4 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {isSubmitting ? "Sending…" : "Send request"}
      {!isSubmitting && <Send size={18} />}
    </button>
  );
}

export default RequestModal;
