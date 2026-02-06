"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export default function PrivacyPolicyPage() {
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
            Last updated: January 26, 2026
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
              <li><strong>Volunteer Information:</strong> For Ansars, we collect information about your background, experience, practice level, knowledge background, and availability</li>
              <li><strong>Organization Information:</strong> For Partner Hubs, we collect details about your community or organization, including infrastructure details and core team information</li>
              <li><strong>Communication Preferences:</strong> Your consent to receive SMS and email communications</li>
            </ul>
            <p className="text-ansar-gray leading-relaxed mt-4">
              We also automatically collect certain information when you use our platform, including 
              IP address, browser type, device information, and usage patterns through our analytics 
              and authentication providers.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              How We Use Your Information
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2 mb-4">
              <li>Connect seekers with local Ansar volunteers and community resources</li>
              <li>Facilitate introductions and ongoing support relationships</li>
              <li>Enable Partner Hubs to manage their local community programs</li>
              <li>Send you welcome messages, updates, and important notifications via SMS and email</li>
              <li>Notify you when you&apos;ve been paired with an Ansar or connected to a community</li>
              <li>Communicate with you about your participation in our programs</li>
              <li>Improve our services and develop new features</li>
              <li>Ensure the safety and security of our community</li>
              <li>Comply with legal obligations and protect our rights</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              SMS and Email Communications
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              When you submit a form on our platform, we automatically send you:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2 mb-4">
              <li><strong>Welcome SMS:</strong> A text message welcoming you to Ansar Family and explaining next steps</li>
              <li><strong>Welcome Email:</strong> A detailed email with resources and information about your journey</li>
              <li><strong>Pairing Notifications:</strong> SMS and email notifications when you&apos;re connected with an Ansar or community</li>
            </ul>
            <p className="text-ansar-gray leading-relaxed mb-4">
              <strong>Opt-Out:</strong> You can opt out of SMS communications at any time by replying &quot;STOP&quot; 
              to any SMS message from us. You can opt out of email communications by clicking the unsubscribe 
              link in any email or by contacting us directly.
            </p>
            <p className="text-ansar-gray leading-relaxed">
              <strong>Third-Party Services:</strong> We use Twilio for SMS delivery and Resend for email delivery. 
              These services process your phone number and email address to deliver messages on our behalf. 
              Please review their privacy policies for more information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Information Sharing
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              We share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2 mb-4">
              <li><strong>With Your Ansar or Seeker:</strong> When we pair you with someone, we share necessary contact information (name, phone number, email) to facilitate the connection</li>
              <li><strong>With Partner Hubs:</strong> If you join through a specific community, that Partner Hub will have access to your information to provide local support and coordinate gatherings</li>
              <li><strong>With Service Providers:</strong> We work with trusted third-party services who help us operate our platform:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Convex:</strong> Database and backend services (stores your information securely)</li>
                  <li><strong>Clerk:</strong> Authentication services (manages your account login)</li>
                  <li><strong>Twilio:</strong> SMS delivery services (sends text messages on our behalf)</li>
                  <li><strong>Resend:</strong> Email delivery services (sends emails on our behalf)</li>
                  <li><strong>Vercel:</strong> Hosting and deployment services</li>
                </ul>
              </li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or to protect the safety of our community</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction</li>
            </ul>
            <p className="text-ansar-gray leading-relaxed mt-4">
              <strong>We never sell your personal information to third parties.</strong>
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Data Security
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. Our 
              platform uses:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2 mb-4">
              <li>Industry-standard encryption for data in transit (HTTPS/TLS)</li>
              <li>Secure data storage through Convex (encrypted at rest)</li>
              <li>Authentication and authorization controls through Clerk</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls limiting who can view your information</li>
            </ul>
            <p className="text-ansar-gray leading-relaxed">
              However, no method of transmission over the Internet is 100% secure, and we cannot 
              guarantee absolute security. We encourage you to use strong passwords and keep your 
              account information confidential.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Your Rights
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2 mb-4">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your information (subject to certain exceptions, such as legal requirements or ongoing program participation)</li>
              <li><strong>Withdrawal:</strong> Withdraw from our programs at any time</li>
              <li><strong>Opt-Out:</strong> Opt out of non-essential communications (SMS and email)</li>
              <li><strong>Data Portability:</strong> Request your data in a portable format</li>
              <li><strong>Objection:</strong> Object to certain processing of your information</li>
            </ul>
            <p className="text-ansar-gray leading-relaxed mt-4">
              To exercise any of these rights, please contact us at{" "}
              <a href="mailto:privacy@ansarfamily.org" className="text-ansar-sage-600 hover:underline">
                privacy@ansarfamily.org
              </a>
              . We will respond to your request within 30 days.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Data Retention
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              We retain your personal information for as long as necessary to fulfill the purposes 
              for which it was collected, including:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2 mb-4">
              <li>To provide ongoing support and connection services</li>
              <li>To maintain records of pairings and community connections</li>
              <li>To satisfy any legal, accounting, or reporting requirements</li>
              <li>To resolve disputes and enforce our agreements</li>
            </ul>
            <p className="text-ansar-gray leading-relaxed">
              When you request deletion of your account, we will remove your information within 30 days, 
              except where retention is required by law or necessary for ongoing program administration. 
              We also maintain anonymized analytics data that cannot be used to identify you.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Cookies and Tracking Technologies
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2 mb-4">
              <li>Maintain your authentication session (essential for platform functionality)</li>
              <li>Remember your preferences and settings</li>
              <li>Analyze how you use our platform to improve our services</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
            <p className="text-ansar-gray leading-relaxed">
              You can control cookies through your browser settings. However, disabling certain 
              cookies may limit your ability to use some features of our platform.
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
              immediately at{" "}
              <a href="mailto:privacy@ansarfamily.org" className="text-ansar-sage-600 hover:underline">
                privacy@ansarfamily.org
              </a>
              {" "}and we will take steps to remove that information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              International Data Transfers
            </h2>
            <p className="text-ansar-gray leading-relaxed">
              Your information may be transferred to and processed in countries other than your country 
              of residence. These countries may have data protection laws that differ from those in 
              your country. By using our platform, you consent to the transfer of your information to 
              these countries. We ensure appropriate safeguards are in place to protect your information 
              in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Changes to This Policy
            </h2>
            <p className="text-ansar-gray leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices, 
              technology, legal requirements, or other factors. We will notify you of any material 
              changes by:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2 mt-4">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the &quot;Last updated&quot; date</li>
              <li>Sending you an email notification (if we have your email address)</li>
              <li>Displaying a prominent notice on our platform</li>
            </ul>
            <p className="text-ansar-gray leading-relaxed mt-4">
              We encourage you to review this Privacy Policy periodically to stay informed about how 
              we protect your information.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Contact Us
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our 
              privacy practices, please contact us:
            </p>
            <div className="mt-4 p-6 bg-ansar-sage-50 rounded-lg">
              <p className="text-ansar-charcoal font-medium mb-2">Ansar Family</p>
              <p className="text-ansar-gray mb-1">
                Email:{" "}
                <a href="mailto:privacy@ansarfamily.org" className="text-ansar-sage-600 hover:underline">
                  privacy@ansarfamily.org
                </a>
              </p>
              <p className="text-ansar-gray">
                Website:{" "}
                <a href="https://ansar.family" className="text-ansar-sage-600 hover:underline">
                  ansar.family
                </a>
              </p>
            </div>
          </section>
        </div>
      </motion.article>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-ansar-sage-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-sm text-ansar-gray">
            © 2026 Ansar Family. Every Heart Rooted.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy-policy"
              className="font-body text-sm text-ansar-charcoal font-medium"
            >
              Privacy Policy
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
