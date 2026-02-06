"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export default function TermsAndConditionsPage() {
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
            Terms and Conditions
          </h1>
          <p className="font-body text-ansar-gray">
            Last updated: January 26, 2026
          </p>
        </header>

        <div className="prose prose-lg max-w-none font-body text-ansar-charcoal">
          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Welcome to Ansar Family
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the Ansar Family 
              platform and services. By accessing or using our platform, you agree to be bound by 
              these Terms. If you do not agree to these Terms, please do not use our services.
            </p>
            <p className="text-ansar-gray leading-relaxed">
              Ansar Family is a platform designed to connect individuals new to Islam or reconnecting 
              with their faith (&quot;Seekers&quot;) with volunteer mentors (&quot;Ansars&quot;) through local community 
              organizations (&quot;Partner Hubs&quot;).
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Eligibility
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              To use our platform, you must:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Provide accurate and complete information during registration</li>
              <li>Have the legal capacity to enter into these Terms</li>
              <li>Not have been previously suspended or removed from our platform</li>
              <li>Agree to receive SMS and email communications as part of our service</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              User Responsibilities
            </h2>
            
            <h3 className="font-display text-xl text-ansar-charcoal mb-3 mt-6">
              For All Users
            </h3>
            <p className="text-ansar-gray leading-relaxed mb-4">
              All users of the Ansar Family platform agree to:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2 mb-6">
              <li>Treat all community members with respect, kindness, and dignity</li>
              <li>Maintain confidentiality of personal information shared within the community</li>
              <li>Communicate honestly and in good faith</li>
              <li>Report any concerns or inappropriate behavior to Ansar Family administration</li>
              <li>Not use the platform for any unlawful or harmful purposes</li>
              <li>Not harass, intimidate, or discriminate against any other user</li>
              <li>Provide accurate contact information and keep it updated</li>
              <li>Consent to receive SMS and email communications for service-related purposes</li>
            </ul>

            <h3 className="font-display text-xl text-ansar-charcoal mb-3">
              For Ansars (Volunteers)
            </h3>
            <p className="text-ansar-gray leading-relaxed mb-4">
              As an Ansar volunteer, you additionally agree to:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2 mb-6">
              <li>Complete any required training or orientation programs</li>
              <li>Maintain regular communication with your assigned Seeker as agreed</li>
              <li>Respect boundaries and never pressure or coerce Seekers</li>
              <li>Refer Seekers to professional resources when needs exceed your expertise</li>
              <li>Notify your Partner Hub if you need to step back from your commitment</li>
              <li>Never solicit money, gifts, or personal favors from Seekers</li>
              <li>Attend monthly gatherings and Jumu&apos;ah prayers as part of your community presence</li>
              <li>Flag any Seekers who may need additional support to your Partner Hub</li>
            </ul>

            <h3 className="font-display text-xl text-ansar-charcoal mb-3">
              For Partner Hubs
            </h3>
            <p className="text-ansar-gray leading-relaxed mb-4">
              As a Partner Hub organization, you agree to:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2">
              <li>Designate a responsible Partner Lead to manage your hub</li>
              <li>Properly vet and support Ansar volunteers in your community</li>
              <li>Host at least one monthly gathering for your community</li>
              <li>Maintain accurate records and use the dashboard responsibly</li>
              <li>Respond promptly to any concerns raised by Seekers or Ansars</li>
              <li>Uphold the values and mission of the Ansar Family network</li>
              <li>Provide clear information about Jumu&apos;ah times and monthly gathering schedules</li>
              <li>Use the community overview tools to engage with Seekers and Ansars</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Code of Conduct
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              The Ansar Family community is built on principles of compassion, respect, and support. 
              The following behaviors are strictly prohibited:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2">
              <li>Any form of harassment, abuse, or intimidation</li>
              <li>Discrimination based on race, ethnicity, nationality, or background</li>
              <li>Proselytizing specific madhabs, sects, or ideological positions aggressively</li>
              <li>Sharing private conversations or information without consent</li>
              <li>Romantic or inappropriate personal advances</li>
              <li>Financial exploitation or solicitation</li>
              <li>Providing professional advice (legal, medical, psychological) without proper credentials</li>
              <li>Any illegal activity</li>
              <li>Spamming or sending unsolicited communications</li>
              <li>Impersonating Ansar Family staff or other users</li>
            </ul>
            <p className="text-ansar-gray leading-relaxed mt-4">
              Violations of this Code of Conduct may result in immediate removal from the platform.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Communications and Notifications
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              By using our platform, you consent to receive:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2 mb-4">
              <li><strong>Welcome Messages:</strong> SMS and email notifications when you join our platform</li>
              <li><strong>Pairing Notifications:</strong> SMS and email alerts when you&apos;re connected with an Ansar or community</li>
              <li><strong>Service Updates:</strong> Important information about your participation in our programs</li>
              <li><strong>Community Updates:</strong> Information about gatherings, events, and resources</li>
            </ul>
            <p className="text-ansar-gray leading-relaxed mb-4">
              <strong>Opt-Out:</strong> You can opt out of SMS communications by replying &quot;STOP&quot; to any SMS 
              message. You can opt out of email communications by clicking the unsubscribe link or 
              contacting us. However, some service-related communications may be necessary for platform 
              functionality and cannot be opted out of.
            </p>
            <p className="text-ansar-gray leading-relaxed">
              <strong>Message Frequency:</strong> Message frequency varies based on your participation level. 
              Standard messaging rates may apply. Contact your carrier for details.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Disclaimer of Warranties
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              THE ANSAR FAMILY PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES 
              OF ANY KIND, EXPRESS OR IMPLIED. We do not guarantee:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2">
              <li>The availability or quality of matches between Seekers and Ansars</li>
              <li>The accuracy, reliability, or completeness of any information provided by users</li>
              <li>That the platform will be uninterrupted, secure, or error-free</li>
              <li>The conduct or qualifications of any Ansar volunteer</li>
              <li>Any specific outcomes from participation in our programs</li>
              <li>The delivery of SMS or email messages (subject to carrier and service provider limitations)</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Limitation of Liability
            </h2>
            <p className="text-ansar-gray leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ANSAR FAMILY AND ITS OFFICERS, DIRECTORS, 
              EMPLOYEES, AND VOLUNTEERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
              CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM OR ANY 
              INTERACTIONS WITH OTHER USERS. This includes, but is not limited to, damages for 
              personal injury, emotional distress, loss of data, or failure to receive communications.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Indemnification
            </h2>
            <p className="text-ansar-gray leading-relaxed">
              You agree to indemnify and hold harmless Ansar Family and its officers, directors, 
              employees, and volunteers from any claims, damages, losses, or expenses (including 
              reasonable attorneys&apos; fees) arising from your use of the platform, your violation 
              of these Terms, or your violation of any rights of another person or entity.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Intellectual Property
            </h2>
            <p className="text-ansar-gray leading-relaxed">
              The Ansar Family name, logo, and all related trademarks, service marks, and content 
              on the platform are the property of Ansar Family or its licensors. You may not use, 
              copy, or distribute any of our intellectual property without prior written consent.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Account Termination
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              We reserve the right to suspend or terminate your account at any time for:
            </p>
            <ul className="list-disc pl-6 text-ansar-gray space-y-2">
              <li>Violation of these Terms or the Code of Conduct</li>
              <li>Behavior that poses a risk to other users or the community</li>
              <li>Providing false or misleading information</li>
              <li>Extended inactivity</li>
              <li>Abuse of the communication systems (SMS/email)</li>
              <li>Any other reason we deem necessary to protect the community</li>
            </ul>
            <p className="text-ansar-gray leading-relaxed mt-4">
              You may also request to close your account at any time by contacting us. Upon termination, 
              we will delete your account information in accordance with our Privacy Policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Changes to These Terms
            </h2>
            <p className="text-ansar-gray leading-relaxed">
              We may modify these Terms at any time. We will notify you of material changes by 
              posting a notice on the platform, sending you an email, or via SMS notification. Your 
              continued use of the platform after such changes constitutes your acceptance of the 
              new Terms. If you do not agree to the modified Terms, you must stop using the platform.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Governing Law
            </h2>
            <p className="text-ansar-gray leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the 
              United States, without regard to its conflict of law provisions. Any disputes arising 
              from these Terms or your use of the platform shall be resolved in the courts of the 
              United States.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Severability
            </h2>
            <p className="text-ansar-gray leading-relaxed">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining 
              provisions shall continue in full force and effect. The invalid provision shall be 
              replaced with a valid provision that most closely reflects the intent of the original provision.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ansar-charcoal mb-4">
              Contact Us
            </h2>
            <p className="text-ansar-gray leading-relaxed mb-4">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <div className="mt-4 p-6 bg-ansar-sage-50 rounded-lg">
              <p className="text-ansar-charcoal font-medium mb-2">Ansar Family</p>
              <p className="text-ansar-gray mb-1">
                Email:{" "}
                <a href="mailto:legal@ansarfamily.org" className="text-ansar-sage-600 hover:underline">
                  legal@ansarfamily.org
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
              className="font-body text-sm text-ansar-gray hover:text-ansar-charcoal transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="font-body text-sm text-ansar-charcoal font-medium"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
