"use client";

import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** 与站点表单、卡片一致的原生 select 样式（去操作系统默认皮肤） */
export const formSelectClassName =
  "w-full cursor-pointer appearance-none rounded-lg border border-[#E2DDD4] bg-white py-3 pl-3 pr-10 text-sm text-near-black shadow-none transition-colors focus:border-[#B47B2E] focus:outline-none focus:ring-1 focus:ring-[#B47B2E]/30 disabled:cursor-not-allowed disabled:opacity-50";

export type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

/**
 * Design-system 对齐的下拉框：自定义箭头与 focus 环，避免各浏览器原生样式不一
 */
export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  function FormSelect({ className, children, disabled, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(formSelectClassName, className)}
          disabled={disabled}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6658]",
            disabled && "opacity-50"
          )}
          strokeWidth={2}
        />
      </div>
    );
  }
);
