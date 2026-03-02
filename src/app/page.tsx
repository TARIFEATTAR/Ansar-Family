"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ChevronDown, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import GardenAnimation from "@/components/GardenAnimation";

const CAL_URL = "https://cal.com/hassankhawaja/ansar-family";
const FAQ_ITEMS = [
  {
    question: "How does Ansar Family support partner hubs?",
    answer:
      "We provide a ready-built operating system for convert care: intake workflows, role-based dashboards, messaging, and follow-up structure so your team can focus on people rather than manual coordination.",
  },
  {
    question: "How long does onboarding usually take?",
    answer:
      "Most hubs can start within a few weeks, depending on team readiness. We guide setup, access, and initial workflow mapping so your launch is clean and sustainable.",
  },
  {
    question: "What does our community team need to provide?",
    answer:
      "Typically: a point person, your local support process, and a small volunteer/core team. We help translate your existing process into a consistent, scalable model inside the platform.",
  },
];

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-ansar-cream selection:bg-ansar-sage-200 selection:text-ansar-charcoal relative overflow-x-hidden flex flex-col font-body">

      {/* ========================================
          HERO SECTION
          ======================================== */}
      <section className="relative w-full min-h-screen flex flex-col justify-between">
        {/* Navbar */}
        <header className="relative w-full flex items-center justify-between px-6 md:px-8 py-6 md:py-8 z-50">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center"
          >
            <Link href="/" className="block hover:opacity-80 transition-opacity">
              <Image
                src="/images/accents/Slide cover (1).png"
                alt="ansar family"
                width={360}
                height={80}
                className="h-16 md:h-20 w-auto object-contain object-left"
                priority
              />
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
            <Link href="/sign-in" className="font-body text-xs uppercase tracking-widest bg-ansar-terracotta-700 text-ansar-cream px-4 py-2 rounded-lg hover:bg-ansar-terracotta-800 transition-colors duration-200">
              Login
            </Link>
          </motion.div>
        </header>

        {/* Hero Content — Split Layout */}
        <div className="flex-1 flex items-center px-6 md:px-8 lg:px-16 relative z-10">
          <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-20 items-center">

            {/* LEFT: Typography + Form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="w-full max-w-[540px] mx-auto lg:mx-0 order-2 lg:order-1"
            >
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-[3.5rem] text-ansar-charcoal mb-4 leading-[1.1] tracking-tight">
                A convert care model
                <br />
                that actually works.
              </h1>

              <p className="font-body text-base md:text-lg text-ansar-gray leading-relaxed mb-10 max-w-[460px]">
                Ready-built systems for communities to support new Muslims.
              </p>

              <div id="hero-lead-form" className="scroll-mt-24">
                <LeadForm calUrl={CAL_URL} />
              </div>

              <p className="text-xs text-ansar-gray/60 mt-4 max-w-[380px]">
                Currently onboarding new partners in limited cohorts to ensure high-quality support.
              </p>
            </motion.div>

            {/* RIGHT: Branded video placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="flex flex-col items-center justify-center order-1 lg:order-2"
            >
              <div className="w-full max-w-[520px]">
                <div className="relative rounded-2xl border border-[rgba(61,61,61,0.10)] bg-white/70 backdrop-blur-sm shadow-soft overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-ansar-sage-200/30 blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-10 w-44 h-44 rounded-full bg-ansar-ochre-200/25 blur-2xl pointer-events-none" />

                  <div className="relative aspect-video bg-gradient-to-br from-ansar-sage-50 to-ansar-cream">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src="https://www.youtube.com/embed/6LkTJH1MaD0?si=WpXXvT0m-yN9-2fA"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                  </div>

                  <div className="px-4 py-3 border-t border-[rgba(61,61,61,0.08)] bg-white/80">
                    <p className="font-body text-xs tracking-wide uppercase text-ansar-gray">Ansar Family • Platform Walkthrough</p>
                  </div>
                </div>
              </div>
              <a
                href="#hero-lead-form"
                className="lg:hidden mt-3 inline-flex items-center gap-1 text-xs text-ansar-gray/80 hover:text-ansar-charcoal transition-colors"
              >
                Continue to form
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================
          FREQUENTLY ASKED QUESTIONS
          ======================================== */}
      <section className="relative bg-ansar-cream-warm py-16 md:py-20 border-y border-[rgba(61,61,61,0.08)]">
        <div className="max-w-[900px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="font-heading text-3xl md:text-4xl text-ansar-charcoal text-center mb-10">
              Frequently asked questions
            </h2>

            <div className="space-y-2">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={item.question} className="border-b border-[rgba(61,61,61,0.12)]">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full py-4 flex items-center justify-between gap-4 text-left transition-colors hover:text-ansar-charcoal"
                    >
                      <span className="font-body text-lg md:text-xl text-ansar-charcoal/95">
                        {item.question}
                      </span>
                      <Plus
                        className={`w-5 h-5 text-ansar-sage-700 transition-transform duration-200 ${isOpen ? "rotate-45" : ""
                          }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="pb-5 pr-10 font-body text-sm md:text-base text-ansar-gray leading-relaxed">
                        {item.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================
          OUR STORY + CASE STUDY
          ======================================== */}
      <div id="story" className="relative z-20 bg-ansar-cream py-16 md:py-20 overflow-hidden">
        <section className="relative px-6 mx-auto w-full max-w-[1160px] min-h-[62vh] flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-10 lg:gap-16 xl:gap-20 items-center"
          >
            <div className="max-w-[620px]">
              <h2 className="font-heading text-4xl md:text-5xl text-ansar-charcoal mb-8">Our Story</h2>
              <div className="space-y-6 font-body text-lg md:text-xl text-ansar-gray leading-relaxed">
                <p className="font-medium text-ansar-charcoal">
                  It began with two people and a relentless pace.
                </p>
                <p>
                  Shahadas were coming in every week. We found ourselves awake at 1 AM, night after night, trying to be
                  everything for everyone. In those late hours, the reality hit us: we couldn&apos;t do this alone. No
                  individual can. We needed a community.
                </p>
                <p>
                  We spent years testing different models, hitting walls, and searching for a sustainable way forward until
                  we returned to the foundation: The Prophetic Model.
                </p>
              </div>
            </div>

            <div className="bg-[#F2ECE3]/82 rounded-2xl p-8 md:p-10 lg:p-11 shadow-sm backdrop-blur-[1px] max-w-[520px] lg:ml-auto">
              <span className="font-body uppercase tracking-widest text-ansar-charcoal/60 text-xs font-semibold mb-4 block">
                Case Study: Masjid Al-Huda
              </span>
              <p className="font-body text-lg md:text-xl text-ansar-charcoal/90 leading-relaxed">
                Our system worked so well that there were 80+ Shahadas and 100% retention amongst those new Muslims.
              </p>
            </div>
          </motion.div>
        </section>
      </div>

      {/* ========================================
          GARDEN ANIMATION
          ======================================== */}
      <GardenAnimation />

      {/* ========================================
          FOOTER
          ======================================== */}
      <footer className="relative z-30"> {/* Removed overflow-hidden, increased z-index so text sits above flower */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/accents/footer-landscape.svg"
            alt=""
            fill
            className="object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-ansar-cream/20" />
          <div className="absolute inset-x-0 top-0 h-24 md:h-32 bg-gradient-to-b from-ansar-cream via-ansar-cream/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1000px] mx-auto px-6 py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="font-body text-ansar-charcoal/85 text-sm max-w-sm font-medium">
                Vision: Establishing and maintaining Muslim Communities globally.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
              <Link href="/join" className="font-body text-sm text-ansar-charcoal/80 hover:text-ansar-charcoal transition-colors">I&apos;m New to Islam</Link>
              <span className="text-ansar-charcoal/35">|</span>
              <Link href="/volunteer" className="font-body text-sm text-ansar-charcoal/80 hover:text-ansar-charcoal transition-colors">Become an Ansar</Link>
              <span className="text-ansar-charcoal/35">|</span>
              <Link href="/contact" className="font-body text-sm text-ansar-charcoal/80 hover:text-ansar-charcoal transition-colors">Contact Us</Link>
              <span className="text-ansar-charcoal/35">|</span>
              <Link href="/privacy" className="font-body text-sm text-ansar-charcoal/80 hover:text-ansar-charcoal transition-colors">Privacy Policy</Link>
            </div>
          </div>
          <div className="text-center mt-8">
            <span className="font-body text-sm text-ansar-charcoal/60">est. 2020 Ansar Family</span>
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
  const router = useRouter();
  const submitLead = useMutation(api.leads.submit);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", organizationName: "", organizationType: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = form.fullName.trim() && form.email.trim() && form.phone.trim() && form.organizationType;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      await submitLead({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        organizationName: form.organizationName.trim() || undefined,
        organizationType: form.organizationType as "masjid" | "msa" | "community_org" | "other",
      });

      const params = new URLSearchParams({
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
      });
      router.push(`/schedule?${params.toString()}`);

      setForm({ fullName: "", email: "", phone: "", organizationName: "", organizationType: "" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white/70 border border-ansar-charcoal/10 rounded-lg font-body text-sm text-ansar-charcoal placeholder:text-ansar-gray/50 focus:outline-none focus:border-ansar-sage-400 focus:ring-1 focus:ring-ansar-sage-400/30 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-[520px]">
      <input
        type="text"
        placeholder="Full name"
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        className={inputClass}
      />
      <input
        type="email"
        placeholder="Email address"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className={inputClass}
      />
      <input
        type="tel"
        placeholder="Phone number"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className={inputClass}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Organization name"
          value={form.organizationName}
          onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
          className={inputClass}
        />
        <div className="relative">
          <select
            value={form.organizationType}
            onChange={(e) => setForm({ ...form, organizationType: e.target.value })}
            className={`${inputClass} appearance-none cursor-pointer`}
          >
            <option value="" disabled>Organization type</option>
            <option value="masjid">Masjid</option>
            <option value="msa">MSA</option>
            <option value="community_org">Community Organization</option>
            <option value="other">Other</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ansar-gray/40 pointer-events-none" />
        </div>
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
