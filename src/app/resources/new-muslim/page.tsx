"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Play, Phone, Heart, Users, BookOpen,
  CheckCircle2, ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react";

/**
 * NEW MUSLIM RESOURCES PAGE
 * 
 * "These videos are just to get your feet wet."
 * "Islam is lived with people, not just watched."
 * 
 * Linked from welcome SMS/email after a seeker signs up.
 * Public page — no authentication required.
 */

const EASE_OUT_QUINT = [0.19, 1, 0.22, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_QUINT, delay: delay * 0.12 },
  }),
};

// Placeholder video series — replace URLs with real content later
const videoSeries = [
  {
    id: 1,
    title: "What is Islam?",
    description: "A gentle introduction to the core beliefs and what it means to be Muslim.",
    duration: "8 min",
    youtubeId: "TpcbfxtdoI8", // New Muslim Academy placeholder
  },
  {
    id: 2,
    title: "The Five Pillars",
    description: "The five foundational practices every Muslim learns — simple and approachable.",
    duration: "12 min",
    youtubeId: "P5ZOwNK6n9U",
  },
  {
    id: 3,
    title: "How to Pray (Salah)",
    description: "Step-by-step guide to the daily prayer. Don't worry — everyone starts here.",
    duration: "15 min",
    youtubeId: "zalLv2NY68E",
  },
  {
    id: 4,
    title: "Reading the Quran",
    description: "How to begin engaging with the Quran, even if you don't read Arabic yet.",
    duration: "10 min",
    youtubeId: "WnQ7YHjgPfY",
  },
  {
    id: 5,
    title: "Finding Your Community",
    description: "Why community matters and how to connect with Muslims near you.",
    duration: "7 min",
    youtubeId: "YD6fA3rNMAo",
  },
];

const faqItems = [
  {
    question: "I just took my Shahada. What should I do first?",
    answer: "Breathe. You've made a beautiful decision. There's no rush to learn everything at once. Start with the basics of prayer (salah), and lean on your community. That's what Ansar Family is here for — to make sure you're never alone on this journey.",
  },
  {
    question: "Do I need to change my name?",
    answer: "No, changing your name is not required in Islam. Some people choose to take an Arabic or Islamic name, but it's entirely a personal choice. You're already Muslim — your name doesn't change that.",
  },
  {
    question: "What if my family doesn't understand?",
    answer: "This is one of the most common challenges new Muslims face. You're not alone in this. Your Ansar companion and local community can help you navigate these conversations. Be patient with your family — and with yourself.",
  },
  {
    question: "I have doubts. Is that normal?",
    answer: "Absolutely. Doubt is a natural part of any sincere journey. The Prophet Muhammad ﷺ himself comforted companions who experienced doubt. Having questions means you're thinking deeply. That's a good thing.",
  },
  {
    question: "How do I find a mosque near me?",
    answer: "Your Ansar Family community will connect you with a local mosque. In the meantime, you can search islamicfinder.org for mosques in your area. Most mosques welcome visitors — just show up for Friday prayer (Jumu'ah).",
  },
];

export default function NewMuslimResourcesPage() {
  return (
    <main className="min-h-screen bg-ansar-cream">
      {/* Header */}
      <header className="px-6 md:px-12 py-6 border-b border-[rgba(61,61,61,0.06)]">
        <nav className="flex items-center justify-between max-w-4xl mx-auto">
          <Link
            href="/"
            className="flex items-center gap-2 text-ansar-gray hover:text-ansar-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-body text-sm">Ansar Family</span>
          </Link>
          <Link
            href="/sign-in"
            className="font-body text-sm text-ansar-sage-600 hover:text-ansar-sage-700 transition-colors"
          >
            Sign In →
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 md:px-12 pt-16 pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <p className="font-body text-xs font-normal tracking-[0.2em] uppercase text-ansar-sage-600 mb-4">
              Your Starter Kit
            </p>
          </motion.div>

          <motion.h1
            className="font-heading text-4xl md:text-5xl text-ansar-charcoal mb-6 leading-[1.1]"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Welcome to the Family
          </motion.h1>

          <motion.p
            className="font-body text-lg text-ansar-gray max-w-2xl mx-auto mb-8"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            You&apos;ve taken a beautiful step. We&apos;re honored you&apos;re here.
            Below are some resources to get your feet wet — but remember:
          </motion.p>

          {/* Core Framing Message */}
          <motion.div
            className="bg-ansar-sage-50 border border-ansar-sage-200 rounded-2xl p-8 max-w-2xl mx-auto"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <Heart className="w-8 h-8 text-ansar-sage-600 mx-auto mb-4" strokeWidth={1.5} />
            <p className="font-heading text-2xl text-ansar-charcoal mb-3">
              These videos are just to get your feet wet.
            </p>
            <p className="font-body text-base text-ansar-gray leading-relaxed">
              Islam is lived with people, not just watched on a screen.
              Real growth happens in community — at the dinner table, in the masjid,
              and with the people who show up for you. We&apos;re working on connecting
              you to exactly that.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What's Happening Behind the Scenes */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="bg-white rounded-2xl border border-[rgba(61,61,61,0.08)] overflow-hidden"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <div className="px-8 py-6 border-b border-[rgba(61,61,61,0.06)]">
              <h2 className="font-heading text-xl text-ansar-charcoal flex items-center gap-3">
                <Users className="w-5 h-5 text-ansar-sage-600" />
                What&apos;s happening right now
              </h2>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-ansar-sage-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-ansar-sage-600" />
                  </div>
                  <div>
                    <p className="font-body font-medium text-ansar-charcoal">We received your info</p>
                    <p className="font-body text-sm text-ansar-gray mt-1">
                      Your information has been securely submitted to Ansar Family.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-ansar-ochre-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-body text-xs font-bold text-ansar-ochre-700">2</span>
                  </div>
                  <div>
                    <p className="font-body font-medium text-ansar-charcoal">Connecting you to a local community</p>
                    <p className="font-body text-sm text-ansar-gray mt-1">
                      We&apos;re matching you with a Partner Hub near you — a masjid, MSA, or community group that will welcome you.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-ansar-terracotta-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-body text-xs font-bold text-ansar-terracotta-700">3</span>
                  </div>
                  <div>
                    <p className="font-body font-medium text-ansar-charcoal">Someone will reach out within 48 hours</p>
                    <p className="font-body text-sm text-ansar-gray mt-1">
                      A real person from your local community — not a bot, not a call center — will text or call you to say hello.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Series */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
          >
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-ansar-sage-600" />
              <p className="font-body text-xs font-normal tracking-[0.2em] uppercase text-ansar-sage-600">
                Starter Videos
              </p>
            </div>
            <h2 className="font-heading text-3xl text-ansar-charcoal mb-3">
              The Basics — At Your Own Pace
            </h2>
            <p className="font-body text-ansar-gray mb-8">
              No tests, no timelines. Watch what feels right. Skip what doesn&apos;t.
              These are here to give you a gentle foundation while your community connection is being set up.
            </p>
          </motion.div>

          <div className="space-y-6">
            {videoSeries.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </div>

          {/* Post-video reminder */}
          <motion.div
            className="mt-8 bg-ansar-sage-50 rounded-xl p-6 border border-ansar-sage-200"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
          >
            <p className="font-body text-sm text-ansar-sage-700 text-center leading-relaxed">
              <strong>Remember:</strong> You don&apos;t need to finish all of these before connecting with your community.
              In fact, the best way to learn is alongside others. These videos are just the appetizer.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Emergency Hotline */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="bg-white rounded-2xl border border-[rgba(61,61,61,0.08)] overflow-hidden"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
          >
            <div className="p-8 text-center">
              <Phone className="w-8 h-8 text-ansar-terracotta-600 mx-auto mb-4" strokeWidth={1.5} />
              <h2 className="font-heading text-2xl text-ansar-charcoal mb-3">
                Need to Talk to Someone Right Now?
              </h2>
              <p className="font-body text-ansar-gray mb-6 max-w-lg mx-auto">
                If you have urgent questions about Islam, need spiritual support, or just want
                to talk to someone who understands — the WhyIslam hotline is available for you.
              </p>
              <a
                href="tel:1-877-949-4752"
                className="inline-flex items-center gap-3 bg-ansar-terracotta-100 hover:bg-ansar-terracotta-200 text-ansar-terracotta-800 px-8 py-4 rounded-full transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span className="font-body font-medium text-lg">1-877-WHY-ISLAM</span>
              </a>
              <p className="font-body text-xs text-ansar-muted mt-4">
                Free, confidential, and available 24/7 in multiple languages
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
          >
            <h2 className="font-heading text-3xl text-ansar-charcoal mb-8">
              Common Questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <FAQItem key={index} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="bg-ansar-sage-50 rounded-2xl p-10 text-center border border-ansar-sage-200"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
          >
            <h2 className="font-heading text-3xl text-ansar-charcoal mb-4">
              You&apos;re Not Alone
            </h2>
            <p className="font-body text-ansar-gray mb-8 max-w-lg mx-auto">
              We&apos;re actively connecting you to a local community of Muslims who will walk beside you.
              In the meantime, check your phone — someone will be reaching out soon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-in"
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                Sign In to Your Portal
              </Link>
              <Link
                href="/"
                className="btn-outline inline-flex items-center justify-center gap-2"
              >
                Learn More About Ansar Family
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-[rgba(61,61,61,0.06)]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-sm text-ansar-muted">
            © 2026 Ansar Family. Every Heart Rooted.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="font-body text-xs text-ansar-muted hover:text-ansar-gray transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="font-body text-xs text-ansar-muted hover:text-ansar-gray transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════
// VIDEO CARD COMPONENT
// ═══════════════════════════════════════════════════════════════

function VideoCard({ video, index }: { video: typeof videoSeries[0]; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-xl border border-[rgba(61,61,61,0.08)] overflow-hidden"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={index * 0.5}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-ansar-sage-50/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-ansar-sage-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Play className="w-4 h-4 text-ansar-sage-600 ml-0.5" />
          </div>
          <div className="text-left">
            <p className="font-body text-sm font-medium text-ansar-charcoal">
              {video.id}. {video.title}
            </p>
            <p className="font-body text-xs text-ansar-muted mt-0.5">
              {video.duration} &middot; {video.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <span className="font-body text-xs text-ansar-muted hidden sm:inline">
            {isExpanded ? "Close" : "Watch"}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-ansar-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ansar-muted" />
          )}
        </div>
      </button>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3, ease: EASE_OUT_QUINT }}
          className="px-6 pb-6"
        >
          <div className="aspect-video bg-ansar-charcoal rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FAQ ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.08)] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-ansar-sage-50/30 transition-colors"
      >
        <span className="font-body text-sm font-medium text-ansar-charcoal pr-4">
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-ansar-muted flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-ansar-muted flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="px-6 pb-5"
        >
          <p className="font-body text-sm text-ansar-gray leading-relaxed">
            {answer}
          </p>
        </motion.div>
      )}
    </div>
  );
}
