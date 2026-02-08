"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Loader2, Heart, BookOpen, Video, Users, ArrowRight, CheckCircle2,
  Phone, Mail, MapPin, UserCircle, Building2, Clock,
  MessageSquare, Send, Inbox as InboxIcon,
} from "lucide-react";
import Link from "next/link";
import { MessageBubble } from "@/components/messaging/MessageBubble";

/**
 * SEEKER PORTAL — Dashboard for New Muslims & Seekers
 * 
 * Shows journey status, paired Ansar details, community info,
 * and supportive resources.
 */

export default function SeekerPortalPage() {
  const { user, isLoaded } = useUser();

  const currentUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get seeker's intake record by their email
  const seekerIntake = useQuery(
    api.intakes.getByEmail,
    user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

  // Get seeker's active pairing (includes Ansar + Organization details)
  const pairing = useQuery(
    api.pairings.getBySeeker,
    seekerIntake?._id ? { seekerId: seekerIntake._id } : "skip"
  );

  // Inbox — all hooks must be called before any conditional returns
  const seekerUserId = currentUser?._id as Id<"users"> | undefined;
  const inbox = useQuery(
    api.inbox.getInbox,
    seekerUserId ? { userId: seekerUserId } : "skip"
  ) ?? [];
  const inboxUnread = useQuery(
    api.inbox.getUnreadTotal,
    seekerUserId ? { userId: seekerUserId } : "skip"
  ) ?? 0;

  // Get the most recent conversation (seeker usually has one — with their Ansar)
  const latestConvoId = inbox.length > 0 ? inbox[0].conversationId : undefined;
  const latestConversation = useQuery(
    api.inbox.getConversation,
    latestConvoId && seekerUserId
      ? { conversationId: latestConvoId, userId: seekerUserId }
      : "skip"
  );

  const markAsRead = useMutation(api.inbox.markAsRead);
  const replyToConversation = useMutation(api.inbox.replyToConversation);
  const startConversation = useMutation(api.inbox.startConversation);

  // Loading state
  if (!isLoaded || currentUser === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-ansar-sage-600 animate-spin mx-auto mb-4" />
          <p className="font-body text-ansar-gray">Loading your portal...</p>
        </div>
      </main>
    );
  }

  // Not a seeker
  if (currentUser?.role !== "seeker") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <div className="text-center max-w-md mx-auto px-6">
          <p className="font-body text-ansar-gray">This page is for seekers only.</p>
          <Link href="/dashboard" className="text-ansar-sage-600 font-body hover:underline mt-4 block">
            ← Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const firstName = currentUser.name.split(" ")[0];
  const intakeExists = seekerIntake !== null && seekerIntake !== undefined;
  const status = seekerIntake?.status || "awaiting_outreach";

  return (
    <main className="min-h-screen bg-ansar-cream">
      {/* Header */}
      <header className="bg-white border-b border-[rgba(61,61,61,0.08)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-heading text-xl text-ansar-charcoal">
              Ansar Family
            </Link>
            <span className="text-[10px] font-body font-medium uppercase tracking-wider text-ansar-sage-600 bg-ansar-sage-50 px-2 py-0.5 rounded-full">
              Seeker Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-body text-xs text-ansar-muted hidden sm:inline">
              {currentUser.email}
            </span>
            <SignOutButton>
              <button className="text-sm font-body text-ansar-muted hover:text-ansar-charcoal">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-ansar-sage-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-ansar-sage-600" />
            </div>
            <div className="flex-1">
              <h1 className="font-heading text-3xl text-ansar-charcoal mb-2">
                Assalamu Alaikum, {firstName}
              </h1>
              <p className="font-body text-ansar-gray text-lg">
                Welcome to your journey portal. We&apos;re so glad you&apos;re here.
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* JOURNEY STATUS TRACKER                                     */}
          {/* ═══════════════════════════════════════════════════════════ */}

          {/* No intake yet */}
          {!intakeExists && seekerIntake !== undefined && (
            <div className="bg-ansar-terracotta-50 border border-ansar-terracotta-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-ansar-terracotta-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-body font-semibold text-ansar-charcoal mb-1">
                    Complete Your Registration
                  </h3>
                  <p className="font-body text-sm text-ansar-gray leading-relaxed mb-3">
                    We have your account, but it looks like your intake form wasn&apos;t submitted yet.
                    Please fill it out so we can connect you with your local community.
                  </p>
                  <Link
                    href="/join"
                    className="inline-flex items-center gap-2 text-sm font-body font-medium text-white bg-ansar-sage-600 hover:bg-ansar-sage-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    Complete Intake Form
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Awaiting outreach — not yet assigned to any org */}
          {intakeExists && status === "awaiting_outreach" && (
            <div className="bg-ansar-sage-50 border border-ansar-sage-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-ansar-sage-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-body font-semibold text-ansar-charcoal mb-1">
                    Your Application Has Been Received
                  </h3>
                  <p className="font-body text-sm text-ansar-gray leading-relaxed">
                    We&apos;re reviewing your submission and matching you with a local community.
                    Someone will reach out within 3-5 days. In the meantime, explore the resources below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Triaged — assigned to org, waiting to be paired with an Ansar */}
          {intakeExists && status === "triaged" && (
            <div className="bg-ansar-ochre-50 border border-ansar-ochre-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-ansar-ochre-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-body font-semibold text-ansar-charcoal mb-1">
                    You&apos;ve Been Matched with a Community
                  </h3>
                  <p className="font-body text-sm text-ansar-gray leading-relaxed mb-2">
                    Your local community is finding the right companion (Ansar) for you.
                    They&apos;ll reach out soon to introduce themselves.
                  </p>
                  {/* Show org name if we know it */}
                  {seekerIntake?.organizationId && (
                    <p className="font-body text-sm text-ansar-ochre-700 font-medium">
                      Community: {pairing?.organization?.name || "Your local hub"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Connected / Active — paired with an Ansar! */}
          {intakeExists && (status === "connected" || status === "active") && (
            <div className="bg-ansar-sage-50 border border-ansar-sage-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-ansar-sage-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-body font-semibold text-ansar-charcoal mb-1">
                    You&apos;re Paired with an Ansar!
                  </h3>
                  <p className="font-body text-sm text-ansar-gray leading-relaxed">
                    Your local companion is here to support you on your journey. They&apos;ll check in regularly and answer your questions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* YOUR ANSAR — shown when paired                             */}
        {/* ═══════════════════════════════════════════════════════════ */}

        {pairing && pairing.ansar && (
          <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
            <h2 className="font-heading text-xl text-ansar-charcoal mb-6 flex items-center gap-2">
              <UserCircle className="w-6 h-6 text-ansar-sage-600" />
              Your Ansar (Companion)
            </h2>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar / Name */}
              <div className="w-20 h-20 bg-ansar-sage-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-heading text-ansar-sage-700">
                  {pairing.ansar.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-2xl text-ansar-charcoal mb-1">
                  {pairing.ansar.fullName}
                </h3>
                {pairing.organization && (
                  <p className="font-body text-sm text-ansar-sage-600 mb-4 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {pairing.organization.name}
                  </p>
                )}

                {/* Contact info */}
                <div className="space-y-2">
                  {pairing.ansar.phone && (
                    <div className="flex items-center gap-3">
                      <a
                        href={`tel:${pairing.ansar.phone}`}
                        className="inline-flex items-center gap-2 text-sm font-body text-ansar-charcoal bg-ansar-sage-50 hover:bg-ansar-sage-100 px-4 py-2 rounded-lg border border-[rgba(61,61,61,0.08)] transition-colors"
                      >
                        <Phone className="w-4 h-4 text-ansar-sage-600" />
                        {pairing.ansar.phone}
                      </a>
                      <a
                        href={`sms:${pairing.ansar.phone}`}
                        className="inline-flex items-center gap-2 text-sm font-body text-white bg-ansar-sage-600 hover:bg-ansar-sage-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Text
                      </a>
                    </div>
                  )}
                  {pairing.ansar.email && (
                    <a
                      href={`mailto:${pairing.ansar.email}`}
                      className="inline-flex items-center gap-2 text-sm font-body text-ansar-charcoal bg-ansar-sage-50 hover:bg-ansar-sage-100 px-4 py-2 rounded-lg border border-[rgba(61,61,61,0.08)] transition-colors"
                    >
                      <Mail className="w-4 h-4 text-ansar-sage-600" />
                      {pairing.ansar.email}
                    </a>
                  )}
                  {pairing.ansar.city && (
                    <p className="flex items-center gap-2 text-sm font-body text-ansar-gray mt-2">
                      <MapPin className="w-4 h-4 text-ansar-muted" />
                      {pairing.ansar.city}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* MESSAGES — shown when paired or has conversations           */}
        {/* ═══════════════════════════════════════════════════════════ */}

        {seekerUserId && (
          <SeekerMessagesCard
            seekerUserId={seekerUserId}
            seekerName={currentUser.name}
            inbox={inbox}
            inboxUnread={inboxUnread}
            latestConversation={latestConversation}
            markAsRead={markAsRead}
            replyToConversation={replyToConversation}
            startConversation={startConversation}
            pairing={pairing}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* JOURNEY PROGRESS                                           */}
        {/* ═══════════════════════════════════════════════════════════ */}

        {intakeExists && (
          <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
            <h2 className="font-heading text-xl text-ansar-charcoal mb-6">
              Your Journey
            </h2>
            <div className="space-y-0">
              {/* Step 1: Form submitted */}
              <JourneyStep
                step={1}
                label="Form Submitted"
                description="Your information has been received"
                completed={true}
                active={status === "awaiting_outreach"}
              />
              {/* Step 2: Matched with community */}
              <JourneyStep
                step={2}
                label="Community Matched"
                description={pairing?.organization?.name || seekerIntake?.organizationId ? "You've been assigned to a local community" : "Waiting to be matched"}
                completed={status === "triaged" || status === "connected" || status === "active"}
                active={status === "triaged"}
              />
              {/* Step 3: Paired with Ansar */}
              <JourneyStep
                step={3}
                label="Paired with Ansar"
                description={pairing?.ansar ? `Your companion: ${pairing.ansar.fullName}` : "Your personal companion will be assigned"}
                completed={status === "connected" || status === "active"}
                active={status === "connected" || status === "active"}
                isLast
              />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* RESOURCES                                                  */}
        {/* ═══════════════════════════════════════════════════════════ */}

        <div className="space-y-6">
          <h2 className="font-heading text-2xl text-ansar-charcoal">
            Resources for Your Journey
          </h2>

          {/* Video Resources */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-ansar-terracotta-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="w-6 h-6 text-ansar-terracotta-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-body font-semibold text-ansar-charcoal text-lg mb-2">
                  Getting Started Videos
                </h3>
                <p className="font-body text-ansar-gray text-sm mb-4">
                  Short, practical videos to help you understand the basics of Islam.
                </p>
                <div className="space-y-3">
                  <a href="https://www.youtube.com/watch?v=l6XQbQsNq04" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group">
                    <span>What is Islam?</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="https://www.youtube.com/watch?v=fCkcr0kcWOE" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group">
                    <span>How to Pray (Step by Step)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="https://www.youtube.com/watch?v=hzM3KN6j7kQ" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group">
                    <span>The Five Pillars of Islam</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Reading Resources */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-ansar-ochre-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-ansar-ochre-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-body font-semibold text-ansar-charcoal text-lg mb-2">
                  Essential Reading
                </h3>
                <p className="font-body text-ansar-gray text-sm mb-4">
                  Foundational texts and guides to deepen your understanding.
                </p>
                <div className="space-y-3">
                  <a href="https://www.whyislam.org/intelligence-creation/" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group">
                    <span>The Intelligence of Allah&apos;s Creations (WhyIslam)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="https://quran.com" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group">
                    <span>Read the Quran (English Translation)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="https://www.islamreligion.com/articles/" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group">
                    <span>Articles on Islamic Beliefs &amp; Practices</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Community Support */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-ansar-sage-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-ansar-sage-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-body font-semibold text-ansar-charcoal text-lg mb-2">
                  Need Immediate Support?
                </h3>
                <p className="font-body text-ansar-gray text-sm mb-4">
                  While you wait for your local connection, these resources are available 24/7.
                </p>
                <div className="space-y-3">
                  <a href="tel:1-877-949-4752"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group">
                    <span>WhyIslam Hotline: 1-877-WHY-ISLAM</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="https://www.whyislam.org/chat/" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group">
                    <span>Live Chat with a Muslim</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="mt-12 border-l-4 border-ansar-sage-400 pl-6 py-2">
          <p className="font-body text-ansar-gray italic text-lg leading-relaxed">
            &quot;These resources are just to get your feet wet. True Islam is lived with people, not just watched.
            Real growth happens in community.&quot;
          </p>
        </div>
      </div>
    </main>
  );
}

/**
 * Seeker Messages Card — inline conversation view
 */
function SeekerMessagesCard({
  seekerUserId,
  seekerName,
  inbox,
  inboxUnread,
  latestConversation,
  markAsRead,
  replyToConversation,
  startConversation,
  pairing,
}: {
  seekerUserId: Id<"users">;
  seekerName: string;
  inbox: any[];
  inboxUnread: number;
  latestConversation: any;
  markAsRead: any;
  replyToConversation: any;
  startConversation: any;
  pairing: any;
}) {
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [firstMessage, setFirstMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mark as read when conversation is viewed
  useEffect(() => {
    if (latestConversation && inboxUnread > 0) {
      markAsRead({ conversationId: latestConversation._id, userId: seekerUserId });
    }
  }, [latestConversation, inboxUnread, markAsRead, seekerUserId]);

  // Auto-scroll to latest message
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
    if (!firstMessage.trim() || sending || !pairing?.ansar) return;
    // Find the ansar's user account
    const ansarName = pairing.ansar.fullName;
    // We need the ansar's userId — query available recipients
    setSending(true);
    try {
      // Use startConversation — we need the recipient userId
      // The available recipients query will have the ansar's user
      // For now, try to find via the inbox recipients
      const recipients = await fetch(""); // We can't call query from here
      // Actually, startConversation needs a userId. Let's check if we have it.
      // The seeker can't easily get the ansar's userId from pairing data alone.
      // Let's skip the "start first message" for now — messages will come from Ansar side.
      console.log("First message from seeker not yet supported — Ansar initiates");
    } catch (error) {
      console.error("Failed to send:", error);
    } finally {
      setSending(false);
    }
  };

  // No conversations yet
  if (inbox.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
        <h2 className="font-heading text-xl text-ansar-charcoal mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-ansar-sage-600" />
          Messages
          {inboxUnread > 0 && (
            <span className="bg-ansar-sage-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {inboxUnread}
            </span>
          )}
        </h2>
        <div className="text-center py-8">
          <InboxIcon className="w-10 h-10 text-ansar-muted/30 mx-auto mb-3" />
          <p className="font-body text-sm text-ansar-muted">
            No messages yet. Once you&apos;re paired with an Ansar companion,
            you&apos;ll be able to message them here.
          </p>
        </div>
      </div>
    );
  }

  // Has conversation — show messages
  return (
    <div className="bg-white rounded-2xl mb-8 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-[rgba(61,61,61,0.08)]">
        <h2 className="font-heading text-xl text-ansar-charcoal flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-ansar-sage-600" />
          Messages
          {inboxUnread > 0 && (
            <span className="bg-ansar-sage-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {inboxUnread}
            </span>
          )}
        </h2>
        {latestConversation && (
          <p className="font-body text-xs text-ansar-muted mt-1">
            Conversation with{" "}
            {latestConversation.participants
              ?.filter((p: any) => p.userId !== seekerUserId)
              .map((p: any) => p.userName)
              .join(", ")}
          </p>
        )}
      </div>

      {/* Messages */}
      {latestConversation?.messages && (
        <div className="px-6 py-4 space-y-4 max-h-96 overflow-y-auto bg-[#FAFAF8]">
          {latestConversation.messages.map((msg: any) => (
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
      )}

      {/* Reply input */}
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
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Journey Step — visual progress indicator
 */
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
  description: string;
  completed: boolean;
  active: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      {/* Vertical line + circle */}
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-body font-semibold
            ${completed
              ? "bg-ansar-sage-600 text-white"
              : active
                ? "bg-ansar-ochre-400 text-white"
                : "bg-gray-200 text-gray-400"
            }`}
        >
          {completed ? <CheckCircle2 className="w-4 h-4" /> : step}
        </div>
        {!isLast && (
          <div className={`w-0.5 h-8 ${completed ? "bg-ansar-sage-300" : "bg-gray-200"}`} />
        )}
      </div>
      {/* Text */}
      <div className="pb-6">
        <p className={`font-body font-semibold text-sm ${completed || active ? "text-ansar-charcoal" : "text-gray-400"}`}>
          {label}
        </p>
        <p className={`font-body text-xs ${completed || active ? "text-ansar-gray" : "text-gray-300"}`}>
          {description}
        </p>
      </div>
    </div>
  );
}
