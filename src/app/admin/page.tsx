"use client";

import { useUser, UserButton, SignOutButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import {
  ArrowLeft, Heart, Users, Building2, Link2, MessageSquare,
  LayoutDashboard, Shield, Loader2, Trash2, CheckCircle2,
  Phone, Mail, MapPin, Clock, Eye, Check, X as XIcon, BookUser,
  UserCog, Menu, ChevronRight, TrendingUp, Activity, LogOut,
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  DataTable, SearchBar, StatusBadge,
  StatsRow, DetailPanel, DetailField, EditableField,
} from "@/components/crm";
import type { Column, StatItem } from "@/components/crm";
import { AnimatePresence, motion } from "framer-motion";

/**
 * SUPER ADMIN DASHBOARD — Sidebar CRM Layout
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
// NAV CONFIG
// ═══════════════════════════════════════════════════════════════

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const navConfig: Omit<NavItem, "icon">[] = [
  { id: "overview", label: "Overview", description: "Dashboard summary and recent activity" },
  { id: "seekers", label: "Seekers", description: "People seeking support and community" },
  { id: "ansars", label: "Ansars", description: "Volunteer companions and mentors" },
  { id: "contacts", label: "Contacts", description: "Community members and stakeholders" },
  { id: "partners", label: "Partners", description: "Community Hub organizations" },
  { id: "users", label: "Users", description: "Authenticated platform users" },
  { id: "pairings", label: "Pairings", description: "Seeker-Ansar connections" },
  { id: "messages", label: "Messages", description: "SMS and email notification log" },
];

const navIcons: Record<string, React.ReactNode> = {
  overview: <LayoutDashboard className="w-[18px] h-[18px]" />,
  seekers: <Heart className="w-[18px] h-[18px]" />,
  ansars: <Users className="w-[18px] h-[18px]" />,
  contacts: <BookUser className="w-[18px] h-[18px]" />,
  partners: <Building2 className="w-[18px] h-[18px]" />,
  users: <UserCog className="w-[18px] h-[18px]" />,
  pairings: <Link2 className="w-[18px] h-[18px]" />,
  messages: <MessageSquare className="w-[18px] h-[18px]" />,
};

// ═══════════════════════════════════════════════════════════════
// MAIN CRM DASHBOARD
// ═══════════════════════════════════════════════════════════════

function AdminDashboard({ currentUser }: { currentUser: { role: string; name: string } | null | undefined }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const intakes = useQuery(api.intakes.listAll) ?? [];
  const ansars = useQuery(api.ansars.listAll) ?? [];
  const contacts = useQuery(api.contacts.listAll) ?? [];
  const partners = useQuery(api.partners.listAll) ?? [];
  const pairings = useQuery(api.pairings.listAll) ?? [];
  const messages = useQuery(api.messages.listAll) ?? [];
  const users = useQuery(api.users.listAll) ?? [];
  const organizations = useQuery(api.organizations.listActive) ?? [];

  // Mutations
  const updateIntakeStatus = useMutation(api.intakes.updateStatus);
  const updateIntake = useMutation(api.intakes.update);
  const updateAnsarStatus = useMutation(api.ansars.updateStatus);
  const updateAnsar = useMutation(api.ansars.update);
  const approvePartner = useMutation(api.partners.approveAndCreateOrg);
  const updatePartner = useMutation(api.partners.update);
  const deleteIntake = useMutation(api.intakes.deleteIntake);
  const assignIntakeToOrg = useMutation(api.intakes.assignToOrganization);
  const deleteAnsar = useMutation(api.ansars.deleteAnsar);
  const deletePartner = useMutation(api.partners.deletePartner);
  const rejectPartner = useMutation(api.partners.rejectPartner);
  const clearAllData = useMutation(api.admin.clearAllData);
  const createContact = useMutation(api.contacts.create);
  const updateContact = useMutation(api.contacts.update);
  const deleteContact = useMutation(api.contacts.deleteContact);
  const createUser = useMutation(api.users.createManual);
  const updateUser = useMutation(api.users.update);
  const deleteUser = useMutation(api.users.deleteUser);

  // Counts per section
  const counts: Record<string, number> = {
    seekers: intakes.length,
    ansars: ansars.length,
    contacts: contacts.length,
    partners: partners.length,
    users: users.length,
    pairings: pairings.length,
    messages: messages.length,
  };

  const pendingCount =
    intakes.filter((i: any) => i.status === "awaiting_outreach" || i.status === "disconnected").length +
    ansars.filter((a: any) => a.status === "pending").length +
    partners.filter((p: any) => p.status === "pending").length;

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

  const handleDeleteContact = useCallback(async (id: Id<"contacts">) => {
    if (confirm("Delete this contact? This cannot be undone.")) await deleteContact({ id });
  }, [deleteContact]);

  const handleDeleteUser = useCallback(async (id: Id<"users">) => {
    if (confirm("Delete this user? This cannot be undone.")) await deleteUser({ id });
  }, [deleteUser]);

  const handleClearAllData = useCallback(async () => {
    const confirmation = prompt("WARNING: This will delete ALL data. Type 'DELETE ALL' to confirm:");
    if (confirmation === "DELETE ALL") {
      const result = await clearAllData();
      alert(`Deleted:\n- ${result.deleted.intakes} Intakes\n- ${result.deleted.ansars} Ansars\n- ${result.deleted.partners} Partners\n- ${result.deleted.organizations} Organizations`);
    }
  }, [clearAllData]);

  // Active section info
  const activeSection = navConfig.find((n) => n.id === activeTab) || navConfig[0];

  // Reset search/filter when switching tabs
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearch("");
    setStatusFilter("");
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-ansar-cream overflow-hidden">
      {/* ─── Sidebar (Desktop) ──────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col w-[260px] bg-white border-r border-[rgba(61,61,61,0.06)] shrink-0">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-[rgba(61,61,61,0.06)]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-ansar-sage-600 flex items-center justify-center shadow-sm">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-[15px] text-ansar-charcoal leading-tight group-hover:text-ansar-sage-700 transition-colors">
                Ansar Family
              </h1>
              <p className="font-body text-[11px] text-ansar-muted leading-tight">
                Super Admin
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navConfig.map((item) => {
            const isActive = activeTab === item.id;
            const messageCount = item.id === "messages" ? counts[item.id] : undefined;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-[13px] transition-all ${
                  isActive
                    ? "bg-ansar-sage-50 text-ansar-charcoal font-medium"
                    : "text-ansar-gray hover:bg-ansar-sage-50/50 hover:text-ansar-charcoal"
                }`}
              >
                <span className={`shrink-0 ${isActive ? "text-ansar-sage-600" : "text-ansar-muted"}`}>
                  {navIcons[item.id]}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {messageCount !== undefined && messageCount > 0 && (
                  <span
                    className={`text-[10px] font-medium min-w-[20px] text-center px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-ansar-sage-200 text-ansar-sage-800"
                        : "bg-gray-100 text-ansar-muted"
                    }`}
                  >
                    {messageCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-[rgba(61,61,61,0.06)] space-y-3">
          <button
            onClick={handleClearAllData}
            className="w-full text-[11px] text-ansar-error/70 border border-ansar-error/15 px-3 py-2 rounded-lg hover:bg-ansar-error/5 hover:text-ansar-error transition-colors font-body text-center"
          >
            Clear All Data
          </button>
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 min-w-0">
              <p className="font-body text-xs text-ansar-charcoal font-medium truncate">
                {currentUser?.name}
              </p>
              <p className="font-body text-[10px] text-ansar-muted">
                {currentUser?.role?.replace("_", " ")}
              </p>
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
                  <div className="w-8 h-8 rounded-lg bg-ansar-sage-600 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="font-heading text-sm text-ansar-charcoal leading-tight">Ansar Family</h1>
                    <p className="font-body text-[10px] text-ansar-muted">Super Admin</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-ansar-muted hover:text-ansar-charcoal rounded-lg">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                {navConfig.map((item) => {
                  const isActive = activeTab === item.id;
                  const messageCount = item.id === "messages" ? counts[item.id] : undefined;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-[13px] transition-all ${
                        isActive
                          ? "bg-ansar-sage-50 text-ansar-charcoal font-medium"
                          : "text-ansar-gray hover:bg-ansar-sage-50/50"
                      }`}
                    >
                      <span className={`shrink-0 ${isActive ? "text-ansar-sage-600" : "text-ansar-muted"}`}>
                        {navIcons[item.id]}
                      </span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {messageCount !== undefined && messageCount > 0 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-ansar-muted">
                          {messageCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
              <div className="px-4 py-3 border-t border-[rgba(61,61,61,0.06)] space-y-2">
                <div className="flex items-center gap-3">
                  <UserButton afterSignOutUrl="/" />
                  <span className="font-body text-xs text-ansar-charcoal truncate">{currentUser?.name}</span>
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
            <Shield className="w-4 h-4 text-ansar-sage-600" />
            <span className="font-heading text-sm text-ansar-charcoal">Ansar Family</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Section Header */}
        <div className="px-6 lg:px-8 py-5 bg-white border-b border-[rgba(61,61,61,0.06)] shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="font-heading text-xl lg:text-2xl text-ansar-charcoal">
                  {activeSection.label}
                </h2>
                {pendingCount > 0 && activeTab === "overview" && (
                  <span className="bg-ansar-terracotta-50 text-ansar-terracotta-700 text-[10px] font-body font-medium px-2 py-0.5 rounded-full">
                    {pendingCount} pending
                  </span>
                )}
              </div>
              <p className="font-body text-sm text-ansar-muted">
                {activeSection.description}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 lg:px-8 py-6 space-y-6">
            {activeTab === "overview" && (
              <OverviewTab
                intakes={intakes}
                ansars={ansars}
                contacts={contacts}
                partners={partners}
                users={users}
                pairings={pairings}
                messages={messages}
              />
            )}
            {activeTab === "seekers" && (
              <SeekersTab
                intakes={intakes}
                organizations={organizations}
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onTriage={handleTriageSeeker}
                onDelete={handleDeleteIntake}
                onUpdate={updateIntake}
                onAssignToOrg={assignIntakeToOrg}
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
            {activeTab === "contacts" && (
              <ContactsTab
                contacts={contacts}
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onCreate={createContact}
                onUpdate={updateContact}
                onDelete={handleDeleteContact}
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
            {activeTab === "users" && (
              <UsersTab
                users={users}
                organizations={organizations}
                intakes={intakes}
                ansars={ansars}
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onCreate={createUser}
                onUpdate={updateUser}
                onDelete={handleDeleteUser}
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
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════

function OverviewTab({
  intakes, ansars, contacts, partners, users, pairings, messages,
}: {
  intakes: any[]; ansars: any[]; contacts: any[]; partners: any[]; users: any[]; pairings: any[]; messages: any[];
}) {
  const topStats: StatItem[] = [
    { label: "Seekers", value: intakes.length, icon: <Heart className="w-4 h-4" />, accent: "terracotta" },
    { label: "Ansars", value: ansars.length, icon: <Users className="w-4 h-4" />, accent: "sage" },
    { label: "Contacts", value: contacts.length, icon: <BookUser className="w-4 h-4" />, accent: "ochre" },
    { label: "Partners", value: partners.length, icon: <Building2 className="w-4 h-4" />, accent: "ochre" },
  ];

  const bottomStats: StatItem[] = [
    { label: "Users", value: users.length, icon: <UserCog className="w-4 h-4" />, accent: "sage" },
    { label: "Active Pairings", value: pairings.filter((p) => p.status === "active" || p.status === "pending_intro").length, icon: <Link2 className="w-4 h-4" />, accent: "success" },
    { label: "Pending Review", value: intakes.filter((i) => i.status === "awaiting_outreach" || i.status === "disconnected").length + ansars.filter((a) => a.status === "pending").length + partners.filter((p) => p.status === "pending").length, icon: <Clock className="w-4 h-4" />, accent: "terracotta" },
    { label: "Messages Sent", value: messages.filter((m) => m.status === "sent").length, icon: <MessageSquare className="w-4 h-4" />, accent: "muted" },
  ];

  const recentSeekers = intakes.slice(0, 5);
  const recentAnsars = ansars.slice(0, 5);
  const recentPairings = pairings.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <StatsRow stats={topStats} />
      <StatsRow stats={bottomStats} />

      {/* Recent Activity Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Seekers */}
        <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.06)] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="px-5 py-4 border-b border-[rgba(61,61,61,0.04)] flex items-center justify-between">
            <h3 className="font-heading text-base text-ansar-charcoal flex items-center gap-2">
              <Heart className="w-4 h-4 text-ansar-terracotta-500" />
              Recent Seekers
            </h3>
            <span className="font-body text-[10px] font-medium text-ansar-muted uppercase tracking-wider">
              Last 5
            </span>
          </div>
          <div className="divide-y divide-[rgba(61,61,61,0.04)]">
            {recentSeekers.length === 0 ? (
              <p className="px-5 py-8 text-center font-body text-sm text-ansar-muted">No seekers yet.</p>
            ) : (
              recentSeekers.map((s) => (
                <div key={s._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-ansar-sage-50/30 transition-colors">
                  <div className="min-w-0">
                    <p className="font-body text-sm text-ansar-charcoal font-medium truncate">{s.fullName}</p>
                    <p className="font-body text-[11px] text-ansar-muted flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {s.city}{s.stateRegion ? ` - ${s.stateRegion}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Ansars */}
        <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.06)] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="px-5 py-4 border-b border-[rgba(61,61,61,0.04)] flex items-center justify-between">
            <h3 className="font-heading text-base text-ansar-charcoal flex items-center gap-2">
              <Users className="w-4 h-4 text-ansar-sage-600" />
              Recent Ansars
            </h3>
            <span className="font-body text-[10px] font-medium text-ansar-muted uppercase tracking-wider">
              Last 5
            </span>
          </div>
          <div className="divide-y divide-[rgba(61,61,61,0.04)]">
            {recentAnsars.length === 0 ? (
              <p className="px-5 py-8 text-center font-body text-sm text-ansar-muted">No ansars yet.</p>
            ) : (
              recentAnsars.map((a) => (
                <div key={a._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-ansar-sage-50/30 transition-colors">
                  <div className="min-w-0">
                    <p className="font-body text-sm text-ansar-charcoal font-medium truncate">{a.fullName}</p>
                    <p className="font-body text-[11px] text-ansar-muted flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {a.city}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Pairings */}
        <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.06)] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="px-5 py-4 border-b border-[rgba(61,61,61,0.04)] flex items-center justify-between">
            <h3 className="font-heading text-base text-ansar-charcoal flex items-center gap-2">
              <Link2 className="w-4 h-4 text-ansar-sage-600" />
              Recent Pairings
            </h3>
            <span className="font-body text-[10px] font-medium text-ansar-muted uppercase tracking-wider">
              Last 5
            </span>
          </div>
          <div className="divide-y divide-[rgba(61,61,61,0.04)]">
            {recentPairings.length === 0 ? (
              <p className="px-5 py-8 text-center font-body text-sm text-ansar-muted">No pairings yet.</p>
            ) : (
              recentPairings.map((p) => (
                <div key={p._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-ansar-sage-50/30 transition-colors">
                  <p className="font-body text-xs text-ansar-muted">
                    {new Date(p.pairedAt).toLocaleDateString()}
                  </p>
                  <StatusBadge status={p.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Summary */}
        <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.06)] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="px-5 py-4 border-b border-[rgba(61,61,61,0.04)] flex items-center justify-between">
            <h3 className="font-heading text-base text-ansar-charcoal flex items-center gap-2">
              <Activity className="w-4 h-4 text-ansar-ochre-600" />
              Message Activity
            </h3>
          </div>
          <div className="px-5 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-ansar-gray">Total Sent</span>
              <span className="font-heading text-lg text-ansar-charcoal">{messages.filter(m => m.status === "sent").length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-ansar-gray">Failed</span>
              <span className="font-heading text-lg text-ansar-error">{messages.filter(m => m.status === "failed").length}</span>
            </div>
            <div className="h-px bg-[rgba(61,61,61,0.06)]" />
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-ansar-gray flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Emails
              </span>
              <span className="font-body text-sm text-ansar-charcoal font-medium">{messages.filter(m => m.type === "email").length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-ansar-gray flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> SMS
              </span>
              <span className="font-body text-sm text-ansar-charcoal font-medium">{messages.filter(m => m.type === "sms").length}</span>
            </div>
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
  intakes, organizations, search, setSearch, statusFilter, setStatusFilter, onTriage, onDelete, onUpdate, onAssignToOrg,
}: {
  intakes: any[]; organizations: any[]; search: string; setSearch: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  onTriage: (id: Id<"intakes">) => void; onDelete: (id: Id<"intakes">) => void;
  onUpdate: (args: any) => Promise<any>;
  onAssignToOrg: (args: { id: Id<"intakes">; organizationId: Id<"organizations"> }) => Promise<any>;
}) {
  const [selectedSeeker, setSelectedSeeker] = useState<any>(null);

  // Build org lookup map so we can show Partner Hub names
  const orgMap = useMemo(() => {
    const map: Record<string, any> = {};
    organizations.forEach((org: any) => { map[org._id] = org; });
    return map;
  }, [organizations]);

  const filtered = useMemo(() => {
    let result = intakes;
    if (statusFilter) result = result.filter((i: any) => i.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i: any) =>
        i.fullName.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.city.toLowerCase().includes(q) ||
        i.phone.includes(q) ||
        (i.organizationId && orgMap[i.organizationId]?.name?.toLowerCase().includes(q))
      );
    }
    return result;
  }, [intakes, search, statusFilter, orgMap]);

  const unassignedCount = intakes.filter((i: any) => !i.organizationId).length;

  const stats: StatItem[] = [
    { label: "Total", value: intakes.length, accent: "sage" },
    { label: "Unassigned", value: unassignedCount, accent: unassignedCount > 0 ? "terracotta" : "sage" },
    { label: "Awaiting Outreach", value: intakes.filter((i: any) => i.status === "awaiting_outreach" || i.status === "disconnected").length, accent: "terracotta" },
    { label: "Triaged", value: intakes.filter((i: any) => i.status === "triaged").length, accent: "ochre" },
    { label: "Connected", value: intakes.filter((i: any) => i.status === "connected" || i.status === "active").length, accent: "success" },
  ];

  const columns: Column<any>[] = [
    { key: "fullName", label: "Name", sortable: true, render: (r) => <span className="font-medium">{r.fullName}</span> },
    { key: "email", label: "Email", sortable: true, render: (r) => <span className="text-ansar-gray text-xs">{r.email}</span> },
    { key: "phone", label: "Phone", render: (r) => <span className="text-ansar-gray text-xs">{r.phone}</span> },
    { key: "city", label: "City", sortable: true, render: (r) => <span className="text-ansar-gray">{r.city}</span> },
    { key: "organizationId", label: "Partner Hub", render: (r) => r.organizationId && orgMap[r.organizationId] ? (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-ansar-sage-700 bg-ansar-sage-50 px-2 py-0.5 rounded-full">
        <Building2 className="w-3 h-3" />{orgMap[r.organizationId].name}
      </span>
    ) : (
      <span className="text-ansar-muted text-xs italic">General</span>
    )},
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
            { value: "awaiting_outreach", label: "Awaiting Outreach" },
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
            {!row.organizationId && (
              <button onClick={() => setSelectedSeeker(row)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Assign to Organization">
                <Building2 className="w-3.5 h-3.5" />
              </button>
            )}
            {(row.status === "awaiting_outreach" || row.status === "disconnected") && (
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

      <DetailPanel
        isOpen={!!selectedSeeker}
        onClose={() => setSelectedSeeker(null)}
        title={selectedSeeker?.fullName}
        subtitle={selectedSeeker ? `${selectedSeeker.city} · ${selectedSeeker.journeyType?.replace("_", " ")}` : ""}
      >
        {selectedSeeker && (
          <dl className="space-y-0">
            <DetailField label="Status"><StatusBadge status={selectedSeeker.status} size="md" /></DetailField>

            {/* Organization Assignment — the key field for routing seekers */}
            {selectedSeeker.organizationId && orgMap[selectedSeeker.organizationId] ? (
              <DetailField label="Partner Hub">
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/${orgMap[selectedSeeker.organizationId].slug}`} className="inline-flex items-center gap-1.5 text-sm text-ansar-sage-600 hover:text-ansar-sage-800 underline underline-offset-2">
                    <Building2 className="w-4 h-4" />
                    {orgMap[selectedSeeker.organizationId].name}
                  </Link>
                </div>
              </DetailField>
            ) : (
              <DetailField label="Partner Hub">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                    <Building2 className="w-4 h-4" />
                    Not assigned — seeker won&apos;t appear in any Partner Lead dashboard
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      id="assign-org-select"
                      className="flex-1 px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400"
                      defaultValue=""
                      onChange={async (e) => {
                        if (!e.target.value) return;
                        try {
                          await onAssignToOrg({
                            id: selectedSeeker._id,
                            organizationId: e.target.value as Id<"organizations">,
                          });
                          // Refresh the selected seeker with updated data
                          const updated = intakes.find((i: any) => i._id === selectedSeeker._id);
                          if (updated) setSelectedSeeker({ ...updated, organizationId: e.target.value, status: "triaged" });
                        } catch (err) {
                          console.error("Failed to assign:", err);
                        }
                      }}
                    >
                      <option value="">Select an organization...</option>
                      {organizations.map((org: any) => (
                        <option key={org._id} value={org._id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </DetailField>
            )}

            <DetailField label="Source">
              {selectedSeeker.source === "partner_specific" ? (
                <span className="text-sm text-ansar-sage-700">Partner Hub Link</span>
              ) : (
                <span className="text-ansar-gray text-sm">General Sign-Up</span>
              )}
            </DetailField>

            <EditableField label="Full Name" value={selectedSeeker.fullName} onSave={(v) => onUpdate({ id: selectedSeeker._id, fullName: v })} />
            <EditableField label="Email" type="email" value={selectedSeeker.email} onSave={(v) => onUpdate({ id: selectedSeeker._id, email: v })} />
            <EditableField label="Phone" type="tel" value={selectedSeeker.phone} onSave={(v) => onUpdate({ id: selectedSeeker._id, phone: v })} />
            <EditableField label="City" value={selectedSeeker.city} onSave={(v) => onUpdate({ id: selectedSeeker._id, city: v })} />
            <EditableField label="State/Region" value={selectedSeeker.stateRegion || ""} onSave={(v) => onUpdate({ id: selectedSeeker._id, stateRegion: v })} />
            <EditableField label="Gender" type="select" value={selectedSeeker.gender} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} onSave={(v) => onUpdate({ id: selectedSeeker._id, gender: v })} />
            <EditableField label="Journey Type" type="select" value={selectedSeeker.journeyType} options={[{ value: "new_muslim", label: "New Muslim" }, { value: "reconnecting", label: "Reconnecting" }, { value: "seeker", label: "Seeker" }]} onSave={(v) => onUpdate({ id: selectedSeeker._id, journeyType: v })} />
            <EditableField label="Address" value={selectedSeeker.address || ""} onSave={(v) => onUpdate({ id: selectedSeeker._id, address: v })} />
            {selectedSeeker.supportAreas?.length > 0 && (
              <DetailField label="Support Areas">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedSeeker.supportAreas.map((area: string) => (
                    <span key={area} className="bg-ansar-sage-50 text-ansar-sage-700 text-xs px-2 py-0.5 rounded-full font-body">{area}</span>
                  ))}
                </div>
              </DetailField>
            )}
            <EditableField label="Notes" type="textarea" value={selectedSeeker.notes || ""} onSave={(v) => onUpdate({ id: selectedSeeker._id, notes: v })} />
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
    { key: "email", label: "Email", sortable: true, render: (r) => <span className="text-ansar-gray text-xs">{r.email}</span> },
    { key: "phone", label: "Phone", render: (r) => <span className="text-ansar-gray text-xs">{r.phone}</span> },
    { key: "city", label: "City", sortable: true, render: (r) => <span className="text-ansar-gray">{r.city}</span> },
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
        subtitle={selectedAnsar ? `${selectedAnsar.city} · ${selectedAnsar.practiceLevel}` : ""}
        actions={selectedAnsar?.status === "pending" ? (
          <button onClick={() => { onApprove(selectedAnsar._id); setSelectedAnsar(null); }} className="btn-primary text-sm py-2 px-5">Approve</button>
        ) : undefined}
      >
        {selectedAnsar && (
          <dl className="space-y-0">
            <DetailField label="Status"><StatusBadge status={selectedAnsar.status} size="md" /></DetailField>
            <EditableField label="Full Name" value={selectedAnsar.fullName} onSave={(v) => onUpdate({ id: selectedAnsar._id, fullName: v })} />
            <EditableField label="Email" type="email" value={selectedAnsar.email} onSave={(v) => onUpdate({ id: selectedAnsar._id, email: v })} />
            <EditableField label="Phone" type="tel" value={selectedAnsar.phone} onSave={(v) => onUpdate({ id: selectedAnsar._id, phone: v })} />
            <EditableField label="City" value={selectedAnsar.city} onSave={(v) => onUpdate({ id: selectedAnsar._id, city: v })} />
            <EditableField label="State/Region" value={selectedAnsar.stateRegion || ""} onSave={(v) => onUpdate({ id: selectedAnsar._id, stateRegion: v })} />
            <EditableField label="Gender" type="select" value={selectedAnsar.gender} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} onSave={(v) => onUpdate({ id: selectedAnsar._id, gender: v })} />
            <EditableField label="Address" value={selectedAnsar.address || ""} onSave={(v) => onUpdate({ id: selectedAnsar._id, address: v })} />
            <EditableField label="Is Convert" type="checkbox" value={selectedAnsar.isConvert} onSave={(v) => onUpdate({ id: selectedAnsar._id, isConvert: v })} />
            <EditableField label="Practice Level" type="select" value={selectedAnsar.practiceLevel} options={[{ value: "consistent", label: "Consistent" }, { value: "steady", label: "Steady" }, { value: "reconnecting", label: "Reconnecting" }]} onSave={(v) => onUpdate({ id: selectedAnsar._id, practiceLevel: v })} />
            <EditableField label="Check-In Frequency" type="select" value={selectedAnsar.checkInFrequency} options={[{ value: "weekly", label: "Weekly" }, { value: "biweekly", label: "Biweekly" }, { value: "monthly", label: "Monthly" }]} onSave={(v) => onUpdate({ id: selectedAnsar._id, checkInFrequency: v })} />
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
            <EditableField label="Motivation" type="textarea" value={selectedAnsar.motivation || ""} onSave={(v) => onUpdate({ id: selectedAnsar._id, motivation: v })} />
            <EditableField label="Notes" type="textarea" value={selectedAnsar.notes || ""} onSave={(v) => onUpdate({ id: selectedAnsar._id, notes: v })} />
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
    { key: "city", label: "City", sortable: true, render: (r) => <span className="text-ansar-gray">{r.city}</span> },
    { key: "orgType", label: "Type", render: (r) => <span className="text-ansar-gray text-xs">{orgTypeLabels[r.orgType] || r.orgType}</span> },
    { key: "hubLevel", label: "Level", sortable: true, render: (r) => (
      <span className="bg-ansar-sage-50 text-ansar-sage-700 text-[11px] px-2 py-0.5 rounded-full font-body font-medium">
        L{r.hubLevel}
      </span>
    )},
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <StatsRow stats={stats} columns={3} />
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
        subtitle={selectedPartner ? `${selectedPartner.city} · Level ${selectedPartner.hubLevel}` : ""}
        actions={selectedPartner?.status === "pending" ? (
          <div className="flex gap-2">
            <button onClick={() => { onReject(selectedPartner._id); setSelectedPartner(null); }} className="btn-outline text-sm py-2 px-4 text-ansar-error border-ansar-error/20">Reject</button>
            <button onClick={() => { onApprove(selectedPartner._id); setSelectedPartner(null); }} className="btn-primary text-sm py-2 px-5">Approve & Create Hub</button>
          </div>
        ) : undefined}
      >
        {selectedPartner && (
          <dl className="space-y-0">
            <DetailField label="Status"><StatusBadge status={selectedPartner.status} size="md" /></DetailField>
            <DetailField label="Hub Level">Level {selectedPartner.hubLevel}</DetailField>
            <EditableField label="Organization Name" value={selectedPartner.orgName} onSave={(v) => onUpdate({ id: selectedPartner._id, orgName: v })} />
            <EditableField label="Organization Type" type="select" value={selectedPartner.orgType} options={[{ value: "masjid", label: "Masjid" }, { value: "msa", label: "MSA" }, { value: "nonprofit", label: "Nonprofit" }, { value: "informal_circle", label: "Community Circle" }, { value: "other", label: "Other" }]} onSave={(v) => onUpdate({ id: selectedPartner._id, orgType: v })} />
            <EditableField label="Lead Name" value={selectedPartner.leadName} onSave={(v) => onUpdate({ id: selectedPartner._id, leadName: v })} />
            <EditableField label="Lead Email" type="email" value={selectedPartner.leadEmail} onSave={(v) => onUpdate({ id: selectedPartner._id, leadEmail: v })} />
            <EditableField label="Lead Phone" type="tel" value={selectedPartner.leadPhone} onSave={(v) => onUpdate({ id: selectedPartner._id, leadPhone: v })} />
            <EditableField label="Lead is Convert" type="checkbox" value={selectedPartner.leadIsConvert} onSave={(v) => onUpdate({ id: selectedPartner._id, leadIsConvert: v })} />
            <EditableField label="City" value={selectedPartner.city} onSave={(v) => onUpdate({ id: selectedPartner._id, city: v })} />
            <EditableField label="State/Region" value={selectedPartner.stateRegion || ""} onSave={(v) => onUpdate({ id: selectedPartner._id, stateRegion: v })} />
            <EditableField label="Address" value={selectedPartner.address || ""} onSave={(v) => onUpdate({ id: selectedPartner._id, address: v })} />
            <EditableField label="Gender Focus" type="select" value={selectedPartner.genderFocus} options={[{ value: "brothers", label: "Brothers" }, { value: "sisters", label: "Sisters" }, { value: "both", label: "Both" }]} onSave={(v) => onUpdate({ id: selectedPartner._id, genderFocus: v })} />
            <EditableField label="Notes" type="textarea" value={selectedPartner.notes || ""} onSave={(v) => onUpdate({ id: selectedPartner._id, notes: v })} />
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
  const seekerMap = useMemo(() => { const m: Record<string, any> = {}; intakes.forEach((i) => { m[i._id] = i; }); return m; }, [intakes]);
  const ansarMap = useMemo(() => { const m: Record<string, any> = {}; ansars.forEach((a) => { m[a._id] = a; }); return m; }, [ansars]);

  const enriched = useMemo(() =>
    pairings.map((p) => ({ ...p, seekerName: seekerMap[p.seekerId]?.fullName || "Unknown", ansarName: ansarMap[p.ansarId]?.fullName || "Unknown" })),
    [pairings, seekerMap, ansarMap]
  );

  const filtered = useMemo(() => {
    let result = enriched;
    if (statusFilter) result = result.filter((p) => p.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.seekerName.toLowerCase().includes(q) || p.ansarName.toLowerCase().includes(q));
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
    { key: "pairedAt", label: "Paired", sortable: true, render: (r) => <span className="text-ansar-gray text-xs">{new Date(r.pairedAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-5">
      <StatsRow stats={stats} />
      <SearchBar placeholder="Search by seeker or ansar name..." value={search} onChange={setSearch} filters={[{ id: "status", label: "All Statuses", value: statusFilter, options: [{ value: "pending_intro", label: "Pending Intro" }, { value: "active", label: "Active" }, { value: "completed", label: "Completed" }, { value: "ended", label: "Ended" }] }]} onFilterChange={(_, v) => setStatusFilter(v)} />
      <DataTable columns={columns} data={filtered} keyField="_id" emptyMessage="No pairings found." emptyIcon={<Link2 className="w-12 h-12" />} />
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
      result = result.filter((m) => (m.recipientEmail?.toLowerCase().includes(q)) || (m.recipientPhone?.includes(q)) || m.template.toLowerCase().includes(q));
    }
    return result;
  }, [messages, search, statusFilter]);

  const stats: StatItem[] = [
    { label: "Total", value: messages.length, accent: "sage" },
    { label: "Sent", value: messages.filter((m) => m.status === "sent").length, accent: "success" },
    { label: "Failed", value: messages.filter((m) => m.status === "failed").length, accent: "terracotta" },
    { label: "Emails", value: messages.filter((m) => m.type === "email").length, accent: "muted" },
  ];

  const columns: Column<any>[] = [
    { key: "type", label: "Type", render: (r) => <StatusBadge status={r.type} /> },
    { key: "recipient", label: "Recipient", render: (r) => <span className="text-ansar-gray text-xs">{r.recipientEmail || r.recipientPhone || "—"}</span> },
    { key: "template", label: "Template", sortable: true, render: (r) => <span className="font-body text-xs text-ansar-charcoal">{r.template.replace(/_/g, " ")}</span> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: "sentAt", label: "Sent", sortable: true, render: (r) => <span className="text-ansar-gray text-xs">{new Date(r.sentAt).toLocaleString()}</span> },
  ];

  return (
    <div className="space-y-5">
      <StatsRow stats={stats} />
      <SearchBar placeholder="Search by email, phone, or template..." value={search} onChange={setSearch} filters={[{ id: "status", label: "All Statuses", value: statusFilter, options: [{ value: "sent", label: "Sent" }, { value: "failed", label: "Failed" }, { value: "pending", label: "Pending" }] }]} onFilterChange={(_, v) => setStatusFilter(v)} />
      <DataTable columns={columns} data={filtered} keyField="_id" emptyMessage="No messages found." emptyIcon={<MessageSquare className="w-12 h-12" />} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONTACTS TAB
// ═══════════════════════════════════════════════════════════════

function ContactsTab({
  contacts, search, setSearch, statusFilter, setStatusFilter, onCreate, onUpdate, onDelete,
}: {
  contacts: any[]; search: string; setSearch: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  onCreate: (args: any) => Promise<any>; onUpdate: (args: any) => Promise<any>; onDelete: (id: Id<"contacts">) => void;
}) {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = contacts;
    if (statusFilter) result = result.filter((c) => c.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.fullName.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q) || c.city?.toLowerCase().includes(q));
    }
    return result;
  }, [contacts, search, statusFilter]);

  const stats: StatItem[] = [
    { label: "Total", value: contacts.length, accent: "sage" },
    { label: "Active", value: contacts.filter((c) => c.status === "active").length, accent: "success" },
    { label: "Imams", value: contacts.filter((c) => c.role === "imam").length, accent: "ochre" },
    { label: "Donors", value: contacts.filter((c) => c.role === "donor").length, accent: "terracotta" },
  ];

  const columns: Column<any>[] = [
    { key: "fullName", label: "Name", sortable: true, render: (r) => <span className="font-medium">{r.fullName}</span> },
    { key: "phone", label: "Phone", render: (r) => <span className="text-ansar-gray text-xs">{r.phone || "—"}</span> },
    { key: "role", label: "Role", sortable: true, render: (r) => <StatusBadge status={r.role} /> },
    { key: "city", label: "City", sortable: true, render: (r) => <span className="text-ansar-gray">{r.city || "—"}</span> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <StatsRow stats={stats} />
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <SearchBar placeholder="Search contacts..." value={search} onChange={setSearch} filters={[{ id: "status", label: "All Statuses", value: statusFilter, options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] }]} onFilterChange={(_, v) => setStatusFilter(v)} />
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap">+ Add Contact</button>
      </div>
      <DataTable columns={columns} data={filtered} keyField="_id" onRowClick={(row) => setSelectedContact(row)} emptyMessage="No contacts found." emptyIcon={<BookUser className="w-12 h-12" />} actions={(row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setSelectedContact(row)} className="p-1.5 text-ansar-muted hover:text-ansar-sage-600 hover:bg-ansar-sage-50 rounded-lg transition-colors" title="View"><Eye className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(row._id)} className="p-1.5 text-ansar-muted hover:text-ansar-error hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )} />

      <AdminAddContactModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onCreate={onCreate} />

      <DetailPanel isOpen={!!selectedContact} onClose={() => setSelectedContact(null)} title={selectedContact?.fullName} subtitle={selectedContact ? `${selectedContact.role?.replace("_", " ")}${selectedContact.city ? ` · ${selectedContact.city}` : ""}` : ""}>
        {selectedContact && (
          <dl className="space-y-0">
            <DetailField label="Status"><StatusBadge status={selectedContact.status} size="md" /></DetailField>
            <EditableField label="Full Name" value={selectedContact.fullName} onSave={(v) => onUpdate({ id: selectedContact._id, fullName: v })} />
            <EditableField label="Email" type="email" value={selectedContact.email || ""} onSave={(v) => onUpdate({ id: selectedContact._id, email: v })} />
            <EditableField label="Phone" type="tel" value={selectedContact.phone || ""} onSave={(v) => onUpdate({ id: selectedContact._id, phone: v })} />
            <EditableField label="Role" type="select" value={selectedContact.role} options={[{ value: "imam", label: "Imam" }, { value: "donor", label: "Donor" }, { value: "community_member", label: "Community Member" }, { value: "family_member", label: "Family Member" }, { value: "scholar", label: "Scholar" }, { value: "volunteer", label: "Volunteer" }, { value: "other", label: "Other" }]} onSave={(v) => onUpdate({ id: selectedContact._id, role: v })} />
            {selectedContact.role === "other" && <EditableField label="Role (Other)" value={selectedContact.roleOther || ""} onSave={(v) => onUpdate({ id: selectedContact._id, roleOther: v })} />}
            <EditableField label="Gender" type="select" value={selectedContact.gender || ""} options={[{ value: "", label: "Not specified" }, { value: "male", label: "Male" }, { value: "female", label: "Female" }]} onSave={(v) => onUpdate({ id: selectedContact._id, gender: v || undefined })} />
            <EditableField label="City" value={selectedContact.city || ""} onSave={(v) => onUpdate({ id: selectedContact._id, city: v })} />
            <EditableField label="State/Region" value={selectedContact.stateRegion || ""} onSave={(v) => onUpdate({ id: selectedContact._id, stateRegion: v })} />
            <EditableField label="Address" value={selectedContact.address || ""} onSave={(v) => onUpdate({ id: selectedContact._id, address: v })} />
            {selectedContact.tags?.length > 0 && (
              <DetailField label="Tags">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedContact.tags.map((tag: string) => (<span key={tag} className="bg-ansar-ochre-50 text-ansar-ochre-700 text-xs px-2 py-0.5 rounded-full font-body">{tag}</span>))}
                </div>
              </DetailField>
            )}
            <EditableField label="Notes" type="textarea" value={selectedContact.notes || ""} onSave={(v) => onUpdate({ id: selectedContact._id, notes: v })} />
          </dl>
        )}
      </DetailPanel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADD CONTACT MODAL
// ═══════════════════════════════════════════════════════════════

function AdminAddContactModal({ isOpen, onClose, onCreate }: { isOpen: boolean; onClose: () => void; onCreate: (args: any) => Promise<any>; }) {
  const [formData, setFormData] = useState<{ fullName: string; email: string; phone: string; role: "imam" | "donor" | "community_member" | "family_member" | "scholar" | "volunteer" | "other"; roleOther: string; city: string; notes: string; }>({ fullName: "", email: "", phone: "", role: "community_member", roleOther: "", city: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) { alert("Please enter a name"); return; }
    setIsSubmitting(true);
    try {
      await onCreate({ fullName: formData.fullName.trim(), email: formData.email.trim() || undefined, phone: formData.phone.trim() || undefined, role: formData.role, roleOther: formData.role === "other" ? formData.roleOther.trim() : undefined, city: formData.city.trim() || undefined, notes: formData.notes.trim() || undefined });
      setFormData({ fullName: "", email: "", phone: "", role: "community_member", roleOther: "", city: "", notes: "" });
      onClose();
    } catch (error) { console.error("Failed to create contact:", error); alert("Failed to create contact. Please try again."); } finally { setIsSubmitting(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[520px] md:max-h-[85vh] bg-white rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(61,61,61,0.08)] flex items-center justify-between">
              <h3 className="font-heading text-lg text-ansar-charcoal">Add Contact</h3>
              <button onClick={onClose} className="p-1 text-ansar-muted hover:text-ansar-charcoal rounded-lg transition-colors"><XIcon className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div><label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">Full Name <span className="text-ansar-error">*</span></label><input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400" required /></div>
                <div><label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">Role</label><select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400"><option value="community_member">Community Member</option><option value="imam">Imam</option><option value="donor">Donor</option><option value="family_member">Family Member</option><option value="scholar">Scholar</option><option value="volunteer">Volunteer</option><option value="other">Other</option></select></div>
                {formData.role === "other" && <div><label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">Role (Other)</label><input type="text" value={formData.roleOther} onChange={(e) => setFormData({ ...formData, roleOther: e.target.value })} className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400" /></div>}
                <div><label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400" /></div>
                <div><label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400" /></div>
                <div><label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">City</label><input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400" /></div>
                <div><label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400 resize-none" /></div>
              </div>
            </form>
            <div className="px-6 py-4 border-t border-[rgba(61,61,61,0.08)] flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-outline text-sm py-2 px-4" disabled={isSubmitting}>Cancel</button>
              <button type="submit" onClick={handleSubmit} className="btn-primary text-sm py-2 px-5" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Contact"}</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════

function UsersTab({
  users, organizations, intakes, ansars, search, setSearch, statusFilter, setStatusFilter, onCreate, onUpdate, onDelete,
}: {
  users: any[]; organizations: any[]; intakes: any[]; ansars: any[]; search: string; setSearch: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  onCreate: (args: any) => Promise<any>; onUpdate: (args: any) => Promise<any>; onDelete: (id: Id<"users">) => void;
}) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Build lookup: user email -> intake organizationId (for seekers)
  const seekerOrgByEmail = useMemo(() => {
    const map: Record<string, string> = {};
    intakes.forEach((intake: any) => {
      if (intake.email && intake.organizationId) {
        map[intake.email.toLowerCase()] = intake.organizationId;
      }
    });
    return map;
  }, [intakes]);

  // Build lookup: user email -> ansar organizationId (for ansars)
  const ansarOrgByEmail = useMemo(() => {
    const map: Record<string, string> = {};
    ansars.forEach((ansar: any) => {
      if (ansar.email && ansar.organizationId) {
        map[ansar.email.toLowerCase()] = ansar.organizationId;
      }
    });
    return map;
  }, [ansars]);

  const filtered = useMemo(() => {
    let result = users;
    if (statusFilter) result = result.filter((u: any) => u.role === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((u: any) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.clerkId.toLowerCase().includes(q));
    }
    return result;
  }, [users, search, statusFilter]);

  const stats: StatItem[] = [
    { label: "Total", value: users.length, accent: "sage" },
    { label: "Super Admins", value: users.filter((u) => u.role === "super_admin").length, accent: "terracotta" },
    { label: "Partner Leads", value: users.filter((u) => u.role === "partner_lead").length, accent: "ochre" },
    { label: "Active", value: users.filter((u) => u.isActive).length, accent: "success" },
  ];

  const orgMap = useMemo(() => { const map: Record<string, any> = {}; organizations.forEach((org: any) => { map[org._id] = org; }); return map; }, [organizations]);

  // Resolve organization for any user role
  const getOrgForUser = useCallback((user: any): any | null => {
    // Partner Leads and Ansars may have org on their user record
    if (user.organizationId && orgMap[user.organizationId]) return orgMap[user.organizationId];
    // Seekers: look up org from their intake record
    if (user.role === "seeker" && user.email) {
      const orgId = seekerOrgByEmail[user.email.toLowerCase()];
      if (orgId && orgMap[orgId]) return orgMap[orgId];
    }
    // Ansars: also look up from ansar record
    if (user.role === "ansar" && user.email) {
      const orgId = ansarOrgByEmail[user.email.toLowerCase()];
      if (orgId && orgMap[orgId]) return orgMap[orgId];
    }
    return null;
  }, [orgMap, seekerOrgByEmail, ansarOrgByEmail]);

  const columns: Column<any>[] = [
    { key: "name", label: "Name", sortable: true, render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "email", label: "Email", sortable: true, render: (r) => <span className="text-ansar-gray text-xs">{r.email}</span> },
    { key: "role", label: "Role", sortable: true, render: (r) => <StatusBadge status={r.role} /> },
    { key: "organizationId", label: "Organization", render: (r) => {
      const org = getOrgForUser(r);
      return org ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-ansar-sage-700 bg-ansar-sage-50 px-2 py-0.5 rounded-full">
          <Building2 className="w-3 h-3" />{org.name}
        </span>
      ) : (
        <span className="text-ansar-muted text-xs">—</span>
      );
    }},
    { key: "isActive", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.isActive ? "active" : "inactive"} /> },
  ];

  return (
    <div className="space-y-5">
      <StatsRow stats={stats} />
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <SearchBar placeholder="Search users..." value={search} onChange={setSearch} filters={[{ id: "role", label: "All Roles", value: statusFilter, options: [{ value: "super_admin", label: "Super Admin" }, { value: "partner_lead", label: "Partner Lead" }, { value: "ansar", label: "Ansar" }, { value: "seeker", label: "Seeker" }] }]} onFilterChange={(_, v) => setStatusFilter(v)} />
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap">+ Add User</button>
      </div>
      <DataTable columns={columns} data={filtered} keyField="_id" onRowClick={(row) => setSelectedUser(row)} emptyMessage="No users found." emptyIcon={<UserCog className="w-12 h-12" />} actions={(row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setSelectedUser(row)} className="p-1.5 text-ansar-muted hover:text-ansar-sage-600 hover:bg-ansar-sage-50 rounded-lg transition-colors" title="View"><Eye className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(row._id)} className="p-1.5 text-ansar-muted hover:text-ansar-error hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )} />

      <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} organizations={organizations} onCreate={onCreate} />

      <DetailPanel isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={selectedUser?.name} subtitle={selectedUser ? `${selectedUser.role?.replace("_", " ")} · ${selectedUser.email}` : ""}>
        {selectedUser && (
          <dl className="space-y-0">
            <DetailField label="Status"><StatusBadge status={selectedUser.isActive ? "active" : "inactive"} size="md" /></DetailField>
            <DetailField label="Clerk ID"><span className="font-mono text-xs text-ansar-gray">{selectedUser.clerkId}</span></DetailField>
            <EditableField label="Name" value={selectedUser.name} onSave={(v) => onUpdate({ id: selectedUser._id, name: v })} />
            <EditableField label="Email" type="email" value={selectedUser.email} onSave={(v) => onUpdate({ id: selectedUser._id, email: v })} />
            <EditableField label="Role" type="select" value={selectedUser.role} options={[{ value: "super_admin", label: "Super Admin" }, { value: "partner_lead", label: "Partner Lead" }, { value: "ansar", label: "Ansar" }, { value: "seeker", label: "Seeker" }]} onSave={(v) => onUpdate({ id: selectedUser._id, role: v })} />
            {selectedUser.role === "partner_lead" && (
              <EditableField label="Organization" type="select" value={selectedUser.organizationId || ""} options={[{ value: "", label: "No Organization" }, ...organizations.map((org: any) => ({ value: org._id, label: org.name }))]} onSave={(v) => onUpdate({ id: selectedUser._id, organizationId: v || null })} />
            )}
            {selectedUser.role !== "partner_lead" && (() => {
              const org = getOrgForUser(selectedUser);
              return org ? (
                <DetailField label="Organization">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ansar-sage-700">
                    <Building2 className="w-4 h-4" />{org.name}
                  </span>
                </DetailField>
              ) : null;
            })()}
            <EditableField label="Active" type="checkbox" value={selectedUser.isActive} onSave={(v) => onUpdate({ id: selectedUser._id, isActive: v })} />
          </dl>
        )}
      </DetailPanel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADD USER MODAL
// ═══════════════════════════════════════════════════════════════

function AddUserModal({ isOpen, onClose, organizations, onCreate }: { isOpen: boolean; onClose: () => void; organizations: any[]; onCreate: (args: any) => Promise<any>; }) {
  const [formData, setFormData] = useState<{ clerkId: string; name: string; email: string; role: "super_admin" | "partner_lead" | "ansar" | "seeker"; organizationId: string; }>({ clerkId: "", name: "", email: "", role: "seeker", organizationId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clerkId.trim() || !formData.name.trim() || !formData.email.trim()) { alert("Please fill in all required fields"); return; }
    setIsSubmitting(true);
    try {
      await onCreate({ clerkId: formData.clerkId.trim(), name: formData.name.trim(), email: formData.email.trim(), role: formData.role, organizationId: formData.organizationId || undefined });
      setFormData({ clerkId: "", name: "", email: "", role: "seeker", organizationId: "" });
      onClose();
    } catch (error) { console.error("Failed to create user:", error); alert(error instanceof Error ? error.message : "Failed to create user. Please try again."); } finally { setIsSubmitting(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[520px] md:max-h-[85vh] bg-white rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(61,61,61,0.08)] flex items-center justify-between">
              <h3 className="font-heading text-lg text-ansar-charcoal">Add User</h3>
              <button onClick={onClose} className="p-1 text-ansar-muted hover:text-ansar-charcoal rounded-lg transition-colors"><XIcon className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div><label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">Clerk ID <span className="text-ansar-error">*</span></label><input type="text" value={formData.clerkId} onChange={(e) => setFormData({ ...formData, clerkId: e.target.value })} placeholder="user_2abc123xyz" className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400" required /><p className="text-xs text-ansar-muted mt-1">Get this from Clerk dashboard</p></div>
                <div><label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">Full Name <span className="text-ansar-error">*</span></label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400" required /></div>
                <div><label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">Email <span className="text-ansar-error">*</span></label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400" required /></div>
                <div><label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">Role <span className="text-ansar-error">*</span></label><select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400"><option value="seeker">Seeker</option><option value="ansar">Ansar</option><option value="partner_lead">Partner Lead</option><option value="super_admin">Super Admin</option></select></div>
                {formData.role === "partner_lead" && (
                  <div><label className="block font-body text-sm font-medium text-ansar-charcoal mb-1.5">Organization</label><select value={formData.organizationId} onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })} className="w-full px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:ring-2 focus:ring-ansar-sage-400"><option value="">No Organization</option>{organizations.map((org) => (<option key={org._id} value={org._id}>{org.name}</option>))}</select></div>
                )}
              </div>
            </form>
            <div className="px-6 py-4 border-t border-[rgba(61,61,61,0.08)] flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-outline text-sm py-2 px-4" disabled={isSubmitting}>Cancel</button>
              <button type="submit" onClick={handleSubmit} className="btn-primary text-sm py-2 px-5" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add User"}</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
