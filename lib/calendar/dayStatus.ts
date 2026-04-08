import {
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";
import type { AvailabilityRow, StayRequestRow } from "@/lib/types/database";

export type StripDayStatus = "available" | "pending" | "booked" | "none";

type Avail = Pick<AvailabilityRow, "start_date" | "end_date">;
type Req = Pick<StayRequestRow, "check_in" | "check_out" | "status">;

/**
 * 与 CalendarStrip 一致：单日在可用窗口内的状态（confirmed > pending > available）
 * @param day - 日历上的某一天
 * @param availability - 可用区间列表
 * @param requests - 该 Anchor 的住宿申请
 */
export function getStripDayStatus(
  day: Date,
  availability: Avail[],
  requests: Req[]
): StripDayStatus {
  const d = startOfDay(day);
  const inAvail = availability.some((range) =>
    isWithinInterval(d, {
      start: parseISO(range.start_date),
      end: parseISO(range.end_date),
    })
  );
  if (!inAvail) return "none";

  const confirmed = requests.find(
    (req) =>
      req.status === "confirmed" &&
      isWithinInterval(d, {
        start: parseISO(req.check_in),
        end: parseISO(req.check_out),
      })
  );
  if (confirmed) return "booked";

  const pending = requests.find(
    (req) =>
      req.status === "pending" &&
      isWithinInterval(d, {
        start: parseISO(req.check_in),
        end: parseISO(req.check_out),
      })
  );
  if (pending) return "pending";

  return "available";
}

/**
 * 在一段日期内扫描，判断城市级地图标记颜色（见产品说明：绿 > 黄 > 红）
 * @param horizonDays - 从今天起向后看多少天
 */
export function summarizeCityMarkerStatus(
  anchors: { availability: Avail[]; requests: Req[] }[],
  horizonDays: number
): "available" | "pending" | "booked" | null {
  if (anchors.length === 0) return null;

  const today = startOfDay(new Date());
  const end = new Date(today);
  end.setDate(end.getDate() + horizonDays - 1);
  const days = eachDayOfInterval({ start: today, end });

  let seenAvailable = false;
  let seenPending = false;
  let seenBooked = false;

  for (const day of days) {
    for (const anchor of anchors) {
      const s = getStripDayStatus(day, anchor.availability, anchor.requests);
      if (s === "available") seenAvailable = true;
      if (s === "pending") seenPending = true;
      if (s === "booked") seenBooked = true;
    }
  }

  if (seenAvailable) return "available";
  if (seenPending) return "pending";
  if (seenBooked) return "booked";
  return null;
}
