"use client";

/**
 * ANSAR FAMILY - Enhanced Homepage
 * "Every Heart Rooted" - Where every journey begins.
 * 
 * Features:
 * - Garden animation that grows with scroll
 * - 7 content sections telling the Ansar story
 * - Sage-green footer "soil" where the flower plants
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Users, Building2, BookOpen, MessageCircle, Calendar, Home as HomeIcon } from "lucide-react";
import GardenAnimation from "@/components/GardenAnimation";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT, delay },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-ansar-cream relative">
      {/* Garden Animation - Fixed on right side */}
      <GardenAnimation />

      {/* ============================================
          HEADER / NAVIGATION
          ============================================ */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 bg-ansar-cream/90 backdrop-blur-sm border-b border-ansar-sage-100">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-display text-2xl text-ansar-charcoal">
            Ansar Family
          </Link>
          <div className="hidden md:flex items-center gap-8">
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
            <Link
              href="#programs"
              className="font-body text-sm text-ansar-gray hover:text-ansar-sage-600 transition-colors"
            >
              Programs
            </Link>
            <Link
              href="/join"
              className="font-body text-sm px-5 py-2.5 bg-ansar-sage-600 text-white rounded-full hover:bg-ansar-sage-700 transition-colors"
            >
              Get Started
            </Link>
        </div>
        </nav>
      </header>

      {/* Content wrapper - garden overlays on right side */}
      <div className="relative">
        
        {/* ============================================
            SECTION 1: HERO
            ============================================ */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 md:px-12 pt-24 pb-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.p
              variants={fadeInUp}
              custom={0}
              className="font-body text-sm text-ansar-sage-600 uppercase tracking-widest mb-6"
            >
              No One Walks Alone
            </motion.p>

            <motion.h1
              variants={fadeInUp}
              custom={0.1}
              className="font-display text-5xl md:text-7xl text-ansar-charcoal mb-6 leading-tight"
            >
              Every Heart Rooted
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={0.2}
              className="font-body text-lg md:text-xl text-ansar-gray max-w-2xl mx-auto mb-12"
            >
              We provide the infrastructure so local communities can focus on nurturing 
              those new to Islam. We handle the system. You provide the support.
            </motion.p>

            {/* CTA Cards */}
            <motion.div
              variants={fadeInUp}
              custom={0.3}
              className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              {/* Seeker Card */}
              <Link href="/join" className="group">
                <div className="bg-white p-8 rounded-2xl border border-ansar-sage-100 hover:border-ansar-sage-300 hover:shadow-medium transition-all duration-300">
                  <div className="w-12 h-12 bg-ansar-sage-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-ansar-sage-100 transition-colors">
                    <Heart className="w-6 h-6 text-ansar-sage-600" />
                  </div>
                  <h3 className="font-display text-xl text-ansar-charcoal mb-2">
                    I&apos;m New to Islam
                  </h3>
                  <p className="font-body text-sm text-ansar-gray mb-4">
                    or reconnecting with my faith
                  </p>
                  <p className="font-body text-sm text-ansar-muted">
                    No matter where you are, you don&apos;t have to walk alone. We&apos;ll connect you to your local community.
                  </p>
                  <p className="font-body text-sm text-ansar-sage-600 mt-4 group-hover:text-ansar-sage-700 transition-colors">
                    Join the Family →
                  </p>
                </div>
              </Link>

              {/* Ansar Card */}
              <Link href="/volunteer" className="group">
                <div className="bg-white p-8 rounded-2xl border border-ansar-sage-100 hover:border-ansar-terracotta-300 hover:shadow-medium transition-all duration-300">
                  <div className="w-12 h-12 bg-ansar-terracotta-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-ansar-terracotta-100 transition-colors">
                    <Users className="w-6 h-6 text-ansar-terracotta-600" />
                  </div>
                  <h3 className="font-display text-xl text-ansar-charcoal mb-2">
                    I Want to Help
                  </h3>
                  <p className="font-body text-sm text-ansar-gray mb-4">
                    become an Ansar
                  </p>
                  <p className="font-body text-sm text-ansar-muted">
                    Volunteer to support new Muslims in your community with friendship and guidance.
                  </p>
                  <p className="font-body text-sm text-ansar-terracotta-600 mt-4 group-hover:text-ansar-terracotta-700 transition-colors">
                    Become an Ansar →
                  </p>
                </div>
              </Link>

              {/* Partner Card */}
              <Link href="/partner" className="group">
                <div className="bg-white p-8 rounded-2xl border border-ansar-sage-100 hover:border-ansar-ochre-300 hover:shadow-medium transition-all duration-300">
                  <div className="w-12 h-12 bg-ansar-ochre-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-ansar-ochre-100 transition-colors">
                    <Building2 className="w-6 h-6 text-ansar-ochre-600" />
                  </div>
                  <h3 className="font-display text-xl text-ansar-charcoal mb-2">
                    Register Your Community
                  </h3>
                  <p className="font-body text-sm text-ansar-gray mb-4">
                    become a Partner Hub
                  </p>
                  <p className="font-body text-sm text-ansar-muted">
                    Bring the Ansar Family infrastructure to your masjid, MSA, or organization.
                  </p>
                  <p className="font-body text-sm text-ansar-ochre-600 mt-4 group-hover:text-ansar-ochre-700 transition-colors">
                    Partner With Us →
                  </p>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* ============================================
            SECTION 2: THE CHALLENGE
            ============================================ */}
        <section id="challenge" className="py-24 px-6 md:px-12 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: EASE_OUT }}
            >
              <p className="font-body text-sm text-ansar-terracotta-600 uppercase tracking-widest mb-4">
                The Challenge
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-ansar-charcoal mb-8">
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
            </motion.div>
          </div>
        </section>

        {/* ============================================
            SECTION 3: OUR SOLUTION
            ============================================ */}
        <section id="mission" className="py-24 px-6 md:px-12 bg-ansar-sage-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: EASE_OUT }}
            >
              <p className="font-body text-sm text-ansar-sage-700 uppercase tracking-widest mb-4">
                Our Solution
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-ansar-charcoal mb-8">
                The infrastructure layer for new Muslim support
              </h2>
              <div className="space-y-6 font-body text-lg text-ansar-gray leading-relaxed">
                <p>
                  Ansar Family is a platform that connects seekers with trained volunteer mentors 
                  called <strong className="text-ansar-sage-700">Ansars</strong>, coordinated 
                  through local <strong className="text-ansar-sage-700">Partner Hubs</strong> 
                  like masjids, MSAs, and community organizations.
                </p>
                <p>
                  We don&apos;t replace your local community. We give them the tools, training, 
                  and systems to do what they already want to do: welcome and support those 
                  new to the faith.
                </p>
              </div>

              {/* Key benefits */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white p-6 rounded-xl">
                  <div className="w-10 h-10 bg-ansar-sage-100 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="w-5 h-5 text-ansar-sage-600" />
                  </div>
                  <h4 className="font-display text-lg text-ansar-charcoal mb-2">Personal Connection</h4>
                  <p className="font-body text-sm text-ansar-gray">
                    One-on-one mentorship rooted in friendship, not just curriculum.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl">
                  <div className="w-10 h-10 bg-ansar-sage-100 rounded-lg flex items-center justify-center mb-4">
                    <Building2 className="w-5 h-5 text-ansar-sage-600" />
                  </div>
                  <h4 className="font-display text-lg text-ansar-charcoal mb-2">Local Roots</h4>
                  <p className="font-body text-sm text-ansar-gray">
                    Connected to your neighborhood masjid or community center.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl">
                  <div className="w-10 h-10 bg-ansar-sage-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-5 h-5 text-ansar-sage-600" />
                  </div>
                  <h4 className="font-display text-lg text-ansar-charcoal mb-2">Sustainable System</h4>
                  <p className="font-body text-sm text-ansar-gray">
                    We handle the coordination so communities can focus on care.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================
            SECTION 4: THE ECOSYSTEM
            ============================================ */}
        <section id="ecosystem" className="py-24 px-6 md:px-12 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: EASE_OUT }}
            >
              <p className="font-body text-sm text-ansar-ochre-600 uppercase tracking-widest mb-4">
                The Ecosystem
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-ansar-charcoal mb-12">
                Three roles, one family
              </h2>

              <div className="space-y-8">
                {/* Seeker */}
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 bg-ansar-sage-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Heart className="w-8 h-8 text-ansar-sage-600" />
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
                    <Users className="w-8 h-8 text-ansar-terracotta-600" />
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
                    <Building2 className="w-8 h-8 text-ansar-ochre-600" />
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
            </motion.div>
          </div>
        </section>

        {/* ============================================
            SECTION 5: PROGRAMS / PATHWAYS
            ============================================ */}
        <section id="programs" className="py-24 px-6 md:px-12 bg-ansar-cream">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: EASE_OUT }}
            >
              <p className="font-body text-sm text-ansar-sage-600 uppercase tracking-widest mb-4">
                Pathways to Belonging
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-ansar-charcoal mb-12">
                Four ways we nurture growth
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* 1:1 Mentorship */}
                <div className="bg-white p-8 rounded-2xl border border-ansar-sage-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-ansar-sage-50 rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-ansar-sage-600" />
                    </div>
                    <h3 className="font-display text-xl text-ansar-charcoal">1:1 Mentorship</h3>
                  </div>
                  <p className="font-body text-ansar-gray">
                    Your personal Ansar meets with you regularly for conversation, 
                    questions, and companionship on the journey.
                  </p>
                </div>

                {/* Learning Circles */}
                <div className="bg-white p-8 rounded-2xl border border-ansar-sage-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-ansar-terracotta-50 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-ansar-terracotta-600" />
                    </div>
                    <h3 className="font-display text-xl text-ansar-charcoal">Learning Circles</h3>
                  </div>
                  <p className="font-body text-ansar-gray">
                    Small group sessions covering the essentials: prayer, Quran basics, 
                    and building a daily practice.
                  </p>
                </div>

                {/* Community Gatherings */}
                <div className="bg-white p-8 rounded-2xl border border-ansar-sage-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-ansar-ochre-50 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-ansar-ochre-600" />
                    </div>
                    <h3 className="font-display text-xl text-ansar-charcoal">Community Gatherings</h3>
                  </div>
                  <p className="font-body text-ansar-gray">
                    Monthly dinners and events where seekers meet other seekers, 
                    build friendships, and feel at home.
                  </p>
                </div>

                {/* Resource Access */}
                <div className="bg-white p-8 rounded-2xl border border-ansar-sage-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-ansar-sage-50 rounded-xl flex items-center justify-center">
                      <HomeIcon className="w-6 h-6 text-ansar-sage-600" />
                    </div>
                    <h3 className="font-display text-xl text-ansar-charcoal">Resource Access</h3>
                  </div>
                  <p className="font-body text-ansar-gray">
                    Curated books, apps, and materials to support your learning 
                    at whatever pace feels right for you.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================
            SECTION 6: IMPACT / SOCIAL PROOF
            ============================================ */}
        <section className="py-24 px-6 md:px-12 bg-ansar-sage-600 text-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: EASE_OUT }}
              className="text-center"
            >
              <p className="font-body text-sm text-ansar-sage-200 uppercase tracking-widest mb-4">
                Our Impact
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-16">
                Growing together across communities
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className="font-display text-4xl md:text-5xl text-white mb-2">2,400+</p>
                  <p className="font-body text-sm text-ansar-sage-200">Seekers Supported</p>
                </div>
                <div>
                  <p className="font-display text-4xl md:text-5xl text-white mb-2">850+</p>
                  <p className="font-body text-sm text-ansar-sage-200">Active Ansars</p>
                </div>
                <div>
                  <p className="font-display text-4xl md:text-5xl text-white mb-2">120+</p>
                  <p className="font-body text-sm text-ansar-sage-200">Partner Hubs</p>
                </div>
                <div>
                  <p className="font-display text-4xl md:text-5xl text-white mb-2">45</p>
                  <p className="font-body text-sm text-ansar-sage-200">Cities Nationwide</p>
                </div>
              </div>

              {/* Testimonial */}
              <div className="mt-16 max-w-2xl mx-auto">
                <blockquote className="font-display text-xl md:text-2xl text-white/90 italic mb-6">
                  &quot;My Ansar didn&apos;t just teach me how to pray. She became my sister. 
                  That&apos;s something no YouTube video could give me.&quot;
                </blockquote>
                <p className="font-body text-sm text-ansar-sage-200">
                  Sarah M., Chicago
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================
            SECTION 7: FINAL CTA
            ============================================ */}
        <section className="py-24 px-6 md:px-12 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: EASE_OUT }}
            >
              <h2 className="font-display text-3xl md:text-5xl text-ansar-charcoal mb-6">
                Begin Your Journey
              </h2>
              <p className="font-body text-lg text-ansar-gray max-w-xl mx-auto mb-10">
                Whether you&apos;re seeking connection, ready to give back, or want to bring 
                this to your community, there&apos;s a place for you in the Ansar Family.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/join"
                  className="inline-flex items-center justify-center px-8 py-4 bg-ansar-sage-600 text-white font-body rounded-full hover:bg-ansar-sage-700 transition-colors"
                >
                  I&apos;m a Seeker
                </Link>
                <Link
                  href="/volunteer"
                  className="inline-flex items-center justify-center px-8 py-4 bg-ansar-terracotta-600 text-white font-body rounded-full hover:bg-ansar-terracotta-700 transition-colors"
                >
                  I Want to Volunteer
                </Link>
                <Link
                  href="/partner"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-ansar-ochre-600 text-ansar-ochre-700 font-body rounded-full hover:bg-ansar-ochre-50 transition-colors"
                >
                  Register a Hub
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================
            FOOTER
            ============================================ */}
        <footer className="bg-ansar-cream">
          {/* Main footer content */}
          <div className="px-6 md:px-12 py-12 border-t border-ansar-sage-100">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8 mb-12">
                {/* Brand */}
                <div className="md:col-span-2">
                  <h3 className="font-display text-2xl text-ansar-charcoal mb-4">
                    Ansar Family
                  </h3>
                  <p className="font-body text-sm text-ansar-gray max-w-sm">
                    Every heart anchored. Building bridges between those new to Islam 
                    and the communities that welcome them home.
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="font-body text-sm font-medium text-ansar-charcoal mb-4 uppercase tracking-wider">
                    Get Involved
                  </h4>
                  <ul className="space-y-2">
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
                  <h4 className="font-body text-sm font-medium text-ansar-charcoal mb-4 uppercase tracking-wider">
                    Legal
                  </h4>
                  <ul className="space-y-2">
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
              <div className="pt-8 border-t border-ansar-sage-100 text-center">
                <p className="font-body text-sm text-ansar-gray">
                  © 2026 Ansar Family. Every Heart Rooted.
                </p>
              </div>
            </div>
          </div>

          {/* Sage-green "soil" strip where the garden plants */}
          <div className="h-4 bg-ansar-sage-600" />
        </footer>
        </div>
      </main>
  );
}
