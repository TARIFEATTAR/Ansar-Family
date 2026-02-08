"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  Heart, Users, Building2, Link2, MessageSquare,
  LayoutDashboard, Loader2, Trash2, Eye, Check,
  UserPlus, Unlink, Send, Phone, Mail, MapPin, Clock,
  X as XIcon, BookUser, Copy, CheckCheck, Share2, ExternalLink,
  QrCode, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Circle,
  Inbox as InboxIcon, MailPlus, CheckSquare, Calendar, Plus, Pencil,
} from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  DashboardSidebar, DataTable, SearchBar, StatusBadge,
  StatsRow, DetailPanel, DetailField, EditableField,
} from "@/components/crm";
import type { SidebarNavItem, Column, StatItem } from "@/components/crm";
import { InboxTab } from "@/components/messaging";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

/**
 * PARTNER LEAD DASHBOARD — CRM-Style Organization View
 */

export default function PartnerDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, isLoaded } = useUser();

  const organization = useQuery(api.organizations.getBySlug, { slug });
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

  if (!isLoaded || organization === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <Loader2 className="w-8 h-8 text-ansar-sage-600 animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-ansar-charcoal mb-4">Partner Dashboard</h1>
          <p className="font-body text-ansar-gray mb-6">Please sign in to access the dashboard.</p>
          <a href="/sign-in" className="btn-primary inline-block">Sign In</a>
        </div>
      </main>
    );
  }

  if (organization === null) {
    notFound();
  }

  if (currentUser && currentUser.role === "partner_lead") {
    if (currentUser.organizationId !== organization._id) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
          <div className="text-center max-w-md mx-auto px-6">
            <h1 className="font-heading text-2xl text-ansar-charcoal mb-4">Access Denied</h1>
            <p className="font-body text-ansar-gray mb-6">
              You don&apos;t have permission to access this organization&apos;s dashboard.
            </p>
            <a href="/dashboard" className="btn-primary inline-block">Go to Your Dashboard</a>
          </div>
        </main>
      );
    }
  }

  return <PartnerDashboard organization={organization} currentUser={currentUser} />;
}

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface Organization {
  _id: Id<"organizations">;
  name: string;
  slug: string;
  type: string;
  city: string;
  hubLevel: number;
}

// ═══════════════════════════════════════════════════════════════
// MAIN CRM DASHBOARD
// ═══════════════════════════════════════════════════════════════

function PartnerDashboard({
  organization,
  currentUser,
}: {
  organization: Organization;
  currentUser: { _id: Id<"users">; role: string; name: string } | null | undefined;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const hubUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${organization.slug}`
    : `https://ansar.family/${organization.slug}`;

  const copyHubLink = useCallback(() => {
    navigator.clipboard.writeText(hubUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [hubUrl]);

  // Organization-scoped data
  const seekers = useQuery(api.intakes.listByOrganization, { organizationId: organization._id }) ?? [];
  const ansars = useQuery(api.ansars.listByOrganization, { organizationId: organization._id }) ?? [];
  const contacts = useQuery(api.contacts.listByOrganization, { organizationId: organization._id }) ?? [];
  const pairings = useQuery(api.pairings.listByOrganization, { organizationId: organization._id }) ?? [];
  const pairingStats = useQuery(api.pairings.getOrgStats, { organizationId: organization._id });
  const readyToPair = useQuery(api.intakes.listReadyForPairing, { organizationId: organization._id }) ?? [];
  const availableAnsars = useQuery(api.ansars.listAvailableForPairing, { organizationId: organization._id }) ?? [];
  const messages = useQuery(api.messages.listAll) ?? []; // Will filter client-side
  const events = useQuery(api.events.getByOrganization, { organizationId: organization._id }) ?? [];

  // Inbox
  const partnerUserId = currentUser?._id;
  const inboxUnread = useQuery(
    api.inbox.getUnreadTotal,
    partnerUserId ? { userId: partnerUserId } : "skip"
  ) ?? 0;

  // Mutations
  const createPairing = useMutation(api.pairings.create);
  const markIntroSent = useMutation(api.pairings.markIntroSent);
  const unpairMutation = useMutation(api.pairings.unpair);
  const deleteIntake = useMutation(api.intakes.deleteIntake);
  const updateAnsarStatus = useMutation(api.ansars.updateStatus);
  const updateIntake = useMutation(api.intakes.update);
  const updateAnsar = useMutation(api.ansars.update);
  const createContact = useMutation(api.contacts.create);
  const updateContact = useMutation(api.contacts.update);
  const deleteContact = useMutation(api.contacts.deleteContact);
  const sendMessageMutation = useMutation(api.messages.sendMessage);
  const sendBulkEmailMutation = useMutation(api.messages.sendBulkEmail);

  // Org-scoped messages: filter messages where recipientId matches any seeker/ansar in this org
  const orgRecipientIds = useMemo(() => {
    const ids = new Set<string>();
    seekers.forEach((s: any) => ids.add(s._id));
    ansars.forEach((a: any) => ids.add(a._id));
    return ids;
  }, [seekers, ansars]);

  const orgMessages = useMemo(
    () => messages.filter((m: any) => orgRecipientIds.has(m.recipientId)),
    [messages, orgRecipientIds]
  );

  // Counts
  const pendingCount = readyToPair.length + ansars.filter((a: any) => a.status === "pending").length;

  const navItems: SidebarNavItem[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-[18px] h-[18px]" />, description: "Dashboard summary and activity" },
    { id: "inbox", label: "Inbox", icon: <InboxIcon className="w-[18px] h-[18px]" />, badge: inboxUnread || undefined, description: "Messages and conversations" },
    { id: "seekers", label: "Seekers", icon: <Heart className="w-[18px] h-[18px]" />, badge: seekers.length, description: "People seeking support and community" },
    { id: "ansars", label: "Ansars", icon: <Users className="w-[18px] h-[18px]" />, badge: ansars.length, description: "Volunteer companions and mentors" },
    { id: "contacts", label: "Contacts", icon: <BookUser className="w-[18px] h-[18px]" />, badge: contacts.length, description: "Community members and stakeholders" },
    { id: "pairings", label: "Pairings", icon: <Link2 className="w-[18px] h-[18px]" />, badge: pairings.length, description: "Seeker-Ansar connections" },
    { id: "events", label: "Events", icon: <Calendar className="w-[18px] h-[18px]" />, badge: events.length || undefined, description: "Community events for your seekers" },
    { id: "messages", label: "Notification Log", icon: <MessageSquare className="w-[18px] h-[18px]" />, badge: orgMessages.length, description: "SMS and email notification log" },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearch("");
    setStatusFilter("");
  };

  // Handlers
  const handleCreatePairing = useCallback(async (seekerId: Id<"intakes">, ansarId: Id<"ansars">) => {
    if (!currentUser) return;
    try {
      await createPairing({
        seekerId,
        ansarId,
        organizationId: organization._id,
        pairedByUserId: currentUser._id,
      });
    } catch (error) {
      console.error("Failed to create pairing:", error);
      alert("Failed to create pairing. Please try again.");
    }
  }, [createPairing, organization._id, currentUser]);

  const handleMarkIntroSent = useCallback(async (id: Id<"pairings">) => {
    await markIntroSent({ id });
  }, [markIntroSent]);

  const handleUnpair = useCallback(async (id: Id<"pairings">) => {
    if (confirm("Unpair them? Both will become available again.")) {
      await unpairMutation({ id });
    }
  }, [unpairMutation]);

  const handleDeleteSeeker = useCallback(async (id: Id<"intakes">) => {
    if (confirm("Remove this seeker? This cannot be undone.")) {
      await deleteIntake({ id });
    }
  }, [deleteIntake]);

  const handleApproveAnsar = useCallback(async (id: Id<"ansars">) => {
    await updateAnsarStatus({ id, status: "approved" });
  }, [updateAnsarStatus]);

  const handleDeleteContact = useCallback(async (id: Id<"contacts">) => {
    if (confirm("Remove this contact? This cannot be undone.")) {
      await deleteContact({ id });
    }
  }, [deleteContact]);

  const orgTypeLabel: Record<string, string> = {
    masjid: "Masjid", msa: "MSA", nonprofit: "Nonprofit",
    informal_circle: "Community Circle", other: "Community",
  };

  // Hub link sidebar footer
  const hubLinkFooter = (
    <div className="space-y-2 pb-2">
      <div className="flex items-center gap-2 text-ansar-sage-700 mb-1">
        <Share2 className="w-3 h-3" />
        <span className="font-body text-[10px] font-medium uppercase tracking-wide">Hub Link</span>
      </div>
      <code className="font-body text-[10px] text-ansar-charcoal bg-ansar-sage-50 px-2.5 py-1.5 rounded-lg border border-[rgba(61,61,61,0.06)] block truncate">
        {hubUrl}
      </code>
      <div className="flex items-center gap-1.5">
        <button
          onClick={copyHubLink}
          className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-body font-medium px-2 py-1.5 rounded-lg border transition-all ${
            linkCopied
              ? "bg-ansar-sage-100 border-ansar-sage-300 text-ansar-sage-700"
              : "bg-white border-[rgba(61,61,61,0.10)] text-ansar-charcoal hover:bg-ansar-sage-50"
          }`}
        >
          {linkCopied ? <><CheckCheck className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
        </button>
        <button
          onClick={() => setShowQR(true)}
          className="flex items-center justify-center gap-1 text-[10px] font-body font-medium px-2 py-1.5 rounded-lg border border-[rgba(61,61,61,0.10)] text-ansar-charcoal hover:bg-ansar-sage-50 transition-all bg-white"
        >
          <QrCode className="w-3 h-3" />
          QR
        </button>
        <Link
          href={`/${organization.slug}`}
          target="_blank"
          className="flex items-center justify-center gap-1 text-[10px] font-body font-medium px-2 py-1.5 rounded-lg border border-[rgba(61,61,61,0.10)] text-ansar-charcoal hover:bg-ansar-sage-50 transition-all bg-white"
        >
          <ExternalLink className="w-3 h-3" />
          View
        </Link>
      </div>
      {pendingCount > 0 && (
        <div className="bg-ansar-terracotta-50 text-ansar-terracotta-700 text-[10px] font-body font-medium px-2.5 py-1.5 rounded-lg text-center">
          {pendingCount} pending action{pendingCount !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );

  return (
    <>
      <DashboardSidebar
        brandIcon={<Building2 className="w-4.5 h-4.5 text-white" />}
        brandTitle={organization.name}
        brandSubtitle={`${orgTypeLabel[organization.type] || organization.type} \u00B7 ${organization.city}`}
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userName={currentUser?.name}
        userRoleLabel="Partner Lead"
        footerContent={hubLinkFooter}
      >
        {activeTab === "overview" && (
          <PartnerOverviewTab
            seekers={seekers}
            ansars={ansars}
            contacts={contacts}
            pairings={pairings}
            pairingStats={pairingStats}
            readyToPair={readyToPair}
            orgMessages={orgMessages}
            orgSlug={organization.slug}
            hubUrl={hubUrl}
          />
        )}
        {activeTab === "inbox" && partnerUserId && (
          <InboxTab
            currentUserId={partnerUserId}
            currentUserName={currentUser?.name ?? "Partner Lead"}
            currentUserRole="partner_lead"
            organizationId={organization._id}
          />
        )}
        {activeTab === "seekers" && (
          <PartnerSeekersTab
            seekers={seekers}
            availableAnsars={availableAnsars}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onPair={handleCreatePairing}
            onDelete={handleDeleteSeeker}
            onUpdate={updateIntake}
            onSendMessage={sendMessageMutation}
            onBulkEmail={sendBulkEmailMutation}
            senderName={currentUser?.name || "Partner Lead"}
            organizationName={organization.name}
          />
        )}
        {activeTab === "ansars" && (
          <PartnerAnsarsTab
            ansars={ansars}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onApprove={handleApproveAnsar}
            onUpdate={updateAnsar}
            onBulkEmail={sendBulkEmailMutation}
            senderName={currentUser?.name || "Partner Lead"}
            organizationName={organization.name}
          />
        )}
        {activeTab === "contacts" && (
          <PartnerContactsTab
            contacts={contacts}
            organizationId={organization._id}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onCreate={createContact}
            onUpdate={updateContact}
            onDelete={handleDeleteContact}
          />
        )}
        {activeTab === "pairings" && (
          <PartnerPairingsTab
            pairings={pairings}
            seekers={seekers}
            ansars={ansars}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onMarkIntroSent={handleMarkIntroSent}
            onUnpair={handleUnpair}
          />
        )}
        {activeTab === "events" && currentUser && (
          <PartnerEventsTab
            events={events}
            organizationId={organization._id}
            userId={currentUser._id}
          />
        )}
        {activeTab === "messages" && (
          <PartnerMessagesTab
            messages={orgMessages}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        )}
      </DashboardSidebar>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        url={hubUrl}
        orgName={organization.name}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// QR CODE MODAL
// ═══════════════════════════════════════════════════════════════

function QRCodeModal({
  isOpen, onClose, url, orgName,
}: {
  isOpen: boolean; onClose: () => void; url: string; orgName: string;
}) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const svgEl = document.getElementById("hub-qr-code");
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
                  id="hub-qr-code"
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
                Print this QR code and display it at your masjid, events, or community spaces. Seekers can scan it to join through your hub.
              </p>
              <button
                onClick={handlePrint}
                className="btn-primary w-full text-sm py-2.5"
              >
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
// ONBOARDING CHECKLIST
// ═══════════════════════════════════════════════════════════════

function OnboardingChecklist({ orgSlug, hubUrl, seekerCount, ansarCount }: {
  orgSlug: string; hubUrl: string; seekerCount: number; ansarCount: number;
}) {
  const storageKey = `ansar_onboarding_dismissed_${orgSlug}`;
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDismissed(localStorage.getItem(storageKey) === "true");
    }
  }, [storageKey]);

  if (dismissed) return null;

  const steps = [
    { label: "Share your hub link with seekers", done: seekerCount > 0 },
    { label: "Review incoming seeker applications", done: seekerCount >= 2 },
    { label: "Approve at least one Ansar volunteer", done: ansarCount > 0 },
    { label: "Create your first seeker-Ansar pairing", done: false }, // Pairings not passed in, keep simple
  ];

  const completedCount = steps.filter((s) => s.done).length;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(storageKey, "true");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-ansar-sage-200 overflow-hidden"
    >
      <div className="px-5 py-4 flex items-center justify-between cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-ansar-sage-600" />
          <h3 className="font-heading text-base text-ansar-charcoal">Getting Started</h3>
          <span className="text-[10px] font-body font-medium text-ansar-sage-700 bg-ansar-sage-100 px-2 py-0.5 rounded-full">
            {completedCount}/{steps.length} complete
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
            className="text-[11px] font-body text-ansar-muted hover:text-ansar-charcoal transition-colors"
          >
            Dismiss
          </button>
          {collapsed ? <ChevronDown className="w-4 h-4 text-ansar-muted" /> : <ChevronUp className="w-4 h-4 text-ansar-muted" />}
        </div>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3">
              {/* Progress bar */}
              <div className="w-full bg-ansar-sage-100 rounded-full h-1.5">
                <div
                  className="bg-ansar-sage-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / steps.length) * 100}%` }}
                />
              </div>

              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 text-ansar-sage-600 mt-0.5 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-ansar-muted mt-0.5 shrink-0" />
                  )}
                  <span className={`font-body text-sm ${step.done ? "text-ansar-muted line-through" : "text-ansar-charcoal"}`}>
                    {step.label}
                  </span>
                </div>
              ))}

              <div className="pt-2 flex items-center gap-3">
                <Link
                  href={`/${orgSlug}`}
                  target="_blank"
                  className="text-xs font-body font-medium text-ansar-sage-700 hover:text-ansar-sage-800 underline underline-offset-2"
                >
                  Preview your hub page
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════

function PartnerOverviewTab({
  seekers, ansars, contacts, pairings, pairingStats, readyToPair, orgMessages, orgSlug, hubUrl,
}: {
  seekers: any[]; ansars: any[]; contacts: any[]; pairings: any[];
  pairingStats: any; readyToPair: any[]; orgMessages: any[];
  orgSlug: string; hubUrl: string;
}) {
  const stats: StatItem[] = [
    { label: "Seekers", value: seekers.length, icon: <Heart className="w-4 h-4" />, accent: "terracotta" },
    { label: "Ansars", value: ansars.length, icon: <Users className="w-4 h-4" />, accent: "sage" },
    { label: "Contacts", value: contacts.length, icon: <BookUser className="w-4 h-4" />, accent: "ochre" },
    { label: "Active Pairings", value: pairingStats?.active || 0, icon: <Link2 className="w-4 h-4" />, accent: "success" },
    { label: "Ready to Pair", value: readyToPair.length, icon: <UserPlus className="w-4 h-4" />, accent: "ochre" },
    { label: "Pending Intro", value: pairingStats?.pendingIntro || 0, icon: <Clock className="w-4 h-4" />, accent: "terracotta" },
    { label: "Messages", value: orgMessages.length, icon: <MessageSquare className="w-4 h-4" />, accent: "muted" },
  ];

  const recentSeekers = seekers.slice(0, 5);
  const recentPairings = pairings.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Onboarding Checklist — shown for new hubs */}
      <OnboardingChecklist
        orgSlug={orgSlug}
        hubUrl={hubUrl}
        seekerCount={seekers.length}
        ansarCount={ansars.length}
      />

      <StatsRow stats={stats} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Ready to Pair */}
        <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.08)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(61,61,61,0.06)]">
            <h3 className="font-heading text-base text-ansar-charcoal flex items-center gap-2">
              <span className="w-2 h-2 bg-ansar-terracotta-600 rounded-full" />
              Ready to Pair
              {readyToPair.length > 0 && (
                <span className="bg-ansar-terracotta-100 text-ansar-terracotta-700 text-[10px] font-body font-medium px-1.5 py-0.5 rounded-full">
                  {readyToPair.length}
                </span>
              )}
            </h3>
          </div>
          <div className="divide-y divide-[rgba(61,61,61,0.04)]">
            {readyToPair.length === 0 ? (
              <p className="px-5 py-6 text-center font-body text-sm text-ansar-muted">All seekers are paired.</p>
            ) : (
              readyToPair.slice(0, 5).map((s) => (
                <div key={s._id} className="px-5 py-3 flex items-center justify-between hover:bg-ansar-sage-50/30 transition-colors">
                  <div>
                    <p className="font-body text-sm text-ansar-charcoal font-medium">{s.fullName}</p>
                    <p className="font-body text-xs text-ansar-muted">{s.city} &middot; {s.journeyType?.replace("_", " ")}</p>
                  </div>
                  <StatusBadge status="triaged" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Pairings */}
        <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.08)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(61,61,61,0.06)]">
            <h3 className="font-heading text-base text-ansar-charcoal flex items-center gap-2">
              <span className="w-2 h-2 bg-ansar-sage-600 rounded-full" />
              Recent Pairings
            </h3>
          </div>
          <div className="divide-y divide-[rgba(61,61,61,0.04)]">
            {recentPairings.length === 0 ? (
              <p className="px-5 py-6 text-center font-body text-sm text-ansar-muted">No pairings yet.</p>
            ) : (
              recentPairings.map((p) => (
                <div key={p._id} className="px-5 py-3 flex items-center justify-between hover:bg-ansar-sage-50/30 transition-colors">
                  <div>
                    <p className="font-body text-xs text-ansar-muted">
                      {new Date(p.pairedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SEEKERS TAB (with Pairing Modal)
// ═══════════════════════════════════════════════════════════════

function PartnerSeekersTab({
  seekers, availableAnsars, search, setSearch, statusFilter, setStatusFilter,
  onPair, onDelete, onUpdate, onSendMessage, onBulkEmail, senderName, organizationName,
}: {
  seekers: any[]; availableAnsars: any[];
  search: string; setSearch: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  onPair: (seekerId: Id<"intakes">, ansarId: Id<"ansars">) => void;
  onDelete: (id: Id<"intakes">) => void;
  onUpdate: (args: any) => Promise<any>;
  onSendMessage: (args: any) => Promise<any>;
  onBulkEmail: (args: any) => Promise<any>;
  senderName: string;
  organizationName: string;
}) {
  const [selectedSeeker, setSelectedSeeker] = useState<any>(null);
  const [pairingSeeker, setPairingSeeker] = useState<Id<"intakes"> | null>(null);
  const [showMessageModal, setShowMessageModal] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkEmail, setShowBulkEmail] = useState(false);

  const filtered = useMemo(() => {
    let result = seekers;
    if (statusFilter) result = result.filter((s) => s.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.phone?.includes(q)
      );
    }
    return result;
  }, [seekers, search, statusFilter]);

  // Seekers with emails (eligible for bulk email)
  const emailableSelected = useMemo(
    () => filtered.filter((s) => selectedIds.has(s._id) && s.email),
    [filtered, selectedIds]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s._id)));
    }
  }, [filtered, selectedIds.size]);

  const stats: StatItem[] = [
    { label: "Total", value: seekers.length, accent: "sage" },
    { label: "Awaiting Outreach", value: seekers.filter((s) => s.status === "awaiting_outreach").length, accent: "terracotta" },
    { label: "Triaged", value: seekers.filter((s) => s.status === "triaged").length, accent: "ochre" },
    { label: "Connected", value: seekers.filter((s) => s.status === "connected" || s.status === "active").length, accent: "success" },
  ];

  const columns: Column<any>[] = [
    {
      key: "_select",
      label: "",
      render: (r) => (
        <input
          type="checkbox"
          checked={selectedIds.has(r._id)}
          onChange={(e) => { e.stopPropagation(); toggleSelect(r._id); }}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 text-ansar-sage-600 focus:ring-ansar-sage-500 cursor-pointer"
        />
      ),
    },
    { key: "fullName", label: "Name", sortable: true, render: (r) => <span className="font-medium">{r.fullName}</span> },
    { key: "phone", label: "Phone", render: (r) => <span className="text-ansar-gray text-xs">{r.phone}</span> },
    { key: "city", label: "City", sortable: true, render: (r) => r.city },
    { key: "journeyType", label: "Journey", render: (r) => <StatusBadge status={r.journeyType} /> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <StatsRow stats={stats} />

      {/* Bulk Action Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SearchBar
          placeholder="Search seekers..."
          value={search}
          onChange={setSearch}
          filters={[{
            id: "status", label: "All Statuses", value: statusFilter,
            options: [
              { value: "awaiting_outreach", label: "Awaiting Outreach" },
              { value: "triaged", label: "Triaged" },
              { value: "connected", label: "Connected" },
            ],
          }]}
          onFilterChange={(_, v) => setStatusFilter(v)}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSelectAll}
            className={`flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-lg border transition-all ${
              selectedIds.size > 0
                ? "bg-ansar-sage-50 border-ansar-sage-300 text-ansar-sage-700"
                : "bg-white border-[rgba(61,61,61,0.10)] text-ansar-charcoal hover:bg-ansar-sage-50"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            {selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : "Select All"}
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkEmail(true)}
              disabled={emailableSelected.length === 0}
              className="flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-lg bg-ansar-sage-600 text-white hover:bg-ansar-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MailPlus className="w-3.5 h-3.5" />
              Email {emailableSelected.length > 0 ? `(${emailableSelected.length})` : ""}
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyField="_id"
        onRowClick={(row) => setSelectedSeeker(row)}
        emptyMessage="No seekers in your community."
        emptyIcon={<Heart className="w-12 h-12" />}
        actions={(row) => (
          <div className="flex items-center gap-1">
            {row.status === "triaged" && availableAnsars.length > 0 && (
              <button onClick={() => setPairingSeeker(row._id)} className="p-1.5 text-ansar-sage-600 hover:bg-ansar-sage-50 rounded-lg transition-colors" title="Pair with Ansar">
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => setSelectedSeeker(row)} className="p-1.5 text-ansar-muted hover:text-ansar-sage-600 hover:bg-ansar-sage-50 rounded-lg transition-colors" title="View">
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(row._id)} className="p-1.5 text-ansar-muted hover:text-ansar-error hover:bg-red-50 rounded-lg transition-colors" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      />

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selectedSeeker}
        onClose={() => setSelectedSeeker(null)}
        title={selectedSeeker?.fullName}
        subtitle={selectedSeeker ? `${selectedSeeker.city} • ${selectedSeeker.journeyType?.replace("_", " ")}` : ""}
        actions={
          selectedSeeker && (
            <button
              onClick={() => setShowMessageModal(selectedSeeker)}
              className="flex items-center gap-1.5 text-xs font-body font-medium text-ansar-sage-700 bg-ansar-sage-50 hover:bg-ansar-sage-100 px-3 py-1.5 rounded-lg border border-ansar-sage-200 transition-colors"
            >
              <Send className="w-3 h-3" />
              Message
            </button>
          )
        }
      >
        {selectedSeeker && (
          <dl className="space-y-0">
            <DetailField label="Status"><StatusBadge status={selectedSeeker.status} size="md" /></DetailField>

            {/* Quick contact buttons */}
            <div className="px-5 py-3 flex items-center gap-2 border-b border-[rgba(61,61,61,0.04)]">
              {selectedSeeker.phone && (
                <a
                  href={`sms:${selectedSeeker.phone}`}
                  className="flex items-center gap-1.5 text-xs font-body font-medium text-ansar-charcoal bg-ansar-sage-50 hover:bg-ansar-sage-100 px-3 py-1.5 rounded-lg border border-[rgba(61,61,61,0.08)] transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  SMS
                </a>
              )}
              {selectedSeeker.email && (
                <a
                  href={`mailto:${selectedSeeker.email}`}
                  className="flex items-center gap-1.5 text-xs font-body font-medium text-ansar-charcoal bg-ansar-sage-50 hover:bg-ansar-sage-100 px-3 py-1.5 rounded-lg border border-[rgba(61,61,61,0.08)] transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  Email
                </a>
              )}
              <button
                onClick={() => setShowMessageModal(selectedSeeker)}
                className="flex items-center gap-1.5 text-xs font-body font-medium text-white bg-ansar-sage-600 hover:bg-ansar-sage-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Send className="w-3 h-3" />
                Send via Platform
              </button>
            </div>

            <EditableField
              label="Full Name"
              value={selectedSeeker.fullName}
              onSave={(v) => onUpdate({ id: selectedSeeker._id, fullName: v })}
            />
            <EditableField
              label="Email"
              type="email"
              value={selectedSeeker.email}
              onSave={(v) => onUpdate({ id: selectedSeeker._id, email: v })}
            />
            <EditableField
              label="Phone"
              type="tel"
              value={selectedSeeker.phone}
              onSave={(v) => onUpdate({ id: selectedSeeker._id, phone: v })}
            />
            <EditableField
              label="City"
              value={selectedSeeker.city}
              onSave={(v) => onUpdate({ id: selectedSeeker._id, city: v })}
            />
            <EditableField
              label="Gender"
              type="select"
              value={selectedSeeker.gender}
              options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]}
              onSave={(v) => onUpdate({ id: selectedSeeker._id, gender: v })}
            />
            <EditableField
              label="Journey Type"
              type="select"
              value={selectedSeeker.journeyType}
              options={[
                { value: "new_muslim", label: "New Muslim" },
                { value: "reconnecting", label: "Reconnecting" },
                { value: "seeker", label: "Seeker" },
              ]}
              onSave={(v) => onUpdate({ id: selectedSeeker._id, journeyType: v })}
            />
            {selectedSeeker.supportAreas?.length > 0 && (
              <DetailField label="Support Areas">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedSeeker.supportAreas.map((area: string) => (
                    <span key={area} className="bg-ansar-sage-50 text-ansar-sage-700 text-xs px-2 py-0.5 rounded-full font-body">{area}</span>
                  ))}
                </div>
              </DetailField>
            )}
            <EditableField
              label="Notes"
              type="textarea"
              value={selectedSeeker.notes || ""}
              onSave={(v) => onUpdate({ id: selectedSeeker._id, notes: v })}
            />
          </dl>
        )}
      </DetailPanel>

      {/* Send Message Modal */}
      <SendMessageModal
        isOpen={!!showMessageModal}
        onClose={() => setShowMessageModal(null)}
        recipientName={showMessageModal?.fullName || ""}
        recipientId={showMessageModal?._id || ""}
        recipientPhone={showMessageModal?.phone}
        recipientEmail={showMessageModal?.email}
        senderName={senderName}
        onSend={onSendMessage}
      />

      {/* Pairing Modal */}
      <PairingModal
        isOpen={!!pairingSeeker}
        onClose={() => setPairingSeeker(null)}
        availableAnsars={availableAnsars}
        onSelect={(ansarId) => {
          if (pairingSeeker) {
            onPair(pairingSeeker, ansarId);
            setPairingSeeker(null);
          }
        }}
      />

      {/* Bulk Email Modal */}
      <BulkEmailModal
        isOpen={showBulkEmail}
        onClose={() => setShowBulkEmail(false)}
        recipients={emailableSelected.map((s: any) => ({ id: s._id, email: s.email, name: s.fullName }))}
        senderName={senderName}
        organizationName={organizationName}
        onSend={onBulkEmail}
        recipientLabel="seekers"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAIRING MODAL
// ═══════════════════════════════════════════════════════════════

function PairingModal({
  isOpen, onClose, availableAnsars, onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  availableAnsars: any[];
  onSelect: (ansarId: Id<"ansars">) => void;
}) {
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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[440px] md:max-h-[80vh] bg-white rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[rgba(61,61,61,0.08)] flex items-center justify-between">
              <h3 className="font-heading text-lg text-ansar-charcoal">Select an Ansar</h3>
              <button onClick={onClose} className="p-1 text-ansar-muted hover:text-ansar-charcoal rounded-lg transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {availableAnsars.length === 0 ? (
                <p className="text-center py-8 font-body text-sm text-ansar-muted">No ansars available for pairing.</p>
              ) : (
                <div className="space-y-2">
                  {availableAnsars.map((ansar) => (
                    <button
                      key={ansar._id}
                      onClick={() => onSelect(ansar._id)}
                      className="w-full text-left p-4 rounded-xl border border-[rgba(61,61,61,0.08)] hover:border-ansar-sage-300 hover:bg-ansar-sage-50/50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-body text-sm text-ansar-charcoal font-medium">{ansar.fullName}</p>
                          <p className="font-body text-xs text-ansar-muted mt-0.5">
                            {ansar.city} &middot; {ansar.practiceLevel}
                          </p>
                        </div>
                        <UserPlus className="w-4 h-4 text-ansar-sage-400 group-hover:text-ansar-sage-600 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// SEND MESSAGE MODAL
// ═══════════════════════════════════════════════════════════════

function SendMessageModal({
  isOpen, onClose, recipientName, recipientId, recipientPhone, recipientEmail, senderName, onSend,
}: {
  isOpen: boolean; onClose: () => void;
  recipientName: string; recipientId: string;
  recipientPhone?: string; recipientEmail?: string;
  senderName: string;
  onSend: (args: any) => Promise<any>;
}) {
  const [message, setMessage] = useState("");
  const [sendViaSMS, setSendViaSMS] = useState(!!recipientPhone);
  const [sendViaEmail, setSendViaEmail] = useState(!!recipientEmail);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setMessage("");
      setSendViaSMS(!!recipientPhone);
      setSendViaEmail(!!recipientEmail);
      setIsSending(false);
      setSent(false);
    }
  }, [isOpen, recipientPhone, recipientEmail]);

  const handleSend = async () => {
    if (!message.trim()) return;
    if (!sendViaSMS && !sendViaEmail) return;

    setIsSending(true);
    try {
      await onSend({
        recipientId,
        phone: sendViaSMS ? recipientPhone : undefined,
        email: sendViaEmail ? recipientEmail : undefined,
        message: message.trim(),
        senderName,
      });
      setSent(true);
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] bg-white rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[rgba(61,61,61,0.08)] flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg text-ansar-charcoal">Message {recipientName}</h3>
                <p className="font-body text-xs text-ansar-muted mt-0.5">Send via SMS and/or Email</p>
              </div>
              <button onClick={onClose} className="p-1 text-ansar-muted hover:text-ansar-charcoal rounded-lg transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {sent ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-ansar-sage-600 mx-auto mb-3" />
                <p className="font-heading text-lg text-ansar-charcoal">Message Sent</p>
                <p className="font-body text-sm text-ansar-muted mt-1">
                  Your message to {recipientName} has been queued.
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-4">
                  {/* Channel selectors */}
                  <div className="flex items-center gap-3">
                    {recipientPhone && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendViaSMS}
                          onChange={(e) => setSendViaSMS(e.target.checked)}
                          className="rounded border-gray-300 text-ansar-sage-600 focus:ring-ansar-sage-500"
                        />
                        <Phone className="w-3.5 h-3.5 text-ansar-muted" />
                        <span className="font-body text-xs text-ansar-charcoal">SMS ({recipientPhone})</span>
                      </label>
                    )}
                    {recipientEmail && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendViaEmail}
                          onChange={(e) => setSendViaEmail(e.target.checked)}
                          className="rounded border-gray-300 text-ansar-sage-600 focus:ring-ansar-sage-500"
                        />
                        <Mail className="w-3.5 h-3.5 text-ansar-muted" />
                        <span className="font-body text-xs text-ansar-charcoal">Email</span>
                      </label>
                    )}
                  </div>

                  {/* Message body */}
                  <div>
                    <label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Write a message to ${recipientName}...`}
                      rows={4}
                      className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400 resize-none"
                    />
                    <p className="font-body text-[10px] text-ansar-muted mt-1">
                      Will be signed as &quot;— {senderName}, Ansar Family&quot;
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[rgba(61,61,61,0.08)] flex items-center justify-end gap-3">
                  <button onClick={onClose} className="btn-outline text-sm py-2 px-4" disabled={isSending}>
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={isSending || !message.trim() || (!sendViaSMS && !sendViaEmail)}
                    className="btn-primary text-sm py-2 px-5 disabled:opacity-50"
                  >
                    {isSending ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Send className="w-3.5 h-3.5" /> Send Message</span>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// ANSARS TAB
// ═══════════════════════════════════════════════════════════════

function PartnerAnsarsTab({
  ansars, search, setSearch, statusFilter, setStatusFilter, onApprove, onUpdate,
  onBulkEmail, senderName, organizationName,
}: {
  ansars: any[];
  search: string; setSearch: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  onApprove: (id: Id<"ansars">) => void;
  onUpdate: (args: any) => Promise<any>;
  onBulkEmail: (args: any) => Promise<any>;
  senderName: string;
  organizationName: string;
}) {
  const [selectedAnsar, setSelectedAnsar] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkEmail, setShowBulkEmail] = useState(false);

  const filtered = useMemo(() => {
    let result = ansars;
    if (statusFilter) result = result.filter((a) => a.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) =>
        a.fullName.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [ansars, search, statusFilter]);

  // Ansars with emails (eligible for bulk email)
  const emailableSelected = useMemo(
    () => filtered.filter((a) => selectedIds.has(a._id) && a.email),
    [filtered, selectedIds]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((a) => a._id)));
    }
  }, [filtered, selectedIds.size]);

  const stats: StatItem[] = [
    { label: "Total", value: ansars.length, accent: "sage" },
    { label: "Pending", value: ansars.filter((a) => a.status === "pending").length, accent: "terracotta" },
    { label: "Approved", value: ansars.filter((a) => a.status === "approved").length, accent: "ochre" },
    { label: "Active", value: ansars.filter((a) => a.status === "active").length, accent: "success" },
  ];

  const columns: Column<any>[] = [
    {
      key: "_select",
      label: "",
      render: (r) => (
        <input
          type="checkbox"
          checked={selectedIds.has(r._id)}
          onChange={(e) => { e.stopPropagation(); toggleSelect(r._id); }}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 text-ansar-sage-600 focus:ring-ansar-sage-500 cursor-pointer"
        />
      ),
    },
    { key: "fullName", label: "Name", sortable: true, render: (r) => <span className="font-medium">{r.fullName}</span> },
    { key: "phone", label: "Phone", render: (r) => <span className="text-ansar-gray text-xs">{r.phone}</span> },
    { key: "city", label: "City", sortable: true, render: (r) => r.city },
    { key: "practiceLevel", label: "Practice", render: (r) => <StatusBadge status={r.practiceLevel} /> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <StatsRow stats={stats} />

      {/* Bulk Action Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SearchBar
          placeholder="Search ansars..."
          value={search}
          onChange={setSearch}
          filters={[{
            id: "status", label: "All Statuses", value: statusFilter,
            options: [
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "active", label: "Active" },
            ],
          }]}
          onFilterChange={(_, v) => setStatusFilter(v)}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSelectAll}
            className={`flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-lg border transition-all ${
              selectedIds.size > 0
                ? "bg-ansar-sage-50 border-ansar-sage-300 text-ansar-sage-700"
                : "bg-white border-[rgba(61,61,61,0.10)] text-ansar-charcoal hover:bg-ansar-sage-50"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            {selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : "Select All"}
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkEmail(true)}
              disabled={emailableSelected.length === 0}
              className="flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-lg bg-ansar-sage-600 text-white hover:bg-ansar-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MailPlus className="w-3.5 h-3.5" />
              Email {emailableSelected.length > 0 ? `(${emailableSelected.length})` : ""}
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyField="_id"
        onRowClick={(row) => setSelectedAnsar(row)}
        emptyMessage="No ansars in your community."
        emptyIcon={<Users className="w-12 h-12" />}
        actions={(row) => (
          <div className="flex items-center gap-1">
            {row.status === "pending" && (
              <button onClick={() => onApprove(row._id)} className="p-1.5 text-ansar-sage-600 hover:bg-ansar-sage-50 rounded-lg transition-colors" title="Approve">
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => setSelectedAnsar(row)} className="p-1.5 text-ansar-muted hover:text-ansar-sage-600 hover:bg-ansar-sage-50 rounded-lg transition-colors" title="View">
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      />

      <DetailPanel
        isOpen={!!selectedAnsar}
        onClose={() => setSelectedAnsar(null)}
        title={selectedAnsar?.fullName}
        subtitle={selectedAnsar ? `${selectedAnsar.city} • ${selectedAnsar.practiceLevel}` : ""}
        actions={
          selectedAnsar?.status === "pending" ? (
            <button onClick={() => { onApprove(selectedAnsar._id); setSelectedAnsar(null); }} className="btn-primary text-sm py-2 px-5">
              Approve
            </button>
          ) : undefined
        }
      >
        {selectedAnsar && (
          <dl className="space-y-0">
            <DetailField label="Status"><StatusBadge status={selectedAnsar.status} size="md" /></DetailField>
            <EditableField
              label="Full Name"
              value={selectedAnsar.fullName}
              onSave={(v) => onUpdate({ id: selectedAnsar._id, fullName: v })}
            />
            <EditableField
              label="Email"
              type="email"
              value={selectedAnsar.email}
              onSave={(v) => onUpdate({ id: selectedAnsar._id, email: v })}
            />
            <EditableField
              label="Phone"
              type="tel"
              value={selectedAnsar.phone}
              onSave={(v) => onUpdate({ id: selectedAnsar._id, phone: v })}
            />
            <EditableField
              label="City"
              value={selectedAnsar.city}
              onSave={(v) => onUpdate({ id: selectedAnsar._id, city: v })}
            />
            <EditableField
              label="Gender"
              type="select"
              value={selectedAnsar.gender}
              options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]}
              onSave={(v) => onUpdate({ id: selectedAnsar._id, gender: v })}
            />
            <EditableField
              label="Practice Level"
              type="select"
              value={selectedAnsar.practiceLevel}
              options={[
                { value: "consistent", label: "Consistent" },
                { value: "steady", label: "Steady" },
                { value: "reconnecting", label: "Reconnecting" },
              ]}
              onSave={(v) => onUpdate({ id: selectedAnsar._id, practiceLevel: v })}
            />
            <EditableField
              label="Check-In Frequency"
              type="select"
              value={selectedAnsar.checkInFrequency}
              options={[
                { value: "weekly", label: "Weekly" },
                { value: "biweekly", label: "Biweekly" },
                { value: "monthly", label: "Monthly" },
              ]}
              onSave={(v) => onUpdate({ id: selectedAnsar._id, checkInFrequency: v })}
            />
            {selectedAnsar.supportAreas?.length > 0 && (
              <DetailField label="Support Areas">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedAnsar.supportAreas.map((area: string) => (
                    <span key={area} className="bg-ansar-sage-50 text-ansar-sage-700 text-xs px-2 py-0.5 rounded-full font-body capitalize">{area}</span>
                  ))}
                </div>
              </DetailField>
            )}
            <EditableField
              label="Motivation"
              type="textarea"
              value={selectedAnsar.motivation || ""}
              onSave={(v) => onUpdate({ id: selectedAnsar._id, motivation: v })}
            />
            <EditableField
              label="Notes"
              type="textarea"
              value={selectedAnsar.notes || ""}
              onSave={(v) => onUpdate({ id: selectedAnsar._id, notes: v })}
            />
          </dl>
        )}
      </DetailPanel>

      {/* Bulk Email Modal */}
      <BulkEmailModal
        isOpen={showBulkEmail}
        onClose={() => setShowBulkEmail(false)}
        recipients={emailableSelected.map((a: any) => ({ id: a._id, email: a.email, name: a.fullName }))}
        senderName={senderName}
        organizationName={organizationName}
        onSend={onBulkEmail}
        recipientLabel="ansars"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAIRINGS TAB
// ═══════════════════════════════════════════════════════════════

function PartnerPairingsTab({
  pairings, seekers, ansars, search, setSearch, statusFilter, setStatusFilter,
  onMarkIntroSent, onUnpair,
}: {
  pairings: any[]; seekers: any[]; ansars: any[];
  search: string; setSearch: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  onMarkIntroSent: (id: Id<"pairings">) => void;
  onUnpair: (id: Id<"pairings">) => void;
}) {
  const seekerMap = useMemo(() => {
    const m: Record<string, any> = {};
    seekers.forEach((s) => { m[s._id] = s; });
    return m;
  }, [seekers]);

  const ansarMap = useMemo(() => {
    const m: Record<string, any> = {};
    ansars.forEach((a) => { m[a._id] = a; });
    return m;
  }, [ansars]);

  const enriched = useMemo(() =>
    pairings.map((p) => ({
      ...p,
      seekerName: seekerMap[p.seekerId]?.fullName || "Unknown",
      ansarName: ansarMap[p.ansarId]?.fullName || "Unknown",
    })),
    [pairings, seekerMap, ansarMap]
  );

  const filtered = useMemo(() => {
    let result = enriched;
    if (statusFilter) result = result.filter((p) => p.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.seekerName.toLowerCase().includes(q) ||
        p.ansarName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [enriched, search, statusFilter]);

  const stats: StatItem[] = [
    { label: "Total", value: pairings.length, accent: "sage" },
    { label: "Pending Intro", value: pairings.filter((p) => p.status === "pending_intro").length, accent: "ochre" },
    { label: "Active", value: pairings.filter((p) => p.status === "active").length, accent: "success" },
    { label: "Completed", value: pairings.filter((p) => p.status === "completed").length, accent: "muted" },
  ];

  const columns: Column<any>[] = [
    { key: "seekerName", label: "Seeker", sortable: true, render: (r) => <span className="font-medium">{r.seekerName}</span> },
    { key: "ansarName", label: "Ansar", sortable: true, render: (r) => <span className="font-medium">{r.ansarName}</span> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: "pairedAt", label: "Paired", sortable: true, render: (r) => (
      <span className="text-ansar-gray text-xs">{new Date(r.pairedAt).toLocaleDateString()}</span>
    )},
  ];

  return (
    <div className="space-y-5">
      <StatsRow stats={stats} />
      <SearchBar
        placeholder="Search by seeker or ansar name..."
        value={search}
        onChange={setSearch}
        filters={[{
          id: "status", label: "All Statuses", value: statusFilter,
          options: [
            { value: "pending_intro", label: "Pending Intro" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
            { value: "ended", label: "Ended" },
          ],
        }]}
        onFilterChange={(_, v) => setStatusFilter(v)}
      />
      <DataTable
        columns={columns}
        data={filtered}
        keyField="_id"
        emptyMessage="No pairings yet."
        emptyIcon={<Link2 className="w-12 h-12" />}
        actions={(row) => (
          <div className="flex items-center gap-1">
            {row.status === "pending_intro" && (
              <button onClick={() => onMarkIntroSent(row._id)} className="p-1.5 text-ansar-sage-600 hover:bg-ansar-sage-50 rounded-lg transition-colors" title="Mark Intro Sent">
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
            {(row.status === "active" || row.status === "pending_intro") && (
              <button onClick={() => onUnpair(row._id)} className="p-1.5 text-ansar-muted hover:text-ansar-error hover:bg-red-50 rounded-lg transition-colors" title="Unpair">
                <Unlink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MESSAGES TAB
// ═══════════════════════════════════════════════════════════════

function PartnerMessagesTab({
  messages, search, setSearch, statusFilter, setStatusFilter,
}: {
  messages: any[];
  search: string; setSearch: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
}) {
  const filtered = useMemo(() => {
    let result = messages;
    if (statusFilter) result = result.filter((m) => m.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) =>
        (m.recipientEmail?.toLowerCase().includes(q)) ||
        (m.recipientPhone?.includes(q)) ||
        m.template.toLowerCase().includes(q)
      );
    }
    return result;
  }, [messages, search, statusFilter]);

  const stats: StatItem[] = [
    { label: "Total", value: messages.length, accent: "sage" },
    { label: "Sent", value: messages.filter((m) => m.status === "sent").length, accent: "success" },
    { label: "Failed", value: messages.filter((m) => m.status === "failed").length, accent: "terracotta" },
  ];

  const columns: Column<any>[] = [
    { key: "type", label: "Type", render: (r) => <StatusBadge status={r.type} /> },
    { key: "recipient", label: "Recipient", render: (r) => (
      <span className="text-ansar-gray text-xs">{r.recipientEmail || r.recipientPhone || "---"}</span>
    )},
    { key: "template", label: "Template", sortable: true, render: (r) => (
      <span className="font-body text-xs text-ansar-charcoal capitalize">{r.template.replace(/_/g, " ")}</span>
    )},
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: "sentAt", label: "Sent", sortable: true, render: (r) => (
      <span className="text-ansar-gray text-xs">{new Date(r.sentAt).toLocaleString()}</span>
    )},
  ];

  return (
    <div className="space-y-5">
      <StatsRow stats={stats} />
      <SearchBar
        placeholder="Search messages..."
        value={search}
        onChange={setSearch}
        filters={[{
          id: "status", label: "All Statuses", value: statusFilter,
          options: [
            { value: "sent", label: "Sent" },
            { value: "failed", label: "Failed" },
          ],
        }]}
        onFilterChange={(_, v) => setStatusFilter(v)}
      />
      <DataTable
        columns={columns}
        data={filtered}
        keyField="_id"
        emptyMessage="No messages yet."
        emptyIcon={<MessageSquare className="w-12 h-12" />}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EVENTS TAB
// ═══════════════════════════════════════════════════════════════

function PartnerEventsTab({
  events,
  organizationId,
  userId,
}: {
  events: any[];
  organizationId: Id<"organizations">;
  userId: Id<"users">;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const removeEvent = useMutation(api.events.remove);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setLocation("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (event: any) => {
    setTitle(event.title);
    setDescription(event.description || "");
    setDate(event.date);
    setTime(event.time || "");
    setLocation(event.location || "");
    setEditingId(event._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !date) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateEvent({
          eventId: editingId as Id<"events">,
          title: title.trim(),
          description: description.trim() || undefined,
          date,
          time: time.trim() || undefined,
          location: location.trim() || undefined,
        });
      } else {
        await createEvent({
          title: title.trim(),
          description: description.trim() || undefined,
          date,
          time: time.trim() || undefined,
          location: location.trim() || undefined,
          organizationId,
          createdBy: userId,
        });
      }
      resetForm();
    } catch (err) {
      console.error("Failed to save event:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      await removeEvent({ eventId: eventId as Id<"events"> });
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-ansar-gray">
          Create events that appear on your seekers&apos; dashboards.
        </p>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 text-sm font-body font-medium text-white bg-ansar-sage-600 hover:bg-ansar-sage-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.08)] p-6 shadow-sm">
          <h3 className="font-heading text-lg text-ansar-charcoal mb-4">
            {editingId ? "Edit Event" : "Create Event"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block font-body text-xs text-ansar-muted mb-1">Event Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Community Dinner"
                className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal placeholder:text-ansar-muted/50 focus:outline-none focus:border-ansar-sage-400 focus:ring-1 focus:ring-ansar-sage-200"
              />
            </div>
            <div>
              <label className="block font-body text-xs text-ansar-muted mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:border-ansar-sage-400 focus:ring-1 focus:ring-ansar-sage-200"
              />
            </div>
            <div>
              <label className="block font-body text-xs text-ansar-muted mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 6:00 PM"
                className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal placeholder:text-ansar-muted/50 focus:outline-none focus:border-ansar-sage-400 focus:ring-1 focus:ring-ansar-sage-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-body text-xs text-ansar-muted mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Masjid Al-Noor, 123 Main St"
                className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal placeholder:text-ansar-muted/50 focus:outline-none focus:border-ansar-sage-400 focus:ring-1 focus:ring-ansar-sage-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-body text-xs text-ansar-muted mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell seekers what to expect..."
                rows={3}
                className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal placeholder:text-ansar-muted/50 resize-none focus:outline-none focus:border-ansar-sage-400 focus:ring-1 focus:ring-ansar-sage-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!title.trim() || !date || saving}
              className="inline-flex items-center gap-2 text-sm font-body font-medium text-white bg-ansar-sage-600 hover:bg-ansar-sage-700 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 rounded-lg transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editingId ? "Update Event" : "Create Event"}
            </button>
            <button
              onClick={resetForm}
              className="text-sm font-body text-ansar-muted hover:text-ansar-charcoal px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Events List */}
      {events.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Calendar className="w-12 h-12 text-ansar-muted/30 mx-auto mb-4" />
          <h3 className="font-heading text-lg text-ansar-charcoal mb-2">No events yet</h3>
          <p className="font-body text-sm text-ansar-muted max-w-sm mx-auto mb-6">
            Create your first event and it will appear on your seekers&apos; dashboards automatically.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 text-sm font-body font-medium text-white bg-ansar-sage-600 hover:bg-ansar-sage-700 px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const eventDate = new Date(event.date + "T00:00:00");
            const month = eventDate.toLocaleDateString("en-US", { month: "short" });
            const day = eventDate.getDate();
            const fullDate = eventDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={event._id}
                className="bg-white rounded-xl border border-[rgba(61,61,61,0.08)] p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Date badge */}
                  <div className="w-14 h-16 bg-ansar-sage-50 rounded-lg border border-ansar-sage-200 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-body font-medium text-ansar-sage-600 uppercase leading-none">{month}</span>
                    <span className="text-xl font-heading text-ansar-charcoal leading-none mt-0.5">{day}</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-body font-semibold text-ansar-charcoal mb-1">{event.title}</h4>
                    <p className="font-body text-xs text-ansar-gray mb-1">{fullDate}{event.time ? ` at ${event.time}` : ""}</p>
                    {event.location && (
                      <p className="font-body text-xs text-ansar-muted flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="font-body text-xs text-ansar-gray mt-2 line-clamp-2">{event.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 text-ansar-muted hover:text-ansar-sage-600 hover:bg-ansar-sage-50 rounded-lg transition-colors"
                      title="Edit event"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="p-2 text-ansar-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONTACTS TAB
// ═══════════════════════════════════════════════════════════════

function PartnerContactsTab({
  contacts, organizationId, search, setSearch, statusFilter, setStatusFilter, onCreate, onUpdate, onDelete,
}: {
  contacts: any[];
  organizationId: Id<"organizations">;
  search: string; setSearch: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  onCreate: (args: any) => Promise<any>;
  onUpdate: (args: any) => Promise<any>;
  onDelete: (id: Id<"contacts">) => void;
}) {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = contacts;
    if (statusFilter) result = result.filter((c) => c.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.city?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [contacts, search, statusFilter]);

  const stats: StatItem[] = [
    { label: "Total", value: contacts.length, accent: "sage" },
    { label: "Active", value: contacts.filter((c) => c.status === "active").length, accent: "success" },
    { label: "Imams", value: contacts.filter((c) => c.role === "imam").length, accent: "ochre" },
    { label: "Donors", value: contacts.filter((c) => c.role === "donor").length, accent: "terracotta" },
  ];

  const roleLabels: Record<string, string> = {
    imam: "Imam",
    donor: "Donor",
    community_member: "Community Member",
    family_member: "Family Member",
    scholar: "Scholar",
    volunteer: "Volunteer",
    other: "Other",
  };

  const columns: Column<any>[] = [
    { key: "fullName", label: "Name", sortable: true, render: (r) => <span className="font-medium">{r.fullName}</span> },
    { key: "phone", label: "Phone", render: (r) => <span className="text-ansar-gray text-xs">{r.phone || "—"}</span> },
    { key: "role", label: "Role", sortable: true, render: (r) => <StatusBadge status={r.role} /> },
    { key: "city", label: "City", sortable: true, render: (r) => r.city || "—" },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <StatsRow stats={stats} />
      <div className="flex items-center justify-between gap-4">
        <SearchBar
          placeholder="Search contacts..."
          value={search}
          onChange={setSearch}
          filters={[{
            id: "status", label: "All Statuses", value: statusFilter,
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          }]}
          onFilterChange={(_, v) => setStatusFilter(v)}
        />
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary text-sm py-2 px-4 whitespace-nowrap"
        >
          + Add Contact
        </button>
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        keyField="_id"
        onRowClick={(row) => setSelectedContact(row)}
        emptyMessage="No contacts in your community."
        emptyIcon={<BookUser className="w-12 h-12" />}
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button onClick={() => setSelectedContact(row)} className="p-1.5 text-ansar-muted hover:text-ansar-sage-600 hover:bg-ansar-sage-50 rounded-lg transition-colors" title="View">
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(row._id)} className="p-1.5 text-ansar-muted hover:text-ansar-error hover:bg-red-50 rounded-lg transition-colors" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      />

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        organizationId={organizationId}
        onCreate={onCreate}
      />

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        title={selectedContact?.fullName}
        subtitle={selectedContact ? `${roleLabels[selectedContact.role] || selectedContact.role}${selectedContact.city ? ` • ${selectedContact.city}` : ""}` : ""}
      >
        {selectedContact && (
          <dl className="space-y-0">
            <DetailField label="Status"><StatusBadge status={selectedContact.status} size="md" /></DetailField>
            <EditableField
              label="Full Name"
              value={selectedContact.fullName}
              onSave={(v) => onUpdate({ id: selectedContact._id, fullName: v })}
            />
            <EditableField
              label="Email"
              type="email"
              value={selectedContact.email || ""}
              onSave={(v) => onUpdate({ id: selectedContact._id, email: v })}
            />
            <EditableField
              label="Phone"
              type="tel"
              value={selectedContact.phone || ""}
              onSave={(v) => onUpdate({ id: selectedContact._id, phone: v })}
            />
            <EditableField
              label="Role"
              type="select"
              value={selectedContact.role}
              options={[
                { value: "imam", label: "Imam" },
                { value: "donor", label: "Donor" },
                { value: "community_member", label: "Community Member" },
                { value: "family_member", label: "Family Member" },
                { value: "scholar", label: "Scholar" },
                { value: "volunteer", label: "Volunteer" },
                { value: "other", label: "Other" },
              ]}
              onSave={(v) => onUpdate({ id: selectedContact._id, role: v })}
            />
            {selectedContact.role === "other" && (
              <EditableField
                label="Role (Other)"
                value={selectedContact.roleOther || ""}
                onSave={(v) => onUpdate({ id: selectedContact._id, roleOther: v })}
              />
            )}
            <EditableField
              label="Gender"
              type="select"
              value={selectedContact.gender || ""}
              options={[
                { value: "", label: "Not specified" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
              ]}
              onSave={(v) => onUpdate({ id: selectedContact._id, gender: v || undefined })}
            />
            <EditableField
              label="City"
              value={selectedContact.city || ""}
              onSave={(v) => onUpdate({ id: selectedContact._id, city: v })}
            />
            <EditableField
              label="State/Region"
              value={selectedContact.stateRegion || ""}
              onSave={(v) => onUpdate({ id: selectedContact._id, stateRegion: v })}
            />
            <EditableField
              label="Address"
              value={selectedContact.address || ""}
              onSave={(v) => onUpdate({ id: selectedContact._id, address: v })}
            />
            {selectedContact.tags?.length > 0 && (
              <DetailField label="Tags">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedContact.tags.map((tag: string) => (
                    <span key={tag} className="bg-ansar-ochre-50 text-ansar-ochre-700 text-xs px-2 py-0.5 rounded-full font-body">{tag}</span>
                  ))}
                </div>
              </DetailField>
            )}
            <EditableField
              label="Notes"
              type="textarea"
              value={selectedContact.notes || ""}
              onSave={(v) => onUpdate({ id: selectedContact._id, notes: v })}
            />
          </dl>
        )}
      </DetailPanel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADD CONTACT MODAL
// ═══════════════════════════════════════════════════════════════

function AddContactModal({
  isOpen, onClose, organizationId, onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  organizationId: Id<"organizations">;
  onCreate: (args: any) => Promise<any>;
}) {
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    phone: string;
    role: "imam" | "donor" | "community_member" | "family_member" | "scholar" | "volunteer" | "other";
    roleOther: string;
    city: string;
    notes: string;
  }>({
    fullName: "",
    email: "",
    phone: "",
    role: "community_member",
    roleOther: "",
    city: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      alert("Please enter a name");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate({
        fullName: formData.fullName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        roleOther: formData.role === "other" ? formData.roleOther.trim() : undefined,
        city: formData.city.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        organizationId,
      });
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        role: "community_member",
        roleOther: "",
        city: "",
        notes: "",
      });
      onClose();
    } catch (error) {
      console.error("Failed to create contact:", error);
      alert("Failed to create contact. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[520px] md:max-h-[85vh] bg-white rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[rgba(61,61,61,0.08)] flex items-center justify-between">
              <h3 className="font-heading text-lg text-ansar-charcoal">Add Contact</h3>
              <button onClick={onClose} className="p-1 text-ansar-muted hover:text-ansar-charcoal rounded-lg transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">
                    Full Name <span className="text-ansar-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400"
                    required
                  />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400"
                  >
                    <option value="community_member">Community Member</option>
                    <option value="imam">Imam</option>
                    <option value="donor">Donor</option>
                    <option value="family_member">Family Member</option>
                    <option value="scholar">Scholar</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {formData.role === "other" && (
                  <div>
                    <label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">
                      Role (Other)
                    </label>
                    <input
                      type="text"
                      value={formData.roleOther}
                      onChange={(e) => setFormData({ ...formData, roleOther: e.target.value })}
                      className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400"
                    />
                  </div>
                )}
                <div>
                  <label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400 resize-none"
                  />
                </div>
              </div>
            </form>
            <div className="px-6 py-4 border-t border-[rgba(61,61,61,0.08)] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline text-sm py-2 px-4"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="btn-primary text-sm py-2 px-5"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Contact"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// BULK EMAIL MODAL
// ═══════════════════════════════════════════════════════════════

function BulkEmailModal({
  isOpen, onClose, recipients, senderName, organizationName, onSend, recipientLabel,
}: {
  isOpen: boolean;
  onClose: () => void;
  recipients: { id: string; email: string; name: string }[];
  senderName: string;
  organizationName: string;
  onSend: (args: any) => Promise<any>;
  recipientLabel: string;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [result, setResult] = useState<{ scheduled: number; total: number } | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubject("");
      setMessage("");
      setIsSending(false);
      setSent(false);
      setResult(null);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim() || recipients.length === 0) return;

    setIsSending(true);
    try {
      const res = await onSend({
        recipients,
        subject: subject.trim(),
        message: message.trim(),
        senderName,
        organizationName,
      });
      setResult(res);
      setSent(true);
    } catch (error) {
      console.error("Failed to send bulk email:", error);
      alert("Failed to send emails. Please try again.");
    } finally {
      setIsSending(false);
    }
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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[560px] md:max-h-[85vh] bg-white rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[rgba(61,61,61,0.08)] flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg text-ansar-charcoal flex items-center gap-2">
                  <MailPlus className="w-5 h-5 text-ansar-sage-600" />
                  Email {recipients.length} {recipientLabel}
                </h3>
                <p className="font-body text-xs text-ansar-muted mt-0.5">
                  Send a branded email to selected {recipientLabel} via Ansar Family
                </p>
              </div>
              <button onClick={onClose} className="p-1 text-ansar-muted hover:text-ansar-charcoal rounded-lg transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {sent ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-ansar-sage-600 mx-auto mb-4" />
                <p className="font-heading text-xl text-ansar-charcoal mb-2">Emails Queued!</p>
                <p className="font-body text-sm text-ansar-gray">
                  {result?.scheduled || recipients.length} email{(result?.scheduled || recipients.length) !== 1 ? "s" : ""} are being sent to your {recipientLabel}.
                  They&apos;ll arrive within the next few minutes.
                </p>
                <button
                  onClick={onClose}
                  className="btn-primary mt-6 text-sm py-2 px-6"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {/* Recipient Preview */}
                  <div>
                    <label className="block font-body text-xs font-medium text-ansar-muted uppercase tracking-wide mb-2">
                      Recipients ({recipients.length})
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {recipients.slice(0, 20).map((r) => (
                        <span
                          key={r.id}
                          className="inline-flex items-center gap-1 bg-ansar-sage-50 text-ansar-sage-700 text-[11px] font-body px-2 py-0.5 rounded-full"
                        >
                          <Mail className="w-2.5 h-2.5" />
                          {r.name.split(" ")[0]}
                        </span>
                      ))}
                      {recipients.length > 20 && (
                        <span className="inline-flex items-center text-[11px] font-body text-ansar-muted px-2 py-0.5">
                          +{recipients.length - 20} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">
                      Subject <span className="text-ansar-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Monthly Dinner — This Saturday!"
                      className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400"
                    />
                  </div>

                  {/* Message Body */}
                  <div>
                    <label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">
                      Message <span className="text-ansar-error">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Write your message to ${recipients.length} ${recipientLabel}...\n\nExample: Assalamu Alaikum! We're hosting our monthly community dinner this Saturday at 6pm. Bring your family and a dish to share. We'd love to see you there!`}
                      rows={7}
                      className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400 resize-none"
                    />
                    <p className="font-body text-[10px] text-ansar-muted mt-1.5">
                      Each email will start with &quot;Assalamu Alaikum, [First Name]&quot; and end with &quot;— {senderName}, {organizationName}&quot;
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[rgba(61,61,61,0.08)] flex items-center justify-between">
                  <p className="font-body text-xs text-ansar-muted">
                    Sent from: <span className="font-medium">welcome@ansar.family</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <button onClick={onClose} className="btn-outline text-sm py-2 px-4" disabled={isSending}>
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={isSending || !subject.trim() || !message.trim()}
                      className="btn-primary text-sm py-2 px-5 disabled:opacity-50"
                    >
                      {isSending ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</span>
                      ) : (
                        <span className="flex items-center gap-2"><Send className="w-3.5 h-3.5" /> Send to {recipients.length} {recipientLabel}</span>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
