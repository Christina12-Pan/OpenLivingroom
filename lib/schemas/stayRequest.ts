import { z } from "zod";

/**
 * 提交住宿申请的校验 schema（与 stay_requests 表字段对应；blurb 已改为线下邮件沟通）
 */
export const stayRequestFormSchema = z
  .object({
    check_in: z.string().min(1, "Check-in date is required"),
    check_out: z.string().min(1, "Check-out date is required"),
  })
  .refine(
    (data) => {
      const a = new Date(data.check_in);
      const b = new Date(data.check_out);
      return a < b;
    },
    { message: "Check-out must be after check-in", path: ["check_out"] }
  );

export type StayRequestFormValues = z.infer<typeof stayRequestFormSchema>;
