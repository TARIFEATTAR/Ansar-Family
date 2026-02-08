"use client";

import { ReactNode } from "react";

/**
 * StatsRow — Consolidated "Hero Bar" style stats.
 * Renders a single container with divided columns instead of separate cards.
 */

export interface StatItem {
  label: string;
  value: number | string;
  icon?: ReactNode;
  accent?: "sage" | "terracotta" | "ochre" | "success" | "muted";
}

interface StatsRowProps {
  stats: StatItem[];
  columns?: number;
}

const accentTextColors: Record<string, string> = {
  sage: "text-ansar-sage-600",
  terracotta: "text-ansar-terracotta-600",
  ochre: "text-ansar-ochre-600",
  success: "text-ansar-success",
  muted: "text-ansar-muted",
};

export function StatsRow({ stats, columns }: StatsRowProps) {
  // Determine column count based on prop or stats length
  const colCount = columns || stats.length;
  
  // Tailwind classes must be complete strings for JIT
  const lgGridClass = 
    colCount === 2 ? "lg:grid-cols-2" :
    colCount === 3 ? "lg:grid-cols-3" :
    colCount === 4 ? "lg:grid-cols-4" :
    colCount === 5 ? "lg:grid-cols-5" :
    colCount === 6 ? "lg:grid-cols-6" :
    "lg:grid-cols-4"; // default fallback

  const mdGridClass = colCount >= 4 ? "md:grid-cols-4" : `md:grid-cols-${colCount}`;

  return (
    <div className="bg-white rounded-lg border border-[rgba(61,61,61,0.06)] shadow-sm overflow-hidden">
      <div className={`grid grid-cols-2 ${mdGridClass} ${lgGridClass} divide-y md:divide-y-0 divide-x-0 md:divide-x divide-[rgba(61,61,61,0.06)]`}>
        {stats.map((stat, idx) => {
          const textColor = accentTextColors[stat.accent || "sage"];
          return (
            <div
              key={idx}
              className="px-4 py-4 flex flex-col items-center text-center hover:bg-ansar-cream/30 transition-colors group"
            >
              <span className="font-body text-[10px] font-semibold uppercase tracking-widest text-ansar-muted mb-1.5 flex items-center gap-1.5">
                {stat.icon && (
                  <span className={`${textColor} w-3.5 h-3.5 flex items-center justify-center transition-transform group-hover:scale-110`}>
                    {stat.icon}
                  </span>
                )}
                {stat.label}
              </span>
              <span className="font-heading text-2xl text-ansar-charcoal leading-none">
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
