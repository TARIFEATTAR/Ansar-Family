"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Heart, Users, Building2 } from "lucide-react";

/**
 * LANDING PAGE — The Welcome Interface
 * 
 * "Every Heart Anchored" — Where every journey begins.
 * Three clear paths: Join (Seeker), Volunteer (Ansar), Partner
 */

const EASE_OUT_QUINT = [0.19, 1, 0.22, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASE_OUT_QUINT,
      delay: delay * 0.15,
    },
  }),
};

const ctaCards = [
  {
    title: "I'm New to Islam",
    subtitle: "or reconnecting with my faith",
    description: "No matter where you are, you don't have to walk alone. We'll connect you to your local community.",
    href: "/join",
    icon: Heart,
    cta: "Join the Family",
    available: true,
  },
  {
    title: "I Want to Help",
    subtitle: "become an Ansar",
    description: "Volunteer to support new Muslims in your community with friendship and guidance.",
    href: "/volunteer",
    icon: Users,
    cta: "Become an Ansar",
    available: true,
  },
  {
    title: "Register Your Community",
    subtitle: "become a Partner Hub",
    description: "Bring the Ansar Family infrastructure to your masjid, MSA, or organization.",
    href: "/partner",
    icon: Building2,
    cta: "Partner With Us",
    available: true,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-ansar-cream">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 bg-ansar-cream/90 backdrop-blur-sm">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="font-heading text-2xl text-ansar-sage-800 tracking-tight">
            Ansar Family
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/resources" className="font-body text-sm text-ansar-gray hover:text-ansar-charcoal transition-colors">
              Resources
            </Link>
            <Link href="/about" className="font-body text-sm text-ansar-gray hover:text-ansar-charcoal transition-colors">
              About
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 pt-32 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tagline */}
          <motion.p
            className="font-body text-sm uppercase tracking-widest text-ansar-sage-600 mb-6"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            No One Walks Alone
          </motion.p>

          {/* Headline */}
          <motion.h1
            className="font-heading text-4xl md:text-6xl lg:text-7xl text-ansar-charcoal tracking-tight leading-[1.1] mb-6"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Every Heart{" "}
            <span className="text-ansar-sage-600">Anchored</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="font-body text-lg md:text-xl text-ansar-gray max-w-2xl mx-auto mb-12"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            We provide the infrastructure so local communities can focus on nurturing 
            those new to Islam. We handle the system. You provide the support.
          </motion.p>

          {/* CTA Cards */}
          <motion.div
            className="grid md:grid-cols-3 gap-6 mt-16"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            {ctaCards.map((card) => (
              <CTACard key={card.title} card={card} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-ansar-sage-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-sm text-ansar-gray">
            © 2026 Ansar Family. Every Heart Anchored.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="font-body text-sm text-ansar-gray hover:text-ansar-charcoal transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="font-body text-sm text-ansar-gray hover:text-ansar-charcoal transition-colors">
              Terms
            </Link>
            <Link href="/admin" className="font-body text-sm text-ansar-gray-light hover:text-ansar-gray transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

interface CTACardProps {
  card: typeof ctaCards[0];
}

function CTACard({ card }: CTACardProps) {
  const Icon = card.icon;
  
  if (!card.available) {
    return (
      <div className="card p-8 text-left opacity-60">
        <Icon className="w-8 h-8 text-ansar-gray-light mb-4" strokeWidth={1.5} />
        <h3 className="font-heading text-xl text-ansar-charcoal mb-1">{card.title}</h3>
        <p className="font-body text-sm text-ansar-gray mb-3">
          {card.subtitle}
        </p>
        <p className="font-body text-sm text-ansar-gray-light mb-6">
          {card.description}
        </p>
        <span className="font-body text-sm text-ansar-gray-light">
          Coming Soon
        </span>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: EASE_OUT_QUINT }}
    >
      <Link href={card.href} className="card p-8 text-left block group">
        <Icon className="w-8 h-8 text-ansar-sage-600 mb-4" strokeWidth={1.5} />
        <h3 className="font-heading text-xl text-ansar-charcoal mb-1">{card.title}</h3>
        <p className="font-body text-sm text-ansar-sage-600 mb-3">
          {card.subtitle}
        </p>
        <p className="font-body text-sm text-ansar-gray mb-6">
          {card.description}
        </p>
        <span className="inline-flex items-center gap-2 font-body text-sm font-medium text-ansar-sage-600 group-hover:gap-3 transition-all">
          {card.cta}
          <ArrowRight className="w-4 h-4" />
        </span>
      </Link>
    </motion.div>
  );
}
