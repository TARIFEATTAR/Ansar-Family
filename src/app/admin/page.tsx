"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import {
  ArrowLeft, Heart, Users, Building2, Link2, MessageSquare,
  LayoutDashboard, Shield, Loader2, Trash2, CheckCircle2,
  Phone, Mail, MapPin, Clock, Eye, Check, X as XIcon,
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  TabNav, DataTable, SearchBar, StatusBadge,
  StatsRow, DetailPanel, DetailField, EditableField,
} from "@/components/crm";
import type { Tab, Column, StatItem } from "@/components/crm";

/**
 * SUPER ADMIN DASHBOARD — CRM-Style Central Command
 */

export default function AdminPage() {
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

  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <Loader2 className="w-8 h-8 text-ansar-sage-600 animate-spin" />
      </main>
    );
  }

  if (!currentUser && user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-ansar-sage-600 animate-spin" />
          <p className="text-ansar-gray font-body">Syncing admin profile...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-ansar-charcoal mb-4">Admin Access</h1>
          <p className="font-body text-ansar-gray mb-6">Please sign in to access the admin dashboard.</p>
          <a href="/sign-in" className="btn-primary inline-block">Sign In</a>
        </div>
      </main>
    );
  }

  return <AdminDashboard currentUser={currentUser} />;
}

// ═══════════════════════════════════════════════════════════════
// MAIN CRM DASHBOARD
// ═══════════════════════════════════════════════════════════════

function AdminDashboard({ currentUser }: { currentUser: { role: string; name: string } | null | undefined }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Data
  const intakes = useQuery(api.intakes.listAll) ?? [];
  const ansars = useQuery(api.ansars.listAll) ?? [];
  const partners = useQuery(api.partners.listAll) ?? [];
  const pairings = useQuery(api.pairings.listAll) ?? [];
  const messages = useQuery(api.messages.listAll) ?? [];

  // Mutations
  const updateIntakeStatus = useMutation(api.intakes.updateStatus);
  const updateIntake = useMutation(api.intakes.update);
  const updateAnsarStatus = useMutation(api.ansars.updateStatus);
  const updateAnsar = useMutation(api.ansars.update);
  const approvePartner = useMutation(api.partners.approveAndCreateOrg);
  const updatePartner = useMutation(api.partners.update);
  const deleteIntake = useMutation(api.intakes.deleteIntake);
  const deleteAnsar = useMutation(api.ansars.deleteAnsar);
  const deletePartner = useMutation(api.partners.deletePartner);
  const rejectPartner = useMutation(api.partners.rejectPartner);
  const clearAllData = useMutation(api.admin.clearAllData);

  // Counts
  const pendingCount =
    intakes.filter((i) => i.status === "disconnected").length +
    ansars.filter((a) => a.status === "pending").length +
    partners.filter((p) => p.status === "pending").length;

  // Tabs
  const tabs: Tab[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "seekers", label: "Seekers", icon: <Heart className="w-4 h-4" />, count: intakes.length },
    { id: "ansars", label: "Ansars", icon: <Users className="w-4 h-4" />, count: ansars.length },
    { id: "partners", label: "Partners", icon: <Building2 className="w-4 h-4" />, count: partners.length },
    { id: "pairings", label: "Pairings", icon: <Link2 className="w-4 h-4" />, count: pairings.length },
    { id: "messages", label: "Messages", icon: <MessageSquare className="w-4 h-4" />, count: messages.length },
  ];

  // Handlers
  const handleDeleteIntake = useCallback(async (id: Id<"intakes">) => {
    if (confirm("Delete this seeker? This cannot be undone.")) await deleteIntake({ id });
  }, [deleteIntake]);

  const handleApproveAnsar = useCallback(async (id: Id<"ansars">) => {
    await updateAnsarStatus({ id, status: "approved" });
  }, [updateAnsarStatus]);

  const handleDeleteAnsar = useCallback(async (id: Id<"ansars">) => {
    if (confirm("Delete this Ansar? This cannot be undone.")) await deleteAnsar({ id });
  }, [deleteAnsar]);

  const handleApprovePartner = useCallback(async (id: Id<"partners">) => {
    await approvePartner({ id });
  }, [approvePartner]);

  const handleRejectPartner = useCallback(async (id: Id<"partners">) => {
    if (confirm("Reject this Partner application?")) await rejectPartner({ id });
  }, [rejectPartner]);

  const handleDeletePartner = useCallback(async (id: Id<"partners">) => {
    if (confirm("Delete this Partner? This cannot be undone.")) await deletePartner({ id });
  }, [deletePartner]);

  const handleTriageSeeker = useCallback(async (id: Id<"intakes">) => {
    await updateIntakeStatus({ id, status: "triaged" });
  }, [updateIntakeStatus]);

  const handleClearAllData = useCallback(async () => {
    const confirmation = prompt("WARNING: This will delete ALL data. Type 'DELETE ALL' to confirm:");
    if (confirmation === "DELETE ALL") {
      const result = await clearAllData();
      alert(`Deleted:\n- ${result.deleted.intakes} Intakes\n- ${result.deleted.ansars} Ansars\n- ${result.deleted.partners} Partners\n- ${result.deleted.organizations} Organizations`);
    }
  }, [clearAllData]);

  return (
    <main className="min-h-screen bg-ansar-cream">
      {/* Header */}
      <header className="px-6 md:px-8 py-4 border-b border-[rgba(61,61,61,0.08)] bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-ansar-muted hover:text-ansar-charcoal transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Shield className="w-4 h-4 text-ansar-sage-600" />
            <h1 className="font-heading text-lg text-ansar-charcoal">Super Admin</h1>
            {pendingCount > 0 && (
              <span className="bg-ansar-terracotta-100 text-ansar-terracotta-700 text-[10px] font-body font-medium px-2 py-0.5 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearAllData}
              className="text-[11px] text-ansar-error border border-ansar-error/20 px-2.5 py-1 rounded-lg hover:bg-ansar-error/5 transition-colors font-body"
            >
              Clear Data
            </button>
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
            <OverviewTab
              intakes={intakes}
              ansars={ansars}
              partners={partners}
              pairings={pairings}
              messages={messages}
            />
          )}
          {activeTab === "seekers" && (
            <SeekersTab
              intakes={intakes}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onTriage={handleTriageSeeker}
              onDelete={handleDeleteIntake}
              onUpdate={updateIntake}
            />
          )}
          {activeTab === "ansars" && (
            <AnsarsTab
              ansars={ansars}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onApprove={handleApproveAnsar}
              onDelete={handleDeleteAnsar}
              onUpdate={updateAnsar}
            />
          )}
          {activeTab === "partners" && (
            <PartnersTab
              partners={partners}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onApprove={handleApprovePartner}
              onReject={handleRejectPartner}
              onDelete={handleDeletePartner}
              onUpdate={updatePartner}
            />
          )}
          {activeTab === "pairings" && (
            <PairingsTab
              pairings={pairings}
              intakes={intakes}
              ansars={ansars}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          )}
          {activeTab === "messages" && (
            <MessagesTab
              messages={messages}
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

function OverviewTab({
  intakes, ansars, partners, pairings, messages,
}: {
  intakes: any[]; ansars: any[]; partners: any[]; pairings: any[]; messages: any[];
}) {
  const stats: StatItem[] = [
    { label: "Seekers", value: intakes.length, icon: <Heart className="w-4 h-4" />, accent: "terracotta" },
    { label: "Ansars", value: ansars.length, icon: <Users className="w-4 h-4" />, accent: "sage" },
    { label: "Partners", value: partners.length, icon: <Building2 className="w-4 h-4" />, accent: "ochre" },
    { label: "Active Pairings", value: pairings.filter((p) => p.status === "active" || p.status === "pending_intro").length, icon: <Link2 className="w-4 h-4" />, accent: "success" },
    { label: "Pending", value: intakes.filter((i) => i.status === "disconnected").length + ansars.filter((a) => a.status === "pending").length + partners.filter((p) => p.status === "pending").length, icon: <Clock className="w-4 h-4" />, accent: "terracotta" },
    { label: "Messages Sent", value: messages.filter((m) => m.status === "sent").length, icon: <MessageSquare className="w-4 h-4" />, accent: "muted" },
  ];

  const recentSeekers = intakes.slice(0, 5);
  const recentPairings = pairings.slice(0, 5);

  return (
    <div className="space-y-8">
      <StatsRow stats={stats} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Seekers */}
        <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.08)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(61,61,61,0.06)]">
            <h3 className="font-heading text-base text-ansar-charcoal flex items-center gap-2">
              <Heart className="w-4 h-4 text-ansar-terracotta-600" />
              Recent Seekers
            </h3>
          </div>
          <div className="divide-y divide-[rgba(61,61,61,0.04)]">
            {recentSeekers.length === 0 ? (
              <p className="px-5 py-6 text-center font-body text-sm text-ansar-muted">No seekers yet.</p>
            ) : (
              recentSeekers.map((s) => (
                <div key={s._id} className="px-5 py-3 flex items-center justify-between hover:bg-ansar-sage-50/30 transition-colors">
                  <div>
                    <p className="font-body text-sm text-ansar-charcoal font-medium">{s.fullName}</p>
                    <p className="font-body text-xs text-ansar-muted">{s.city}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Pairings */}
        <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.08)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(61,61,61,0.06)]">
            <h3 className="font-heading text-base text-ansar-charcoal flex items-center gap-2">
              <Link2 className="w-4 h-4 text-ansar-sage-600" />
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
// SEEKERS TAB
// ═══════════════════════════════════════════════════════════════

function SeekersTab({
  intakes, search, setSearch, statusFilter, setStatusFilter, onTriage, onDelete, onUpdate,
}: {
  intakes: any[]; search: string; setSearch: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  onTriage: (id: Id<"intakes">) => void; onDelete: (id: Id<"intakes">) => void;
  onUpdate: (args: any) => Promise<any>;
}) {
  const [selectedSeeker, setSelectedSeeker] = useState<any>(null);

  const filtered = useMemo(() => {
    let result = intakes;
    if (statusFilter) result = result.filter((i) => i.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) =>
        i.fullName.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.city.toLowerCase().includes(q) ||
        i.phone.includes(q)
      );
    }
    return result;
  }, [intakes, search, statusFilter]);

  const stats: StatItem[] = [
    { label: "Total", value: intakes.length, accent: "sage" },
    { label: "Disconnected", value: intakes.filter((i) => i.status === "disconnected").length, accent: "terracotta" },
    { label: "Triaged", value: intakes.filter((i) => i.status === "triaged").length, accent: "ochre" },
    { label: "Connected", value: intakes.filter((i) => i.status === "connected" || i.status === "active").length, accent: "success" },
  ];

  const columns: Column<any>[] = [
    { key: "fullName", label: "Name", sortable: true, render: (r) => <span className="font-medium">{r.fullName}</span> },
    { key: "email", label: "Email", sortable: true, render: (r) => <span className="text-ansar-gray">{r.email}</span> },
    { key: "phone", label: "Phone", render: (r) => <span className="text-ansar-gray">{r.phone}</span> },
    { key: "city", label: "City", sortable: true, render: (r) => r.city },
    { key: "journeyType", label: "Journey", render: (r) => <StatusBadge status={r.journeyType} /> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <StatsRow stats={stats} />
      <SearchBar
        placeholder="Search seekers by name, email, city..."
        value={search}
        onChange={setSearch}
        filters={[{
          id: "status", label: "All Statuses", value: statusFilter,
          options: [
            { value: "disconnected", label: "Disconnected" },
            { value: "triaged", label: "Triaged" },
            { value: "connected", label: "Connected" },
            { value: "active", label: "Active" },
          ],
        }]}
        onFilterChange={(_, v) => setStatusFilter(v)}
      />
      <DataTable
        columns={columns}
        data={filtered}
        keyField="_id"
        onRowClick={(row) => setSelectedSeeker(row)}
        emptyMessage="No seekers found."
        emptyIcon={<Heart className="w-12 h-12" />}
        actions={(row) => (
          <div className="flex items-center gap-1">
            {row.status === "disconnected" && (
              <button onClick={() => onTriage(row._id)} className="p-1.5 text-ansar-sage-600 hover:bg-ansar-sage-50 rounded-lg transition-colors" title="Triage">
                <Check className="w-3.5 h-3.5" />
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
              label="State/Region"
              value={selectedSeeker.stateRegion || ""}
              onSave={(v) => onUpdate({ id: selectedSeeker._id, stateRegion: v })}
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
            <EditableField
              label="Address"
              value={selectedSeeker.address || ""}
              onSave={(v) => onUpdate({ id: selectedSeeker._id, address: v })}
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
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ANSARS TAB
// ═══════════════════════════════════════════════════════════════

function AnsarsTab({
  ansars, search, setSearch, statusFilter, setStatusFilter, onApprove, onDelete, onUpdate,
}: {
  ansars: any[]; search: string; setSearch: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  onApprove: (id: Id<"ansars">) => void; onDelete: (id: Id<"ansars">) => void;
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
        a.email.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.phone.includes(q)
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
    { key: "email", label: "Email", sortable: true, render: (r) => <span className="text-ansar-gray">{r.email}</span> },
    { key: "phone", label: "Phone", render: (r) => <span className="text-ansar-gray">{r.phone}</span> },
    { key: "city", label: "City", sortable: true, render: (r) => r.city },
    { key: "practiceLevel", label: "Practice", render: (r) => <StatusBadge status={r.practiceLevel} /> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <StatsRow stats={stats} />
      <SearchBar
        placeholder="Search ansars by name, email, city..."
        value={search}
        onChange={setSearch}
        filters={[{
          id: "status", label: "All Statuses", value: statusFilter,
          options: [
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ],
        }]}
        onFilterChange={(_, v) => setStatusFilter(v)}
      />
      <DataTable
        columns={columns}
        data={filtered}
        keyField="_id"
        onRowClick={(row) => setSelectedAnsar(row)}
        emptyMessage="No ansars found."
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
            <button onClick={() => onDelete(row._id)} className="p-1.5 text-ansar-muted hover:text-ansar-error hover:bg-red-50 rounded-lg transition-colors" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
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
              label="State/Region"
              value={selectedAnsar.stateRegion || ""}
              onSave={(v) => onUpdate({ id: selectedAnsar._id, stateRegion: v })}
            />
            <EditableField
              label="Gender"
              type="select"
              value={selectedAnsar.gender}
              options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]}
              onSave={(v) => onUpdate({ id: selectedAnsar._id, gender: v })}
            />
            <EditableField
              label="Address"
              value={selectedAnsar.address || ""}
              onSave={(v) => onUpdate({ id: selectedAnsar._id, address: v })}
            />
            <EditableField
              label="Is Convert"
              type="checkbox"
              value={selectedAnsar.isConvert}
              onSave={(v) => onUpdate({ id: selectedAnsar._id, isConvert: v })}
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
            {selectedAnsar.knowledgeBackground?.length > 0 && (
              <DetailField label="Knowledge Background">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedAnsar.knowledgeBackground.map((kb: string) => (
                    <span key={kb} className="bg-ansar-ochre-50 text-ansar-ochre-700 text-xs px-2 py-0.5 rounded-full font-body">{kb}</span>
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
// PARTNERS TAB
// ═══════════════════════════════════════════════════════════════

function PartnersTab({
  partners, search, setSearch, statusFilter, setStatusFilter, onApprove, onReject, onDelete, onUpdate,
}: {
  partners: any[]; search: string; setSearch: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  onApprove: (id: Id<"partners">) => void; onReject: (id: Id<"partners">) => void; onDelete: (id: Id<"partners">) => void;
  onUpdate: (args: any) => Promise<any>;
}) {
  const [selectedPartner, setSelectedPartner] = useState<any>(null);

  const orgTypeLabels: Record<string, string> = {
    masjid: "Masjid", msa: "MSA", nonprofit: "Nonprofit",
    informal_circle: "Circle", other: "Other",
  };

  const filtered = useMemo(() => {
    let result = partners;
    if (statusFilter) result = result.filter((p) => p.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.orgName.toLowerCase().includes(q) ||
        p.leadName.toLowerCase().includes(q) ||
        p.leadEmail.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
      );
    }
    return result;
  }, [partners, search, statusFilter]);

  const stats: StatItem[] = [
    { label: "Total", value: partners.length, accent: "ochre" },
    { label: "Pending", value: partners.filter((p) => p.status === "pending").length, accent: "terracotta" },
    { label: "Approved", value: partners.filter((p) => p.status === "approved" || p.status === "active").length, accent: "success" },
  ];

  const columns: Column<any>[] = [
    { key: "orgName", label: "Organization", sortable: true, render: (r) => <span className="font-medium">{r.orgName}</span> },
    { key: "leadName", label: "Lead", sortable: true, render: (r) => <span className="text-ansar-gray">{r.leadName}</span> },
    { key: "city", label: "City", sortable: true, render: (r) => r.city },
    { key: "orgType", label: "Type", render: (r) => <span className="text-ansar-gray">{orgTypeLabels[r.orgType] || r.orgType}</span> },
    { key: "hubLevel", label: "Level", sortable: true, render: (r) => (
      <span className="bg-ansar-sage-100 text-ansar-sage-700 text-[11px] px-2 py-0.5 rounded-full font-body font-medium">
        L{r.hubLevel}
      </span>
    )},
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <StatsRow stats={stats} />
      <SearchBar
        placeholder="Search partners by org name, lead, city..."
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
        onRowClick={(row) => setSelectedPartner(row)}
        emptyMessage="No partners found."
        emptyIcon={<Building2 className="w-12 h-12" />}
        actions={(row) => (
          <div className="flex items-center gap-1">
            {row.status === "pending" && (
              <>
                <button onClick={() => onApprove(row._id)} className="p-1.5 text-ansar-sage-600 hover:bg-ansar-sage-50 rounded-lg transition-colors" title="Approve">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onReject(row._id)} className="p-1.5 text-ansar-muted hover:text-ansar-error hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            {(row.status === "approved" || row.status === "active") && (
              <Link
                href={`/dashboard/${row.orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
                className="p-1.5 text-ansar-sage-600 hover:bg-ansar-sage-50 rounded-lg transition-colors"
                title="Dashboard"
                onClick={(e) => e.stopPropagation()}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
              </Link>
            )}
            <button onClick={() => onDelete(row._id)} className="p-1.5 text-ansar-muted hover:text-ansar-error hover:bg-red-50 rounded-lg transition-colors" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      />

      <DetailPanel
        isOpen={!!selectedPartner}
        onClose={() => setSelectedPartner(null)}
        title={selectedPartner?.orgName}
        subtitle={selectedPartner ? `${selectedPartner.city} • Level ${selectedPartner.hubLevel}` : ""}
        actions={
          selectedPartner?.status === "pending" ? (
            <div className="flex gap-2">
              <button onClick={() => { onReject(selectedPartner._id); setSelectedPartner(null); }} className="btn-outline text-sm py-2 px-4 text-ansar-error border-ansar-error/20">
                Reject
              </button>
              <button onClick={() => { onApprove(selectedPartner._id); setSelectedPartner(null); }} className="btn-primary text-sm py-2 px-5">
                Approve & Create Hub
              </button>
            </div>
          ) : undefined
        }
      >
        {selectedPartner && (
          <dl className="space-y-0">
            <DetailField label="Status"><StatusBadge status={selectedPartner.status} size="md" /></DetailField>
            <DetailField label="Hub Level">Level {selectedPartner.hubLevel}</DetailField>
            <EditableField
              label="Organization Name"
              value={selectedPartner.orgName}
              onSave={(v) => onUpdate({ id: selectedPartner._id, orgName: v })}
            />
            <EditableField
              label="Organization Type"
              type="select"
              value={selectedPartner.orgType}
              options={[
                { value: "masjid", label: "Masjid" },
                { value: "msa", label: "MSA" },
                { value: "nonprofit", label: "Nonprofit" },
                { value: "informal_circle", label: "Community Circle" },
                { value: "other", label: "Other" },
              ]}
              onSave={(v) => onUpdate({ id: selectedPartner._id, orgType: v })}
            />
            <EditableField
              label="Lead Name"
              value={selectedPartner.leadName}
              onSave={(v) => onUpdate({ id: selectedPartner._id, leadName: v })}
            />
            <EditableField
              label="Lead Email"
              type="email"
              value={selectedPartner.leadEmail}
              onSave={(v) => onUpdate({ id: selectedPartner._id, leadEmail: v })}
            />
            <EditableField
              label="Lead Phone"
              type="tel"
              value={selectedPartner.leadPhone}
              onSave={(v) => onUpdate({ id: selectedPartner._id, leadPhone: v })}
            />
            <EditableField
              label="Lead is Convert"
              type="checkbox"
              value={selectedPartner.leadIsConvert}
              onSave={(v) => onUpdate({ id: selectedPartner._id, leadIsConvert: v })}
            />
            <EditableField
              label="City"
              value={selectedPartner.city}
              onSave={(v) => onUpdate({ id: selectedPartner._id, city: v })}
            />
            <EditableField
              label="State/Region"
              value={selectedPartner.stateRegion || ""}
              onSave={(v) => onUpdate({ id: selectedPartner._id, stateRegion: v })}
            />
            <EditableField
              label="Address"
              value={selectedPartner.address || ""}
              onSave={(v) => onUpdate({ id: selectedPartner._id, address: v })}
            />
            <EditableField
              label="Gender Focus"
              type="select"
              value={selectedPartner.genderFocus}
              options={[
                { value: "brothers", label: "Brothers" },
                { value: "sisters", label: "Sisters" },
                { value: "both", label: "Both" },
              ]}
              onSave={(v) => onUpdate({ id: selectedPartner._id, genderFocus: v })}
            />
            <EditableField
              label="Notes"
              type="textarea"
              value={selectedPartner.notes || ""}
              onSave={(v) => onUpdate({ id: selectedPartner._id, notes: v })}
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

function PairingsTab({
  pairings, intakes, ansars, search, setSearch, statusFilter, setStatusFilter,
}: {
  pairings: any[]; intakes: any[]; ansars: any[];
  search: string; setSearch: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
}) {
  const seekerMap = useMemo(() => {
    const m: Record<string, any> = {};
    intakes.forEach((i) => { m[i._id] = i; });
    return m;
  }, [intakes]);

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
        emptyMessage="No pairings found."
        emptyIcon={<Link2 className="w-12 h-12" />}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MESSAGES TAB
// ═══════════════════════════════════════════════════════════════

function MessagesTab({
  messages, search, setSearch, statusFilter, setStatusFilter,
}: {
  messages: any[]; search: string; setSearch: (v: string) => void;
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
    { label: "Emails", value: messages.filter((m) => m.type === "email").length, accent: "sage" },
    { label: "SMS", value: messages.filter((m) => m.type === "sms").length, accent: "ochre" },
  ];

  const columns: Column<any>[] = [
    { key: "type", label: "Type", render: (r) => <StatusBadge status={r.type} /> },
    { key: "recipient", label: "Recipient", render: (r) => (
      <span className="text-ansar-gray text-xs">{r.recipientEmail || r.recipientPhone || "—"}</span>
    )},
    { key: "template", label: "Template", sortable: true, render: (r) => (
      <span className="font-body text-xs text-ansar-charcoal">{r.template.replace(/_/g, " ")}</span>
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
        placeholder="Search by email, phone, or template..."
        value={search}
        onChange={setSearch}
        filters={[{
          id: "status", label: "All Statuses", value: statusFilter,
          options: [
            { value: "sent", label: "Sent" },
            { value: "failed", label: "Failed" },
            { value: "pending", label: "Pending" },
          ],
        }]}
        onFilterChange={(_, v) => setStatusFilter(v)}
      />
      <DataTable
        columns={columns}
        data={filtered}
        keyField="_id"
        emptyMessage="No messages found."
        emptyIcon={<MessageSquare className="w-12 h-12" />}
      />
    </div>
  );
}
