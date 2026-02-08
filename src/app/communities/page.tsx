"use client";

/**
 * COMMUNITIES DIRECTORY — Public hub discovery page
 *
 * Helps people find Ansar Family hubs near them.
 * Adaptive layout: featured cards at small scale, search + filter at 5+ hubs.
 */

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Search, Building2, Users, Heart, MapPin, ArrowRight,
  Loader2, Sparkles, ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";

// ═══════════════════════════════════════════════════════════════
// TYPE LABELS
// ═══════════════════════════════════════════════════════════════

const orgTypeLabel: Record<string, string> = {
  masjid: "Masjid",
  msa: "MSA",
  nonprofit: "Nonprofit",
  informal_circle: "Community Circle",
  other: "Community",
};

const orgTypeOptions = [
  { value: "", label: "All Types" },
  { value: "masjid", label: "Masjid" },
  { value: "msa", label: "MSA" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "informal_circle", label: "Community Circle" },
  { value: "other", label: "Community" },
];

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════

export default function CommunitiesPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Data
  const organizations = useQuery(api.organizations.listActive) ?? [];
  const stats = useQuery(api.directory.getStats);
  const orgCounts = useQuery(api.directory.getOrgCounts);

  const isLoading = organizations === undefined || stats === undefined;
  const showSearch = organizations.length >= 5;

  // Filter
  const filtered = useMemo(() => {
    let result = [...organizations];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (org) =>
          org.name.toLowerCase().includes(q) ||
          org.city.toLowerCase().includes(q) ||
          (org.stateRegion && org.stateRegion.toLowerCase().includes(q)) ||
          (org.zipCode && org.zipCode.includes(q))
      );
    }

    if (typeFilter) {
      result = result.filter((org) => org.type === typeFilter);
    }

    // Sort by city, then name
    result.sort((a, b) => {
      const cityCompare = a.city.localeCompare(b.city);
      if (cityCompare !== 0) return cityCompare;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [organizations, searchQuery, typeFilter]);

  return (
    <main className="min-h-screen bg-ansar-cream">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-8 py-4 bg-ansar-cream border-b border-[rgba(61,61,61,0.08)]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-ansar-charcoal tracking-wide">
            Ansar Family
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/#mission"
              className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#ecosystem"
              className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors"
            >
              Who It&apos;s For
            </Link>
            <Link
              href="/communities"
              className="font-body text-sm text-ansar-sage-600 font-medium transition-colors"
            >
              Communities
            </Link>
          </nav>
          <Link
            href="/sign-in"
            className="md:ml-0 ml-auto font-body text-sm text-ansar-sage-600 hover:text-ansar-sage-700 transition-colors"
          >
            Partner Login
          </Link>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="pt-32 pb-12 px-6 md:px-8">
        <div className="max-w-[900px] mx-auto text-center">
          <p
            className={`font-body text-xs font-normal tracking-[0.2em] uppercase text-ansar-muted mb-6 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            Communities Directory
          </p>

          <h1
            className={`font-display text-[clamp(2.5rem,2rem+2.5vw,4.5rem)] text-ansar-charcoal mb-6 leading-[1.15] transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[30px]"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            Find Your Community
          </h1>

          <p
            className={`font-body text-lg text-ansar-gray max-w-[600px] mx-auto mb-10 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            Ansar Family hubs across the country, ready to welcome you.
          </p>

          {/* Hero Search (always shown — it's the main interaction) */}
          <div
            className={`max-w-[560px] mx-auto transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ transitionDelay: "800ms" }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ansar-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city, state, zip, or hub name..."
                className="w-full pl-12 pr-4 py-4 rounded-lg bg-white/70 backdrop-blur-md border border-white/40 shadow-sm font-body text-sm text-ansar-charcoal placeholder:text-ansar-muted focus:outline-none focus:ring-2 focus:ring-ansar-sage-300 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Banner ───────────────────────────────────────── */}
      {stats && (stats.hubCount > 0 || stats.ansarCount > 0 || stats.seekerCount > 0) && (
        <section className="px-6 md:px-8 pb-10">
          <div className="max-w-[700px] mx-auto">
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                value={stats.hubCount}
                label="Communities"
                icon={<Building2 className="w-4 h-4" />}
                delay={0}
              />
              <StatCard
                value={stats.ansarCount}
                label="Volunteers"
                icon={<Users className="w-4 h-4" />}
                delay={1}
              />
              <StatCard
                value={stats.seekerCount}
                label="People Welcomed"
                icon={<Heart className="w-4 h-4" />}
                delay={2}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Filter Bar (5+ hubs) ───────────────────────────────── */}
      {showSearch && (
        <section className="px-6 md:px-8 pb-6">
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="font-body text-sm text-ansar-muted">
              Showing{" "}
              <span className="text-ansar-charcoal font-medium">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "community" : "communities"}
              {searchQuery || typeFilter ? " matching your search" : ""}
            </p>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 rounded-lg bg-white/70 backdrop-blur-md border border-white/40 shadow-sm font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-300 cursor-pointer"
              >
                {orgTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ansar-muted pointer-events-none" />
            </div>
          </div>
        </section>
      )}

      {/* ── Hub Cards Grid ─────────────────────────────────────── */}
      <section className="px-6 md:px-8 pb-16">
        <div className="max-w-[1200px] mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-ansar-sage-600 animate-spin" />
            </div>
          ) : filtered.length === 0 && organizations.length === 0 ? (
            /* Empty state: no hubs at all */
            <EmptyState />
          ) : filtered.length === 0 ? (
            /* No results from search/filter */
            <NoResults onClear={() => { setSearchQuery(""); setTypeFilter(""); }} />
          ) : (
            <>
              {/* Featured label for small scale */}
              {!showSearch && (
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-4 h-4 text-ansar-sage-600" />
                  <p className="font-body text-sm text-ansar-sage-700 font-medium">
                    Featured Communities
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((org, index) => (
                  <HubCard
                    key={org._id}
                    org={org}
                    counts={orgCounts?.[org._id]}
                    index={index}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────────── */}
      <section className="px-6 md:px-8 pb-20">
        <div className="max-w-[600px] mx-auto text-center">
          <div className="bg-white/70 backdrop-blur-md p-10 rounded-[20px] border border-white/40 shadow-sm">
            <Building2 className="w-8 h-8 text-ansar-sage-600 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="font-display text-2xl text-ansar-charcoal mb-3">
              Don&apos;t see your community?
            </h2>
            <p className="font-body text-sm text-ansar-gray mb-6 leading-relaxed max-w-[400px] mx-auto">
              Register your masjid, MSA, or organization as a Partner Hub.
              Set up takes 10 minutes. We handle the rest.
            </p>
            <Link
              href="/partner"
              className="inline-flex items-center gap-2 bg-ansar-sage-600 text-white px-6 py-3 rounded-lg font-body text-sm font-medium hover:bg-ansar-sage-700 transition-colors shadow-sm"
            >
              Register Your Hub
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-[#F3EFE7] border-t border-[rgba(61,61,61,0.08)]">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid md:grid-cols-[2fr_1fr_1fr] gap-12 mb-12">
            <div className="max-w-[320px]">
              <h3 className="font-display text-xl text-ansar-charcoal mb-4">
                Ansar Family
              </h3>
              <p className="font-body text-sm text-ansar-gray leading-relaxed">
                Connecting people new to Islam with the local communities
                ready to welcome them, and giving those communities the
                tools to do it well.
              </p>
            </div>
            <div>
              <h4 className="font-body text-xs font-medium tracking-[0.1em] uppercase text-ansar-muted mb-4">
                Get Involved
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/join" className="font-body text-sm text-ansar-sage-700 hover:text-ansar-sage-600 hover:underline transition-colors">
                    I&apos;m New to Islam &rarr;
                  </Link>
                </li>
                <li>
                  <Link href="/volunteer" className="font-body text-sm text-ansar-sage-700 hover:text-ansar-sage-600 hover:underline transition-colors">
                    Become an Ansar &rarr;
                  </Link>
                </li>
                <li>
                  <Link href="/partner" className="font-body text-sm text-ansar-sage-700 hover:text-ansar-sage-600 hover:underline transition-colors">
                    Register a Hub &rarr;
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-body text-xs font-medium tracking-[0.1em] uppercase text-ansar-muted mb-4">
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy-policy" className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[rgba(61,61,61,0.08)] text-center space-y-2">
            <p className="font-body text-sm text-ansar-muted">
              &copy; 2026 Ansar Family. Every Heart Rooted.
            </p>
            <p className="font-body text-xs text-ansar-muted/70">
              Built by{" "}
              <a
                href="https://asala.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ansar-sage-600 hover:text-ansar-sage-700 transition-colors"
              >
                asala.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════

function StatCard({
  value,
  label,
  icon,
  delay,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + delay * 0.1, duration: 0.5 }}
      className="bg-white/70 backdrop-blur-md rounded-lg border border-white/40 shadow-sm p-5 text-center"
    >
      <div className="flex items-center justify-center gap-2 text-ansar-sage-600 mb-2">
        {icon}
        <span className="font-display text-2xl md:text-3xl text-ansar-charcoal">
          {value}
        </span>
      </div>
      <p className="font-body text-xs text-ansar-muted uppercase tracking-wide">
        {label}
      </p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HUB CARD
// ═══════════════════════════════════════════════════════════════

function HubCard({
  org,
  counts,
  index,
}: {
  org: {
    _id: string;
    name: string;
    slug: string;
    type: string;
    city: string;
    stateRegion?: string;
    zipCode?: string;
    hubLevel: number;
  };
  counts?: { seekerCount: number; ansarCount: number };
  index: number;
}) {
  const location = org.stateRegion
    ? `${org.city}, ${org.stateRegion}`
    : org.city;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.5 }}
    >
      <Link href={`/${org.slug}`} className="group block h-full">
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-[20px] border border-white/40 shadow-sm hover:bg-white/85 hover:shadow-[0_8px_32px_rgba(61,61,61,0.06)] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
          {/* Type Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ansar-sage-50 text-ansar-sage-700 font-body text-[11px] font-medium">
              <Building2 className="w-3 h-3" />
              {orgTypeLabel[org.type] || org.type}
            </span>
          </div>

          {/* Name */}
          <h3 className="font-display text-xl text-ansar-charcoal mb-2 group-hover:text-ansar-sage-700 transition-colors">
            {org.name}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-ansar-gray mb-4">
            <MapPin className="w-3.5 h-3.5 text-ansar-muted" />
            <span className="font-body text-sm">{location}</span>
          </div>

          {/* Counts */}
          {counts && (
            <div className="flex items-center gap-4 mt-auto pt-4 border-t border-[rgba(61,61,61,0.06)]">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-ansar-terracotta-500" />
                <span className="font-body text-xs text-ansar-gray">
                  {counts.seekerCount} {counts.seekerCount === 1 ? "seeker" : "seekers"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-ansar-sage-600" />
                <span className="font-body text-xs text-ansar-gray">
                  {counts.ansarCount} {counts.ansarCount === 1 ? "ansar" : "ansars"}
                </span>
              </div>
              <div className="ml-auto">
                <ArrowRight className="w-4 h-4 text-ansar-muted group-hover:text-ansar-sage-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          )}
          {!counts && (
            <div className="flex items-center justify-end mt-auto pt-4 border-t border-[rgba(61,61,61,0.06)]">
              <span className="font-body text-xs text-ansar-sage-600 group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                Visit Hub
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE — No hubs exist yet
// ═══════════════════════════════════════════════════════════════

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-ansar-sage-50 rounded-lg flex items-center justify-center mx-auto mb-6">
        <Building2 className="w-8 h-8 text-ansar-sage-600" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-2xl text-ansar-charcoal mb-3">
        Something beautiful is growing
      </h3>
      <p className="font-body text-sm text-ansar-gray max-w-[400px] mx-auto mb-8 leading-relaxed">
        We&apos;re building a network of communities across the country.
        Be the first to bring Ansar Family to your area.
      </p>
      <Link
        href="/partner"
        className="inline-flex items-center gap-2 bg-ansar-sage-600 text-white px-6 py-3 rounded-lg font-body text-sm font-medium hover:bg-ansar-sage-700 transition-colors shadow-sm"
      >
        Register the First Hub
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NO RESULTS — Search returned nothing
// ═══════════════════════════════════════════════════════════════

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="text-center py-16">
      <Search className="w-10 h-10 text-ansar-muted mx-auto mb-4" strokeWidth={1.5} />
      <h3 className="font-display text-xl text-ansar-charcoal mb-2">
        No communities found
      </h3>
      <p className="font-body text-sm text-ansar-gray max-w-[360px] mx-auto mb-6">
        Try a different city or state, or clear your filters.
      </p>
      <button
        onClick={onClear}
        className="inline-flex items-center gap-2 font-body text-sm text-ansar-sage-600 hover:text-ansar-sage-700 font-medium transition-colors"
      >
        Clear all filters
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
