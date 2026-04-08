import { z } from "zod";

/**
 * Anchor 注册 — Step 2：地点（目录选择或手动地理编码）
 * 经纬度由 RHF `setValueAs` 规范化为 number | undefined
 */
export const anchorLocationStepSchema = z
  .object({
    location_mode: z.enum(["catalog", "manual"]),
    country_region: z.string().max(120).or(z.literal("")).optional(),
    state_province: z.string().max(120).or(z.literal("")).optional(),
    city: z.string().max(200).or(z.literal("")).optional(),
    city_slug: z.string().max(200).or(z.literal("")).optional(),
    manual_query: z.string().max(500).or(z.literal("")).optional(),
    manual_city_label: z.string().max(200).or(z.literal("")).optional(),
    manual_country_label: z.string().max(120).or(z.literal("")).optional(),
    manual_display_name: z.string().max(800).or(z.literal("")).optional(),
    geocode_lat: z.number().finite().optional(),
    geocode_lng: z.number().finite().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.location_mode === "catalog") {
      if (!data.country_region?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Country / region is required",
          path: ["country_region"],
        });
      }
      if (!data.state_province?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "State / province is required",
          path: ["state_province"],
        });
      }
      if (!data.city?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "City is required",
          path: ["city"],
        });
      }
      if (!data.city_slug?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "City selection is required",
          path: ["city_slug"],
        });
      }
    } else {
      const q = data.manual_query?.trim();
      if (!q || q.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter at least 3 characters (e.g. city and country).",
          path: ["manual_query"],
        });
      }
      if (
        data.geocode_lat == null ||
        data.geocode_lng == null ||
        !Number.isFinite(data.geocode_lat) ||
        !Number.isFinite(data.geocode_lng)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Use "Look up" to confirm the place on the map before continuing.',
          path: ["manual_query"],
        });
      }
      if (!data.manual_city_label?.trim() || !data.manual_country_label?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Look up your place to fill city and country.",
          path: ["manual_query"],
        });
      }
    }
  });

/**
 * Anchor 注册 — Step 3：可用时段（单段；多段在提交时合并校验）
 */
export const anchorAvailabilityRangeSchema = z
  .object({
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
  })
  .refine(
    (d) => new Date(d.start_date) <= new Date(d.end_date),
    { message: "End date must be on or after start date", path: ["end_date"] }
  );

/** 1 / 2 / 99（99 表示 Flexible，写入 DB 时由调用方映射） */
export const anchorAvailabilityStepSchema = z.object({
  ranges: z
    .array(anchorAvailabilityRangeSchema)
    .min(1, "Add at least one availability window"),
  max_guests: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(99),
  ]),
});

/**
 * Anchor 注册 — Step 4：房屋说明
 */
export const anchorNotesStepSchema = z.object({
  notes: z.string().max(8000).optional().or(z.literal("")),
});

/**
 * 完整提交（多步表单合并校验）
 */
export const anchorFullSchema = anchorLocationStepSchema
  .merge(anchorAvailabilityStepSchema)
  .merge(anchorNotesStepSchema);

export type AnchorLocationStepValues = z.infer<typeof anchorLocationStepSchema>;
export type AnchorAvailabilityStepValues = z.infer<typeof anchorAvailabilityStepSchema>;
export type AnchorNotesStepValues = z.infer<typeof anchorNotesStepSchema>;
export type AnchorFullFormValues = z.infer<typeof anchorFullSchema>;
