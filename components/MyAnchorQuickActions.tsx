"use client";

import Link from "next/link";
import { Calendar as CalendarIcon, Clock, Edit, MapPin } from "lucide-react";

type MyAnchorQuickActionsProps = {
  citySlug: string;
};

/**
 * Dashboard 右侧：快捷入口与自动释放说明
 */
export function MyAnchorQuickActions({ citySlug }: MyAnchorQuickActionsProps) {
  return (
    <div className="space-y-8">
      <h2 className="font-serif text-2xl font-bold">Quick actions</h2>
      <div className="space-y-4">
        <div className="flex w-full items-center justify-between rounded-lg border border-near-black/5 bg-white p-4 text-left opacity-60">
          <div className="flex items-center gap-3">
            <CalendarIcon className="text-[#B47B2E]" size={20} />
            <span className="font-bold">Edit availability</span>
          </div>
          <Edit size={16} className="text-secondary" />
        </div>
        <Link
          href={`/city/${citySlug}`}
          className="flex w-full items-center justify-between rounded-lg border border-near-black/5 bg-white p-4 text-left transition-colors hover:bg-[#F0EDE6]"
        >
          <div className="flex items-center gap-3">
            <MapPin className="text-[#B47B2E]" size={20} />
            <span className="font-bold">View listing</span>
          </div>
          <Edit size={16} className="text-secondary" />
        </Link>
      </div>

      <div className="rounded-lg border border-near-black/5 bg-[#F0EDE6] p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-secondary">
          <Clock size={14} />
          Auto-release rule
        </h3>
        <p className="text-xs leading-relaxed text-secondary">
          Requests expire automatically after 48 hours if no action is taken. This
          keeps the community moving!
        </p>
      </div>
    </div>
  );
}
