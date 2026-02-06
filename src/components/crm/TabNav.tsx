"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

/**
 * TabNav — Elegant tab bar with count badges and animated indicator
 */

export interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
  count?: number;
}

interface TabNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="bg-white border-b border-[rgba(61,61,61,0.08)] sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <nav className="flex items-center gap-1 -mb-px overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3.5 font-body text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "text-ansar-charcoal"
                    : "text-ansar-muted hover:text-ansar-gray"
                }`}
              >
                <span className={`w-4 h-4 ${isActive ? "text-ansar-sage-600" : ""}`}>
                  {tab.icon}
                </span>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-ansar-sage-100 text-ansar-sage-700"
                        : "bg-ansar-sage-50 text-ansar-muted"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-ansar-sage-600 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
