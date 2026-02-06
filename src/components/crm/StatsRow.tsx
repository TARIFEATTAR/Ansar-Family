"use client";

import { ReactNode } from "react";

/**
 * StatsRow — Overview metrics bar with branded stat cards
 */

export interface StatItem {
  label: string;
  value: number | string;
  icon?: ReactNode;
  accent?: "sage" | "terracotta" | "ochre" | "success" | "muted";
}

interface StatsRowProps {
  stats: StatItem[];
}

const accentClasses: Record<string, { bg: string; icon: string; value: string }> = {
  sage: { bg: "bg-ansar-sage-50", icon: "text-ansar-sage-600", value: "text-ansar-sage-700" },
  terracotta: { bg: "bg-ansar-terracotta-50", icon: "text-ansar-terracotta-600", value: "text-ansar-terracotta-700" },
  ochre: { bg: "bg-ansar-ochre-50", icon: "text-ansar-ochre-600", value: "text-ansar-ochre-700" },
  success: { bg: "bg-[#f0f5f0]", icon: "text-ansar-success", value: "text-ansar-success" },
  muted: { bg: "bg-ansar-sage-50", icon: "text-ansar-muted", value: "text-ansar-muted" },
};

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, idx) => {
        const colors = accentClasses[stat.accent || "sage"];
        return (
          <div
            key={idx}
            className={`${colors.bg} rounded-xl px-4 py-3.5 transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-2 mb-1">
              {stat.icon && (
                <span className={`w-4 h-4 ${colors.icon}`}>{stat.icon}</span>
              )}
              <span className="font-body text-[11px] font-medium uppercase tracking-wider text-ansar-muted">
                {stat.label}
              </span>
            </div>
            <p className={`font-heading text-2xl ${colors.value}`}>
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
