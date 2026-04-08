"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  eachDayOfInterval,
  format,
  isWithinInterval,
  isSameMonth,
  parseISO,
  startOfDay,
} from "date-fns";
import type { StayRequestStatus } from "@/lib/types/database";

interface CalendarStripProps {
  availability: { start_date: string; end_date: string }[];
  requests: { check_in: string; check_out: string; status: StayRequestStatus }[];
}

/**
 * 日历条：在可用窗口与今天起的交集内逐日着色，并按月份分组显示日期数字
 */
const CalendarStrip = ({ availability, requests }: CalendarStripProps) => {
  const days = useMemo(() => {
    if (availability.length === 0) return [];

    const starts = availability.map((r) => startOfDay(parseISO(r.start_date)));
    const ends = availability.map((r) => startOfDay(parseISO(r.end_date)));
    const winStart = new Date(Math.min(...starts.map((d) => d.getTime())));
    const winEnd = new Date(Math.max(...ends.map((d) => d.getTime())));
    const today = startOfDay(new Date());
    const start = winStart > today ? winStart : today;
    const end = winEnd;
    if (start > end) return [];

    return eachDayOfInterval({ start, end });
  }, [availability]);

  if (days.length === 0) {
    return (
      <p className="text-xs text-secondary">No upcoming availability in this window.</p>
    );
  }

  const monthGroups = useMemo(() => {
    const groups: { monthKey: string; monthLabel: string; days: Date[] }[] = [];
    for (const day of days) {
      const last = groups[groups.length - 1];
      if (!last || !isSameMonth(last.days[0], day)) {
        groups.push({
          monthKey: format(day, "yyyy-MM"),
          monthLabel: format(day, "MMM"),
          days: [day],
        });
      } else {
        last.days.push(day);
      }
    }
    return groups;
  }, [days]);

  return (
    <div className="space-y-2 py-2">
      {monthGroups.map((group) => (
        <div key={group.monthKey} className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
            {group.monthLabel}
          </p>
          <div className="scrollbar-hide flex gap-1 overflow-x-auto">
            {group.days.map((day) => {
              const isAvailable = availability.some((range) =>
                isWithinInterval(day, {
                  start: parseISO(range.start_date),
                  end: parseISO(range.end_date),
                })
              );

              let cell: "available" | "pending" | "booked" | "none" = "none";
              if (isAvailable) {
                cell = "available";
                const confirmed = requests.find(
                  (req) =>
                    req.status === "confirmed" &&
                    isWithinInterval(day, {
                      start: parseISO(req.check_in),
                      end: parseISO(req.check_out),
                    })
                );
                if (confirmed) cell = "booked";
                else {
                  const pending = requests.find(
                    (req) =>
                      req.status === "pending" &&
                      isWithinInterval(day, {
                        start: parseISO(req.check_in),
                        end: parseISO(req.check_out),
                      })
                  );
                  if (pending) cell = "pending";
                }
              }

              return (
                <div
                  key={day.toISOString()}
                  title={
                    cell === "none"
                      ? "Not available in this window"
                      : format(day, "MMM d")
                  }
                  className={cn(
                    "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-sm text-[10px] font-semibold transition-colors",
                    cell === "available" && "bg-available text-white",
                    cell === "pending" && "bg-pending text-[#6B4800]",
                    cell === "booked" && "bg-booked text-white",
                    cell === "none" && "bg-near-black/3 text-secondary"
                  )}
                >
                  {format(day, "d")}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarStrip;
