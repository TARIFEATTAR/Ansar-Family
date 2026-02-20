"use client";

/**
 * ANSAR FAMILY - Homepage
 * Refined Human-First Strategy:
 * 1. Header: Hosts the "Partner" CTA (B2B/Organizational)
 * 2. Hero: Dedicated exclusively to "Humans" (Seekers & Volunteers)
 * 3. Aesthetic: High-end glassmorphism + Framer Motion animations
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Users, Building2, ArrowRight, Send, Phone, Coffee, UtensilsCrossed, QrCode, LayoutDashboard, MessageCircle, Menu, X } from "lucide-react";
import Image from "next/image";
import GardenAnimation from "@/components/GardenAnimation";
import { motion } from "framer-motion";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const cardHoverVariants = {
    initial: { y: 0, scale: 1 },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.4,
        ease: [0.19, 1, 0.22, 1]
      }
    }
  };

  return (
    <main className="min-h-screen bg-ansar-cream relative selection:bg-ansar-sage-200 selection:text-ansar-charcoal">
      {/* Garden Animation - Fixed on right side */}
      <GardenAnimation />

      {/* ============================================
          HEADER / NAVIGATION
          ============================================ */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-4 left-4 right-4 md:left-8 md:right-8 z-50 max-w-[1200px] mx-auto px-4 md:px-8 py-3 bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_-8px_rgba(61,61,61,0.08)] rounded-full"
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-ansar-charcoal tracking-wide hover:opacity-80 transition-opacity">
            Ansar Family
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#mission" className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors">How It Works</Link>
            <Link href="#ecosystem" className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors">Who It&apos;s For</Link>
            <Link href="/communities" className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors">Communities</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden md:block font-body text-sm text-ansar-sage-600 hover:text-ansar-sage-700 transition-colors font-medium">Sign In</Link>
            <Link
              href="/partner"
              className="hidden sm:inline-flex items-center py-2.5 px-5 text-xs font-semibold rounded-full border border-ansar-sage-200/60 text-ansar-sage-700 bg-ansar-sage-50 hover:bg-ansar-sage-600 hover:text-white hover:border-ansar-sage-600 hover:shadow-md transition-all duration-300"
            >
              Bring Ansar to Your Community
            </Link>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-ansar-sage-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-ansar-charcoal" /> : <Menu className="w-5 h-5 text-ansar-charcoal" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="fixed top-[72px] left-4 right-4 z-40 bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-[0_16px_48px_-12px_rgba(61,61,61,0.15)] p-5 md:hidden"
        >
          <nav className="flex flex-col gap-1">
            <Link onClick={() => setMobileMenuOpen(false)} href="#mission" className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 px-3 py-2.5 rounded-lg hover:bg-ansar-sage-50 transition-colors">How It Works</Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="#ecosystem" className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 px-3 py-2.5 rounded-lg hover:bg-ansar-sage-50 transition-colors">Who It&apos;s For</Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/communities" className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 px-3 py-2.5 rounded-lg hover:bg-ansar-sage-50 transition-colors">Communities</Link>
            <div className="border-t border-[rgba(61,61,61,0.06)] my-2" />
            <Link onClick={() => setMobileMenuOpen(false)} href="/dashboard" className="font-body text-sm font-medium text-ansar-sage-600 px-3 py-2.5 rounded-lg hover:bg-ansar-sage-50 transition-colors">Sign In</Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/partner" className="font-body text-sm font-medium text-white bg-ansar-sage-600 px-3 py-2.5 rounded-lg text-center hover:bg-ansar-sage-700 transition-colors">Bring Ansar to Your Community</Link>
          </nav>
        </motion.div>
      )}

      {/* Content wrapper */}
      <div className="relative">

        {/* ============================================
            HERO SECTION - Split Layout: Text Left, Cards Right
            ============================================ */}
        <section className="min-h-screen flex items-center px-6 md:px-12 pt-28 pb-16 relative overflow-hidden">
          {/* Hero background watercolor */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <Image
              src="/images/accents/hero-watercolor-bg.png"
              alt=""
              fill
              className="object-cover opacity-40"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ansar-cream/30 via-transparent to-ansar-cream/70" />
          </div>

          {/* Ambient floating shapes - subtle background animation */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            <motion.div
              animate={{
                x: [0, 30, -20, 0],
                y: [0, -40, 20, 0],
                scale: [1, 1.1, 0.95, 1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[15%] right-[10%] w-[400px] h-[400px] bg-ansar-sage-100/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, -20, 30, 0],
                y: [0, 30, -20, 0],
                scale: [1, 0.9, 1.05, 1]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[20%] right-[25%] w-[300px] h-[300px] bg-ansar-terracotta-100/15 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, 15, -10, 0],
                y: [0, -15, 25, 0]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[40%] left-[5%] w-[200px] h-[200px] bg-ansar-ochre-100/15 rounded-full blur-3xl"
            />
          </div>

          <div className="max-w-[1200px] mx-auto w-full relative z-10 grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">

            {/* LEFT: Typography */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isLoaded ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="max-w-[580px]"
            >
              <p className="font-body text-xs font-normal tracking-[0.2em] uppercase text-ansar-muted mb-5">
                Every Heart Rooted
              </p>

              <h1 className="font-display text-[clamp(2.75rem,2.5rem+2vw,4.5rem)] text-ansar-charcoal mb-6 leading-[1.08] tracking-tight">
                You took the first step. We&apos;ll walk with you.
              </h1>

              <p className="font-body text-lg text-ansar-gray leading-relaxed font-light max-w-[500px]">
                Ansar Family connects you to a real person in a real community near you. Someone to answer your questions, show you around, and make sure you never have to figure this out alone.
              </p>
            </motion.div>

            {/* RIGHT: Cards - Desktop (horizontal layout, stacked) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isLoaded ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
              className="hidden lg:flex flex-col gap-5 w-[380px]"
            >
              {/* Desktop Card 1: Seeker */}
              <Link href="/join" className="block relative group">
                <motion.div
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                  className="bg-white/45 backdrop-blur-xl p-7 rounded-[32px] border border-white/80 shadow-[0_8px_32px_-8px_rgba(61,61,61,0.06)] group-hover:shadow-[0_24px_48px_-12px_rgba(61,61,61,0.1)] group-hover:bg-white/80 group-hover:border-white transition-all duration-400 relative overflow-hidden backdrop-blur-2xl"
                >
                  <div className="absolute -top-8 -right-8 w-40 h-40 bg-ansar-terracotta-100/25 rounded-full blur-2xl group-hover:bg-ansar-terracotta-200/35 transition-colors duration-500" />
                  <div className="relative z-10 flex items-start gap-5">
                    <div className="w-12 h-12 bg-gradient-to-br from-ansar-terracotta-50 to-ansar-terracotta-100/80 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-[-3deg] transition-all duration-500 border border-ansar-terracotta-200/30 shrink-0">
                      <span className="font-display text-2xl text-ansar-terracotta-600 leading-none select-none">S</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-[10px] font-semibold tracking-wider text-ansar-terracotta-600/80 uppercase mb-1">I&apos;m New to Islam</p>
                      <h3 className="font-display text-xl text-ansar-charcoal mb-1.5 group-hover:text-ansar-terracotta-800 transition-colors">Find Your People</h3>
                      <p className="font-body text-sm text-ansar-gray leading-relaxed mb-4">We pair you with someone local, who walks with you at your pace.</p>
                      <span className="inline-flex items-center gap-1.5 font-body text-xs font-medium text-ansar-terracotta-700 group-hover:gap-2.5 transition-all bg-white/60 px-3 py-1.5 rounded-full border border-ansar-terracotta-100/40 group-hover:bg-white group-hover:shadow-sm">
                        Get Connected <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Desktop Card 2: Volunteer */}
              <Link href="/volunteer" className="block relative group">
                <motion.div
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                  className="bg-white/45 backdrop-blur-xl p-7 rounded-[32px] border border-white/80 shadow-[0_8px_32px_-8px_rgba(61,61,61,0.06)] group-hover:shadow-[0_24px_48px_-12px_rgba(61,61,61,0.1)] group-hover:bg-white/80 group-hover:border-white transition-all duration-400 relative overflow-hidden backdrop-blur-2xl"
                >
                  <div className="absolute -top-8 -right-8 w-40 h-40 bg-ansar-sage-100/25 rounded-full blur-2xl group-hover:bg-ansar-sage-200/35 transition-colors duration-500" />
                  <div className="relative z-10 flex items-start gap-5">
                    <div className="w-12 h-12 bg-gradient-to-br from-ansar-sage-50 to-ansar-sage-100/80 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-[3deg] transition-all duration-500 border border-ansar-sage-200/30 shrink-0">
                      <span className="font-display text-2xl text-ansar-sage-600 leading-none select-none">A</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-[10px] font-semibold tracking-wider text-ansar-sage-600/80 uppercase mb-1">I Want to Help</p>
                      <h3 className="font-display text-xl text-ansar-charcoal mb-1.5 group-hover:text-ansar-sage-800 transition-colors">Become an Ansar</h3>
                      <p className="font-body text-sm text-ansar-gray leading-relaxed mb-4">You don&apos;t need to be a scholar. Just someone willing to be there for a person finding their way.</p>
                      <span className="inline-flex items-center gap-1.5 font-body text-xs font-medium text-ansar-sage-700 group-hover:gap-2.5 transition-all bg-white/60 px-3 py-1.5 rounded-full border border-ansar-sage-100/40 group-hover:bg-white group-hover:shadow-sm">
                        Become an Ansar <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>

            {/* MOBILE: Stacked tiles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="flex flex-col gap-3 w-full lg:hidden"
            >
              {/* Mobile Tile 1: Seeker */}
              <Link href="/join" className="block relative group">
                <div className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl border border-white/80 shadow-[0_8px_24px_-6px_rgba(61,61,61,0.06)] active:scale-[0.98] transition-all duration-300 relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 w-28 h-28 bg-ansar-terracotta-100/20 rounded-full blur-2xl" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-ansar-terracotta-50 to-ansar-terracotta-100/80 rounded-xl flex items-center justify-center border border-ansar-terracotta-200/30 shrink-0">
                      <span className="font-display text-lg text-ansar-terracotta-600 leading-none select-none">S</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-base text-ansar-charcoal leading-tight">New to Islam?</h3>
                      <p className="font-body text-xs text-ansar-gray mt-0.5">Get paired with someone local</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-ansar-terracotta-600 shrink-0" />
                  </div>
                </div>
              </Link>

              {/* Mobile Tile 2: Volunteer */}
              <Link href="/volunteer" className="block relative group">
                <div className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl border border-white/80 shadow-[0_8px_24px_-6px_rgba(61,61,61,0.06)] active:scale-[0.98] transition-all duration-300 relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 w-28 h-28 bg-ansar-sage-100/20 rounded-full blur-2xl" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-ansar-sage-50 to-ansar-sage-100/80 rounded-xl flex items-center justify-center border border-ansar-sage-200/30 shrink-0">
                      <span className="font-display text-lg text-ansar-sage-600 leading-none select-none">A</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-base text-ansar-charcoal leading-tight">Become an Ansar</h3>
                      <p className="font-body text-xs text-ansar-gray mt-0.5">Be the friend someone needs</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-ansar-sage-600 shrink-0" />
                  </div>
                </div>
              </Link>
            </motion.div>

          </div>
        </section>

        {/* ============================================
            SECTION: THE GARDEN PHILOSOPHY
            ============================================ */}
        <section className="py-24 px-6 relative z-10">
          <div className="max-w-[900px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-body text-xs font-normal tracking-[0.2em] uppercase text-ansar-sage-600 mb-4">
                The Garden
              </p>
              <h2 className="font-display text-[clamp(2rem,1.5rem+2.5vw,3rem)] text-ansar-charcoal mb-8">
                A seed needs soil, water, and light to grow
              </h2>
              <div className="space-y-6 font-body text-lg text-ansar-gray leading-relaxed max-w-[780px]">
                <p>
                  The Ansar were those in Madinah who opened their homes and hearts to the first Muslims. They understood something simple: faith doesn&apos;t grow in isolation. It grows in community.
                </p>
                <p>
                  Like a garden, every role matters. The seed carries the potential. The water and soil provide the nourishment. And the garden bed gives it all a place to take root.
                </p>
              </div>
            </motion.div>

            {/* Three mini-cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14"
            >
              {/* Seed */}
              <div className="text-center rounded-[32px] bg-gradient-to-b from-ansar-terracotta-50/60 to-white/80 border border-white shadow-[0_8px_24px_-8px_rgba(61,61,61,0.04)] overflow-hidden hover:shadow-[0_16px_32px_-12px_rgba(61,61,61,0.08)] hover:-translate-y-1 transition-all duration-400">
                <div className="relative w-full aspect-[4/3]">
                  <Image
                    src="/images/accents/asala_Single_seed_resting_on_soft_earth_watercolor_and_ink_il_7ad05669-43e3-49bf-b656-772e96b1fb87_3.png"
                    alt="Watercolor seed illustration"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 md:p-6">
                  <h3 className="font-display text-lg md:text-xl text-ansar-charcoal mb-1.5">Seeds</h3>
                  <p className="font-body text-sm text-ansar-gray leading-relaxed">New and returning Muslims</p>
                </div>
              </div>

              {/* Water & Soil */}
              <div className="text-center p-6 md:p-8 rounded-[32px] bg-gradient-to-b from-ansar-sage-50/60 to-white/80 border border-white shadow-[0_8px_24px_-8px_rgba(61,61,61,0.04)] hover:shadow-[0_16px_32px_-12px_rgba(61,61,61,0.08)] hover:-translate-y-1 transition-all duration-400">
                <span className="font-display text-3xl md:text-4xl leading-none block mb-3 select-none">&#x1F4A7;</span>
                <h3 className="font-display text-lg md:text-xl text-ansar-charcoal mb-2">Water &amp; Soil</h3>
                <p className="font-body text-sm text-ansar-gray leading-relaxed">Ansars</p>
              </div>

              {/* Garden Beds */}
              <div className="text-center p-6 md:p-8 rounded-[32px] bg-gradient-to-b from-ansar-ochre-50/60 to-white/80 border border-white shadow-[0_8px_24px_-8px_rgba(61,61,61,0.04)] hover:shadow-[0_16px_32px_-12px_rgba(61,61,61,0.08)] hover:-translate-y-1 transition-all duration-400">
                <span className="font-display text-3xl md:text-4xl leading-none block mb-3 select-none">&#x1F33F;</span>
                <h3 className="font-display text-lg md:text-xl text-ansar-charcoal mb-2">Garden Beds</h3>
                <p className="font-body text-sm text-ansar-gray leading-relaxed">Partner communities</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================
            SECTION: THE REALITY
            ============================================ */}
        <section id="reality" className="py-24 px-6 bg-white relative z-10">
          <div className="max-w-[900px] mx-auto">
            <p className="font-body text-xs font-normal tracking-[0.2em] uppercase text-ansar-terracotta-600 mb-4">
              The Reality
            </p>
            <h2 className="font-display text-[clamp(2rem,1.5rem+2.5vw,3rem)] text-ansar-charcoal mb-8">
              Most people don&apos;t leave Islam. They just never find their community.
            </h2>
            <div className="space-y-6 font-body text-lg text-ansar-gray leading-relaxed">
              <p>
                Someone takes their shahada on a Friday night. By Monday, they&apos;re alone with a hundred questions and no one to call.
              </p>
              <p>
                The masjid down the road has people who&apos;d love to help. They just don&apos;t know who&apos;s new. We built Ansar Family to close that gap.
              </p>
            </div>

            {/* Quran Verse */}
            <blockquote className="mt-12 border-l-2 border-ansar-sage-300 pl-6 py-2">
              <p className="font-display text-xl text-ansar-charcoal/80 leading-relaxed mb-3">
                &ldquo;The example of those who spend their wealth in the way of Allah is like a seed which grows seven spikes; in each spike is a hundred grains. And Allah multiplies for whom He wills. And Allah is All-Encompassing and Knowing.&rdquo;
              </p>
              <cite className="font-body text-sm text-ansar-muted not-italic">
                Surah Al-Baqarah, 2:261
              </cite>
            </blockquote>
          </div>
        </section>

        {/* ============================================
            SECTION 3: HOW IT WORKS
            ============================================ */}
        <section id="mission" className="py-24 px-6 bg-ansar-sage-50 relative z-10">
          <div className="max-w-[1000px] mx-auto">
            <p className="font-body text-xs font-normal tracking-[0.2em] uppercase text-ansar-sage-700 mb-4">
              How It Works
            </p>
            <h2 className="font-display text-[clamp(2rem,1.5rem+2.5vw,3rem)] text-ansar-charcoal mb-4">
              From sign-up to sitting at someone&apos;s dinner table
            </h2>
            <p className="font-body text-lg text-ansar-gray mb-12 max-w-[800px]">
              This isn&apos;t an app you download and scroll through. It&apos;s a real connection pipeline. Here&apos;s what happens after you sign up:
            </p>

            {/* 4 Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

              {/* Step 1 */}
              <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_32px_-12px_rgba(61,61,61,0.06)] border border-white flex flex-col items-center text-center hover:shadow-[0_16px_40px_-16px_rgba(61,61,61,0.1)] hover:-translate-y-1 transition-all duration-400 relative overflow-hidden group">
                <div className="w-16 h-16 bg-ansar-sage-50 border border-ansar-sage-100/50 rounded-[24px] flex items-center justify-center mb-6 text-ansar-sage-600 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Send className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <span className="font-body text-[10.5px] font-bold text-ansar-sage-600 uppercase tracking-widest mb-4 bg-ansar-sage-50/80 px-3.5 py-1.5 rounded-full">Within Minutes</span>
                <h4 className="font-display text-lg text-ansar-charcoal mb-2">Welcome message</h4>
                <p className="font-body text-sm text-ansar-gray">
                  A text and email with starter resources. You&apos;re in the system, not floating.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_32px_-12px_rgba(61,61,61,0.06)] border border-white flex flex-col items-center text-center hover:shadow-[0_16px_40px_-16px_rgba(61,61,61,0.1)] hover:-translate-y-1 transition-all duration-400 relative overflow-hidden group">
                <div className="w-16 h-16 bg-ansar-sage-50 border border-ansar-sage-100/50 rounded-[24px] flex items-center justify-center mb-6 text-ansar-sage-600 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Phone className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <span className="font-body text-[10.5px] font-bold text-ansar-sage-600 uppercase tracking-widest mb-4 bg-ansar-sage-50/80 px-3.5 py-1.5 rounded-full">Within 48 Hours</span>
                <h4 className="font-display text-lg text-ansar-charcoal mb-2">A real person calls</h4>
                <p className="font-body text-sm text-ansar-gray">
                  Someone from our team listens to where you are and what you need.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_32px_-12px_rgba(61,61,61,0.06)] border border-white flex flex-col items-center text-center hover:shadow-[0_16px_40px_-16px_rgba(61,61,61,0.1)] hover:-translate-y-1 transition-all duration-400 relative overflow-hidden group">
                <div className="w-16 h-16 bg-ansar-sage-50 border border-ansar-sage-100/50 rounded-[24px] flex items-center justify-center mb-6 text-ansar-sage-600 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Coffee className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <span className="font-body text-[10.5px] font-bold text-ansar-sage-600 uppercase tracking-widest mb-4 bg-ansar-sage-50/80 px-3.5 py-1.5 rounded-full">Within a Week</span>
                <h4 className="font-display text-lg text-ansar-charcoal mb-2">Meet your Ansar</h4>
                <p className="font-body text-sm text-ansar-gray">
                  We pair you with someone local who meets you before you ever walk into a masjid alone.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_32px_-12px_rgba(61,61,61,0.06)] border border-white flex flex-col items-center text-center hover:shadow-[0_16px_40px_-16px_rgba(61,61,61,0.1)] hover:-translate-y-1 transition-all duration-400 relative overflow-hidden group">
                <div className="w-16 h-16 bg-ansar-sage-50 border border-ansar-sage-100/50 rounded-[24px] flex items-center justify-center mb-6 text-ansar-sage-600 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <UtensilsCrossed className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <span className="font-body text-[10.5px] font-bold text-ansar-sage-600 uppercase tracking-widest mb-4 bg-ansar-sage-50/80 px-3.5 py-1.5 rounded-full">Within a Month</span>
                <h4 className="font-display text-lg text-ansar-charcoal mb-2">Dinner with the community</h4>
                <p className="font-body text-sm text-ansar-gray">
                  Your Ansar brings you to the monthly gathering. Food, conversation, and people glad you came.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 4: FOR COMMUNITIES
            ============================================ */}
        <section id="communities" className="py-24 px-6 bg-white relative z-10">
          <div className="max-w-[1000px] mx-auto">
            <p className="font-body text-xs font-normal tracking-[0.2em] uppercase text-ansar-terracotta-600 mb-4">
              For Communities
            </p>
            <h2 className="font-display text-[clamp(2rem,1.5rem+2.5vw,3rem)] text-ansar-charcoal mb-4">
              We built the back-end so you can focus on the human part
            </h2>
            <p className="font-body text-lg text-ansar-gray mb-12 max-w-[800px]">
              Ansar Family gives your masjid, MSA, or organization everything it needs to welcome and follow up with new Muslims without building anything from scratch.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#FAF9F5] to-white p-8 rounded-[32px] border border-white shadow-[0_8px_24px_-12px_rgba(61,61,61,0.05)] hover:shadow-[0_20px_40px_-16px_rgba(61,61,61,0.08)] hover:-translate-y-1 transition-all duration-400 relative overflow-hidden group">
                <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center mb-6 text-ansar-terracotta-600 shadow-md border border-ansar-terracotta-50/50 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                  <QrCode className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h4 className="font-display text-xl text-ansar-charcoal mb-3">Your own page</h4>
                <p className="font-body text-sm text-ansar-gray">
                  A branded page at ansar.family/your-name with sign-up forms, QR codes for your lobby, and links for your social media. People route directly to you.
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#FAF9F5] to-white p-8 rounded-[32px] border border-white shadow-[0_8px_24px_-12px_rgba(61,61,61,0.05)] hover:shadow-[0_20px_40px_-16px_rgba(61,61,61,0.08)] hover:-translate-y-1 transition-all duration-400 relative overflow-hidden group">
                <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center mb-6 text-ansar-terracotta-600 shadow-md border border-ansar-terracotta-50/50 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                  <LayoutDashboard className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h4 className="font-display text-xl text-ansar-charcoal mb-3">A dashboard that works</h4>
                <p className="font-body text-sm text-ansar-gray">
                  See who&apos;s new. See who&apos;s been paired. See who needs follow-up. Your volunteers and new Muslims in one place, updated in real time.
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#FAF9F5] to-white p-8 rounded-[32px] border border-white shadow-[0_8px_24px_-12px_rgba(61,61,61,0.05)] hover:shadow-[0_20px_40px_-16px_rgba(61,61,61,0.08)] hover:-translate-y-1 transition-all duration-400 relative overflow-hidden group">
                <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center mb-6 text-ansar-terracotta-600 shadow-md border border-ansar-terracotta-50/50 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                  <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h4 className="font-display text-xl text-ansar-charcoal mb-3">Automatic follow-up</h4>
                <p className="font-body text-sm text-ansar-gray">
                  Welcome texts, check-in reminders, dinner invites. Sent automatically. No one falls through the cracks because someone forgot to send a text.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 5: WHO IT'S FOR
            ============================================ */}
        <section id="ecosystem" className="py-24 px-6 bg-ansar-sage-50 relative z-10">
          <div className="max-w-[900px] mx-auto">
            <p className="font-body text-xs font-normal tracking-[0.2em] uppercase text-ansar-ochre-600 mb-4">
              Who It&apos;s For
            </p>
            <h2 className="font-display text-[clamp(2rem,1.5rem+2.5vw,3rem)] text-ansar-charcoal mb-12">
              Three roles. One table.
            </h2>

            <div className="space-y-8">
              {/* Seeker */}
              <div className="flex gap-6 items-start group">
                <div className="w-16 h-16 bg-gradient-to-br from-ansar-sage-50 to-ansar-sage-100/80 shadow-inner border border-ansar-sage-200/40 rounded-[24px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_8px_24px_-8px_rgba(141,162,144,0.3)]">
                  <Heart className="w-8 h-8 text-ansar-sage-600" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-ansar-charcoal mb-2">New & Returning Muslims</h3>
                  <p className="font-body text-ansar-gray leading-relaxed mb-4">
                    New shahada, born Muslim coming back, or still exploring. One form, and we connect you to someone in your area. A friend first, everything else second.
                  </p>
                  <Link href="/join" className="inline-flex items-center gap-2 font-body text-sm text-ansar-sage-700 font-medium hover:gap-3 transition-all">
                    Get connected <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Ansar */}
              <div className="flex gap-6 items-start group">
                <div className="w-16 h-16 bg-gradient-to-br from-ansar-terracotta-50 to-ansar-terracotta-100/80 shadow-inner border border-ansar-terracotta-200/40 rounded-[24px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_8px_24px_-8px_rgba(202,104,83,0.3)]">
                  <Users className="w-8 h-8 text-ansar-terracotta-600" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-ansar-charcoal mb-2">Ansars</h3>
                  <p className="font-body text-ansar-gray leading-relaxed mb-4">
                    An Ansar is the person who sends the first text, walks them into the masjid, and saves them a seat at the monthly dinner. You watch three short training videos, get paired with one person, and commit to 90 days of showing up. You don&apos;t teach fiqh. You don&apos;t give fatwas. You&apos;re a friend. And that&apos;s the thing most people actually need.
                  </p>
                  <Link href="/volunteer" className="inline-flex items-center gap-2 font-body text-sm text-ansar-terracotta-700 font-medium hover:gap-3 transition-all">
                    Become an Ansar <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Partner Hubs */}
              <div className="flex gap-6 items-start group">
                <div className="w-16 h-16 bg-gradient-to-br from-ansar-ochre-50 to-ansar-ochre-100/80 shadow-inner border border-ansar-ochre-200/40 rounded-[24px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_8px_24px_-8px_rgba(212,163,115,0.3)]">
                  <Building2 className="w-8 h-8 text-ansar-ochre-600" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-ansar-charcoal mb-2">Partner Communities</h3>
                  <p className="font-body text-ansar-gray leading-relaxed mb-4">
                    You&apos;re a masjid, MSA, or community org that already wants to support new Muslims. You just don&apos;t have the system for it. You bring three dedicated people. We bring everything else. You stop building spreadsheets. You start building community.
                  </p>
                  <Link href="/partner" className="inline-flex items-center gap-2 font-body text-sm text-ansar-ochre-700 font-medium hover:gap-3 transition-all">
                    Register your community <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            CTA SECTION - Final Reminder
            ============================================ */}
        <section className="py-24 px-6 bg-white relative z-10 border-t border-gray-100">
          <div className="max-w-[900px] mx-auto text-center">
            <h2 className="font-display text-[clamp(2.5rem,2rem+2.5vw,4rem)] text-ansar-charcoal mb-6">
              You don&apos;t have to figure this out alone.
            </h2>
            <p className="font-body text-lg text-ansar-gray max-w-xl mx-auto mb-12">
              Whether you&apos;re looking for your community or trying to build one that actually holds people. Start here.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-8">
              <Link href="/join" className="bg-ansar-terracotta-600 text-white hover:bg-ansar-terracotta-700 min-w-[220px] rounded-full shadow-[0_8px_20px_-6px_rgba(202,104,83,0.4)] hover:shadow-[0_16px_32px_-10px_rgba(202,104,83,0.5)] transition-all duration-300 py-4 px-8 text-base font-medium flex items-center justify-center hover:-translate-y-1">
                Find a Community
              </Link>
              <Link href="/partner" className="bg-white text-ansar-charcoal border border-ansar-gray/20 hover:border-ansar-charcoal hover:bg-ansar-charcoal hover:text-white min-w-[220px] rounded-full shadow-sm hover:shadow-[0_12px_24px_-8px_rgba(61,61,61,0.15)] transition-all duration-300 py-4 px-8 text-base font-medium flex items-center justify-center hover:-translate-y-1">
                Register Your Organization
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="bg-[#F3EFE7] border-t border-[rgba(61,61,61,0.08)] relative z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid md:grid-cols-[2fr_1fr_1fr] gap-12 mb-12">
            {/* Brand */}
            <div className="max-w-[320px]">
              <h3 className="font-display text-xl text-ansar-charcoal mb-4">
                Ansar Family
              </h3>
              <p className="font-body text-sm text-ansar-gray leading-relaxed">
                The infrastructure that connects people new to Islam with the local communities
                ready to welcome them. And gives those communities the tools to actually do it.
              </p>
            </div>

            {/* Get Involved */}
            <div>
              <h4 className="font-body text-xs font-medium tracking-[0.1em] uppercase text-ansar-muted mb-4">
                Get Involved
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/join" className="font-body text-sm text-ansar-sage-700 hover:text-ansar-sage-600 hover:underline transition-colors cursor-pointer">
                    I&apos;m New to Islam →
                  </Link>
                </li>
                <li>
                  <Link href="/volunteer" className="font-body text-sm text-ansar-sage-700 hover:text-ansar-sage-600 hover:underline transition-colors cursor-pointer">
                    Become an Ansar →
                  </Link>
                </li>
                <li>
                  <Link href="/partner" className="font-body text-sm text-ansar-sage-700 hover:text-ansar-sage-600 hover:underline transition-colors cursor-pointer">
                    Register a Community →
                  </Link>
                </li>
                <li>
                  <Link href="/communities" className="font-body text-sm text-ansar-sage-700 hover:text-ansar-sage-600 hover:underline transition-colors cursor-pointer">
                    Find a Community →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-body text-xs font-medium tracking-[0.1em] uppercase text-ansar-muted mb-4">
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy-policy" className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-[rgba(61,61,61,0.08)] text-center space-y-2">
            <p className="font-body text-sm text-ansar-muted">
              © 2026 Ansar Family. Every Heart Rooted.
            </p>
            <p className="font-body text-xs text-ansar-muted/70">
              Built by{" "}
              <a
                href="https://asala.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ansar-sage-600 hover:text-ansar-sage-700 transition-colors"
              >
                asala.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
