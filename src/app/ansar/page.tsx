"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import {
  ArrowLeft, Heart, Users, Link2, LayoutDashboard, Loader2,
  CheckCircle2, Clock, MapPin, Phone, Mail, Calendar,
  Sparkles, BookOpen, Eye, LogOut, Copy, CheckCheck, Share2, ExternalLink,
  QrCode, X as XIcon, Inbox as InboxIcon,
} from "lucide-react";
import {
  TabNav, StatsRow, StatusBadge, DetailPanel, DetailField,
} from "@/components/crm";
import type { Tab, StatItem } from "@/components/crm";
import { InboxTab } from "@/components/messaging";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

/**
 * ANSAR VOLUNTEER DASHBOARD — Personal view for approved Ansars
 *
 * Shows:
 *  - Profile overview & welcome
 *  - Assigned seekers / active pairings
 *  - Community info (organization they belong to)
 *  - No contacts or admin CRM features (they are a volunteer, not a manager)
 */

export default function AnsarDashboardPage() {
  const { user, isLoaded } = useUser();

  const upsertUser = useMutation(api.users.upsertFromClerk);
  const currentUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    if (user && isLoaded) {
      upsertUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? user.firstName ?? "User",
      });
    }
  }, [user, isLoaded, upsertUser]);

  // Get the ansar record by email
  const ansarRecord = useQuery(
    api.ansars.getByEmail,
    user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

  // Loading
  if (!isLoaded || currentUser === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-ansar-sage-600 animate-spin mx-auto mb-4" />
          <p className="font-body text-ansar-gray">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-ansar-charcoal mb-4">Ansar Dashboard</h1>
          <p className="font-body text-ansar-gray mb-6">Please sign in to access your dashboard.</p>
          <a href="/sign-in" className="btn-primary inline-block">Sign In</a>
        </div>
      </main>
    );
  }

  // Not an ansar role
  if (currentUser && currentUser.role !== "ansar") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <div className="text-center max-w-md mx-auto px-6">
          <p className="font-body text-ansar-gray mb-4">This dashboard is for Ansar volunteers.</p>
          <Link href="/dashboard" className="text-ansar-sage-600 font-body hover:underline">
            Go to Your Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <AnsarDashboard
      currentUser={currentUser}
      ansarRecord={ansarRecord}
      userEmail={user.primaryEmailAddress?.emailAddress ?? ""}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN ANSAR DASHBOARD
// ═══════════════════════════════════════════════════════════════

function AnsarDashboard({
  currentUser,
  ansarRecord,
  userEmail,
}: {
  currentUser: { _id: any; role: string; name: string; isActive: boolean } | null | undefined;
  ansarRecord: any;
  userEmail: string;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [linkCopied, setLinkCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const firstName = currentUser?.name?.split(" ")[0] ?? "Ansar";

  // Mutations
  const markIntroSent = useMutation(api.pairings.markIntroSent);

  // Inbox
  const ansarUserId = currentUser?._id;
  const inboxUnread = useQuery(
    api.inbox.getUnreadTotal,
    ansarUserId ? { userId: ansarUserId } : "skip"
  ) ?? 0;

  // Get pairings for this ansar
  const pairings = useQuery(
    api.pairings.listByAnsar,
    ansarRecord?._id ? { ansarId: ansarRecord._id } : "skip"
  ) ?? [];

  // Get organization info
  const organization = useQuery(
    api.organizations.getById,
    ansarRecord?.organizationId ? { id: ansarRecord.organizationId } : "skip"
  );

  // Get all intakes to resolve seeker names in pairings
  const allIntakes = useQuery(api.intakes.listAll) ?? [];
  const seekerMap = useMemo(() => {
    const m: Record<string, any> = {};
    allIntakes.forEach((i: any) => {
      m[i._id] = i;
    });
    return m;
  }, [allIntakes]);

  const hubUrl = organization?.slug
    ? (typeof window !== "undefined"
        ? `${window.location.origin}/${organization.slug}`
        : `https://ansar.family/${organization.slug}`)
    : null;

  const copyHubLink = useCallback(() => {
    if (hubUrl) {
      navigator.clipboard.writeText(hubUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }, [hubUrl]);

  const activePairings = pairings.filter(
    (p: any) => p.status === "active" || p.status === "pending_intro"
  );
  const completedPairings = pairings.filter(
    (p: any) => p.status === "completed" || p.status === "ended"
  );

  const tabs: Tab[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "inbox", label: "Inbox", icon: <InboxIcon className="w-4 h-4" />, count: inboxUnread || undefined },
    {
      id: "pairings",
      label: "My Seekers",
      icon: <Heart className="w-4 h-4" />,
      count: activePairings.length,
    },
    { id: "profile", label: "My Profile", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen bg-ansar-cream">
      {/* Header */}
      <header className="px-6 md:px-8 py-4 border-b border-[rgba(61,61,61,0.08)] bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-ansar-muted hover:text-ansar-charcoal transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Users className="w-4 h-4 text-ansar-sage-600" />
            <div>
              <h1 className="font-heading text-lg text-ansar-charcoal leading-tight">
                Ansar Dashboard
              </h1>
              {organization && (
                <p className="font-body text-[11px] text-ansar-muted">
                  {organization.name} &middot; {organization.city}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-body text-xs text-ansar-muted hidden sm:inline">
              {currentUser?.name}
            </span>
            <SignOutButton>
              <button className="flex items-center gap-1.5 text-[12px] text-ansar-muted hover:text-ansar-charcoal border border-[rgba(61,61,61,0.10)] px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-body">
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      {/* Shareable Hub Link */}
      {hubUrl && (
        <div className="px-6 md:px-8 py-3 bg-ansar-sage-50/60 border-b border-[rgba(61,61,61,0.06)]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 text-ansar-sage-700">
              <Share2 className="w-3.5 h-3.5" />
              <span className="font-body text-xs font-medium">Invite Seekers</span>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <code className="font-body text-xs text-ansar-charcoal bg-white px-3 py-1.5 rounded-lg border border-[rgba(61,61,61,0.08)] truncate flex-1 min-w-0">
                {hubUrl}
              </code>
              <button
                onClick={copyHubLink}
                className={`flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                  linkCopied
                    ? "bg-ansar-sage-100 border-ansar-sage-300 text-ansar-sage-700"
                    : "bg-white border-[rgba(61,61,61,0.10)] text-ansar-charcoal hover:bg-ansar-sage-50 hover:border-ansar-sage-300"
                }`}
              >
                {linkCopied ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </>
                )}
              </button>
              <button
                onClick={() => setShowQR(true)}
                className="flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-lg border border-[rgba(61,61,61,0.10)] text-ansar-charcoal hover:bg-ansar-sage-50 hover:border-ansar-sage-300 transition-all shrink-0 bg-white"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">QR Code</span>
              </button>
              <Link
                href={`/${organization!.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-lg border border-[rgba(61,61,61,0.10)] text-ansar-charcoal hover:bg-ansar-sage-50 hover:border-ansar-sage-300 transition-all shrink-0 bg-white"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Hub Page</span>
              </Link>
            </div>
            <p className="font-body text-[10px] text-ansar-muted sm:hidden">
              Share this link with seekers to join your community.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div className="px-6 md:px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === "overview" && (
            <OverviewTab
              firstName={firstName}
              ansarRecord={ansarRecord}
              organization={organization}
              activePairings={activePairings}
              completedPairings={completedPairings}
              seekerMap={seekerMap}
            />
          )}
          {activeTab === "inbox" && ansarUserId && (
            <InboxTab
              currentUserId={ansarUserId}
              currentUserName={currentUser?.name ?? "Ansar"}
              currentUserRole="ansar"
              organizationId={ansarRecord?.organizationId}
            />
          )}
          {activeTab === "pairings" && (
            <PairingsTab
              pairings={pairings}
              seekerMap={seekerMap}
              onMarkIntroSent={markIntroSent}
            />
          )}
          {activeTab === "profile" && (
            <ProfileTab ansarRecord={ansarRecord} organization={organization} />
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {hubUrl && (
        <AnsarQRCodeModal
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          url={hubUrl}
          orgName={organization?.name || "Community"}
        />
      )}
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════
// QR CODE MODAL (Ansar)
// ═══════════════════════════════════════════════════════════════

function AnsarQRCodeModal({
  isOpen, onClose, url, orgName,
}: {
  isOpen: boolean; onClose: () => void; url: string; orgName: string;
}) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const svgEl = document.getElementById("ansar-hub-qr-code");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>QR Code — ${orgName}</title>
      <style>
        body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: Georgia, serif; }
        h2 { margin-bottom: 8px; color: #3D3D3D; }
        p { color: #5A5A5A; font-size: 14px; margin-bottom: 24px; }
      </style>
      </head><body>
      <h2>${orgName}</h2>
      <p>${url}</p>
      ${svgData}
      <p style="margin-top: 24px; font-size: 12px; color: #8A8A85;">Scan to join our community</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[380px] bg-white rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[rgba(61,61,61,0.08)] flex items-center justify-between">
              <h3 className="font-heading text-lg text-ansar-charcoal">Hub QR Code</h3>
              <button onClick={onClose} className="p-1 text-ansar-muted hover:text-ansar-charcoal rounded-lg transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center gap-5">
              <div className="bg-white p-4 rounded-xl border border-[rgba(61,61,61,0.08)]">
                <QRCodeSVG
                  id="ansar-hub-qr-code"
                  value={url}
                  size={200}
                  bgColor="#FFFFFF"
                  fgColor="#3D3D3D"
                  level="M"
                />
              </div>
              <div className="text-center">
                <p className="font-heading text-sm text-ansar-charcoal">{orgName}</p>
                <p className="font-body text-xs text-ansar-muted mt-1">{url}</p>
              </div>
              <p className="font-body text-xs text-ansar-muted text-center max-w-[280px]">
                Print this QR code and share it with seekers. They can scan it to join through your community hub.
              </p>
              <button onClick={handlePrint} className="btn-primary w-full text-sm py-2.5">
                Print QR Code
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════

function OverviewTab({
  firstName,
  ansarRecord,
  organization,
  activePairings,
  completedPairings,
  seekerMap,
}: {
  firstName: string;
  ansarRecord: any;
  organization: any;
  activePairings: any[];
  completedPairings: any[];
  seekerMap: Record<string, any>;
}) {
  const stats: StatItem[] = [
    {
      label: "Active Seekers",
      value: activePairings.length,
      icon: <Heart className="w-4 h-4" />,
      accent: "terracotta",
    },
    {
      label: "Completed",
      value: completedPairings.length,
      icon: <CheckCircle2 className="w-4 h-4" />,
      accent: "success",
    },
    {
      label: "Total Pairings",
      value: activePairings.length + completedPairings.length,
      icon: <Link2 className="w-4 h-4" />,
      accent: "sage",
    },
    {
      label: "Check-In",
      value: ansarRecord?.checkInFrequency
        ? ansarRecord.checkInFrequency.charAt(0).toUpperCase() +
          ansarRecord.checkInFrequency.slice(1)
        : "—",
      icon: <Calendar className="w-4 h-4" />,
      accent: "ochre",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[rgba(61,61,61,0.06)]">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-ansar-sage-100 to-ansar-sage-200 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-7 h-7 text-ansar-sage-600" />
          </div>
          <div className="flex-1">
            <h1 className="font-heading text-2xl md:text-3xl text-ansar-charcoal mb-1">
              Assalamu Alaikum, {firstName}
            </h1>
            <p className="font-body text-ansar-gray text-base md:text-lg">
              JazakAllahu Khayran for your service as an Ansar.
              {activePairings.length > 0
                ? ` You're currently supporting ${activePairings.length} seeker${activePairings.length > 1 ? "s" : ""}.`
                : " You're available and ready to be paired with a seeker."}
            </p>
          </div>
        </div>
      </div>

      <StatsRow stats={stats} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Seekers */}
        <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.08)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(61,61,61,0.06)]">
            <h3 className="font-heading text-base text-ansar-charcoal flex items-center gap-2">
              <span className="w-2 h-2 bg-ansar-terracotta-600 rounded-full" />
              Your Active Seekers
            </h3>
          </div>
          <div className="divide-y divide-[rgba(61,61,61,0.04)]">
            {activePairings.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Heart className="w-8 h-8 text-ansar-sage-200 mx-auto mb-3" />
                <p className="font-body text-sm text-ansar-muted">
                  No active seekers yet. Your hub will pair you soon, insha'Allah.
                </p>
              </div>
            ) : (
              activePairings.map((p) => {
                const seeker = seekerMap[p.seekerId];
                return (
                  <div
                    key={p._id}
                    className="px-5 py-4 hover:bg-ansar-sage-50/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-body text-sm text-ansar-charcoal font-medium">
                          {seeker?.fullName || "Seeker"}
                        </p>
                        <p className="font-body text-xs text-ansar-muted mt-0.5">
                          {seeker?.city || "—"} &middot;{" "}
                          {seeker?.journeyType?.replace("_", " ") || "—"}
                        </p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Community Info */}
        <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.08)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(61,61,61,0.06)]">
            <h3 className="font-heading text-base text-ansar-charcoal flex items-center gap-2">
              <span className="w-2 h-2 bg-ansar-sage-600 rounded-full" />
              Your Community
            </h3>
          </div>
          <div className="p-5">
            {organization ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ansar-ochre-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-ansar-ochre-600" />
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium text-ansar-charcoal">
                      {organization.name}
                    </p>
                    <p className="font-body text-xs text-ansar-muted">
                      Level {organization.hubLevel} Hub
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-ansar-gray">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="font-body text-sm">{organization.city}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="font-body text-sm text-ansar-muted">
                  You haven't been assigned to a hub yet. Your local community will connect you soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAIRINGS TAB (My Seekers)
// ═══════════════════════════════════════════════════════════════

function PairingsTab({
  pairings,
  seekerMap,
  onMarkIntroSent,
}: {
  pairings: any[];
  seekerMap: Record<string, any>;
  onMarkIntroSent: (args: { id: any }) => Promise<any>;
}) {
  const [selectedPairing, setSelectedPairing] = useState<any>(null);

  const enriched = useMemo(
    () =>
      pairings.map((p) => ({
        ...p,
        seeker: seekerMap[p.seekerId],
        seekerName: seekerMap[p.seekerId]?.fullName || "Unknown Seeker",
      })),
    [pairings, seekerMap]
  );

  const active = enriched.filter(
    (p) => p.status === "active" || p.status === "pending_intro"
  );
  const past = enriched.filter(
    (p) => p.status === "completed" || p.status === "ended"
  );

  const stats: StatItem[] = [
    {
      label: "Active",
      value: active.length,
      accent: "terracotta",
    },
    {
      label: "Pending Intro",
      value: enriched.filter((p) => p.status === "pending_intro").length,
      accent: "ochre",
    },
    {
      label: "Completed",
      value: past.length,
      accent: "success",
    },
  ];

  return (
    <div className="space-y-6">
      <StatsRow stats={stats} />

      {/* Active Pairings */}
      <div>
        <h3 className="font-heading text-base text-ansar-charcoal mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-ansar-terracotta-600" />
          Active Seekers
        </h3>
        {active.length === 0 ? (
          <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.08)] p-8 text-center">
            <Heart className="w-10 h-10 text-ansar-sage-200 mx-auto mb-3" />
            <p className="font-body text-sm text-ansar-muted">
              No active seekers right now. Your hub will pair you when a seeker is ready.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {active.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-xl border border-[rgba(61,61,61,0.08)] p-5 hover:border-ansar-sage-300 hover:shadow-sm transition-all"
              >
                <button
                  onClick={() => setSelectedPairing(p)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-ansar-terracotta-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-ansar-terracotta-500" />
                      </div>
                      <div>
                        <p className="font-body text-sm text-ansar-charcoal font-medium">
                          {p.seekerName}
                        </p>
                        <p className="font-body text-xs text-ansar-muted mt-0.5">
                          {p.seeker?.city || "—"} &middot;{" "}
                          {p.seeker?.journeyType?.replace("_", " ") || "—"} &middot; Paired{" "}
                          {new Date(p.pairedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.status} />
                      <Eye className="w-4 h-4 text-ansar-sage-300 group-hover:text-ansar-sage-600 transition-colors" />
                    </div>
                  </div>
                </button>
                {/* Action: Confirm Introduction for pending_intro */}
                {p.status === "pending_intro" && (
                  <div className="mt-4 pt-4 border-t border-[rgba(61,61,61,0.06)] flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-body text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                        Please reach out to {p.seekerName.split(" ")[0]} to introduce yourself, then confirm below.
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        await onMarkIntroSent({ id: p._id });
                      }}
                      className="flex items-center gap-1.5 text-sm font-body font-medium text-white bg-ansar-sage-600 hover:bg-ansar-sage-700 px-4 py-2 rounded-lg transition-colors shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Introduction
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Pairings */}
      {past.length > 0 && (
        <div>
          <h3 className="font-heading text-base text-ansar-charcoal mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-ansar-sage-600" />
            Completed
          </h3>
          <div className="grid gap-3">
            {past.map((p) => (
              <button
                key={p._id}
                onClick={() => setSelectedPairing(p)}
                className="w-full text-left bg-white rounded-xl border border-[rgba(61,61,61,0.08)] p-4 hover:border-ansar-sage-200 transition-all opacity-75 hover:opacity-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm text-ansar-charcoal font-medium">
                      {p.seekerName}
                    </p>
                    <p className="font-body text-xs text-ansar-muted">
                      Paired {new Date(p.pairedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Seeker Detail Panel */}
      <DetailPanel
        isOpen={!!selectedPairing}
        onClose={() => setSelectedPairing(null)}
        title={selectedPairing?.seekerName}
        subtitle={
          selectedPairing?.seeker
            ? `${selectedPairing.seeker.city || "—"} • ${selectedPairing.seeker.journeyType?.replace("_", " ") || "—"}`
            : ""
        }
      >
        {selectedPairing?.seeker && (
          <dl className="space-y-0">
            <DetailField label="Status">
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedPairing.status} size="md" />
                {selectedPairing.status === "pending_intro" && (
                  <button
                    onClick={async () => {
                      await onMarkIntroSent({ id: selectedPairing._id });
                      setSelectedPairing({ ...selectedPairing, status: "active" });
                    }}
                    className="flex items-center gap-1.5 text-xs font-body font-medium text-white bg-ansar-sage-600 hover:bg-ansar-sage-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm Introduction
                  </button>
                )}
              </div>
            </DetailField>
            <DetailField label="Full Name">
              {selectedPairing.seeker.fullName}
            </DetailField>
            <DetailField label="Phone">
              <a
                href={`tel:${selectedPairing.seeker.phone}`}
                className="text-ansar-sage-600 hover:underline flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                {selectedPairing.seeker.phone}
              </a>
            </DetailField>
            <DetailField label="Email">
              <a
                href={`mailto:${selectedPairing.seeker.email}`}
                className="text-ansar-sage-600 hover:underline flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                {selectedPairing.seeker.email}
              </a>
            </DetailField>
            <DetailField label="City">{selectedPairing.seeker.city}</DetailField>
            <DetailField label="Journey Type">
              <StatusBadge status={selectedPairing.seeker.journeyType} />
            </DetailField>
            {selectedPairing.seeker.supportAreas?.length > 0 && (
              <DetailField label="Support Areas">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedPairing.seeker.supportAreas.map((area: string) => (
                    <span
                      key={area}
                      className="bg-ansar-sage-50 text-ansar-sage-700 text-xs px-2 py-0.5 rounded-full font-body"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </DetailField>
            )}
            <DetailField label="Paired On">
              {new Date(selectedPairing.pairedAt).toLocaleDateString()}
            </DetailField>
            {selectedPairing.notes && (
              <DetailField label="Notes">{selectedPairing.notes}</DetailField>
            )}
          </dl>
        )}
      </DetailPanel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROFILE TAB
// ═══════════════════════════════════════════════════════════════

function ProfileTab({
  ansarRecord,
  organization,
}: {
  ansarRecord: any;
  organization: any;
}) {
  if (!ansarRecord) {
    return (
      <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.08)] p-8 text-center">
        <Users className="w-10 h-10 text-ansar-sage-200 mx-auto mb-3" />
        <p className="font-body text-sm text-ansar-muted">
          Your profile is being set up. Please check back soon.
        </p>
      </div>
    );
  }

  const practiceLabels: Record<string, string> = {
    consistent: "Consistent",
    steady: "Steady",
    reconnecting: "Reconnecting",
  };

  const frequencyLabels: Record<string, string> = {
    weekly: "Weekly",
    biweekly: "Every Two Weeks",
    monthly: "Monthly",
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-[rgba(61,61,61,0.08)] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-ansar-sage-50 to-ansar-sage-100 px-6 py-6 md:px-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <span className="font-heading text-2xl text-ansar-sage-600">
                {ansarRecord.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-heading text-xl text-ansar-charcoal">{ansarRecord.fullName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={ansarRecord.status} />
                {organization && (
                  <span className="font-body text-xs text-ansar-muted">
                    &middot; {organization.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-5 md:px-8 divide-y divide-[rgba(61,61,61,0.06)]">
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 pb-5">
            <div>
              <p className="font-body text-xs text-ansar-muted uppercase tracking-wide mb-1">
                Email
              </p>
              <a
                href={`mailto:${ansarRecord.email}`}
                className="font-body text-sm text-ansar-sage-600 hover:underline flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                {ansarRecord.email}
              </a>
            </div>
            <div>
              <p className="font-body text-xs text-ansar-muted uppercase tracking-wide mb-1">
                Phone
              </p>
              <a
                href={`tel:${ansarRecord.phone}`}
                className="font-body text-sm text-ansar-sage-600 hover:underline flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                {ansarRecord.phone}
              </a>
            </div>
            <div>
              <p className="font-body text-xs text-ansar-muted uppercase tracking-wide mb-1">
                Location
              </p>
              <p className="font-body text-sm text-ansar-charcoal flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-ansar-gray" />
                {ansarRecord.city}
                {ansarRecord.stateRegion ? `, ${ansarRecord.stateRegion}` : ""}
              </p>
            </div>
            <div>
              <p className="font-body text-xs text-ansar-muted uppercase tracking-wide mb-1">
                Gender
              </p>
              <p className="font-body text-sm text-ansar-charcoal capitalize">
                {ansarRecord.gender}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 py-5">
            <div>
              <p className="font-body text-xs text-ansar-muted uppercase tracking-wide mb-1">
                Practice Level
              </p>
              <p className="font-body text-sm text-ansar-charcoal">
                {practiceLabels[ansarRecord.practiceLevel] || ansarRecord.practiceLevel}
              </p>
            </div>
            <div>
              <p className="font-body text-xs text-ansar-muted uppercase tracking-wide mb-1">
                Check-In Frequency
              </p>
              <p className="font-body text-sm text-ansar-charcoal">
                {frequencyLabels[ansarRecord.checkInFrequency] || ansarRecord.checkInFrequency}
              </p>
            </div>
            {ansarRecord.isConvert && (
              <div>
                <p className="font-body text-xs text-ansar-muted uppercase tracking-wide mb-1">
                  Convert
                </p>
                <p className="font-body text-sm text-ansar-sage-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Yes, Alhamdulillah
                </p>
              </div>
            )}
          </div>

          {/* Support Areas */}
          {ansarRecord.supportAreas?.length > 0 && (
            <div className="py-5">
              <p className="font-body text-xs text-ansar-muted uppercase tracking-wide mb-2">
                Support Areas
              </p>
              <div className="flex flex-wrap gap-2">
                {ansarRecord.supportAreas.map((area: string) => (
                  <span
                    key={area}
                    className="bg-ansar-sage-50 text-ansar-sage-700 text-xs px-3 py-1 rounded-full font-body capitalize"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Knowledge Background */}
          {ansarRecord.knowledgeBackground?.length > 0 && (
            <div className="py-5">
              <p className="font-body text-xs text-ansar-muted uppercase tracking-wide mb-2">
                Knowledge Background
              </p>
              <div className="flex flex-wrap gap-2">
                {ansarRecord.knowledgeBackground.map((kb: string) => (
                  <span
                    key={kb}
                    className="bg-ansar-ochre-50 text-ansar-ochre-700 text-xs px-3 py-1 rounded-full font-body"
                  >
                    {kb}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Motivation */}
          {ansarRecord.motivation && (
            <div className="py-5">
              <p className="font-body text-xs text-ansar-muted uppercase tracking-wide mb-2">
                Motivation
              </p>
              <p className="font-body text-sm text-ansar-charcoal leading-relaxed">
                {ansarRecord.motivation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Helpful Note */}
      <div className="border-l-4 border-ansar-sage-400 pl-5 py-2">
        <p className="font-body text-sm text-ansar-gray italic">
          Need to update your profile information? Contact your Hub Admin and they can make changes
          on your behalf.
        </p>
      </div>
    </div>
  );
}
