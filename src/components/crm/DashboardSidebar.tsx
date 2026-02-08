"use client";

import { ReactNode, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import { Menu, X as XIcon, LogOut } from "lucide-react";
import Link from "next/link";

/**
 * DashboardSidebar — Shared sidebar navigation for all dashboard types.
 *
 * Renders:
 *  - Desktop: fixed left sidebar (260px)
 *  - Mobile: hamburger header → overlay sidebar
 *
 * Used by: Admin, Partner Hub, Ansar dashboards.
 */

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  description?: string;
}

interface DashboardSidebarProps {
  /** Brand icon rendered inside the colored square */
  brandIcon: ReactNode;
  /** Primary title (e.g. org name, "Ansar Family") */
  brandTitle: string;
  /** Subtitle (e.g. "Super Admin", "Partner Hub", city) */
  brandSubtitle: string;
  /** Navigation items */
  navItems: SidebarNavItem[];
  /** Currently active nav item id */
  activeTab: string;
  /** Called when a nav item is clicked */
  onTabChange: (tabId: string) => void;
  /** User display name */
  userName?: string;
  /** User role label */
  userRoleLabel?: string;
  /** Accent color for the brand icon bg. Defaults to sage. */
  accentColor?: "sage" | "terracotta" | "ochre";
  /** Optional footer content (e.g. hub link, danger zone) */
  footerContent?: ReactNode;
  /** The main page content */
  children: ReactNode;
}

const accentClasses = {
  sage: "bg-ansar-sage-600",
  terracotta: "bg-ansar-terracotta-600",
  ochre: "bg-ansar-ochre-600",
};

export function DashboardSidebar({
  brandIcon,
  brandTitle,
  brandSubtitle,
  navItems,
  activeTab,
  onTabChange,
  userName,
  userRoleLabel,
  accentColor = "sage",
  footerContent,
  children,
}: DashboardSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSection = navItems.find((n) => n.id === activeTab) || navItems[0];

  const handleNav = (tabId: string) => {
    onTabChange(tabId);
    setSidebarOpen(false);
  };

  const iconBg = accentClasses[accentColor];

  // ── Shared nav list renderer ─────────────────────────────
  const renderNavItems = () =>
    navItems.map((item) => {
      const isActive = activeTab === item.id;
      return (
        <button
          key={item.id}
          onClick={() => handleNav(item.id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-[13px] transition-all ${
            isActive
              ? "bg-ansar-sage-50 text-ansar-charcoal font-medium"
              : "text-ansar-gray hover:bg-ansar-sage-50/50 hover:text-ansar-charcoal"
          }`}
        >
          <span className={`shrink-0 ${isActive ? "text-ansar-sage-600" : "text-ansar-muted"}`}>
            {item.icon}
          </span>
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span
              className={`text-[10px] font-medium min-w-[20px] text-center px-1.5 py-0.5 rounded-full ${
                item.id === "inbox" && !isActive
                  ? "bg-ansar-sage-600 text-white"
                  : isActive
                    ? "bg-ansar-sage-200 text-ansar-sage-800"
                    : "bg-gray-100 text-ansar-muted"
              }`}
            >
              {item.badge}
            </span>
          )}
        </button>
      );
    });

  return (
    <div className="flex h-screen bg-ansar-cream overflow-hidden">
      {/* ─── Desktop Sidebar ──────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col w-[260px] bg-white border-r border-[rgba(61,61,61,0.06)] shrink-0">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-[rgba(61,61,61,0.06)]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
              {brandIcon}
            </div>
            <div>
              <h1 className="font-heading text-[15px] text-ansar-charcoal leading-tight group-hover:text-ansar-sage-700 transition-colors">
                {brandTitle}
              </h1>
              <p className="font-body text-[11px] text-ansar-muted leading-tight">
                {brandSubtitle}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {renderNavItems()}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-[rgba(61,61,61,0.06)] space-y-3">
          {footerContent}
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 min-w-0">
              <p className="font-body text-xs text-ansar-charcoal font-medium truncate">
                {userName}
              </p>
              {userRoleLabel && (
                <p className="font-body text-[10px] text-ansar-muted">
                  {userRoleLabel}
                </p>
              )}
            </div>
          </div>
          <SignOutButton>
            <button className="w-full flex items-center justify-center gap-2 text-[12px] text-ansar-muted hover:text-ansar-charcoal border border-[rgba(61,61,61,0.10)] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors font-body">
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* ─── Mobile Sidebar Overlay ─────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 flex flex-col shadow-xl lg:hidden"
            >
              <div className="px-5 py-4 border-b border-[rgba(61,61,61,0.06)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                    {brandIcon}
                  </div>
                  <div>
                    <h1 className="font-heading text-sm text-ansar-charcoal leading-tight">{brandTitle}</h1>
                    <p className="font-body text-[10px] text-ansar-muted">{brandSubtitle}</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-ansar-muted hover:text-ansar-charcoal rounded-lg">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                {renderNavItems()}
              </nav>
              <div className="px-4 py-3 border-t border-[rgba(61,61,61,0.06)] space-y-2">
                {footerContent}
                <div className="flex items-center gap-3">
                  <UserButton afterSignOutUrl="/" />
                  <span className="font-body text-xs text-ansar-charcoal truncate">{userName}</span>
                </div>
                <SignOutButton>
                  <button className="w-full flex items-center justify-center gap-2 text-[12px] text-ansar-muted hover:text-ansar-charcoal border border-[rgba(61,61,61,0.10)] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors font-body">
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Content ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[rgba(61,61,61,0.06)] shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-ansar-muted hover:text-ansar-charcoal rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded ${iconBg} flex items-center justify-center`}>
              <span className="scale-[0.6]">{brandIcon}</span>
            </div>
            <span className="font-heading text-sm text-ansar-charcoal">{brandTitle}</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Section Header */}
        <div className="px-6 lg:px-8 py-5 bg-white border-b border-[rgba(61,61,61,0.06)] shrink-0">
          <div>
            <h2 className="font-heading text-xl lg:text-2xl text-ansar-charcoal mb-0.5">
              {activeSection.label}
            </h2>
            {activeSection.description && (
              <p className="font-body text-sm text-ansar-muted">
                {activeSection.description}
              </p>
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 lg:px-8 py-6 space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
