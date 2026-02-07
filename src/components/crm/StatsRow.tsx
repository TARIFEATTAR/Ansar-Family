"use client";

import { ReactNode } from "react";

/**
 * StatsRow — Elevated stat cards with accent border and icon badge
 */

export interface StatItem {
  label: string;
  value: number | string;
  icon?: ReactNode;
  accent?: "sage" | "terracotta" | "ochre" | "success" | "muted";
}

interface StatsRowProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

const accentClasses: Record<string, { border: string; iconBg: string; icon: string }> = {
  sage: {
    border: "border-l-[var(--sage-500)]",
    iconBg: "bg-ansar-sage-50",
    icon: "text-ansar-sage-600",
  },
  terracotta: {
    border: "border-l-[var(--terracotta-500)]",
    iconBg: "bg-ansar-terracotta-50",
    icon: "text-ansar-terracotta-600",
  },
  ochre: {
    border: "border-l-[var(--ochre-500)]",
    iconBg: "bg-ansar-ochre-50",
    icon: "text-ansar-ochre-600",
  },
  success: {
    border: "border-l-[#6B8E6B]",
    iconBg: "bg-[#f0f5f0]",
    icon: "text-ansar-success",
  },
  muted: {
    border: "border-l-[var(--text-muted)]",
    iconBg: "bg-gray-50",
    icon: "text-ansar-muted",
  },
};

export function StatsRow({ stats, columns = 4 }: StatsRowProps) {
  const gridCols =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {stats.map((stat, idx) => {
        const colors = accentClasses[stat.accent || "sage"];
        return (
          <div
            key={idx}
            className={`bg-white rounded-xl border border-[rgba(61,61,61,0.06)] border-l-[3px] ${colors.border} px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-soft`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-body text-[11px] font-medium uppercase tracking-wider text-ansar-muted">
                {stat.label}
              </span>
              {stat.icon && (
                <span
                  className={`w-8 h-8 rounded-lg ${colors.iconBg} ${colors.icon} flex items-center justify-center shrink-0`}
                >
                  {stat.icon}
                </span>
              )}
            </div>
            <p className="font-heading text-3xl text-ansar-charcoal">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
