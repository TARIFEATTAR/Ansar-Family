"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Users, Building2, Heart, Phone, Mail, MapPin, Shield, Loader2 } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useEffect } from "react";

/**
 * SUPER ADMIN DASHBOARD — Central Command
 * 
 * Full access to all data across the network:
 * - All Seekers (New Muslims)
 * - All Ansars (Volunteers)
 * - All Partners (Community Hubs)
 * - All Pairings
 * 
 * Protected by Clerk authentication.
 */

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsertFromClerk);
  const currentUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Sync user to Convex on first load
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

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-ansar-charcoal mb-4">Admin Access</h1>
          <p className="font-body text-ansar-gray mb-6">Please sign in to access the admin dashboard.</p>
          <a href="/sign-in" className="btn-primary inline-block">
            Sign In
          </a>
        </div>
      </main>
    );
  }

  return <AdminDashboard currentUser={currentUser} />;
}

function AdminDashboard({ currentUser }: { currentUser: { role: string; name: string } | null | undefined }) {
  const intakes = useQuery(api.intakes.listAll);
  const ansars = useQuery(api.ansars.listAll);
  const partners = useQuery(api.partners.listAll);
  const pairings = useQuery(api.pairings.listAll);

  const updateIntakeStatus = useMutation(api.intakes.updateStatus);
  const updateAnsarStatus = useMutation(api.ansars.updateStatus);
  const approvePartner = useMutation(api.partners.approveAndCreateOrg);
  const setUserRole = useMutation(api.users.setRole);

  // Seeker stats
  const disconnectedSeekers = intakes?.filter((i) => i.status === "disconnected") ?? [];
  const triagedSeekers = intakes?.filter((i) => i.status === "triaged") ?? [];
  const connectedSeekers = intakes?.filter((i) => i.status === "connected" || i.status === "active") ?? [];

  // Ansar stats
  const pendingAnsars = ansars?.filter((a) => a.status === "pending") ?? [];
  const approvedAnsars = ansars?.filter((a) => a.status === "approved" || a.status === "active") ?? [];

  // Partner stats
  const pendingPartners = partners?.filter((p) => p.status === "pending") ?? [];
  const approvedPartners = partners?.filter((p) => p.status === "approved" || p.status === "active") ?? [];

  // Pairing stats
  const activePairings = pairings?.filter((p) => p.status === "active" || p.status === "pending_intro") ?? [];

  const handleUpdateIntakeStatus = async (id: Id<"intakes">, status: "triaged" | "connected") => {
    await updateIntakeStatus({ id, status });
  };

  const handleApproveAnsar = async (id: Id<"ansars">) => {
    await updateAnsarStatus({ id, status: "approved" });
  };

  const handleApprovePartner = async (id: Id<"partners">) => {
    await approvePartner({ id });
  };

  return (
    <main className="min-h-screen bg-ansar-cream">
      {/* Header */}
      <header className="px-6 md:px-12 py-6 border-b border-ansar-sage-100 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-ansar-gray hover:text-ansar-charcoal transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-ansar-sage-600" />
              <h1 className="font-heading text-xl text-ansar-charcoal">Super Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {currentUser && (
              <span className="font-body text-sm text-ansar-gray">
                {currentUser.name} • <span className="text-ansar-sage-600 capitalize">{currentUser.role?.replace("_", " ")}</span>
              </span>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="px-6 md:px-12 py-4 bg-white border-b border-ansar-sage-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-4">
            {/* Seekers */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-ansar-terracotta/10 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-ansar-terracotta" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-ansar-gray">Seekers</p>
                <p className="font-heading text-lg text-ansar-charcoal">
                  <span className="text-ansar-terracotta">{disconnectedSeekers.length}</span>
                  <span className="text-ansar-gray-light mx-1">/</span>
                  {intakes?.length ?? 0}
                </p>
              </div>
            </div>

            {/* Ansars */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-ansar-sage-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-ansar-sage-600" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-ansar-gray">Ansars</p>
                <p className="font-heading text-lg text-ansar-charcoal">
                  <span className="text-ansar-ochre">{pendingAnsars.length}</span>
                  <span className="text-ansar-gray-light mx-1">/</span>
                  {ansars?.length ?? 0}
                </p>
              </div>
            </div>

            {/* Partners */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-ansar-ochre/10 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-ansar-ochre" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-ansar-gray">Partners</p>
                <p className="font-heading text-lg text-ansar-charcoal">
                  <span className="text-ansar-ochre">{pendingPartners.length}</span>
                  <span className="text-ansar-gray-light mx-1">/</span>
                  {partners?.length ?? 0}
                </p>
              </div>
            </div>

            {/* Active Pairings */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-ansar-success/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-ansar-success" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-ansar-gray">Active Pairings</p>
                <p className="font-heading text-lg text-ansar-charcoal">
                  {activePairings.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-12 py-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Disconnected Seekers Section */}
          <section>
            <SectionHeader
              icon={<Heart className="w-4 h-4" />}
              title="Disconnected Seekers"
              count={disconnectedSeekers.length}
              color="terracotta"
              subtitle="Needs immediate attention"
            />

            {disconnectedSeekers.length === 0 ? (
              <EmptyState message="Everyone has a home. Alhamdulillah." />
            ) : (
              <div className="grid gap-4">
                {disconnectedSeekers.map((intake) => (
                  <IntakeCard
                    key={intake._id}
                    intake={intake}
                    onTriage={() => handleUpdateIntakeStatus(intake._id, "triaged")}
                    onConnect={() => handleUpdateIntakeStatus(intake._id, "connected")}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Pending Ansars Section */}
          <section>
            <SectionHeader
              icon={<Users className="w-4 h-4" />}
              title="Pending Ansar Applications"
              count={pendingAnsars.length}
              color="sage"
              subtitle="Awaiting approval"
            />

            {pendingAnsars.length === 0 ? (
              <EmptyState message="No pending Ansar applications." />
            ) : (
              <div className="grid gap-4">
                {pendingAnsars.map((ansar) => (
                  <AnsarCard
                    key={ansar._id}
                    ansar={ansar}
                    onApprove={() => handleApproveAnsar(ansar._id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Pending Partners Section */}
          <section>
            <SectionHeader
              icon={<Building2 className="w-4 h-4" />}
              title="Pending Partner Applications"
              count={pendingPartners.length}
              color="ochre"
              subtitle="Awaiting approval"
            />

            {pendingPartners.length === 0 ? (
              <EmptyState message="No pending Partner applications." />
            ) : (
              <div className="grid gap-4">
                {pendingPartners.map((partner) => (
                  <PartnerCard
                    key={partner._id}
                    partner={partner}
                    onApprove={() => handleApprovePartner(partner._id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Approved Partners with Dashboard Links */}
          {approvedPartners.length > 0 && (
            <section>
              <SectionHeader
                icon={<CheckCircle2 className="w-4 h-4" />}
                title="Active Partner Hubs"
                count={approvedPartners.length}
                color="success"
              />
              <div className="grid gap-4">
                {approvedPartners.map((partner) => (
                  <PartnerCard key={partner._id} partner={partner} showDashboardLink />
                ))}
              </div>
            </section>
          )}

          {/* Triaged Seekers */}
          {triagedSeekers.length > 0 && (
            <section>
              <SectionHeader
                icon={<Clock className="w-4 h-4" />}
                title="Triaged Seekers"
                count={triagedSeekers.length}
                color="gray"
              />
              <div className="grid gap-4">
                {triagedSeekers.map((intake) => (
                  <IntakeCard
                    key={intake._id}
                    intake={intake}
                    onConnect={() => handleUpdateIntakeStatus(intake._id, "connected")}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Connected Seekers */}
          {connectedSeekers.length > 0 && (
            <section>
              <SectionHeader
                icon={<CheckCircle2 className="w-4 h-4" />}
                title="Connected Seekers"
                count={connectedSeekers.length}
                color="success"
              />
              <div className="grid gap-4">
                {connectedSeekers.map((intake) => (
                  <IntakeCard key={intake._id} intake={intake} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function SectionHeader({
  icon,
  title,
  count,
  color,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  color: "terracotta" | "sage" | "ochre" | "gray" | "success";
  subtitle?: string;
}) {
  const colorClasses = {
    terracotta: "bg-ansar-terracotta",
    sage: "bg-ansar-sage-600",
    ochre: "bg-ansar-ochre",
    gray: "bg-ansar-gray",
    success: "bg-ansar-success",
  };

  return (
    <h2 className="font-heading text-xl mb-4 flex items-center gap-2">
      <span className={`w-2 h-2 ${colorClasses[color]} rounded-full`} />
      {title}
      <span className="bg-ansar-sage-100 text-ansar-sage-700 text-sm px-2 py-0.5 rounded font-body">
        {count}
      </span>
      {subtitle && (
        <span className="font-body text-xs text-ansar-gray ml-2">
          {subtitle}
        </span>
      )}
    </h2>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="card p-8 text-center">
      <CheckCircle2 className="w-12 h-12 text-ansar-success mx-auto mb-4" />
      <p className="font-heading text-lg text-ansar-charcoal">{message}</p>
    </div>
  );
}

interface IntakeCardProps {
  intake: {
    _id: Id<"intakes">;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    journeyType: "new_muslim" | "reconnecting" | "seeker";
    supportAreas: string[];
    status: string;
  };
  onTriage?: () => void;
  onConnect?: () => void;
}

function IntakeCard({ intake, onTriage, onConnect }: IntakeCardProps) {
  const journeyLabels = {
    new_muslim: "New Muslim",
    reconnecting: "Reconnecting",
    seeker: "Seeker",
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-heading text-lg text-ansar-charcoal">{intake.fullName}</h3>
            <span className="bg-ansar-terracotta-light/20 text-ansar-terracotta text-xs px-2 py-0.5 rounded font-body">
              {journeyLabels[intake.journeyType]}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-ansar-gray font-body mb-3">
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {intake.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {intake.phone}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {intake.city}
            </span>
          </div>
          {intake.supportAreas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {intake.supportAreas.slice(0, 3).map((area) => (
                <span
                  key={area}
                  className="bg-ansar-sage-50 text-ansar-sage-700 text-xs px-2 py-1 rounded font-body"
                >
                  {area.split(":")[0]}
                </span>
              ))}
              {intake.supportAreas.length > 3 && (
                <span className="text-xs text-ansar-gray-light font-body">
                  +{intake.supportAreas.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          {onTriage && (
            <button
              onClick={onTriage}
              className="btn-secondary text-sm py-2 px-4"
            >
              Triage
            </button>
          )}
          {onConnect && (
            <button
              onClick={onConnect}
              className="btn-primary text-sm py-2 px-4"
            >
              Mark Connected
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface AnsarCardProps {
  ansar: {
    _id: Id<"ansars">;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    practiceLevel: string;
    supportAreas: string[];
    status: string;
  };
  onApprove?: () => void;
}

function AnsarCard({ ansar, onApprove }: AnsarCardProps) {
  const practiceLevelLabels: Record<string, string> = {
    consistent: "Consistent",
    steady: "Steady",
    reconnecting: "Reconnecting",
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-heading text-lg text-ansar-charcoal">{ansar.fullName}</h3>
            <span className="bg-ansar-sage-100 text-ansar-sage-700 text-xs px-2 py-0.5 rounded font-body">
              {practiceLevelLabels[ansar.practiceLevel] || ansar.practiceLevel}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-ansar-gray font-body mb-3">
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {ansar.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {ansar.phone}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {ansar.city}
            </span>
          </div>
          {ansar.supportAreas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ansar.supportAreas.map((area) => (
                <span
                  key={area}
                  className="bg-ansar-sage-50 text-ansar-sage-700 text-xs px-2 py-1 rounded font-body capitalize"
                >
                  {area}
                </span>
              ))}
            </div>
          )}
        </div>
        {onApprove && (
          <button
            onClick={onApprove}
            className="btn-primary text-sm py-2 px-4 ml-4"
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
}

interface PartnerCardProps {
  partner: {
    _id: Id<"partners">;
    leadName: string;
    leadEmail: string;
    leadPhone: string;
    orgName: string;
    orgType: string;
    city: string;
    hubLevel: number;
    status: string;
    organizationId?: Id<"organizations">;
  };
  onApprove?: () => void;
  showDashboardLink?: boolean;
}

function PartnerCard({ partner, onApprove, showDashboardLink }: PartnerCardProps) {
  const orgTypeLabels: Record<string, string> = {
    masjid: "Masjid",
    msa: "MSA",
    nonprofit: "Nonprofit",
    informal_circle: "Informal Circle",
    other: "Other",
  };

  // Generate slug from org name for dashboard link
  const slug = partner.orgName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-heading text-lg text-ansar-charcoal">{partner.orgName}</h3>
            <span className="bg-ansar-ochre/10 text-ansar-ochre text-xs px-2 py-0.5 rounded font-body">
              {orgTypeLabels[partner.orgType] || partner.orgType}
            </span>
            <span className="bg-ansar-sage-100 text-ansar-sage-700 text-xs px-2 py-0.5 rounded font-body">
              Level {partner.hubLevel}
            </span>
          </div>
          <p className="font-body text-sm text-ansar-gray mb-2">
            Lead: {partner.leadName}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-ansar-gray font-body">
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {partner.leadEmail}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {partner.leadPhone}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {partner.city}
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          {showDashboardLink && (
            <Link
              href={`/dashboard/${slug}`}
              className="btn-secondary text-sm py-2 px-4"
            >
              View Dashboard
            </Link>
          )}
          {onApprove && (
            <button
              onClick={onApprove}
              className="btn-primary text-sm py-2 px-4"
            >
              Approve & Create Hub
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
