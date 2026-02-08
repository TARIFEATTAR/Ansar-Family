"use client";

/**
 * ANSAR FAMILY - Homepage
 * Two-track messaging: warm and universal for seekers,
 * specific and concrete for community partners.
 * 50/50 in warmth, partner-forward in structure.
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
              How It Works
            </Link>
            <Link
              href="#ecosystem"
              className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors"
            >
              Who It&apos;s For
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
              Every Heart Rooted
            </p>

            {/* Title */}
            <h1
              className={`font-display text-[clamp(3rem,2.5rem+2.5vw,5rem)] text-ansar-charcoal mb-8 leading-[1.15] transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
                }`}
              style={{ transitionDelay: '400ms' }}
            >
              No new Muslim should have to figure this out alone
            </h1>

            {/* Description */}
            <p
              className={`font-body text-lg text-ansar-gray max-w-[720px] mx-auto mb-16 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
              style={{ transitionDelay: '600ms' }}
            >
              We connect people new to Islam with local communities ready to welcome them, and we give those communities the tools to do it well.
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
                    Bring This to Your Community
                  </h3>
                  <p className="font-body text-sm text-ansar-sage-700/80 mb-4 font-medium tracking-wide">
                    FOR MASJIDS, MSAS & ORGANIZATIONS
                  </p>
                  <p className="font-body text-sm text-ansar-gray mb-6 leading-relaxed">
                    We handle the logistics (forms, follow-ups, notifications) so you can focus on the human part. Set up in 10 minutes.
                  </p>
                  <span className="inline-flex items-center gap-2 font-body text-sm text-ansar-sage-700 group-hover:gap-3 transition-all font-medium">
                    See What You Get
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
                    Walk alongside someone new to Islam in your community. No teaching credentials required. Just consistency and care.
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
              The gap between wanting help and finding it
            </h2>
            <div className="space-y-6 font-body text-lg text-ansar-gray leading-relaxed">
              <p>
                Every year, thousands of people accept Islam or reconnect with their faith
                after years away. They&apos;re sincere, curious, and ready to grow.
                But most of them have no idea where to go next.
              </p>
              <p>
                At the same time, masjids and MSAs want to welcome them. But there&apos;s
                no easy way to find who&apos;s new, connect them with a friendly face,
                or simply say &ldquo;dinner this Saturday.&rdquo;
              </p>
              <p className="text-ansar-charcoal font-medium">
                Both sides want the same thing. The systems just aren&apos;t there yet.
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
              How It Works
            </p>
            <h2 className="font-display text-[clamp(2rem,1.5rem+2.5vw,3rem)] text-ansar-charcoal mb-8">
              The infrastructure layer for new Muslim support
            </h2>
            <div className="space-y-6 font-body text-lg text-ansar-gray leading-relaxed mb-12">
              <p>
                Ansar Family connects people new to Islam with welcoming volunteers
                called <strong className="text-ansar-sage-700">Ansars</strong>, coordinated
                through local <strong className="text-ansar-sage-700">Partner Hubs</strong>: masjids, MSAs, and community organizations that host the program.
              </p>
              <p>
                We don&apos;t replace your community. We give it the tools to do what
                it already wants to do: find the people who need you, welcome them in,
                and make sure no one falls through the cracks.
              </p>
            </div>

            {/* Key benefits */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl">
                <div className="w-10 h-10 bg-ansar-sage-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-5 h-5 text-ansar-sage-600" strokeWidth={1.5} />
                </div>
                <h4 className="font-display text-lg text-ansar-charcoal mb-2">Real People, Not Programs</h4>
                <p className="font-body text-sm text-ansar-gray">
                  New Muslims get connected with a real person from a local community. Not a course or a chatbot.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl">
                <div className="w-10 h-10 bg-ansar-sage-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5 text-ansar-sage-600" strokeWidth={1.5} />
                </div>
                <h4 className="font-display text-lg text-ansar-charcoal mb-2">Your Community, Your Page</h4>
                <p className="font-body text-sm text-ansar-gray">
                  Each partner gets a branded hub page, a QR code, and sign-up forms that route people directly to you.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl">
                <div className="w-10 h-10 bg-ansar-sage-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-ansar-sage-600" strokeWidth={1.5} />
                </div>
                <h4 className="font-display text-lg text-ansar-charcoal mb-2">We Handle the Logistics</h4>
                <p className="font-body text-sm text-ansar-gray">
                  Automatic welcome messages, a dashboard to see who&apos;s new, and one-click emails to invite everyone to dinner.
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
              Who It&apos;s For
            </p>
            <h2 className="font-display text-[clamp(2rem,1.5rem+2.5vw,3rem)] text-ansar-charcoal mb-12">
              Three roles, one mission
            </h2>

            <div className="space-y-8">
              {/* Seeker — first position, brief. "You're the reason this exists." */}
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-ansar-sage-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-8 h-8 text-ansar-sage-600" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-ansar-charcoal mb-2">Seekers</h3>
                  <p className="font-body text-ansar-gray leading-relaxed">
                    New to Islam or reconnecting after time away. You sign up,
                    we connect you with a local community and a welcoming face.
                    You&apos;re not alone in this.
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
                    Volunteers from your community who are kind, consistent,
                    and willing to show up. No teaching credentials needed.
                    Your local hub approves you and connects you with someone
                    new to the faith.
                  </p>
                </div>
              </div>

              {/* Partner Hubs — most detail, this is the primary audience */}
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-ansar-ochre-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-ansar-ochre-600" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-ansar-charcoal mb-2">Partner Hubs</h3>
                  <p className="font-body text-ansar-gray leading-relaxed">
                    Masjids, MSAs, and organizations that want to support new Muslims
                    but need the tools. You get a branded hub page, sign-up forms,
                    a volunteer dashboard, and automatic welcome messages.
                    We handle the logistics. You focus on being a community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            CTA SECTION - Two Equal Lanes
            ============================================ */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-display text-[clamp(2.5rem,2rem+2.5vw,4rem)] text-ansar-charcoal mb-6 text-center">
              Where do you fit in?
            </h2>
            <p className="font-body text-lg text-ansar-gray max-w-xl mx-auto mb-12 text-center">
              Whether you&apos;re looking for community or looking to build one, there&apos;s a place for you here.
            </p>

            {/* Two equal-weight lanes */}
            <div className="grid md:grid-cols-2 gap-6 max-w-[800px] mx-auto mb-8">
              {/* Community lane */}
              <Link href="/partner" className="group">
                <div className="bg-ansar-sage-50 p-8 rounded-[20px] border border-ansar-sage-200/30 hover:bg-ansar-sage-100/60 hover:shadow-[0_8px_32px_rgba(61,61,61,0.06)] hover:-translate-y-1 transition-all duration-300 text-center h-full">
                  <div className="w-14 h-14 bg-ansar-sage-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Building2 className="w-7 h-7 text-ansar-sage-700" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl text-ansar-charcoal mb-3">
                    I&apos;m a community looking for tools
                  </h3>
                  <p className="font-body text-sm text-ansar-gray mb-6 leading-relaxed">
                    Register your masjid, MSA, or organization as a Partner Hub. Three committed people and one monthly gathering. That&apos;s all it takes.
                  </p>
                  <span className="inline-flex items-center gap-2 font-body text-sm text-ansar-sage-700 group-hover:gap-3 transition-all font-medium">
                    Register Your Hub
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Seeker lane */}
              <Link href="/join" className="group">
                <div className="bg-ansar-terracotta-50/50 p-8 rounded-[20px] border border-ansar-terracotta-200/20 hover:bg-ansar-terracotta-50 hover:shadow-[0_8px_32px_rgba(61,61,61,0.06)] hover:-translate-y-1 transition-all duration-300 text-center h-full">
                  <div className="w-14 h-14 bg-ansar-terracotta-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Heart className="w-7 h-7 text-ansar-terracotta-700" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl text-ansar-charcoal mb-3">
                    I&apos;m new to Islam and looking for people
                  </h3>
                  <p className="font-body text-sm text-ansar-gray mb-6 leading-relaxed">
                    We&apos;ll connect you with a welcoming community near you and someone who&apos;s been where you are. No pressure, no timeline.
                  </p>
                  <span className="inline-flex items-center gap-2 font-body text-sm text-ansar-terracotta-700 group-hover:gap-3 transition-all font-medium">
                    Find Your Community
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </div>

            {/* Volunteer — secondary, centered */}
            <div className="text-center">
              <Link
                href="/volunteer"
                className="inline-flex items-center gap-2 font-body text-sm text-ansar-gray hover:text-ansar-terracotta-700 transition-colors"
              >
                <Users className="w-4 h-4" strokeWidth={1.5} />
                Want to volunteer as an Ansar?
                <ArrowRight className="w-3.5 h-3.5" />
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
                Connecting people new to Islam with the local communities
                ready to welcome them, and giving those communities the
                tools to do it well.
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
                    Register a Hub →
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
