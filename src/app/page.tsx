"use client";

import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import { ArrowRight, Loader2, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const CAL_URL = "https://cal.com/ansar-family/partner-call";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-ansar-cream selection:bg-ansar-sage-200 selection:text-ansar-charcoal relative overflow-hidden flex flex-col font-body">

      {/* ========================================
          HERO SECTION
          ======================================== */}
      <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden">
        {/* Navbar */}
        <header className="relative w-full flex items-center justify-between px-6 md:px-8 py-6 md:py-8 z-50">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Link href="/" className="font-display font-medium text-xl md:text-2xl tracking-wide text-ansar-charcoal hover:opacity-70 transition-opacity uppercase">
              ANSAR FAMILY
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="flex items-center gap-6"
          >
            <a href="#story" className="hidden md:inline font-body text-sm text-ansar-charcoal/70 hover:text-ansar-charcoal transition-colors">
              Our Story
            </a>
            <Link href="/login" className="font-body text-sm uppercase tracking-widest text-ansar-charcoal hover:opacity-70 transition-opacity">
              login
            </Link>
          </motion.div>
        </header>

        {/* Hero Content — Split Layout */}
        <div className="flex-1 flex items-center px-6 md:px-8 lg:px-16 relative z-10">
          <div className="w-full max-w-[1200px] mx-auto grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-center">

            {/* LEFT: Typography + Form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="max-w-[540px]"
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] text-ansar-charcoal mb-4 leading-[1.1] tracking-tight">
                <span className="italic">A convert care model</span>
                <br />
                that actually works.
              </h1>

              <p className="font-body text-base md:text-lg text-ansar-gray leading-relaxed mb-10 max-w-[460px]">
                Ready-built systems for communities to support new Muslims.
              </p>

              <LeadForm calUrl={CAL_URL} />

              <p className="text-xs text-ansar-gray/60 mt-4 max-w-[380px]">
                Currently onboarding new partners in limited cohorts to ensure high-quality support.
              </p>
            </motion.div>

            {/* RIGHT: Illustration placeholder */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isLoaded ? { opacity: 1 } : {}}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="w-full max-w-[480px] aspect-square relative">
                {/* Placeholder for pencil/charcoal olive tree illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[80%] h-[80%] rounded-full bg-ansar-sage-50/30 blur-3xl" />
                </div>
                <div className="relative z-10 flex items-center justify-center h-full">
                  <p className="font-display text-ansar-charcoal/10 text-[120px] leading-none select-none">&#x1F333;</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Big Bottom Text + Bushes */}
        <div className="relative w-full h-[30vh] md:h-[35vh] flex justify-center items-end pointer-events-none z-0 overflow-hidden">
          <motion.h2
            initial={{ y: 80, opacity: 0 }}
            animate={isLoaded ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="font-display text-[10vw] md:text-[8vw] leading-[0.8] text-ansar-charcoal tracking-tighter whitespace-nowrap mb-[-1.5vw]"
          >
            Ansar Family
          </motion.h2>

          <motion.img
            initial={{ x: -16, opacity: 0 }}
            animate={isLoaded ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
            src="/images/accents/abstract-bush.png"
            alt=""
            className="absolute bottom-0 left-0 w-[10vw] h-[10vw] min-w-[60px] min-h-[60px] max-w-[200px] max-h-[200px] object-cover object-bottom-left z-10 mix-blend-multiply opacity-90 pointer-events-none origin-bottom-left"
          />
          <motion.img
            initial={{ x: 16, opacity: 0 }}
            animate={isLoaded ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
            src="/images/accents/abstract-bush.png"
            alt=""
            style={{ transform: "scaleX(-1)" }}
            className="absolute bottom-0 right-0 w-[10vw] h-[10vw] min-w-[60px] min-h-[60px] max-w-[200px] max-h-[200px] object-cover object-bottom-right z-10 mix-blend-multiply opacity-90 pointer-events-none origin-bottom-right"
          />
        </div>
      </section>

      {/* ========================================
          OUR STORY + CASE STUDY
          ======================================== */}
      <div id="story" className="relative z-20 bg-ansar-cream pt-24 pb-12">
        <section className="px-6 py-12 mx-auto w-full max-w-[800px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <h2 className="font-display text-4xl md:text-5xl text-ansar-charcoal mb-12">Our Story</h2>

            <div className="space-y-8 font-body text-lg md:text-xl text-ansar-gray leading-relaxed text-left">
              <p className="font-medium text-ansar-charcoal">
                It began with two people and a relentless pace.
              </p>
              <p>
                Shahadas were coming in every week. We found ourselves awake at 1 AM, night after night, trying to be everything for everyone. In those late hours, the reality hit us: we couldn&apos;t do this alone. No individual can. We needed a community.
              </p>
              <p>
                We spent years testing different models, hitting walls, and searching for a sustainable way forward until we returned to the foundation: The Prophetic Model.
              </p>
            </div>
          </motion.div>
        </section>

        <section className="px-6 py-16 mx-auto w-full max-w-[800px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#F2ECE3] rounded-2xl p-10 md:p-16 border border-ansar-charcoal/5 text-center shadow-sm"
          >
            <span className="uppercase tracking-widest text-ansar-charcoal/60 text-xs font-bold mb-6 block">Case Study: Masjid Al-Huda</span>
            <p className="font-display text-2xl md:text-3xl text-ansar-charcoal/90 leading-relaxed italic">
              &ldquo;Our system worked so well that there were 80+ Shahadas and 100% retention amongst those new Muslims.&rdquo;
            </p>
          </motion.div>
        </section>
      </div>

      {/* ========================================
          FOOTER
          ======================================== */}
      <footer className="relative z-20 border-t border-black/5 bg-ansar-cream">
        <div className="max-w-[1000px] mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="font-body text-ansar-gray text-sm max-w-sm font-medium">
                Vision: Establishing and maintaining Muslim Communities globally.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
              <Link href="/join" className="font-body text-sm text-ansar-charcoal/60 hover:text-ansar-charcoal transition-colors">I&apos;m New to Islam</Link>
              <span className="text-ansar-charcoal/20">|</span>
              <Link href="/volunteer" className="font-body text-sm text-ansar-charcoal/60 hover:text-ansar-charcoal transition-colors">Become an Ansar</Link>
              <span className="text-ansar-charcoal/20">|</span>
              <Link href="/contact" className="font-body text-sm text-ansar-charcoal/60 hover:text-ansar-charcoal transition-colors">Contact Us</Link>
              <span className="text-ansar-charcoal/20">|</span>
              <Link href="/privacy" className="font-body text-sm text-ansar-charcoal/60 hover:text-ansar-charcoal transition-colors">Privacy Policy</Link>
            </div>
          </div>
          <div className="text-center mt-8">
            <span className="font-body text-sm text-ansar-charcoal/40">est. 2020 Ansar Family</span>
          </div>
        </div>
      </footer>
    </main>
  );
}


// ═══════════════════════════════════════════════════════════════
// LEAD CAPTURE FORM
// ═══════════════════════════════════════════════════════════════

function LeadForm({ calUrl }: { calUrl: string }) {
  const submitLead = useMutation(api.leads.submit);
  const [form, setForm] = useState({ fullName: "", email: "", organizationType: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = form.fullName.trim() && form.email.trim() && form.organizationType;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      await submitLead({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        organizationType: form.organizationType as "masjid" | "msa" | "community_org" | "other",
      });

      const params = new URLSearchParams({
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
      });
      window.open(`${calUrl}?${params.toString()}`, "_blank");

      setForm({ fullName: "", email: "", organizationType: "" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-[400px]">
      <input
        type="text"
        placeholder="Full name"
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        className="w-full px-4 py-3 bg-white/70 border border-ansar-charcoal/10 rounded-lg font-body text-sm text-ansar-charcoal placeholder:text-ansar-gray/50 focus:outline-none focus:border-ansar-sage-400 focus:ring-1 focus:ring-ansar-sage-400/30 transition-colors"
      />
      <input
        type="email"
        placeholder="Email address"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full px-4 py-3 bg-white/70 border border-ansar-charcoal/10 rounded-lg font-body text-sm text-ansar-charcoal placeholder:text-ansar-gray/50 focus:outline-none focus:border-ansar-sage-400 focus:ring-1 focus:ring-ansar-sage-400/30 transition-colors"
      />
      <div className="relative">
        <select
          value={form.organizationType}
          onChange={(e) => setForm({ ...form, organizationType: e.target.value })}
          className="w-full px-4 py-3 bg-white/70 border border-ansar-charcoal/10 rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:border-ansar-sage-400 focus:ring-1 focus:ring-ansar-sage-400/30 transition-colors appearance-none cursor-pointer"
        >
          <option value="" disabled>Organization type</option>
          <option value="masjid">Masjid</option>
          <option value="msa">MSA</option>
          <option value="community_org">Community Organization</option>
          <option value="other">Other</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ansar-gray/40 pointer-events-none" />
      </div>

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="w-full bg-ansar-charcoal text-white px-6 py-3 rounded-lg text-sm font-medium tracking-wide hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Book a Call
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </form>
  );
}
