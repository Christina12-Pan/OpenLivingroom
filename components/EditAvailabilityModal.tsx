"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useSupabaseBrowserClient, SUPABASE_BROWSER_CONFIG_HINT } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const rangeSchema = z
  .object({
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
  })
  .refine((d) => new Date(d.start_date) <= new Date(d.end_date), {
    message: "End date must be on or after start date",
    path: ["end_date"],
  });

const formSchema = z.object({
  ranges: z.array(rangeSchema).min(1, "Add at least one availability window"),
});

type FormValues = z.infer<typeof formSchema>;

type EditAvailabilityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  anchorId: string;
  cityLabel: string;
  initialRanges: { start_date: string; end_date: string }[];
  onSaved: () => void;
};

/**
 * 编辑 availability：替换该 anchor_id 的全部 availability 行
 */
export function EditAvailabilityModal({
  isOpen,
  onClose,
  anchorId,
  cityLabel,
  initialRanges,
  onSaved,
}: EditAvailabilityModalProps) {
  const supabase = useSupabaseBrowserClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues = useMemo<FormValues>(() => {
    const ranges =
      initialRanges.length > 0
        ? initialRanges.map((r) => ({ start_date: r.start_date, end_date: r.end_date }))
        : [{ start_date: "", end_date: "" }];
    return { ranges };
  }, [initialRanges]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "ranges" });

  useEffect(() => {
    if (!isOpen) return;
    reset(defaultValues);
    setSubmitError(null);
  }, [isOpen, reset, defaultValues]);

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    if (!supabase) {
      setSubmitError(SUPABASE_BROWSER_CONFIG_HINT);
      return;
    }

    // Replace-all strategy (simple + RLS-safe)
    const { error: delErr } = await supabase
      .from("availability")
      .delete()
      .eq("anchor_id", anchorId);

    if (delErr) {
      console.error("[availability][delete_all] failed", {
        anchorId,
        error: delErr.message,
      });
      setSubmitError(delErr.message);
      return;
    }

    const rows = values.ranges.map((r) => ({
      anchor_id: anchorId,
      start_date: r.start_date,
      end_date: r.end_date,
    }));

    const { error: insErr } = await supabase.from("availability").insert(rows);
    if (insErr) {
      console.error("[availability][insert] failed", {
        anchorId,
        count: rows.length,
        error: insErr.message,
      });
      setSubmitError(insErr.message);
      return;
    }

    onSaved();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-near-black/40 p-4 backdrop-blur-sm">
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
            Edit availability
          </h2>
          <p className="mb-8 text-secondary">
            Update your hosting windows for <span className="font-semibold text-near-black">{cityLabel}</span>.
          </p>

          <form
            onSubmit={(e) => {
              void handleSubmit(onSubmit)(e);
            }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-4 rounded-lg border border-[#E2DDD4] bg-white p-4 md:grid-cols-2"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-secondary">
                      Start
                    </label>
                    <input
                      type="date"
                      {...register(`ranges.${idx}.start_date`)}
                      className="w-full rounded-lg border border-[#E2DDD4] bg-white px-3 py-2 text-sm text-near-black outline-none transition-colors focus:border-[#B47B2E] focus:ring-1 focus:ring-[#B47B2E]/30"
                    />
                    {errors.ranges?.[idx]?.start_date ? (
                      <p className="text-sm text-[#D85A30]">
                        {errors.ranges[idx]?.start_date?.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-secondary">
                      End
                    </label>
                    <input
                      type="date"
                      {...register(`ranges.${idx}.end_date`)}
                      className="w-full rounded-lg border border-[#E2DDD4] bg-white px-3 py-2 text-sm text-near-black outline-none transition-colors focus:border-[#B47B2E] focus:ring-1 focus:ring-[#B47B2E]/30"
                    />
                    {errors.ranges?.[idx]?.end_date ? (
                      <p className="text-sm text-[#D85A30]">
                        {errors.ranges[idx]?.end_date?.message}
                      </p>
                    ) : null}
                  </div>
                  {fields.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="text-sm font-medium text-[#D85A30] md:col-span-2"
                    >
                      Remove range
                    </button>
                  ) : null}
                </div>
              ))}

              {errors.ranges?.root?.message ? (
                <p className="text-sm text-[#D85A30]">{errors.ranges.root.message}</p>
              ) : null}
              {typeof errors.ranges?.message === "string" ? (
                <p className="text-sm text-[#D85A30]">{errors.ranges.message}</p>
              ) : null}

              <button
                type="button"
                onClick={() => append({ start_date: "", end_date: "" }, { shouldFocus: false })}
                className="text-sm font-semibold text-[#B47B2E]"
              >
                + Add another range
              </button>
            </div>

            {submitError ? (
              <p className="text-sm text-[#D85A30]">{submitError}</p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#E2DDD4] bg-white px-5 py-2.5 text-sm font-medium text-near-black transition-colors hover:bg-[#F0EDE6]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "rounded-lg bg-[#B47B2E] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60",
                )}
              >
                {isSubmitting ? "Saving…" : "Save availability"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

