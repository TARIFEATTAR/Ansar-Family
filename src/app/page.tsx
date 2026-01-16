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
import GardenAnimation from "@/components/GardenAnimation";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
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
        </div>
      </header>

      {/* Content wrapper */}
      <div className="relative">
        
        {/* ============================================
            HERO SECTION
            ============================================ */}
        <section className="min-h-screen flex flex-col justify-center px-6 pt-32 pb-16">
          <div className="max-w-[900px] mx-auto text-center">
            {/* Label */}
            <p 
              className={`font-body text-xs font-normal tracking-[0.2em] uppercase text-ansar-muted mb-6 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              No One Walks Alone
            </p>

            {/* Title */}
            <h1 
              className={`font-display text-[clamp(3rem,2.5rem+2.5vw,5rem)] text-ansar-charcoal mb-8 leading-[1.15] transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              Every Heart Rooted
            </h1>

            {/* Description */}
            <p 
              className={`font-body text-lg text-ansar-gray max-w-[680px] mx-auto mb-16 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              We provide the infrastructure so local communities can focus on nurturing 
              those new to Islam. We handle the system. You provide the support.
            </p>

            {/* Three Pathways */}
            <div 
              className={`grid md:grid-cols-3 gap-6 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
              }`}
              style={{ transitionDelay: '800ms' }}
            >
              {/* Seeker Card */}
              <Link href="/join" className="group">
                <div className="bg-[#FAFAF8] p-8 rounded-[20px] border border-[rgba(61,61,61,0.08)] hover:border-[rgba(61,61,61,0.12)] hover:shadow-[0_8px_32px_rgba(61,61,61,0.08)] hover:-translate-y-1 transition-all duration-300 text-left">
                  <div className="w-12 h-12 bg-ansar-sage-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <Heart className="w-6 h-6 text-ansar-sage-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl text-ansar-charcoal mb-2">
                    I&apos;m New to Islam
                  </h3>
                  <p className="font-body text-sm text-ansar-muted mb-4">
                    or reconnecting with my faith
                  </p>
                  <p className="font-body text-sm text-ansar-gray mb-6 leading-relaxed">
                    No matter where you are, you don&apos;t have to walk alone. We&apos;ll connect you to your local community.
                  </p>
                  <span className="inline-flex items-center gap-2 font-body text-sm text-ansar-sage-600 group-hover:gap-3 transition-all">
                    Join the Family
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Ansar Card */}
              <Link href="/volunteer" className="group">
                <div className="bg-[#FAFAF8] p-8 rounded-[20px] border border-[rgba(61,61,61,0.08)] hover:border-[rgba(61,61,61,0.12)] hover:shadow-[0_8px_32px_rgba(61,61,61,0.08)] hover:-translate-y-1 transition-all duration-300 text-left">
                  <div className="w-12 h-12 bg-ansar-terracotta-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6 text-ansar-terracotta-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl text-ansar-charcoal mb-2">
                    I Want to Help
                  </h3>
                  <p className="font-body text-sm text-ansar-muted mb-4">
                    become an Ansar
                  </p>
                  <p className="font-body text-sm text-ansar-gray mb-6 leading-relaxed">
                    Volunteer to support new Muslims in your community with friendship and guidance.
                  </p>
                  <span className="inline-flex items-center gap-2 font-body text-sm text-ansar-sage-600 group-hover:gap-3 transition-all">
                    Become an Ansar
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Partner Card */}
              <Link href="/partner" className="group">
                <div className="bg-[#FAFAF8] p-8 rounded-[20px] border border-[rgba(61,61,61,0.08)] hover:border-[rgba(61,61,61,0.12)] hover:shadow-[0_8px_32px_rgba(61,61,61,0.08)] hover:-translate-y-1 transition-all duration-300 text-left">
                  <div className="w-12 h-12 bg-ansar-ochre-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6 text-ansar-ochre-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl text-ansar-charcoal mb-2">
                    Register Your Community
                  </h3>
                  <p className="font-body text-sm text-ansar-muted mb-4">
                    become a Partner Hub
                  </p>
                  <p className="font-body text-sm text-ansar-gray mb-6 leading-relaxed">
                    Bring the Ansar Family infrastructure to your masjid, MSA, or organization.
                  </p>
                  <span className="inline-flex items-center gap-2 font-body text-sm text-ansar-sage-600 group-hover:gap-3 transition-all">
                    Partner With Us
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================
            CTA SECTION
            ============================================ */}
        <section className="py-32 px-6 text-center reveal">
          <div className="max-w-[600px] mx-auto">
            <h2 className="font-display text-[clamp(2.5rem,2rem+2.5vw,4rem)] text-ansar-charcoal mb-6">
              Begin Your Journey
            </h2>
            <p className="font-body text-lg text-ansar-gray mb-10">
              Whether you&apos;re seeking connection, ready to give back, or want to bring this to your community, there&apos;s a place for you in the Ansar Family.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/join" className="btn-primary">
                I&apos;m a Seeker
              </Link>
              <Link href="/volunteer" className="btn-secondary">
                I Want to Volunteer
              </Link>
              <Link href="/partner" className="btn-outline">
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
                  <Link href="/join" className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors">
                    Join as a Seeker
                  </Link>
                </li>
                <li>
                  <Link href="/volunteer" className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors">
                    Become an Ansar
                  </Link>
                </li>
                <li>
                  <Link href="/partner" className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors">
                    Partner With Us
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
                  <Link href="/privacy" className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors">
                    Terms of Service
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
