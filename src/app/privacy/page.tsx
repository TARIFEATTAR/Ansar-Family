"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-ansar-cream">
      {/* Header */}
      <header className="px-6 md:px-12 py-6 border-b border-ansar-sage-100">
        <nav className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-xl text-ansar-charcoal hover:text-ansar-sage transition-colors"
          >
            ← Back
          </Link>
        </nav>
      </header>

      {/* Content */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-16"
      >
        <header className="mb-12">
          <p className="font-body text-sm text-ansar-sage uppercase tracking-widest mb-4">
            Legal
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-ansar-charcoal mb-4">
            Privacy Policy
          </h1>
          <p className="font-body text-ansar-gray">
            Last updated: January 16, 2026
          </p>
        </header>

        <div className="prose prose-lg max-w-none font-body text-ansar-charcoal">
          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Our Commitment to Your Privacy
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              Ansar Family (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy and 
              ensuring the security of your personal information. This Privacy Policy explains how we 
              collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            <p className="text-ansar-gray leading-relaxed">
              We understand the sensitive nature of the information you share with us, particularly 
              regarding your spiritual journey. We treat this responsibility with the utmost care and respect.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Information We Collect
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2 mb-4">
              <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth, and gender</li>
              <li><strong>Location Information:</strong> Address, city, state/region, and country of origin</li>
              <li><strong>Journey Information:</strong> Your spiritual journey type (new Muslim, reconnecting, or seeker) and areas where you seek support</li>
              <li><strong>Volunteer Information:</strong> For Ansars, we collect information about your background, experience, and availability</li>
              <li><strong>Organization Information:</strong> For Partner Hubs, we collect details about your community or organization</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              How We Use Your Information
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2">
              <li>Connect seekers with local Ansar volunteers and community resources</li>
              <li>Facilitate introductions and ongoing support relationships</li>
              <li>Enable Partner Hubs to manage their local community programs</li>
              <li>Communicate with you about your participation in our programs</li>
              <li>Improve our services and develop new features</li>
              <li>Ensure the safety and security of our community</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Information Sharing
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              We share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2">
              <li><strong>With Your Ansar or Seeker:</strong> When we pair you with someone, we share necessary contact information to facilitate the connection</li>
              <li><strong>With Partner Hubs:</strong> If you join through a specific community, that Partner Hub will have access to your information to provide local support</li>
              <li><strong>With Service Providers:</strong> We work with trusted third-party services (like our database and authentication providers) who help us operate our platform</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect the safety of our community</li>
            </ul>
            <p className="text-ansar-gray leading-relaxed mt-4">
              <strong>We never sell your personal information to third parties.</strong>
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Data Security
            </h2>
            <p className="text-ansar-gray leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. Our 
              platform uses industry-standard encryption and secure data storage practices. However, 
              no method of transmission over the Internet is 100% secure, and we cannot guarantee 
              absolute security.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Your Rights
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information (subject to certain exceptions)</li>
              <li>Withdraw from our programs at any time</li>
              <li>Opt out of non-essential communications</li>
            </ul>
            <p className="text-ansar-gray leading-relaxed mt-4">
              To exercise any of these rights, please contact us at privacy@ansarfamily.org.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Data Retention
            </h2>
            <p className="text-ansar-gray leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes 
              for which it was collected, including to satisfy any legal, accounting, or reporting 
              requirements. When you request deletion of your account, we will remove your information 
              within 30 days, except where retention is required by law.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Children&apos;s Privacy
            </h2>
            <p className="text-ansar-gray leading-relaxed">
              Our platform is not intended for children under 18 years of age. We do not knowingly 
              collect personal information from children under 18. If you are a parent or guardian 
              and believe your child has provided us with personal information, please contact us 
              immediately.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Changes to This Policy
            </h2>
            <p className="text-ansar-gray leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. 
              We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Contact Us
            </h2>
            <p className="text-ansar-gray leading-relaxed">
              If you have any questions about this Privacy Policy or our privacy practices, please 
              contact us at:
            </p>
            <div className="mt-4 p-6 bg-ansar-sage-50 rounded-lg">
              <p className="text-ansar-charcoal font-medium">Ansar Family</p>
              <p className="text-ansar-gray">Email: privacy@ansarfamily.org</p>
            </div>
          </section>
        </div>
      </motion.article>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-ansar-sage-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="font-body text-sm text-ansar-gray">
              © 2026 Ansar Family. Every Heart Rooted.
            </p>
            <p className="font-body text-xs text-ansar-muted/70">
              Built by{" "}
              <a href="https://asala.ai" target="_blank" rel="noopener noreferrer" className="text-ansar-sage-600 hover:text-ansar-sage-700 transition-colors">asala.ai</a>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="font-body text-sm text-ansar-charcoal font-medium"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="font-body text-sm text-ansar-gray hover:text-ansar-charcoal transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
