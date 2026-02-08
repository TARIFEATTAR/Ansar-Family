"use client";

/**
 * ANSAR FAMILY - Homepage
 * "Every Heart Rooted" - Where every journey begins.
 * 
 * Simplified layout with enhanced garden animation
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Users, Building2, ArrowRight } from "lucide-react";
import Image from "next/image";
import GardenAnimation from "@/components/GardenAnimation";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-ansar-cream relative">
      {/* Garden Animation - Fixed on right side */}
      <GardenAnimation />

      {/* ============================================
          HEADER / NAVIGATION
          ============================================ */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-8 py-4 bg-ansar-cream border-b border-[rgba(61,61,61,0.08)]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-ansar-charcoal tracking-wide">
            Ansar Family
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#mission"
              className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors"
            >
              Our Mission
            </Link>
            <Link
              href="#ecosystem"
              className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors"
            >
              The Ecosystem
            </Link>
          </nav>
          <Link
            href="/sign-in"
            className="md:ml-0 ml-auto font-body text-sm text-ansar-sage-600 hover:text-ansar-sage-700 transition-colors"
          >
            Partner Login
          </Link>
        </div>
      </header>

      {/* Content wrapper */}
      <div className="relative">

        {/* ============================================
            HERO SECTION
            ============================================ */}
        <section className="min-h-screen flex flex-col justify-center px-6 pt-32 pb-16 relative overflow-hidden">
          {/* IMG-01: Hero Olive Sprig - Full Width Background */}
          <div className="absolute inset-0 z-0 mix-blend-multiply opacity-90 pointer-events-none">
            <Image
              src="/images/accents/img-01-hero-olive-sprig.png"
              alt="Decorative olive branch"
              fill
              className="object-cover object-right-top"
              priority
            />
            {/* Gradient overlay to ensure text readability if needed, though mostly empty space */}
            <div className="absolute inset-0 bg-gradient-to-r from-ansar-cream via-ansar-cream/80 to-transparent" />
          </div>

          <div className="max-w-[900px] mx-auto text-center relative z-10">
            {/* Label */}
            <p
              className={`font-body text-xs font-normal tracking-[0.2em] uppercase text-ansar-muted mb-6 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
              style={{ transitionDelay: '200ms' }}
            >
              No One Walks Alone
            </p>

            {/* Title */}
            <h1
              className={`font-display text-[clamp(3rem,2.5rem+2.5vw,5rem)] text-ansar-charcoal mb-8 leading-[1.15] transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
                }`}
              style={{ transitionDelay: '400ms' }}
            >
              Every Heart Rooted
            </h1>

            {/* Description */}
            <p
              className={`font-body text-lg text-ansar-gray max-w-[680px] mx-auto mb-16 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
              style={{ transitionDelay: '600ms' }}
            >
              We handle the system. You provide the support.
            </p>

            {/* Two Primary Pathways */}
            <div
              className={`grid md:grid-cols-2 gap-6 max-w-[800px] mx-auto transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
                }`}
              style={{ transitionDelay: '800ms' }}
            >
              {/* Partner Card — Primary CTA */}
              <Link href="/partner" className="group">
                <div className="bg-white/70 backdrop-blur-md p-8 rounded-[20px] border border-white/40 shadow-sm hover:bg-white/85 hover:shadow-[0_8px_32px_rgba(61,61,61,0.06)] hover:-translate-y-1 transition-all duration-300 text-left h-full group">
                  <div className="w-12 h-12 bg-ansar-sage-100/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform border border-ansar-sage-200/20">
                    <Building2 className="w-6 h-6 text-ansar-sage-700" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl text-ansar-charcoal mb-2">
                    Register Your Community
                  </h3>
                  <p className="font-body text-sm text-ansar-sage-700/80 mb-4 font-medium tracking-wide">
                    BECOME A PARTNER HUB
                  </p>
                  <p className="font-body text-sm text-ansar-gray mb-6 leading-relaxed">
                    Bring the Ansar Family infrastructure to your masjid, MSA, or organization. We handle intake, pairing, and follow-up.
                  </p>
                  <span className="inline-flex items-center gap-2 font-body text-sm text-ansar-sage-700 group-hover:gap-3 transition-all font-medium">
                    Partner With Us
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Ansar Card — Secondary CTA */}
              <Link href="/volunteer" className="group">
                <div className="bg-white/70 backdrop-blur-md p-8 rounded-[20px] border border-white/40 shadow-sm hover:bg-white/85 hover:shadow-[0_8px_32px_rgba(61,61,61,0.06)] hover:-translate-y-1 transition-all duration-300 text-left h-full group">
                  <div className="w-12 h-12 bg-ansar-terracotta-100/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform border border-ansar-terracotta-200/20">
                    <Users className="w-6 h-6 text-ansar-terracotta-700" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl text-ansar-charcoal mb-2">
                    I Want to Help
                  </h3>
                  <p className="font-body text-sm text-ansar-terracotta-700/80 mb-4 font-medium tracking-wide">
                    BECOME AN ANSAR
                  </p>
                  <p className="font-body text-sm text-ansar-gray mb-6 leading-relaxed">
                    Volunteer to walk alongside new Muslims in your community with friendship, mentorship, and guidance.
                  </p>
                  <span className="inline-flex items-center gap-2 font-body text-sm text-ansar-terracotta-700 group-hover:gap-3 transition-all font-medium">
                    Become an Ansar
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </div>

            {/* Seeker — Subtle text link */}
            <div
              className={`mt-10 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              style={{ transitionDelay: '1000ms' }}
            >
              <Link
                href="/join"
                className="group inline-flex flex-col items-center gap-1.5 text-center"
              >
                <p className="font-body text-sm text-ansar-gray">
                  New to Islam or reconnecting with your faith? You&apos;re not alone.
                </p>
                <span className="inline-flex items-center gap-2 font-body text-sm text-ansar-sage-600 group-hover:gap-3 transition-all">
                  <Heart className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Find your local community
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 2: THE CHALLENGE
            ============================================ */}
        <section id="challenge" className="py-24 px-6 bg-white">
          <div className="max-w-[900px] mx-auto">
            <p className="font-body text-xs font-normal tracking-[0.2em] uppercase text-ansar-terracotta-600 mb-4">
              The Challenge
            </p>
            <h2 className="font-display text-[clamp(2rem,1.5rem+2.5vw,3rem)] text-ansar-charcoal mb-8">
              Too many new Muslims walk alone
            </h2>
            <div className="space-y-6 font-body text-lg text-ansar-gray leading-relaxed">
              <p>
                Every year, thousands embrace Islam or return to their faith after years away.
                They&apos;re filled with hope, curiosity, and a desire to grow. But too often,
                that spark fades when they can&apos;t find community.
              </p>
              <p>
                Masjids are busy. Programs are scattered. Resources feel overwhelming.
                And the personal connection that transforms knowledge into lived faith?
                That&apos;s rare.
              </p>
              <p className="text-ansar-charcoal font-medium">
                We believe no one should walk this path alone.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 3: OUR SOLUTION
            ============================================ */}
        <section id="mission" className="py-24 px-6 bg-ansar-sage-50">
          <div className="max-w-[900px] mx-auto">
            <p className="font-body text-xs font-normal tracking-[0.2em] uppercase text-ansar-sage-700 mb-4">
              Our Solution
            </p>
            <h2 className="font-display text-[clamp(2rem,1.5rem+2.5vw,3rem)] text-ansar-charcoal mb-8">
              The infrastructure layer for new Muslim support
            </h2>
            <div className="space-y-6 font-body text-lg text-ansar-gray leading-relaxed mb-12">
              <p>
                Ansar Family is a platform that connects seekers with trained volunteer mentors
                called <strong className="text-ansar-sage-700">Ansars</strong>, coordinated
                through local <strong className="text-ansar-sage-700">Partner Hubs</strong> like
                masjids, MSAs, and community organizations.
              </p>
              <p>
                We don&apos;t replace your local community. We give them the tools, training,
                and systems to do what they already want to do: welcome and support those
                new to the faith.
              </p>
            </div>

            {/* Key benefits */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl">
                <div className="w-10 h-10 bg-ansar-sage-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-5 h-5 text-ansar-sage-600" strokeWidth={1.5} />
                </div>
                <h4 className="font-display text-lg text-ansar-charcoal mb-2">Personal Connection</h4>
                <p className="font-body text-sm text-ansar-gray">
                  One-on-one mentorship rooted in friendship, not just curriculum.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl">
                <div className="w-10 h-10 bg-ansar-sage-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5 text-ansar-sage-600" strokeWidth={1.5} />
                </div>
                <h4 className="font-display text-lg text-ansar-charcoal mb-2">Local Roots</h4>
                <p className="font-body text-sm text-ansar-gray">
                  Connected to your neighborhood masjid or community center.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl">
                <div className="w-10 h-10 bg-ansar-sage-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-ansar-sage-600" strokeWidth={1.5} />
                </div>
                <h4 className="font-display text-lg text-ansar-charcoal mb-2">Sustainable System</h4>
                <p className="font-body text-sm text-ansar-gray">
                  We handle the coordination so communities can focus on care.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 4: THE ECOSYSTEM
            ============================================ */}
        <section id="ecosystem" className="py-24 px-6 bg-white">
          <div className="max-w-[900px] mx-auto">
            <p className="font-body text-xs font-normal tracking-[0.2em] uppercase text-ansar-ochre-600 mb-4">
              The Ecosystem
            </p>
            <h2 className="font-display text-[clamp(2rem,1.5rem+2.5vw,3rem)] text-ansar-charcoal mb-12">
              Three roles, one family
            </h2>

            <div className="space-y-8">
              {/* Seeker */}
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-ansar-sage-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-8 h-8 text-ansar-sage-600" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-ansar-charcoal mb-2">Seekers</h3>
                  <p className="font-body text-ansar-gray leading-relaxed">
                    Those new to Islam or reconnecting after time away. You&apos;re not a project.
                    You&apos;re a person with questions, hopes, and a journey that matters.
                    We pair you with an Ansar who walks beside you at your pace.
                  </p>
                </div>
              </div>

              {/* Ansar */}
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-ansar-terracotta-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-8 h-8 text-ansar-terracotta-600" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-ansar-charcoal mb-2">Ansars</h3>
                  <p className="font-body text-ansar-gray leading-relaxed">
                    Volunteer mentors who offer their time, knowledge, and presence.
                    You don&apos;t need to be a scholar. You need to be kind, consistent,
                    and willing to learn alongside your seeker. We train and support you.
                  </p>
                </div>
              </div>

              {/* Partner Hubs */}
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-ansar-ochre-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-ansar-ochre-600" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-ansar-charcoal mb-2">Partner Hubs</h3>
                  <p className="font-body text-ansar-gray leading-relaxed">
                    Masjids, MSAs, and organizations that host the program locally.
                    You provide the space and community. We provide the dashboard,
                    training, and matching system. Together, you anchor hearts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            CTA SECTION - Begin Your Journey
            ============================================ */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-[900px] mx-auto text-center">
            <h2 className="font-display text-[clamp(2.5rem,2rem+2.5vw,4rem)] text-ansar-charcoal mb-6">
              Begin Your Journey
            </h2>
            <p className="font-body text-lg text-ansar-gray max-w-xl mx-auto mb-12">
              Whether you&apos;re seeking connection, ready to give back, or want to bring this to your community, there&apos;s a place for you in the Ansar Family.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
              <Link
                href="/join"
                className="inline-flex items-center justify-center px-8 py-4 bg-ansar-sage-600 text-white font-body rounded-full hover:bg-ansar-sage-700 transition-all hover:-translate-y-0.5"
              >
                I&apos;m a Seeker
              </Link>
              <Link
                href="/volunteer"
                className="inline-flex items-center justify-center px-8 py-4 bg-ansar-terracotta-600 text-white font-body rounded-full hover:bg-ansar-terracotta-700 transition-all hover:-translate-y-0.5"
              >
                I Want to Volunteer
              </Link>
              <Link
                href="/partner"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-ansar-ochre-600 text-ansar-ochre-700 font-body rounded-full hover:bg-ansar-ochre-50 transition-all hover:-translate-y-0.5"
              >
                Register a Hub
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="bg-[#F3EFE7] border-t border-[rgba(61,61,61,0.08)]">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid md:grid-cols-[2fr_1fr_1fr] gap-12 mb-12">
            {/* Brand */}
            <div className="max-w-[320px]">
              <h3 className="font-display text-xl text-ansar-charcoal mb-4">
                Ansar Family
              </h3>
              <p className="font-body text-sm text-ansar-gray leading-relaxed">
                Every heart rooted. Building bridges between those new to Islam
                and the communities that welcome them home.
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
                    Join as a Seeker →
                  </Link>
                </li>
                <li>
                  <Link href="/volunteer" className="font-body text-sm text-ansar-sage-700 hover:text-ansar-sage-600 hover:underline transition-colors cursor-pointer">
                    Become an Ansar →
                  </Link>
                </li>
                <li>
                  <Link href="/partner" className="font-body text-sm text-ansar-sage-700 hover:text-ansar-sage-600 hover:underline transition-colors cursor-pointer">
                    Partner With Us →
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
                <li>
                  <Link href="/admin" className="font-body text-sm text-ansar-muted hover:text-ansar-gray transition-colors">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-[rgba(61,61,61,0.08)] text-center">
            <p className="font-body text-sm text-ansar-muted">
              © 2026 Ansar Family. Every Heart Rooted.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
