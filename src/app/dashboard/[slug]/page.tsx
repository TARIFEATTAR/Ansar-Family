"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ArrowLeft, Heart, Users, Building2, Link2, MessageSquare,
  LayoutDashboard, Loader2, Trash2, Eye, Check,
  UserPlus, Unlink, Send, Phone, Mail, MapPin, Clock,
  X as XIcon, BookUser,
} from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  TabNav, DataTable, SearchBar, StatusBadge,
  StatsRow, DetailPanel, DetailField, EditableField,
} from "@/components/crm";
import type { Tab, Column, StatItem } from "@/components/crm";
import { AnimatePresence, motion } from "framer-motion";

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

  // Organization-scoped data
  const seekers = useQuery(api.intakes.listByOrganization, { organizationId: organization._id }) ?? [];
  const ansars = useQuery(api.ansars.listByOrganization, { organizationId: organization._id }) ?? [];
  const contacts = useQuery(api.contacts.listByOrganization, { organizationId: organization._id }) ?? [];
  const pairings = useQuery(api.pairings.listByOrganization, { organizationId: organization._id }) ?? [];
  const pairingStats = useQuery(api.pairings.getOrgStats, { organizationId: organization._id });
  const readyToPair = useQuery(api.intakes.listReadyForPairing, { organizationId: organization._id }) ?? [];
  const availableAnsars = useQuery(api.ansars.listAvailableForPairing, { organizationId: organization._id }) ?? [];
  const messages = useQuery(api.messages.listAll) ?? []; // Will filter client-side

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

  // Org-scoped messages: filter messages where recipientId matches any seeker/ansar in this org
  const orgRecipientIds = useMemo(() => {
    const ids = new Set<string>();
    seekers.forEach((s) => ids.add(s._id));
    ansars.forEach((a) => ids.add(a._id));
    return ids;
  }, [seekers, ansars]);

  const orgMessages = useMemo(
    () => messages.filter((m) => orgRecipientIds.has(m.recipientId)),
    [messages, orgRecipientIds]
  );

  // Counts
  const pendingCount = readyToPair.length + ansars.filter((a) => a.status === "pending").length;

  const tabs: Tab[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "seekers", label: "Seekers", icon: <Heart className="w-4 h-4" />, count: seekers.length },
    { id: "ansars", label: "Ansars", icon: <Users className="w-4 h-4" />, count: ansars.length },
    { id: "contacts", label: "Contacts", icon: <BookUser className="w-4 h-4" />, count: contacts.length },
    { id: "pairings", label: "Pairings", icon: <Link2 className="w-4 h-4" />, count: pairings.length },
    { id: "messages", label: "Messages", icon: <MessageSquare className="w-4 h-4" />, count: orgMessages.length },
  ];

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

  return (
    <main className="min-h-screen bg-ansar-cream">
      {/* Header */}
      <header className="px-6 md:px-8 py-4 border-b border-[rgba(61,61,61,0.08)] bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-ansar-muted hover:text-ansar-charcoal transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Building2 className="w-4 h-4 text-ansar-sage-600" />
            <div>
              <h1 className="font-heading text-lg text-ansar-charcoal leading-tight">{organization.name}</h1>
              <p className="font-body text-[11px] text-ansar-muted">
                {orgTypeLabel[organization.type] || organization.type} &middot; {organization.city} &middot; Level {organization.hubLevel}
              </p>
            </div>
            {pendingCount > 0 && (
              <span className="bg-ansar-terracotta-100 text-ansar-terracotta-700 text-[10px] font-body font-medium px-2 py-0.5 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {currentUser && (
              <span className="font-body text-xs text-ansar-muted hidden sm:inline">
                {currentUser.name}
              </span>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div className="px-6 md:px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === "overview" && (
            <PartnerOverviewTab
              seekers={seekers}
              ansars={ansars}
              contacts={contacts}
              pairings={pairings}
              pairingStats={pairingStats}
              readyToPair={readyToPair}
              orgMessages={orgMessages}
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
          {activeTab === "messages" && (
            <PartnerMessagesTab
              messages={orgMessages}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          )}
        </div>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════

function PartnerOverviewTab({
  seekers, ansars, contacts, pairings, pairingStats, readyToPair, orgMessages,
}: {
  seekers: any[]; ansars: any[]; contacts: any[]; pairings: any[];
  pairingStats: any; readyToPair: any[]; orgMessages: any[];
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
  onPair, onDelete, onUpdate,
}: {
  seekers: any[]; availableAnsars: any[];
  search: string; setSearch: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  onPair: (seekerId: Id<"intakes">, ansarId: Id<"ansars">) => void;
  onDelete: (id: Id<"intakes">) => void;
  onUpdate: (args: any) => Promise<any>;
}) {
  const [selectedSeeker, setSelectedSeeker] = useState<any>(null);
  const [pairingSeeker, setPairingSeeker] = useState<Id<"intakes"> | null>(null);

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

  const stats: StatItem[] = [
    { label: "Total", value: seekers.length, accent: "sage" },
    { label: "Disconnected", value: seekers.filter((s) => s.status === "disconnected").length, accent: "terracotta" },
    { label: "Triaged", value: seekers.filter((s) => s.status === "triaged").length, accent: "ochre" },
    { label: "Connected", value: seekers.filter((s) => s.status === "connected" || s.status === "active").length, accent: "success" },
  ];

  const columns: Column<any>[] = [
    { key: "fullName", label: "Name", sortable: true, render: (r) => <span className="font-medium">{r.fullName}</span> },
    { key: "phone", label: "Phone", render: (r) => <span className="text-ansar-gray text-xs">{r.phone}</span> },
    { key: "city", label: "City", sortable: true, render: (r) => r.city },
    { key: "journeyType", label: "Journey", render: (r) => <StatusBadge status={r.journeyType} /> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <StatsRow stats={stats} />
      <SearchBar
        placeholder="Search seekers..."
        value={search}
        onChange={setSearch}
        filters={[{
          id: "status", label: "All Statuses", value: statusFilter,
          options: [
            { value: "disconnected", label: "Disconnected" },
            { value: "triaged", label: "Triaged" },
            { value: "connected", label: "Connected" },
          ],
        }]}
        onFilterChange={(_, v) => setStatusFilter(v)}
      />
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
      >
        {selectedSeeker && (
          <dl className="space-y-0">
            <DetailField label="Status"><StatusBadge status={selectedSeeker.status} size="md" /></DetailField>
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
// ANSARS TAB
// ═══════════════════════════════════════════════════════════════

function PartnerAnsarsTab({
  ansars, search, setSearch, statusFilter, setStatusFilter, onApprove, onUpdate,
}: {
  ansars: any[];
  search: string; setSearch: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  onApprove: (id: Id<"ansars">) => void;
  onUpdate: (args: any) => Promise<any>;
}) {
  const [selectedAnsar, setSelectedAnsar] = useState<any>(null);

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

  const stats: StatItem[] = [
    { label: "Total", value: ansars.length, accent: "sage" },
    { label: "Pending", value: ansars.filter((a) => a.status === "pending").length, accent: "terracotta" },
    { label: "Approved", value: ansars.filter((a) => a.status === "approved").length, accent: "ochre" },
    { label: "Active", value: ansars.filter((a) => a.status === "active").length, accent: "success" },
  ];

  const columns: Column<any>[] = [
    { key: "fullName", label: "Name", sortable: true, render: (r) => <span className="font-medium">{r.fullName}</span> },
    { key: "phone", label: "Phone", render: (r) => <span className="text-ansar-gray text-xs">{r.phone}</span> },
    { key: "city", label: "City", sortable: true, render: (r) => r.city },
    { key: "practiceLevel", label: "Practice", render: (r) => <StatusBadge status={r.practiceLevel} /> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <StatsRow stats={stats} />
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
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "community_member" as const,
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
