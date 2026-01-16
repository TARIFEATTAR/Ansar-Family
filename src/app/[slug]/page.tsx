"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Users, Building2, Loader2 } from "lucide-react";

/**
 * PARTNER LANDING PAGE — Partner-Specific Entry Point
 * 
 * Dynamic route for approved Partner Hubs. Shows a customized
 * landing page with partner branding and direct links to their
 * partner-specific intake forms.
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

export default function PartnerLandingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const organization = useQuery(api.organizations.getBySlug, { slug });

  // Loading state
  if (organization === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <Loader2 className="w-8 h-8 text-ansar-sage-600 animate-spin" />
      </main>
    );
  }

  // Not found - this slug doesn't exist
  if (organization === null) {
    notFound();
  }

  const orgTypeLabels: Record<string, string> = {
    masjid: "Masjid",
    msa: "MSA",
    nonprofit: "Nonprofit",
    informal_circle: "Community Circle",
    other: "Community",
  };

  return (
    <main className="min-h-screen flex flex-col bg-ansar-cream">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 bg-ansar-cream/90 backdrop-blur-sm">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-ansar-sage-600" />
            <span className="font-heading text-xl text-ansar-sage-800 tracking-tight">
              {organization.name}
            </span>
          </div>
          <Link href="/" className="font-body text-sm text-ansar-gray hover:text-ansar-charcoal transition-colors">
            Ansar Family Network
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 pt-32 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Partner Badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-ansar-sage-50 px-4 py-2 rounded-full mb-6"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <span className="font-body text-sm text-ansar-sage-600">
              {orgTypeLabels[organization.type]} • {organization.city}
            </span>
            <span className="bg-ansar-sage-600 text-white text-xs px-2 py-0.5 rounded-full font-body">
              Level {organization.hubLevel} Hub
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-heading text-4xl md:text-5xl lg:text-6xl text-ansar-charcoal tracking-tight leading-[1.1] mb-6"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Welcome to{" "}
            <span className="text-ansar-sage-600">{organization.name}</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="font-body text-lg md:text-xl text-ansar-gray max-w-2xl mx-auto mb-12"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            Part of the Ansar Family network, supporting new Muslims and those 
            reconnecting with their faith in {organization.city}.
          </motion.p>

          {/* CTA Cards */}
          <motion.div
            className="grid md:grid-cols-2 gap-6 mt-8"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <PartnerCTACard
              href={`/${slug}/join`}
              icon={Heart}
              title="I'm New to Islam"
              subtitle="or reconnecting"
              description="Connect with our community and get the support you need on your journey."
              cta="Join Our Community"
            />
            <PartnerCTACard
              href={`/${slug}/volunteer`}
              icon={Users}
              title="I Want to Help"
              subtitle="become an Ansar"
              description="Volunteer to support new Muslims in our community."
              cta="Become an Ansar"
            />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-ansar-sage-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-sm text-ansar-gray">
            {organization.name} is a partner of the Ansar Family Network
          </p>
          <Link href="/" className="font-body text-sm text-ansar-sage-600 hover:text-ansar-sage-700 transition-colors">
            Learn more about Ansar Family →
          </Link>
        </div>
      </footer>
    </main>
  );
}

interface PartnerCTACardProps {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
}

function PartnerCTACard({ href, icon: Icon, title, subtitle, description, cta }: PartnerCTACardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: EASE_OUT_QUINT }}
    >
      <Link href={href} className="card p-8 text-left block group">
        <Icon className="w-8 h-8 text-ansar-sage-600 mb-4" strokeWidth={1.5} />
        <h3 className="font-heading text-xl text-ansar-charcoal mb-1">{title}</h3>
        <p className="font-body text-sm text-ansar-sage-600 mb-3">
          {subtitle}
        </p>
        <p className="font-body text-sm text-ansar-gray mb-6">
          {description}
        </p>
        <span className="inline-flex items-center gap-2 font-body text-sm font-medium text-ansar-sage-600 group-hover:gap-3 transition-all">
          {cta}
          <ArrowRight className="w-4 h-4" />
        </span>
      </Link>
    </motion.div>
  );
}
