"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loader2, Heart, BookOpen, Video, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

/**
 * SEEKER PORTAL — Resource Hub for New Muslims & Seekers
 * 
 * Shows supportive resources while awaiting outreach from local community.
 * Displays journey status and provides educational content.
 */

export default function SeekerPortalPage() {
  const { user, isLoaded } = useUser();

  const currentUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get seeker's intake record by their email (efficient targeted query)
  const seekerIntake = useQuery(
    api.intakes.getByEmail,
    user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

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
                Assalamu Alaikum, {firstName} 🌱
              </h1>
              <p className="font-body text-ansar-gray text-lg">
                Welcome to your New Muslim resource portal. We&apos;re so glad you&apos;re here.
              </p>
            </div>
          </div>

          {/* Status */}
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
                    className="inline-flex items-center gap-2 text-sm font-body font-medium text-ansar-sage-600 hover:text-ansar-sage-700"
                  >
                    Complete Intake Form
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {intakeExists && status === "awaiting_outreach" && (
            <div className="bg-ansar-sage-50 border border-ansar-sage-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-ansar-sage-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-body font-semibold text-ansar-charcoal mb-1">
                    Your Application Has Been Received
                  </h3>
                  <p className="font-body text-sm text-ansar-gray leading-relaxed">
                    A local community member will reach out to you within 3-5 days to schedule a meeting.
                    In the meantime, explore the resources below to begin your journey.
                  </p>
                </div>
              </div>
            </div>
          )}

          {intakeExists && status === "triaged" && (
            <div className="bg-ansar-ochre-50 border border-ansar-ochre-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-ansar-ochre-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-body font-semibold text-ansar-charcoal mb-1">
                    You&apos;ve Been Connected!
                  </h3>
                  <p className="font-body text-sm text-ansar-gray leading-relaxed">
                    A local community has been assigned to support you. They&apos;ll be reaching out soon to introduce themselves.
                  </p>
                </div>
              </div>
            </div>
          )}

          {intakeExists && (status === "connected" || status === "active") && (
            <div className="bg-ansar-sage-50 border border-ansar-sage-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-ansar-sage-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-body font-semibold text-ansar-charcoal mb-1">
                    You&apos;re Paired with an Ansar!
                  </h3>
                  <p className="font-body text-sm text-ansar-gray leading-relaxed">
                    Your local mentor (Ansar) will be your guide on this journey. They&apos;ll check in regularly and answer your questions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resources Section */}
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
                  <a
                    href="https://www.youtube.com/watch?v=l6XQbQsNq04"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group"
                  >
                    <span>What is Islam?</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="https://www.youtube.com/watch?v=fCkcr0kcWOE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group"
                  >
                    <span>How to Pray (Step by Step)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="https://www.youtube.com/watch?v=hzM3KN6j7kQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group"
                  >
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
                  <a
                    href="https://www.whyislam.org/intelligence-creation/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group"
                  >
                    <span>The Intelligence of Allah&apos;s Creations (WhyIslam)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="https://quran.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group"
                  >
                    <span>Read the Quran (English Translation)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="https://www.islamreligion.com/articles/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group"
                  >
                    <span>Articles on Islamic Beliefs & Practices</span>
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
                  <a
                    href="tel:1-877-949-4752"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group"
                  >
                    <span>WhyIslam Hotline: 1-877-WHY-ISLAM</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="https://www.whyislam.org/chat/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-ansar-sage-600 hover:text-ansar-sage-700 font-body text-sm group"
                  >
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
