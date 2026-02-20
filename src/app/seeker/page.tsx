"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import {
  Loader2, Heart, BookOpen, Video, Users, ArrowRight, CheckCircle2,
  Phone, Mail, MapPin, UserCircle, Building2, Clock,
  MessageSquare, Send, Inbox as InboxIcon, Home, PlayCircle,
  Calendar, LifeBuoy, ExternalLink, FileText,
} from "lucide-react";
import { DashboardSidebar, SidebarNavItem } from "@/components/crm";
import { MessageBubble } from "@/components/messaging/MessageBubble";
import { FloatingChatWidget } from "@/components/messaging/FloatingChatWidget";

/**
 * SEEKER PORTAL — Redesigned dashboard for New Muslims & Seekers
 *
 * Sidebar navigation with tabs:
 *  - Home: Welcome, status, quick actions, events, video carousel
 *  - Messages: Inbox with Ansar
 *  - My Journey: Progress tracker + Ansar card
 *  - Learn: Video carousel + reading resources
 *  - Support: Hotline, live chat, community links
 */

// ═══════════════════════════════════════════════════════════════
// VIDEO DATA (placeholder — swap YouTube IDs when Bro Uzi finishes)
// ═══════════════════════════════════════════════════════════════

const ONBOARDING_VIDEOS = [
  { id: "placeholder_wudu", title: "How to Make Wudu", duration: "~5 min", placeholder: true },
  { id: "placeholder_shahada", title: "Understanding the Shahada", duration: "~8 min", placeholder: true },
  { id: "placeholder_salah", title: "How to Pray (Salah)", duration: "~12 min", placeholder: true },
  { id: "placeholder_quran", title: "Beginning with the Quran", duration: "~10 min", placeholder: true },
];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function SeekerPortalPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("home");

  // Self-heal: ensure user record exists in Convex (same as dashboard gateway)
  const upsertUser = useMutation(api.users.upsertFromClerk);
  const [upsertAttempted, setUpsertAttempted] = useState(false);

  useEffect(() => {
    if (user && isLoaded && !upsertAttempted) {
      upsertUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? user.firstName ?? "User",
      }).then(() => {
        setUpsertAttempted(true);
      }).catch((err) => {
        console.warn("upsertFromClerk on seeker page failed:", err);
        setUpsertAttempted(true);
      });
    }
  }, [user, isLoaded, upsertAttempted, upsertUser]);

  const currentUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get seeker's intake record by email (normalized)
  const seekerEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const seekerIntake = useQuery(
    api.intakes.getByEmail,
    seekerEmail ? { email: seekerEmail } : "skip"
  );

  // Get seeker's active pairing (includes Ansar + Organization details)
  const pairing = useQuery(
    api.pairings.getBySeeker,
    seekerIntake?._id ? { seekerId: seekerIntake._id } : "skip"
  );

  // Get upcoming events for the seeker's organization
  const orgId = seekerIntake?.organizationId;
  const events = useQuery(
    api.events.getByOrganization,
    orgId ? { organizationId: orgId } : "skip"
  ) ?? [];

  // Get hub resources (videos, articles, links) for this seeker
  const hubResources = useQuery(
    api.hubResources.listForSeeker,
    orgId
      ? { organizationId: orgId, seekerId: seekerIntake?._id }
      : "skip"
  ) ?? [];
  const hubVideos = hubResources.filter((r: any) => r.type === "video");
  const hubArticles = hubResources.filter((r: any) => r.type === "article" || r.type === "link");

  // Inbox
  const seekerUserId = currentUser?._id as Id<"users"> | undefined;
  const inbox = useQuery(
    api.inbox.getInbox,
    seekerUserId ? { userId: seekerUserId } : "skip"
  ) ?? [];
  const inboxUnread = useQuery(
    api.inbox.getUnreadTotal,
    seekerUserId ? { userId: seekerUserId } : "skip"
  ) ?? 0;

  const latestConvoId = inbox.length > 0 ? inbox[0].conversationId : undefined;
  const latestConversation = useQuery(
    api.inbox.getConversation,
    latestConvoId && seekerUserId
      ? { conversationId: latestConvoId, userId: seekerUserId }
      : "skip"
  );

  const markAsRead = useMutation(api.inbox.markAsRead);
  const replyToConversation = useMutation(api.inbox.replyToConversation);

  // Get the Ansar's user record for the floating chat widget
  const ansarUser = useQuery(
    api.users.getByEmail,
    pairing?.ansar?.email ? { email: pairing.ansar.email.toLowerCase() } : "skip"
  );

  // ── Loading states ────────────────────────────────────────────
  if (!isLoaded || currentUser === undefined || (currentUser === null && !upsertAttempted)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-ansar-sage-600 animate-spin mx-auto mb-4" />
          <p className="font-body text-ansar-gray">Loading your portal...</p>
        </div>
      </main>
    );
  }

  if (currentUser === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <div className="text-center max-w-md mx-auto px-6">
          <Loader2 className="w-8 h-8 text-ansar-sage-600 animate-spin mx-auto mb-4" />
          <p className="font-body text-ansar-gray mb-2">Setting up your account...</p>
          <p className="font-body text-sm text-ansar-gray/60">This usually takes just a moment.</p>
        </div>
      </main>
    );
  }

  if (currentUser.role !== "seeker") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <div className="text-center max-w-md mx-auto px-6">
          <p className="font-body text-ansar-gray">This page is for seekers only.</p>
          <Link href="/dashboard" className="text-ansar-sage-600 font-body hover:underline mt-4 block">
            &larr; Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  // ── Derived state ─────────────────────────────────────────────
  const firstName = currentUser.name.split(" ")[0];
  const intakeExists = seekerIntake !== null && seekerIntake !== undefined;
  const status = seekerIntake?.status || "awaiting_outreach";

  // ── Sidebar nav items ─────────────────────────────────────────
  const navItems: SidebarNavItem[] = [
    { id: "home", label: "Home", icon: <Home className="w-4 h-4" />, description: `Welcome back, ${firstName}` },
    { id: "messages", label: "Messages", icon: <MessageSquare className="w-4 h-4" />, badge: inboxUnread, description: "Conversations with your community" },
    { id: "journey", label: "My Journey", icon: <CheckCircle2 className="w-4 h-4" />, description: "Your progress and companion" },
    { id: "learn", label: "Learn", icon: <PlayCircle className="w-4 h-4" />, description: "Videos, reading, and guides" },
    { id: "support", label: "Support", icon: <LifeBuoy className="w-4 h-4" />, description: "Get help anytime" },
  ];

  return (
    <>
      <DashboardSidebar
        brandIcon={<Heart className="w-4 h-4 text-white" />}
        brandTitle="Ansar Family"
        brandSubtitle="Your Journey Portal"
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={currentUser.name}
        userRoleLabel="Seeker"
        accentColor="sage"
      >
        {/* ═══════ HOME TAB ═══════ */}
        {activeTab === "home" && (
          <HomeTab
            firstName={firstName}
            intakeExists={intakeExists}
            status={status}
            seekerIntake={seekerIntake}
            pairing={pairing}
            events={events}
            hubVideos={hubVideos}
            inboxUnread={inboxUnread}
            onNavigate={setActiveTab}
          />
        )}

        {/* ═══════ MESSAGES TAB ═══════ */}
        {activeTab === "messages" && seekerUserId && (
          <MessagesTab
            seekerUserId={seekerUserId}
            seekerName={currentUser.name}
            inbox={inbox}
            inboxUnread={inboxUnread}
            latestConversation={latestConversation}
            markAsRead={markAsRead}
            replyToConversation={replyToConversation}
            pairing={pairing}
          />
        )}

        {/* ═══════ JOURNEY TAB ═══════ */}
        {activeTab === "journey" && (
          <JourneyTab
            intakeExists={intakeExists}
            status={status}
            seekerIntake={seekerIntake}
            pairing={pairing}
          />
        )}

        {/* ═══════ LEARN TAB ═══════ */}
        {activeTab === "learn" && <LearnTab hubVideos={hubVideos} hubArticles={hubArticles} />}

        {/* ═══════ SUPPORT TAB ═══════ */}
        {activeTab === "support" && <SupportTab />}
      </DashboardSidebar>

      {/* ═══════ FLOATING CHAT WIDGET ═══════ */}
      {seekerUserId && activeTab !== "messages" && (
        <FloatingChatWidget
          currentUserId={seekerUserId}
          currentUserName={currentUser.name}
          currentUserRole="seeker"
          recipientId={ansarUser?._id}
          recipientName={pairing?.ansar?.fullName}
          recipientRole="ansar"
          organizationId={orgId}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOME TAB
// ═══════════════════════════════════════════════════════════════

function HomeTab({
  firstName,
  intakeExists,
  status,
  seekerIntake,
  pairing,
  events,
  hubVideos,
  inboxUnread,
  onNavigate,
}: {
  firstName: string;
  intakeExists: boolean;
  status: string;
  seekerIntake: any;
  pairing: any;
  events: any[];
  hubVideos: any[];
  inboxUnread: number;
  onNavigate: (tab: string) => void;
}) {
  // Merge hub videos (from partner) with default onboarding videos
  const mergedVideos = [
    ...hubVideos.map((v: any) => ({
      id: v.videoId || v._id,
      title: v.title,
      duration: "",
      isHub: true,
    })),
    ...ONBOARDING_VIDEOS,
  ];
  return (
    <>
      {/* Welcome + Status Banner */}
      <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 bg-ansar-sage-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 text-ansar-sage-600" />
          </div>
          <div className="flex-1">
            <h1 className="font-heading text-2xl lg:text-3xl text-ansar-charcoal mb-1">
              Assalamu Alaikum, {firstName}
            </h1>
            <p className="font-body text-ansar-gray">
              Welcome to your journey portal. We&apos;re so glad you&apos;re here.
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <StatusBanner
          intakeExists={intakeExists}
          status={status}
          seekerIntake={seekerIntake}
          pairing={pairing}
        />
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-lg border border-[rgba(61,61,61,0.06)] shadow-sm overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x-0 lg:divide-x divide-[rgba(61,61,61,0.06)]">
          <QuickAction
            icon={<MessageSquare className="w-5 h-5" />}
            label="Messages"
            badge={inboxUnread}
            onClick={() => onNavigate("messages")}
          />
          <QuickAction
            icon={<PlayCircle className="w-5 h-5" />}
            label="Watch & Learn"
            onClick={() => onNavigate("learn")}
          />
          <QuickAction
            icon={<Calendar className="w-5 h-5" />}
            label="Events"
            badge={events.length}
            onClick={() => {
              const el = document.getElementById("events-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />
          <QuickAction
            icon={<LifeBuoy className="w-5 h-5" />}
            label="Get Support"
            onClick={() => onNavigate("support")}
          />
        </div>
      </div>

      {/* Two-column layout: Events + Ansar/Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column (3/5): Events + Videos */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upcoming Events */}
          <div id="events-section" className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="font-heading text-lg text-ansar-charcoal mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-ansar-sage-600" />
              Upcoming Events
            </h2>
            {events.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-ansar-muted/30 mx-auto mb-2" />
                <p className="font-body text-sm text-ansar-muted">
                  No upcoming events yet. Your community will post events here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 3).map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </div>

          {/* Video Carousel Preview */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg text-ansar-charcoal flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-ansar-sage-600" />
                Start Learning
              </h2>
              <button
                onClick={() => onNavigate("learn")}
                className="text-xs font-body text-ansar-sage-600 hover:text-ansar-sage-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <VideoCarousel videos={mergedVideos.slice(0, 5)} />
          </div>
        </div>

        {/* Right column (2/5): Ansar + Journey */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ansar Card */}
          {pairing && pairing.ansar ? (
            <AnsarCard pairing={pairing} />
          ) : (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-heading text-lg text-ansar-charcoal mb-3 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-ansar-sage-600" />
                Your Ansar
              </h3>
              <div className="text-center py-4">
                <UserCircle className="w-10 h-10 text-ansar-muted/30 mx-auto mb-2" />
                <p className="font-body text-sm text-ansar-muted">
                  Your personal companion will be assigned soon.
                </p>
              </div>
            </div>
          )}

          {/* Mini Journey Tracker */}
          {intakeExists && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg text-ansar-charcoal">Your Journey</h3>
                <button
                  onClick={() => onNavigate("journey")}
                  className="text-xs font-body text-ansar-sage-600 hover:text-ansar-sage-700 flex items-center gap-1"
                >
                  Details <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-0">
                <JourneyStep step={1} label="Form Submitted" completed={true} active={status === "awaiting_outreach"} />
                <JourneyStep step={2} label="Community Matched" completed={status === "triaged" || status === "connected" || status === "active"} active={status === "triaged"} />
                <JourneyStep step={3} label="Paired with Ansar" completed={status === "connected" || status === "active"} active={status === "connected" || status === "active"} isLast />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inspirational Quote */}
      <div className="border-l-4 border-ansar-sage-400 pl-6 py-2">
        <p className="font-body text-ansar-gray italic leading-relaxed">
          &quot;True Islam is lived with people, not just watched. Real growth happens in community.&quot;
        </p>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// MESSAGES TAB
// ═══════════════════════════════════════════════════════════════

function MessagesTab({
  seekerUserId,
  seekerName,
  inbox,
  inboxUnread,
  latestConversation,
  markAsRead,
  replyToConversation,
  pairing,
}: {
  seekerUserId: Id<"users">;
  seekerName: string;
  inbox: any[];
  inboxUnread: number;
  latestConversation: any;
  markAsRead: any;
  replyToConversation: any;
  pairing: any;
}) {
  const [replyText, setReplyText] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const startConversation = useMutation(api.inbox.startConversation);

  // Get the Ansar's user record so we can message them
  const ansarUserId = pairing?.ansar?.userId;
  const ansarUser = useQuery(
    api.users.getByEmail,
    pairing?.ansar?.email ? { email: pairing.ansar.email.toLowerCase() } : "skip"
  );

  useEffect(() => {
    if (latestConversation && inboxUnread > 0) {
      markAsRead({ conversationId: latestConversation._id, userId: seekerUserId });
    }
  }, [latestConversation, inboxUnread, markAsRead, seekerUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [latestConversation?.messages?.length]);

  const handleReply = async () => {
    if (!replyText.trim() || sending || !latestConversation) return;
    setSending(true);
    try {
      await replyToConversation({
        conversationId: latestConversation._id,
        senderId: seekerUserId,
        senderName: seekerName,
        senderRole: "seeker",
        body: replyText.trim(),
      });
      setReplyText("");
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setSending(false);
    }
  };

  const handleSendFirst = async () => {
    if (!firstMessage.trim() || sending) return;
    const recipientId = ansarUser?._id;
    if (!recipientId) return;
    setSending(true);
    try {
      await startConversation({
        senderId: seekerUserId,
        senderName: seekerName,
        senderRole: "seeker",
        recipientId,
        recipientName: pairing.ansar.fullName,
        recipientRole: "ansar",
        body: firstMessage.trim(),
        organizationId: pairing.organizationId,
      });
      setFirstMessage("");
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setSending(false);
    }
  };

  if (inbox.length === 0) {
    // Paired with Ansar — allow sending first message
    if (pairing?.ansar && ansarUser) {
      return (
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-ansar-sage-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-heading text-ansar-sage-700">
                {pairing.ansar.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
              </span>
            </div>
            <h3 className="font-heading text-lg text-ansar-charcoal mb-1">
              Say Salam to {pairing.ansar.fullName.split(" ")[0]}
            </h3>
            <p className="font-body text-sm text-ansar-muted max-w-sm mx-auto">
              Your Ansar companion is ready to connect. Send them your first message!
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <div className="flex items-end gap-2">
              <textarea
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendFirst();
                  }
                }}
                placeholder="Assalamu Alaikum! I'm excited to connect..."
                rows={3}
                className="flex-1 px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal placeholder:text-ansar-muted/50 resize-none focus:outline-none focus:border-ansar-sage-400 focus:ring-1 focus:ring-ansar-sage-200"
              />
              <button
                onClick={handleSendFirst}
                disabled={!firstMessage.trim() || sending}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-ansar-sage-600 text-white hover:bg-ansar-sage-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Not paired yet
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <div className="text-center py-12">
          <InboxIcon className="w-12 h-12 text-ansar-muted/30 mx-auto mb-4" />
          <h3 className="font-heading text-lg text-ansar-charcoal mb-2">No messages yet</h3>
          <p className="font-body text-sm text-ansar-muted max-w-sm mx-auto">
            Once you&apos;re paired with an Ansar companion, you&apos;ll be able to message them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col" style={{ minHeight: "500px" }}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-[rgba(61,61,61,0.08)]">
        {latestConversation && (
          <p className="font-body text-sm text-ansar-muted">
            Conversation with{" "}
            <span className="text-ansar-charcoal font-medium">
              {latestConversation.participants
                ?.filter((p: any) => p.userId !== seekerUserId)
                .map((p: any) => p.userName)
                .join(", ")}
            </span>
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto bg-[#FAFAF8]">
        {latestConversation?.messages?.map((msg: any) => (
          <MessageBubble
            key={msg._id}
            senderName={msg.senderName}
            senderRole={msg.senderRole}
            body={msg.body}
            sentAt={msg.sentAt}
            isMine={msg.senderId === seekerUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply */}
      <div className="px-6 py-4 border-t border-[rgba(61,61,61,0.08)]">
        <div className="flex items-end gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleReply();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-3 py-2 border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal placeholder:text-ansar-muted/50 resize-none focus:outline-none focus:border-ansar-sage-400 focus:ring-1 focus:ring-ansar-sage-200"
            style={{ minHeight: "38px", maxHeight: "100px" }}
          />
          <button
            onClick={handleReply}
            disabled={!replyText.trim() || sending}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-ansar-sage-600 text-white hover:bg-ansar-sage-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// JOURNEY TAB
// ═══════════════════════════════════════════════════════════════

function JourneyTab({
  intakeExists,
  status,
  seekerIntake,
  pairing,
}: {
  intakeExists: boolean;
  status: string;
  seekerIntake: any;
  pairing: any;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Journey Progress */}
      <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm">
        <h2 className="font-heading text-xl text-ansar-charcoal mb-6">Your Journey</h2>
        {intakeExists ? (
          <div className="space-y-0">
            <JourneyStep
              step={1}
              label="Form Submitted"
              description="Your information has been received"
              completed={true}
              active={status === "awaiting_outreach"}
            />
            <JourneyStep
              step={2}
              label="Community Matched"
              description={
                pairing?.organization?.name || seekerIntake?.organizationId
                  ? "You've been assigned to a local community"
                  : "Waiting to be matched"
              }
              completed={status === "triaged" || status === "connected" || status === "active"}
              active={status === "triaged"}
            />
            <JourneyStep
              step={3}
              label="Paired with Ansar"
              description={
                pairing?.ansar
                  ? `Your companion: ${pairing.ansar.fullName}`
                  : "Your personal companion will be assigned"
              }
              completed={status === "connected" || status === "active"}
              active={status === "connected" || status === "active"}
              isLast
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-ansar-sage-600 animate-spin mx-auto mb-3" />
            <p className="font-body text-sm text-ansar-muted">Setting up your journey...</p>
          </div>
        )}
      </div>

      {/* Ansar Card */}
      <div className="space-y-6">
        {pairing && pairing.ansar ? (
          <AnsarCard pairing={pairing} />
        ) : (
          <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm">
            <h2 className="font-heading text-xl text-ansar-charcoal mb-6 flex items-center gap-2">
              <UserCircle className="w-6 h-6 text-ansar-sage-600" />
              Your Ansar (Companion)
            </h2>
            <div className="text-center py-8">
              <UserCircle className="w-14 h-14 text-ansar-muted/20 mx-auto mb-3" />
              <p className="font-body text-ansar-muted">
                Your personal companion will be assigned once you&apos;re matched with a community.
              </p>
            </div>
          </div>
        )}

        {/* Status detail */}
        <StatusBanner
          intakeExists={intakeExists}
          status={status}
          seekerIntake={seekerIntake}
          pairing={pairing}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LEARN TAB
// ═══════════════════════════════════════════════════════════════

function LearnTab({ hubVideos, hubArticles }: { hubVideos: any[]; hubArticles: any[] }) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Merge hub videos (from partner) with default onboarding videos
  const allVideos = [
    ...hubVideos.map((v: any) => ({
      id: v.videoId || v._id,
      title: v.title,
      duration: "",
      isHub: true,
      description: v.description,
    })),
    ...ONBOARDING_VIDEOS,
  ];

  return (
    <>
      {/* Hub-specific content from your community */}
      {hubVideos.length > 0 && (
        <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm border-l-4 border-ansar-sage-400">
          <h2 className="font-heading text-xl text-ansar-charcoal mb-2 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-ansar-sage-600" />
            From Your Community
          </h2>
          <p className="font-body text-sm text-ansar-gray mb-6">
            Videos shared by your local community to help you on your journey.
          </p>

          {/* Playing video */}
          {playingId && (
            <div className="mb-6">
              <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${playingId}?autoplay=1&rel=0`}
                  title="Video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <button
                onClick={() => setPlayingId(null)}
                className="mt-3 text-xs font-body text-ansar-muted hover:text-ansar-charcoal"
              >
                Close video
              </button>
            </div>
          )}

          <VideoCarousel
            videos={hubVideos.map((v: any) => ({
              id: v.videoId || v._id,
              title: v.title,
              duration: "",
            }))}
            onPlay={setPlayingId}
            activeId={playingId}
          />
        </div>
      )}

      {/* Hub articles & links */}
      {hubArticles.length > 0 && (
        <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm border-l-4 border-ansar-ochre-400">
          <h2 className="font-heading text-xl text-ansar-charcoal mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-ansar-ochre-600" />
            Recommended by Your Community
          </h2>
          <p className="font-body text-sm text-ansar-gray mb-6">
            Articles and resources shared by your local hub.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hubArticles.map((a: any) => (
              <ResourceLink
                key={a._id}
                title={a.title}
                source={a.description || new URL(a.url).hostname.replace("www.", "")}
                href={a.url}
              />
            ))}
          </div>
        </div>
      )}

      {/* Default Video Section */}
      <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm">
        <h2 className="font-heading text-xl text-ansar-charcoal mb-1">Getting Started Videos</h2>
        <p className="font-body text-sm text-ansar-gray mb-1">
          Short, practical videos to help you understand the basics of Islam.
        </p>
        <p className="font-body text-xs text-ansar-sage-600 mb-6 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 bg-ansar-sage-400 rounded-full" />
          Videos are being prepared — titles below show what&apos;s coming.
        </p>

        {/* Playing video — only for non-placeholder IDs */}
        {!hubVideos.length && playingId && !playingId.startsWith("placeholder_") && (
          <div className="mb-6">
            <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${playingId}?autoplay=1&rel=0`}
                title="Video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <button
              onClick={() => setPlayingId(null)}
              className="mt-3 text-xs font-body text-ansar-muted hover:text-ansar-charcoal"
            >
              Close video
            </button>
          </div>
        )}

        {/* Video grid */}
        <VideoCarousel videos={ONBOARDING_VIDEOS} activeId={playingId} />
      </div>

      {/* Reading Resources */}
      <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm">
        <h2 className="font-heading text-xl text-ansar-charcoal mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-ansar-ochre-600" />
          Essential Reading
        </h2>
        <p className="font-body text-sm text-ansar-gray mb-6">
          Foundational texts and guides to deepen your understanding.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ResourceLink
            title="The Intelligence of Allah's Creations"
            source="WhyIslam"
            href="https://www.whyislam.org/intelligence-creation/"
          />
          <ResourceLink
            title="Read the Quran"
            source="English Translation"
            href="https://quran.com"
          />
          <ResourceLink
            title="Articles on Beliefs & Practices"
            source="IslamReligion.com"
            href="https://www.islamreligion.com/articles/"
          />
          <ResourceLink
            title="New Muslim Academy"
            source="Free Courses"
            href="https://newmuslimacademy.org/"
          />
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUPPORT TAB
// ═══════════════════════════════════════════════════════════════

function SupportTab() {
  return (
    <>
      <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm">
        <h2 className="font-heading text-xl text-ansar-charcoal mb-2">Need Help?</h2>
        <p className="font-body text-sm text-ansar-gray mb-6">
          These resources are available 24/7. You&apos;re never alone on this journey.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="tel:1-877-949-4752"
            className="flex items-center gap-4 bg-ansar-sage-50 hover:bg-ansar-sage-100 border border-ansar-sage-200 rounded-lg p-5 transition-colors group"
          >
            <div className="w-12 h-12 bg-ansar-sage-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-body font-semibold text-ansar-charcoal text-sm">WhyIslam Hotline</h3>
              <p className="font-body text-xs text-ansar-sage-700">1-877-WHY-ISLAM</p>
              <p className="font-body text-xs text-ansar-muted mt-0.5">Tap to call</p>
            </div>
          </a>

          <a
            href="https://www.whyislam.org/chat/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-ansar-ochre-50 hover:bg-ansar-ochre-100 border border-ansar-ochre-200 rounded-lg p-5 transition-colors group"
          >
            <div className="w-12 h-12 bg-ansar-ochre-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-body font-semibold text-ansar-charcoal text-sm">Live Chat</h3>
              <p className="font-body text-xs text-ansar-ochre-700">Chat with a Muslim online</p>
              <p className="font-body text-xs text-ansar-muted mt-0.5">Opens in new tab</p>
            </div>
          </a>

          <a
            href="https://www.whyislam.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-5 transition-colors group"
          >
            <div className="w-12 h-12 bg-ansar-charcoal rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-body font-semibold text-ansar-charcoal text-sm">WhyIslam.org</h3>
              <p className="font-body text-xs text-ansar-gray">Explore Islam resources</p>
            </div>
          </a>

          <a
            href="mailto:support@ansar.family"
            className="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-5 transition-colors group"
          >
            <div className="w-12 h-12 bg-ansar-charcoal rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-body font-semibold text-ansar-charcoal text-sm">Email Us</h3>
              <p className="font-body text-xs text-ansar-gray">support@ansar.family</p>
            </div>
          </a>
        </div>
      </div>

      {/* Encouraging message */}
      <div className="border-l-4 border-ansar-sage-400 pl-6 py-2">
        <p className="font-body text-ansar-gray italic leading-relaxed">
          &quot;Whoever relieves a believer of a hardship in this world, Allah will relieve them of a hardship on the Day of Judgment.&quot;
        </p>
        <p className="font-body text-xs text-ansar-muted mt-2">Prophet Muhammad (peace be upon him)</p>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════

/** Status banner — contextual based on journey stage */
function StatusBanner({
  intakeExists,
  status,
  seekerIntake,
  pairing,
}: {
  intakeExists: boolean;
  status: string;
  seekerIntake: any;
  pairing: any;
}) {
  if (!intakeExists && seekerIntake !== undefined) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-body font-semibold text-ansar-charcoal text-sm mb-0.5">Complete Your Profile</h3>
            <p className="font-body text-xs text-ansar-gray mb-3">
              We couldn&apos;t find your intake application. Please complete your profile to get matched with a community.
            </p>
            <Link href="/join" className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-white bg-ansar-sage-600 hover:bg-ansar-sage-700 rounded-lg transition-colors">
              Complete Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (intakeExists && status === "awaiting_outreach") {
    return (
      <div className="bg-ansar-sage-50 border border-ansar-sage-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-ansar-sage-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-body font-semibold text-ansar-charcoal text-sm mb-0.5">Application Received</h3>
            <p className="font-body text-xs text-ansar-gray">We&apos;re matching you with a local community. Someone will reach out within 3-5 days.</p>
          </div>
        </div>
      </div>
    );
  }

  if (intakeExists && status === "triaged") {
    return (
      <div className="bg-ansar-ochre-50 border border-ansar-ochre-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-ansar-ochre-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-body font-semibold text-ansar-charcoal text-sm mb-0.5">Matched with a Community</h3>
            <p className="font-body text-xs text-ansar-gray">
              Your community is finding the right companion for you. They&apos;ll reach out soon.
            </p>
            {seekerIntake?.organizationId && (
              <p className="font-body text-xs text-ansar-ochre-700 font-medium mt-1">
                Community: {pairing?.organization?.name || "Your local hub"}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (intakeExists && (status === "connected" || status === "active")) {
    return (
      <div className="bg-ansar-sage-50 border border-ansar-sage-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-ansar-sage-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-body font-semibold text-ansar-charcoal text-sm mb-0.5">You&apos;re Paired with an Ansar!</h3>
            <p className="font-body text-xs text-ansar-gray">Your companion is here to support you on your journey.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/** Quick action button */
function QuickAction({
  icon,
  label,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center p-4 hover:bg-ansar-cream/30 transition-colors group h-full"
    >
      <span className="text-ansar-sage-600 mb-1.5 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="font-body text-xs text-ansar-charcoal font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-3 right-3 lg:top-4 lg:right-4 bg-ansar-sage-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

/** Ansar companion card */
function AnsarCard({ pairing }: { pairing: any }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="font-heading text-lg text-ansar-charcoal mb-4 flex items-center gap-2">
        <UserCircle className="w-5 h-5 text-ansar-sage-600" />
        Your Ansar
      </h3>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-ansar-sage-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-heading text-ansar-sage-700">
            {pairing.ansar.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
          </span>
        </div>
        <div>
          <h4 className="font-heading text-lg text-ansar-charcoal">{pairing.ansar.fullName}</h4>
          {pairing.organization && (
            <p className="font-body text-xs text-ansar-sage-600 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {pairing.organization.name}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {pairing.ansar.phone && (
          <div className="flex items-center gap-2">
            <a
              href={`tel:${pairing.ansar.phone}`}
              className="inline-flex items-center gap-2 text-xs font-body text-ansar-charcoal bg-ansar-sage-50 hover:bg-ansar-sage-100 px-3 py-1.5 rounded-lg border border-[rgba(61,61,61,0.08)] transition-colors"
            >
              <Phone className="w-3 h-3 text-ansar-sage-600" />
              {pairing.ansar.phone}
            </a>
            <a
              href={`sms:${pairing.ansar.phone}`}
              className="inline-flex items-center gap-2 text-xs font-body text-white bg-ansar-sage-600 hover:bg-ansar-sage-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Text
            </a>
          </div>
        )}
        {pairing.ansar.email && (
          <a
            href={`mailto:${pairing.ansar.email}`}
            className="inline-flex items-center gap-2 text-xs font-body text-ansar-charcoal bg-ansar-sage-50 hover:bg-ansar-sage-100 px-3 py-1.5 rounded-lg border border-[rgba(61,61,61,0.08)] transition-colors"
          >
            <Mail className="w-3 h-3 text-ansar-sage-600" />
            {pairing.ansar.email}
          </a>
        )}
        {pairing.ansar.city && (
          <p className="flex items-center gap-1.5 text-xs font-body text-ansar-gray mt-1">
            <MapPin className="w-3 h-3 text-ansar-muted" />
            {pairing.ansar.city}
          </p>
        )}
      </div>
    </div>
  );
}

/** Event card */
function EventCard({ event }: { event: any }) {
  const date = new Date(event.date + "T00:00:00");
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-ansar-sage-50/50 border border-[rgba(61,61,61,0.06)] hover:bg-ansar-sage-50 transition-colors">
      {/* Date badge */}
      <div className="w-12 h-14 bg-white rounded-lg border border-[rgba(61,61,61,0.08)] flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-[10px] font-body font-medium text-ansar-sage-600 uppercase leading-none">{month}</span>
        <span className="text-lg font-heading text-ansar-charcoal leading-none mt-0.5">{day}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-body font-semibold text-ansar-charcoal text-sm truncate">{event.title}</h4>
        {event.time && (
          <p className="font-body text-xs text-ansar-sage-600 mt-0.5">{event.time}</p>
        )}
        {event.location && (
          <p className="font-body text-xs text-ansar-muted mt-0.5 flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {event.location}
          </p>
        )}
        {event.description && (
          <p className="font-body text-xs text-ansar-gray mt-1 line-clamp-2">{event.description}</p>
        )}
      </div>
    </div>
  );
}

/** Video carousel — 4 across on desktop, scrollable on mobile */
function VideoCarousel({
  videos,
  onPlay,
  activeId,
}: {
  videos: { id: string; title: string; duration: string; placeholder?: boolean }[];
  onPlay?: (id: string) => void;
  activeId?: string | null;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
      {videos.map((video) => {
        const isPlaceholder = video.placeholder || video.id.startsWith("placeholder_");

        if (isPlaceholder) {
          return (
            <div
              key={video.id}
              className="flex-shrink-0 w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)] snap-start"
            >
              <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-ansar-sage-100 to-ansar-sage-200 aspect-video flex items-center justify-center">
                <div className="text-center px-3">
                  <PlayCircle className="w-6 h-6 text-ansar-sage-400 mx-auto mb-1.5" />
                  <p className="font-body text-[10px] font-medium text-ansar-sage-600 uppercase tracking-wide">Coming Soon</p>
                </div>
                {video.duration && (
                  <span className="absolute bottom-1.5 right-1.5 bg-ansar-sage-300/60 text-ansar-sage-700 text-[9px] font-body px-1.5 py-0.5 rounded">
                    {video.duration}
                  </span>
                )}
              </div>
              <p className="font-body text-xs text-ansar-charcoal mt-2 text-left truncate">{video.title}</p>
            </div>
          );
        }

        return (
          <button
            key={video.id}
            onClick={() => onPlay ? onPlay(video.id) : window.open(`https://www.youtube.com/watch?v=${video.id}`, "_blank")}
            className={`flex-shrink-0 w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)] snap-start group ${activeId === video.id ? "ring-2 ring-ansar-sage-600 rounded-lg" : ""
              }`}
          >
            <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
              <img
                src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-5 h-5 text-ansar-sage-700" />
                </div>
              </div>
              {video.duration && (
                <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] font-body px-1.5 py-0.5 rounded">
                  {video.duration}
                </span>
              )}
            </div>
            <p className="font-body text-xs text-ansar-charcoal mt-2 text-left truncate">{video.title}</p>
          </button>
        );
      })}
    </div>
  );
}

/** Resource link card */
function ResourceLink({ title, source, href }: { title: string; source: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-gray-50 hover:bg-ansar-sage-50 border border-[rgba(61,61,61,0.06)] rounded-lg p-4 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <h4 className="font-body font-medium text-ansar-charcoal text-sm truncate">{title}</h4>
        <p className="font-body text-xs text-ansar-muted">{source}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-ansar-muted group-hover:text-ansar-sage-600 flex-shrink-0 transition-colors" />
    </a>
  );
}

/** Journey step — compact visual progress indicator */
function JourneyStep({
  step,
  label,
  description,
  completed,
  active,
  isLast = false,
}: {
  step: number;
  label: string;
  description?: string;
  completed: boolean;
  active: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-body font-semibold
            ${completed
              ? "bg-ansar-sage-600 text-white"
              : active
                ? "bg-ansar-ochre-400 text-white"
                : "bg-gray-200 text-gray-400"
            }`}
        >
          {completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : step}
        </div>
        {!isLast && (
          <div className={`w-0.5 h-6 ${completed ? "bg-ansar-sage-300" : "bg-gray-200"}`} />
        )}
      </div>
      <div className="pb-4">
        <p className={`font-body font-semibold text-sm ${completed || active ? "text-ansar-charcoal" : "text-gray-400"}`}>
          {label}
        </p>
        {description && (
          <p className={`font-body text-xs ${completed || active ? "text-ansar-gray" : "text-gray-300"}`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
