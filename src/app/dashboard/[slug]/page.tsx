"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Users,
  Heart,
  Phone,
  Mail,
  MapPin,
  Building2,
  Loader2,
  Link2,
  X,
  UserPlus,
  Trash2
} from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

/**
 * PARTNER LEAD DASHBOARD — Organization-Scoped View
 * 
 * Partner Leads see only data for their organization:
 * - Seekers assigned to their org
 * - Ansars in their community
 * - Pairings they've created
 * 
 * Key action: Create pairings between Seekers and Ansars.
 */

export default function PartnerDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, isLoaded } = useUser();

  // Get organization by slug
  const organization = useQuery(api.organizations.getBySlug, { slug });

  // Sync user to Convex
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

  // Loading states
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
          <a href="/sign-in" className="btn-primary inline-block">
            Sign In
          </a>
        </div>
      </main>
    );
  }

  if (organization === null) {
    notFound();
  }

  // Authorization check: Partner Leads can only access their own organization
  if (currentUser && currentUser.role === "partner_lead") {
    if (currentUser.organizationId !== organization._id) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
          <div className="text-center max-w-md mx-auto px-6">
            <h1 className="font-heading text-2xl text-ansar-charcoal mb-4">Access Denied</h1>
            <p className="font-body text-ansar-gray mb-6">
              You don&apos;t have permission to access this organization&apos;s dashboard.
            </p>
            <a href="/dashboard" className="btn-primary inline-block">
              Go to Your Dashboard
            </a>
          </div>
        </main>
      );
    }
  }

  return <PartnerDashboard organization={organization} currentUser={currentUser} />;
}

interface Organization {
  _id: Id<"organizations">;
  name: string;
  slug: string;
  type: string;
  city: string;
  hubLevel: number;
}

function PartnerDashboard({
  organization,
  currentUser
}: {
  organization: Organization;
  currentUser: { _id: Id<"users">; role: string; name: string } | null | undefined;
}) {
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [selectedSeeker, setSelectedSeeker] = useState<Id<"intakes"> | null>(null);

  // Organization-scoped queries
  const seekers = useQuery(api.intakes.listByOrganization, { organizationId: organization._id });
  const ansars = useQuery(api.ansars.listByOrganization, { organizationId: organization._id });
  const pairings = useQuery(api.pairings.listByOrganization, { organizationId: organization._id });
  const pairingStats = useQuery(api.pairings.getOrgStats, { organizationId: organization._id });

  // Available for pairing
  const readyToPair = useQuery(api.intakes.listReadyForPairing, { organizationId: organization._id });
  const availableAnsars = useQuery(api.ansars.listAvailableForPairing, { organizationId: organization._id });

  // Mutations
  const createPairing = useMutation(api.pairings.create);
  const markIntroSent = useMutation(api.pairings.markIntroSent);
  const assignSeeker = useMutation(api.intakes.assignToOrganization);
  const assignAnsar = useMutation(api.ansars.assignToOrganization);
  const deleteIntake = useMutation(api.intakes.deleteIntake);
  const updateStatus = useMutation(api.ansars.updateStatus);

  // Stats
  const triagedSeekers = seekers?.filter((s) => s.status === "triaged") ?? [];
  const connectedSeekers = seekers?.filter((s) => s.status === "connected" || s.status === "active") ?? [];
  const pendingAnsars = ansars?.filter((a) => a.status === "pending") ?? [];
  const approvedAnsars = ansars?.filter((a) => a.status === "approved") ?? [];
  const activeAnsars = ansars?.filter((a) => a.status === "active") ?? [];
  const activePairings = pairings?.filter((p) => p.status === "active" || p.status === "pending_intro") ?? [];

  const handleCreatePairing = async (ansarId: Id<"ansars">) => {
    if (!selectedSeeker || !currentUser) return;

    try {
      await createPairing({
        seekerId: selectedSeeker,
        ansarId,
        organizationId: organization._id,
        pairedByUserId: currentUser._id,
      });
      setShowPairingModal(false);
      setSelectedSeeker(null);
    } catch (error) {
      console.error("Failed to create pairing:", error);
      alert("Failed to create pairing. Please try again.");
    }
  };

  const handleMarkIntroSent = async (pairingId: Id<"pairings">) => {
    await markIntroSent({ id: pairingId });
  };

  const handleDeleteSeeker = async (id: Id<"intakes">) => {
    if (confirm("Are you sure you want to remove this seeker? This cannot be undone.")) {
      await deleteIntake({ id });
    }
  };

  const handleUpdateAnsarStatus = async (id: Id<"ansars">, status: "approved" | "inactive") => {
    try {
      await updateStatus({ id, status });
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const openPairingModal = (seekerId: Id<"intakes">) => {
    setSelectedSeeker(seekerId);
    setShowPairingModal(true);
  };

  return (
    <main className="min-h-screen bg-ansar-cream">
      {/* Header */}
      <header className="px-6 md:px-12 py-6 border-b border-ansar-sage-100 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${organization.slug}`} className="text-ansar-gray hover:text-ansar-charcoal transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-ansar-sage-600" />
              <h1 className="font-heading text-xl text-ansar-charcoal">{organization.name}</h1>
              <span className="bg-ansar-sage-100 text-ansar-sage-700 text-xs px-2 py-0.5 rounded font-body">
                Level {organization.hubLevel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {currentUser && (
              <span className="font-body text-sm text-ansar-gray">
                {currentUser.name}
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
            <StatCard
              icon={<Heart className="w-5 h-5 text-ansar-terracotta" />}
              label="Seekers"
              value={seekers?.length ?? 0}
              highlight={triagedSeekers.length}
              highlightLabel="ready to pair"
            />
            <StatCard
              icon={<Users className="w-5 h-5 text-ansar-sage-600" />}
              label="Ansars"
              value={ansars?.length ?? 0}
              highlight={approvedAnsars.length}
              highlightLabel="available"
            />
            <StatCard
              icon={<Link2 className="w-5 h-5 text-ansar-ochre" />}
              label="Active Pairings"
              value={activePairings.length}
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5 text-ansar-success" />}
              label="Completed"
              value={pairingStats?.completed ?? 0}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-12 py-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Ready to Pair Section */}
          <section>
            <h2 className="font-heading text-xl mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-ansar-terracotta rounded-full" />
              Ready to Pair
              <span className="bg-ansar-sage-100 text-ansar-sage-700 text-sm px-2 py-0.5 rounded font-body">
                {triagedSeekers.length}
              </span>
              <span className="font-body text-xs text-ansar-gray ml-2">
                Seekers waiting to be matched with an Ansar
              </span>
            </h2>

            {triagedSeekers.length === 0 ? (
              <div className="card p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-ansar-success mx-auto mb-4" />
                <p className="font-heading text-lg text-ansar-charcoal">
                  All seekers have been paired!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {triagedSeekers.map((seeker) => (
                  <SeekerCard
                    key={seeker._id}
                    seeker={seeker}
                    action={
                      availableAnsars && availableAnsars.length > 0 ? (
                        <button
                          onClick={() => openPairingModal(seeker._id)}
                          className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Pair with Ansar
                        </button>
                      ) : (
                        <span className="font-body text-sm text-ansar-gray">
                          No Ansars available
                        </span>
                      )
                    }
                    onDelete={() => handleDeleteSeeker(seeker._id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Pending Intro Section */}
          {activePairings.filter(p => p.status === "pending_intro").length > 0 && (
            <section>
              <h2 className="font-heading text-xl mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-ansar-ochre rounded-full" />
                Awaiting 3-Way Intro
                <span className="bg-ansar-sage-100 text-ansar-sage-700 text-sm px-2 py-0.5 rounded font-body">
                  {activePairings.filter(p => p.status === "pending_intro").length}
                </span>
              </h2>
              <div className="grid gap-4">
                {activePairings.filter(p => p.status === "pending_intro").map((pairing) => (
                  <PairingCard
                    key={pairing._id}
                    pairing={pairing}
                    seekers={seekers ?? []}
                    ansars={ansars ?? []}
                    onMarkIntroSent={() => handleMarkIntroSent(pairing._id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Active Pairings Section */}
          {activePairings.filter(p => p.status === "active").length > 0 && (
            <section>
              <h2 className="font-heading text-xl mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-ansar-success rounded-full" />
                Active Pairings
                <span className="bg-ansar-sage-100 text-ansar-sage-700 text-sm px-2 py-0.5 rounded font-body">
                  {activePairings.filter(p => p.status === "active").length}
                </span>
              </h2>
              <div className="grid gap-4">
                {activePairings.filter(p => p.status === "active").map((pairing) => (
                  <PairingCard
                    key={pairing._id}
                    pairing={pairing}
                    seekers={seekers ?? []}
                    ansars={ansars ?? []}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Pending Review Section */}
          <section>
            <h2 className="font-heading text-xl mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-ansar-ochre rounded-full" />
              Pending Applications
              <span className="bg-ansar-sage-100 text-ansar-sage-700 text-sm px-2 py-0.5 rounded font-body">
                {pendingAnsars.length}
              </span>
              <span className="font-body text-xs text-ansar-gray ml-2">
                New volunteers waiting for approval
              </span>
            </h2>

            {pendingAnsars.length === 0 ? (
              <div className="card p-6 text-center border-dashed border-2 border-ansar-sage-100 bg-transparent shadow-none">
                <p className="font-body text-sm text-ansar-gray">
                  No new applications to review.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingAnsars.map((ansar) => (
                  <AnsarCard
                    key={ansar._id}
                    ansar={ansar}
                    isPending
                    onApprove={() => handleUpdateAnsarStatus(ansar._id, "approved")}
                    onReject={() => handleUpdateAnsarStatus(ansar._id, "inactive")}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Available Ansars Section */}
          <section>
            <h2 className="font-heading text-xl mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-ansar-sage-600 rounded-full" />
              Available Ansars
              <span className="bg-ansar-sage-100 text-ansar-sage-700 text-sm px-2 py-0.5 rounded font-body">
                {approvedAnsars.length}
              </span>
              <span className="font-body text-xs text-ansar-gray ml-2">
                Approved and ready for pairing
              </span>
            </h2>

            {approvedAnsars.length === 0 ? (
              <div className="card p-8 text-center">
                <Users className="w-12 h-12 text-ansar-gray-light mx-auto mb-4" />
                <p className="font-heading text-lg text-ansar-charcoal mb-2">
                  No Ansars available
                </p>
                <p className="font-body text-sm text-ansar-gray">
                  Recruit volunteers at{" "}
                  <Link href={`/${organization.slug}/volunteer`} className="text-ansar-sage-600 underline">
                    /{organization.slug}/volunteer
                  </Link>
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {approvedAnsars.map((ansar) => (
                  <AnsarCard key={ansar._id} ansar={ansar} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Pairing Modal */}
      {showPairingModal && selectedSeeker && (
        <PairingModal
          seeker={seekers?.find(s => s._id === selectedSeeker)}
          availableAnsars={availableAnsars ?? []}
          onSelect={handleCreatePairing}
          onClose={() => {
            setShowPairingModal(false);
            setSelectedSeeker(null);
          }}
        />
      )}
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function StatCard({
  icon,
  label,
  value,
  highlight,
  highlightLabel
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  highlight?: number;
  highlightLabel?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-ansar-sage-50 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="font-body text-xs uppercase tracking-wider text-ansar-gray">{label}</p>
        <p className="font-heading text-lg text-ansar-charcoal">
          {value}
          {highlight !== undefined && highlightLabel && (
            <span className="font-body text-sm text-ansar-sage-600 ml-2">
              ({highlight} {highlightLabel})
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function SeekerCard({
  seeker,
  action,
  onDelete
}: {
  seeker: {
    _id: Id<"intakes">;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    journeyType: string;
    supportAreas: string[];
  };
  action?: React.ReactNode;
  onDelete?: () => void;
}) {
  const journeyLabels: Record<string, string> = {
    new_muslim: "New Muslim",
    reconnecting: "Reconnecting",
    seeker: "Seeker",
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-heading text-lg text-ansar-charcoal">{seeker.fullName}</h3>
            <span className="bg-ansar-terracotta-light/20 text-ansar-terracotta text-xs px-2 py-0.5 rounded font-body">
              {journeyLabels[seeker.journeyType] || seeker.journeyType}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-ansar-gray font-body mb-3">
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {seeker.phone}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {seeker.city}
            </span>
          </div>
          {seeker.supportAreas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {seeker.supportAreas.slice(0, 3).map((area) => (
                <span
                  key={area}
                  className="bg-ansar-sage-50 text-ansar-sage-700 text-xs px-2 py-1 rounded font-body"
                >
                  {area.split(":")[0]}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="ml-4 flex items-center gap-2">
          {action}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-ansar-gray hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove Seeker"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AnsarCard({
  ansar,
  isPending,
  onApprove,
  onReject
}: {
  ansar: {
    _id: Id<"ansars">;
    fullName: string;
    phone: string;
    city: string;
    practiceLevel: string;
    supportAreas: string[];
    gender: string;
    motivation?: string;
  };
  isPending?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-heading text-lg text-ansar-charcoal">{ansar.fullName}</h3>
            <span className="bg-ansar-sage-100 text-ansar-sage-700 text-xs px-2 py-0.5 rounded font-body capitalize">
              {ansar.gender === "male" ? "Brother" : "Sister"}
            </span>
            {isPending && (
              <span className="bg-ansar-ochre/20 text-ansar-ochre text-xs px-2 py-0.5 rounded font-body">
                Pending Review
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-ansar-gray font-body mb-3">
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {ansar.phone}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {ansar.city}
            </span>
          </div>

          {ansar.motivation && (
            <div className="mb-3 bg-ansar-sage-50/50 p-2 rounded text-sm text-ansar-gray italic">
              "{ansar.motivation.length > 80 ? ansar.motivation.substring(0, 80) + "..." : ansar.motivation}"
            </div>
          )}

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
        </div>

        {isPending && (
          <div className="flex items-center gap-2 ml-4">
            <button onClick={onApprove} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 bg-ansar-success hover:bg-ansar-success/90 border-transparent">
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </button>
            <button onClick={onReject} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 text-ansar-terracotta hover:bg-ansar-terracotta/10 border-ansar-terracotta/20">
              <X className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PairingCard({
  pairing,
  seekers,
  ansars,
  onMarkIntroSent
}: {
  pairing: {
    _id: Id<"pairings">;
    seekerId: Id<"intakes">;
    ansarId: Id<"ansars">;
    status: string;
    pairedAt: number;
  };
  seekers: { _id: Id<"intakes">; fullName: string; phone: string }[];
  ansars: { _id: Id<"ansars">; fullName: string; phone: string }[];
  onMarkIntroSent?: () => void;
}) {
  const seeker = seekers.find(s => s._id === pairing.seekerId);
  const ansar = ansars.find(a => a._id === pairing.ansarId);
  const pairedDate = new Date(pairing.pairedAt).toLocaleDateString();

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="font-body text-xs text-ansar-gray uppercase mb-1">Seeker</p>
            <p className="font-heading text-lg text-ansar-charcoal">{seeker?.fullName}</p>
            <p className="font-body text-sm text-ansar-gray">{seeker?.phone}</p>
          </div>
          <div className="flex items-center gap-2 text-ansar-sage-600">
            <div className="w-8 h-px bg-ansar-sage-300" />
            <Link2 className="w-5 h-5" />
            <div className="w-8 h-px bg-ansar-sage-300" />
          </div>
          <div className="text-center">
            <p className="font-body text-xs text-ansar-gray uppercase mb-1">Ansar</p>
            <p className="font-heading text-lg text-ansar-charcoal">{ansar?.fullName}</p>
            <p className="font-body text-sm text-ansar-gray">{ansar?.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-body text-xs text-ansar-gray mb-2">Paired {pairedDate}</p>
          {pairing.status === "pending_intro" && onMarkIntroSent && (
            <button
              onClick={onMarkIntroSent}
              className="btn-primary text-sm py-2 px-4"
            >
              Mark Intro Sent
            </button>
          )}
          {pairing.status === "active" && (
            <span className="bg-ansar-success/10 text-ansar-success text-xs px-3 py-1 rounded-full font-body">
              Active
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PairingModal({
  seeker,
  availableAnsars,
  onSelect,
  onClose
}: {
  seeker?: {
    _id: Id<"intakes">;
    fullName: string;
    gender: string;
    supportAreas: string[];
  };
  availableAnsars: {
    _id: Id<"ansars">;
    fullName: string;
    gender: string;
    supportAreas: string[];
    phone: string;
  }[];
  onSelect: (ansarId: Id<"ansars">) => void;
  onClose: () => void;
}) {
  if (!seeker) return null;

  // Filter ansars by gender match
  const genderMatchedAnsars = availableAnsars.filter(
    a => a.gender === seeker.gender
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-ansar-sage-100 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl text-ansar-charcoal">
              Pair {seeker.fullName}
            </h2>
            <p className="font-body text-sm text-ansar-gray">
              Select an Ansar to match with this seeker
            </p>
          </div>
          <button onClick={onClose} className="text-ansar-gray hover:text-ansar-charcoal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {genderMatchedAnsars.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-ansar-gray-light mx-auto mb-4" />
              <p className="font-body text-ansar-gray">
                No {seeker.gender === "male" ? "brothers" : "sisters"} available for pairing.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {genderMatchedAnsars.map((ansar) => (
                <button
                  key={ansar._id}
                  onClick={() => onSelect(ansar._id)}
                  className="w-full card p-4 text-left hover:border-ansar-sage-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-lg text-ansar-charcoal">{ansar.fullName}</h3>
                      <p className="font-body text-sm text-ansar-gray">{ansar.phone}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ansar.supportAreas.map((area) => (
                          <span
                            key={area}
                            className="bg-ansar-sage-50 text-ansar-sage-700 text-xs px-2 py-0.5 rounded font-body capitalize"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                    <UserPlus className="w-5 h-5 text-ansar-sage-600" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
