"use node";

import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * NOTIFICATIONS — SMS & Email Actions
 * 
 * Ansar Family notification system using Twilio (SMS) and Resend (Email).
 * All templates are inline with brand colors:
 * - Sage: #7D8B6A (primary)
 * - Terracotta: #B87D6E (Ansar accent)
 * - Ochre: #A8956A (Partner accent)
 * - Cream: #F8F6F1 (background)
 * - Charcoal: #3D3D3D (text)
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type JourneyType = "new_muslim" | "reconnecting" | "seeker";

// ═══════════════════════════════════════════════════════════════
// HELPER — Extract first name
// ═══════════════════════════════════════════════════════════════

function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] || fullName;
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

/**
 * Normalizes phone number to E.164 format required by Twilio
 * Examples:
 *   "(555) 123-4567" → "+15551234567"
 *   "555-123-4567" → "+15551234567"
 *   "5551234567" → "+15551234567"
 *   "+15551234567" → "+15551234567" (already correct)
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If doesn't start with +, assume US number
  if (!cleaned.startsWith('+')) {
    // Remove leading 1 if present (US country code)
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      cleaned = cleaned.substring(1);
    }
    // Add +1 for US numbers
    cleaned = '+1' + cleaned;
  }
  
  // Validate length (US numbers should be +1 + 10 digits = 12 chars)
  if (cleaned.startsWith('+1') && cleaned.length !== 12) {
    throw new Error(`Invalid US phone number length: ${phone} (normalized: ${cleaned})`);
  }
  
  return cleaned;
}

// ═══════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════

/**
 * Base email wrapper with Ansar Family branding
 */
function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ansar Family</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #F8F6F1; color: #3D3D3D;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-family: Georgia, 'Times New Roman', serif; color: #7D8B6A; font-size: 28px; font-weight: 500; margin: 0 0 8px 0;">Ansar Family</h1>
      <p style="color: #8A8A85; font-size: 13px; margin: 0; letter-spacing: 0.5px;">Every Heart Rooted</p>
    </div>
    
    <!-- Main Card -->
    <div style="background: #FFFFFF; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(61,61,61,0.04);">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px;">
      <p style="font-size: 14px; color: #5A5A5A; margin: 0 0 8px 0;">
        With love and du'a,<br>
        <strong style="color: #7D8B6A;">The Ansar Family Team</strong>
      </p>
      <p style="font-size: 12px; color: #8A8A85; margin: 16px 0 0 0;">
        <a href="https://ansar.family" style="color: #8A8A85; text-decoration: none;">ansar.family</a>
      </p>
    </div>
    
  </div>
</body>
</html>
  `.trim();
}

/**
 * Welcome Email — Seeker/New Muslim
 */
function getWelcomeSeekerEmail(
  firstName: string,
  journeyType: JourneyType
): { subject: string; html: string } {
  
  const greetings: Record<JourneyType, string> = {
    new_muslim: "Congratulations on beginning this beautiful journey. Taking your shahada is one of the most courageous steps a person can take, and we're honored you've reached out to join our family.",
    reconnecting: "Welcome back to the path. Reconnecting with your faith takes courage, and we're honored you've reached out to join our family.",
    seeker: "Thank you for taking this step. Exploring Islam is a meaningful journey, and we're honored you've reached out to learn more.",
  };

  const content = `
      <h2 style="font-family: Georgia, 'Times New Roman', serif; color: #3D3D3D; font-size: 24px; font-weight: 500; margin: 0 0 20px 0;">
        Assalamu Alaikum, ${firstName} 🌱
      </h2>
      
      <p style="font-size: 16px; line-height: 1.7; color: #5A5A5A; margin: 0 0 16px 0;">
        ${greetings[journeyType]}
      </p>
      
      <p style="font-size: 16px; line-height: 1.7; color: #5A5A5A; margin: 0 0 24px 0;">
        <strong style="color: #3D3D3D;">You're not alone on this path.</strong> Our mission is simple: to connect you with a local community of Muslims who will walk beside you.
      </p>
      
      <!-- What Happens Next Box -->
      <div style="background: #E8ECE4; border-radius: 8px; padding: 24px; margin: 0 0 24px 0;">
        <h3 style="font-family: Georgia, 'Times New Roman', serif; color: #6B7D5C; font-size: 18px; font-weight: 500; margin: 0 0 16px 0;">What Happens Next</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 12px 8px 0; vertical-align: top; width: 24px;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #7D8B6A; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">1</span>
            </td>
            <td style="padding: 8px 0; vertical-align: top;">
              <strong style="color: #3D3D3D;">Within 48 hours</strong><br>
              <span style="color: #5A5A5A; font-size: 14px;">A team member will reach out to hear your story and understand how we can best support you.</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px 8px 0; vertical-align: top;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #7D8B6A; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">2</span>
            </td>
            <td style="padding: 8px 0; vertical-align: top;">
              <strong style="color: #3D3D3D;">Local Connection</strong><br>
              <span style="color: #5A5A5A; font-size: 14px;">We'll introduce you to an Ansar (companion) in your area for coffee and conversation.</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px 8px 0; vertical-align: top;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #7D8B6A; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">3</span>
            </td>
            <td style="padding: 8px 0; vertical-align: top;">
              <strong style="color: #3D3D3D;">Community</strong><br>
              <span style="color: #5A5A5A; font-size: 14px;">You'll be invited to your local monthly gathering — a space to meet others and feel at home.</span>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <p style="font-size: 14px; color: #8A8A85; margin: 0 0 16px 0;">
          In the meantime, we've prepared a Digital Starter Kit just for you:
        </p>
        <a href="https://ansar.family/resources/new-muslim" 
           style="display: inline-block; background: #7D8B6A; color: white; padding: 14px 32px; 
                  border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
          View Your Starter Kit →
        </a>
      </div>
      
      <!-- Quote Block -->
      <div style="border-left: 3px solid #A8956A; padding-left: 16px; margin: 24px 0;">
        <p style="font-size: 14px; color: #5A5A5A; margin: 0; font-style: italic; line-height: 1.6;">
          "These resources are just to get your feet wet. True Islam is lived with people, not just watched. Real growth happens in community."
        </p>
      </div>
      
      <!-- Emergency Support -->
      <div style="background: #F5F0E4; border-radius: 8px; padding: 16px 20px; margin-top: 24px;">
        <p style="margin: 0; font-size: 14px; color: #5A5A5A;">
          <strong style="color: #3D3D3D;">Need immediate support?</strong><br>
          WhyIslam Hotline: <a href="tel:1-877-949-4752" style="color: #7D8B6A; text-decoration: none; font-weight: 600;">1-877-WHY-ISLAM</a>
        </p>
      </div>
  `;

  return {
    subject: `Welcome to the Family, ${firstName} 🌱`,
    html: emailWrapper(content),
  };
}

/**
 * Welcome Email — Ansar Volunteer
 */
function getWelcomeAnsarEmail(firstName: string): { subject: string; html: string } {
  const content = `
      <h2 style="font-family: Georgia, 'Times New Roman', serif; color: #3D3D3D; font-size: 24px; font-weight: 500; margin: 0 0 20px 0;">
        JazakAllahu Khair, ${firstName} 💚
      </h2>
      
      <p style="font-size: 16px; line-height: 1.7; color: #5A5A5A; margin: 0 0 16px 0;">
        Thank you for applying to become an Ansar. Your willingness to support new Muslims in their journey is a beautiful act of service.
      </p>
      
      <p style="font-size: 16px; line-height: 1.7; color: #5A5A5A; margin: 0 0 24px 0;">
        We've received your application and our team will review it shortly.
      </p>
      
      <!-- What to Expect Box -->
      <div style="background: #F5EAE6; border-radius: 8px; padding: 24px; margin: 0 0 24px 0;">
        <h3 style="font-family: Georgia, 'Times New Roman', serif; color: #8B5A4E; font-size: 18px; font-weight: 500; margin: 0 0 16px 0;">What to Expect</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 12px 8px 0; vertical-align: top; width: 24px;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #B87D6E; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">1</span>
            </td>
            <td style="padding: 8px 0; vertical-align: top;">
              <strong style="color: #3D3D3D;">Application Review</strong><br>
              <span style="color: #5A5A5A; font-size: 14px;">We'll review your application within 3-5 business days.</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px 8px 0; vertical-align: top;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #B87D6E; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">2</span>
            </td>
            <td style="padding: 8px 0; vertical-align: top;">
              <strong style="color: #3D3D3D;">Training Access</strong><br>
              <span style="color: #5A5A5A; font-size: 14px;">Once approved, you'll receive access to our 10-minute "Ansar Way" training.</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px 8px 0; vertical-align: top;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #B87D6E; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">3</span>
            </td>
            <td style="padding: 8px 0; vertical-align: top;">
              <strong style="color: #3D3D3D;">Community Integration</strong><br>
              <span style="color: #5A5A5A; font-size: 14px;">You'll be connected with your local Partner community and invited to monthly gatherings.</span>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Reminder Block -->
      <div style="border-left: 3px solid #7D8B6A; padding-left: 16px; margin: 24px 0;">
        <p style="font-size: 14px; color: #5A5A5A; margin: 0; line-height: 1.6;">
          <strong style="color: #3D3D3D;">Remember:</strong> Your main role as an Ansar is <em>presence</em> — showing up, being welcoming, and helping grow the community. One-on-one mentoring is occasional, not the default.
        </p>
      </div>
  `;

  return {
    subject: `Thank you for stepping up, ${firstName} 💚`,
    html: emailWrapper(content),
  };
}

/**
 * Welcome Email — Contact Added
 */
function getWelcomeContactEmail(
  firstName: string,
  role: string,
  communityName?: string
): { subject: string; html: string } {
  
  const roleGreetings: Record<string, string> = {
    imam: "Thank you for your leadership and guidance in the community. We're honored to have you as part of the Ansar Family network.",
    donor: "Your generosity helps us support new Muslims in their journey. Thank you for being part of the Ansar Family.",
    scholar: "Your knowledge and wisdom are invaluable to our community. Thank you for being part of the Ansar Family.",
    volunteer: "Thank you for your willingness to serve. Your support helps us build stronger communities for new Muslims.",
    community_member: "Welcome to the Ansar Family community! We're glad to have you connected with us.",
    family_member: "Thank you for being part of our extended family. Your support means everything to those on their journey.",
    other: "Thank you for being part of the Ansar Family community. We're glad to have you connected with us.",
  };

  const greeting = roleGreetings[role] || roleGreetings.other;
  const communityInfo = communityName ? `<p style="font-size: 16px; line-height: 1.7; color: #5A5A5A; margin: 0 0 16px 0;">You've been added to the <strong style="color: #3D3D3D;">${communityName}</strong> community network.</p>` : "";

  const content = `
      <h2 style="font-family: Georgia, 'Times New Roman', serif; color: #3D3D3D; font-size: 24px; font-weight: 500; margin: 0 0 20px 0;">
        Assalamu Alaikum, ${firstName} 🤝
      </h2>
      
      ${communityInfo}
      
      <p style="font-size: 16px; line-height: 1.7; color: #5A5A5A; margin: 0 0 24px 0;">
        ${greeting}
      </p>
      
      <!-- Mission Box -->
      <div style="background: #E8ECE4; border-radius: 8px; padding: 24px; margin: 0 0 24px 0;">
        <h3 style="font-family: Georgia, 'Times New Roman', serif; color: #6B7D5C; font-size: 18px; font-weight: 500; margin: 0 0 12px 0;">Our Mission</h3>
        <p style="font-size: 15px; line-height: 1.6; color: #5A5A5A; margin: 0;">
          Ansar Family connects new Muslims with local communities so no one walks this path alone. We're building a network of support across the country.
        </p>
      </div>
      
      <!-- Quote Block -->
      <div style="border-left: 3px solid #7D8B6A; padding-left: 16px; margin: 24px 0;">
        <p style="font-size: 14px; color: #5A5A5A; margin: 0; font-style: italic; line-height: 1.6;">
          "The believers are like a structure, each supporting the other." — Prophet Muhammad ﷺ
        </p>
      </div>
      
      <!-- Stay Connected -->
      <div style="background: #F5F0E4; border-radius: 8px; padding: 16px 20px; margin-top: 24px;">
        <p style="margin: 0; font-size: 14px; color: #5A5A5A;">
          <strong style="color: #3D3D3D;">Stay Connected:</strong><br>
          Visit <a href="https://ansar.family" style="color: #7D8B6A; text-decoration: none; font-weight: 600;">ansar.family</a> to learn more about our work.
        </p>
      </div>
  `;

  return {
    subject: `Welcome to Ansar Family, ${firstName} 🤝`,
    html: emailWrapper(content),
  };
}

/**
 * Welcome Email — Partner Application
 */
function getWelcomePartnerEmail(
  leadName: string,
  orgName: string,
  slug: string
): { subject: string; html: string } {
  const content = `
      <h2 style="font-family: Georgia, 'Times New Roman', serif; color: #3D3D3D; font-size: 24px; font-weight: 500; margin: 0 0 20px 0;">
        Assalamu Alaikum, ${leadName} 🏛️
      </h2>
      
      <p style="font-size: 16px; line-height: 1.7; color: #5A5A5A; margin: 0 0 16px 0;">
        Thank you for registering <strong style="color: #3D3D3D;">${orgName}</strong> as a Partner Hub with Ansar Family!
      </p>
      
      <p style="font-size: 16px; line-height: 1.7; color: #5A5A5A; margin: 0 0 24px 0;">
        Many people accept Islam in your area but don't know your community exists. We're here to put you on the map and help you support them.
      </p>
      
      <!-- What Happens Next Box -->
      <div style="background: #F5F0E4; border-radius: 8px; padding: 24px; margin: 0 0 24px 0;">
        <h3 style="font-family: Georgia, 'Times New Roman', serif; color: #736548; font-size: 18px; font-weight: 500; margin: 0 0 16px 0;">What Happens Next</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 12px 8px 0; vertical-align: top; width: 24px;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #A8956A; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">1</span>
            </td>
            <td style="padding: 8px 0; vertical-align: top;">
              <strong style="color: #3D3D3D;">Intro Call</strong><br>
              <span style="color: #5A5A5A; font-size: 14px;">We'll reach out within 3-5 days to schedule a brief 15-minute check-in to confirm your Core Trio is ready.</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px 8px 0; vertical-align: top;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #A8956A; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">2</span>
            </td>
            <td style="padding: 8px 0; vertical-align: top;">
              <strong style="color: #3D3D3D;">Dashboard Access</strong><br>
              <span style="color: #5A5A5A; font-size: 14px;">Once approved, you'll get access to your Partner Hub at <code style="background: #E8ECE4; padding: 2px 6px; border-radius: 4px; font-size: 13px;">ansar.family/${slug}</code></span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px 8px 0; vertical-align: top;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #A8956A; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">3</span>
            </td>
            <td style="padding: 8px 0; vertical-align: top;">
              <strong style="color: #3D3D3D;">Toolkit & Training</strong><br>
              <span style="color: #5A5A5A; font-size: 14px;">You'll receive resources for hosting gatherings, QR codes for your community, and Ansar training materials.</span>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- What We Provide -->
      <div style="border-left: 3px solid #7D8B6A; padding-left: 16px; margin: 24px 0;">
        <p style="font-size: 14px; color: #5A5A5A; margin: 0; line-height: 1.6;">
          <strong style="color: #3D3D3D;">What you get:</strong> Custom intake forms, community dashboard, event toolkit, and access to our global safety net — so if someone moves, they're never lost to the Ummah.
        </p>
      </div>
  `;

  return {
    subject: `Your Partner Application is In, ${orgName} 🏛️`,
    html: emailWrapper(content),
  };
}

/**
 * Pairing Notification Email — Seeker
 */
function getPairingSeekerEmail(
  seekerFirstName: string,
  ansarName: string,
  communityName: string,
  jumaTime?: string,
  monthlyGathering?: string
): { subject: string; html: string } {
  const ansarInitial = getInitial(ansarName);
  
  let communityInfo = "";
  if (jumaTime || monthlyGathering) {
    communityInfo = `
      <div style="background: #F5F0E4; border-radius: 8px; padding: 20px; margin-top: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #5A5A5A;">
          <strong style="color: #3D3D3D;">Your Local Community:</strong> ${communityName}
        </p>
        ${jumaTime ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #5A5A5A;"><strong style="color: #3D3D3D;">Juma Prayer:</strong> ${jumaTime}</p>` : ""}
        ${monthlyGathering ? `<p style="margin: 0; font-size: 14px; color: #5A5A5A;"><strong style="color: #3D3D3D;">Monthly Gathering:</strong> ${monthlyGathering}</p>` : ""}
      </div>
    `;
  }

  const content = `
      <h2 style="font-family: Georgia, 'Times New Roman', serif; color: #3D3D3D; font-size: 24px; font-weight: 500; margin: 0 0 20px 0;">
        Great News, ${seekerFirstName}! 🤝
      </h2>
      
      <p style="font-size: 16px; line-height: 1.7; color: #5A5A5A; margin: 0 0 24px 0;">
        You've been paired with an Ansar (companion) from your local community! They'll be reaching out soon to connect with you.
      </p>
      
      <!-- Ansar Card -->
      <div style="background: #E8ECE4; border-radius: 8px; padding: 24px; margin: 0 0 24px 0; text-align: center;">
        <div style="width: 64px; height: 64px; background: #7D8B6A; border-radius: 50%; margin: 0 auto 16px; line-height: 64px;">
          <span style="color: white; font-size: 24px; font-weight: bold;">${ansarInitial}</span>
        </div>
        <h3 style="font-family: Georgia, 'Times New Roman', serif; color: #3D3D3D; font-size: 20px; font-weight: 500; margin: 0 0 4px 0;">${ansarName}</h3>
        <p style="color: #5A5A5A; font-size: 14px; margin: 0;">Your Ansar at ${communityName}</p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.7; color: #5A5A5A; margin: 0 0 16px 0;">
        <strong style="color: #3D3D3D;">What to expect:</strong> Your Ansar will reach out via text or call to schedule a casual meetup — maybe coffee, a meal, or a walk. No pressure, just friendship.
      </p>
      
      ${communityInfo}
  `;

  return {
    subject: `Great news, ${seekerFirstName}! Meet your Ansar 🤝`,
    html: emailWrapper(content),
  };
}

// ═══════════════════════════════════════════════════════════════
// SMS TEMPLATES
// ═══════════════════════════════════════════════════════════════

function getWelcomeSeekerSMS(firstName: string): string {
  return `Assalamu Alaikum ${firstName}! Welcome to Ansar Family 🌱 We'll connect you to your local community within 48hrs. Your starter kit: ansar.family/resources/new-muslim\n\nReply STOP to opt out.`;
}

function getWelcomeAnsarSMS(firstName: string): string {
  return `JazakAllahu Khair ${firstName}! Your Ansar application is received 💚 We'll review it within 3-5 days. - Ansar Family\n\nReply STOP to opt out.`;
}

function getWelcomePartnerSMS(orgName: string): string {
  return `Assalamu Alaikum! ${orgName}'s Partner application is received 🏛️ We'll be in touch within 3-5 days to schedule an intro call. - Ansar Family`;
}

function getWelcomeContactSMS(firstName: string, role: string): string {
  const roleLabels: Record<string, string> = {
    imam: "Imam",
    donor: "Donor",
    scholar: "Scholar",
    volunteer: "Volunteer",
    community_member: "Community Member",
    family_member: "Family Member",
    other: "Community Contact",
  };
  const roleLabel = roleLabels[role] || "Community Contact";
  return `Assalamu Alaikum ${firstName}! You've been added to Ansar Family as a ${roleLabel} 🤝 We're honored to have you in our network. - Ansar Family\n\nReply STOP to opt out.`;
}

function getPairingSMS(firstName: string, ansarName: string, communityName: string): string {
  return `Great news ${firstName}! You've been paired with ${ansarName} from ${communityName}. They'll reach out soon to connect 🤝 - Ansar Family`;
}

// ═══════════════════════════════════════════════════════════════
// SMS ACTIONS (Twilio)
// ═══════════════════════════════════════════════════════════════

export const sendWelcomeSMS = internalAction({
  args: {
    recipientId: v.string(),
    phone: v.string(),
    firstName: v.string(),
    template: v.union(
      v.literal("welcome_seeker"),
      v.literal("welcome_ansar"),
      v.literal("welcome_partner")
    ),
    orgName: v.optional(v.string()), // For partner template
  },
  handler: async (ctx, args) => {
    const { recipientId, phone, firstName, template, orgName } = args;
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!accountSid || !authToken || !fromNumber) {
      console.error("❌ Missing Twilio environment variables");
      await ctx.runMutation(internal.messages.logMessage, {
        type: "sms",
        recipientId,
        recipientPhone: phone,
        template,
        status: "failed",
        errorMessage: "Missing Twilio configuration",
      });
      return { success: false, error: "Missing Twilio configuration" };
    }
    
    // Normalize phone number to E.164 format
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhoneNumber(phone);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid phone number format";
      console.error(`❌ Invalid phone number format: ${phone}`, errorMessage);
      await ctx.runMutation(internal.messages.logMessage, {
        type: "sms",
        recipientId,
        recipientPhone: phone,
        template,
        status: "failed",
        errorMessage: `Phone number normalization failed: ${errorMessage}`,
      });
      return { success: false, error: errorMessage };
    }
    
    // Select message based on template
    let message: string;
    switch (template) {
      case "welcome_seeker":
        message = getWelcomeSeekerSMS(firstName);
        break;
      case "welcome_ansar":
        message = getWelcomeAnsarSMS(firstName);
        break;
      case "welcome_partner":
        message = getWelcomePartnerSMS(orgName || firstName);
        break;
      default:
        message = getWelcomeSeekerSMS(firstName);
    }
    
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          },
          body: new URLSearchParams({
            To: normalizedPhone,
            From: fromNumber,
            Body: message,
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Twilio API error");
      }
      
      await ctx.runMutation(internal.messages.logMessage, {
        type: "sms",
        recipientId,
        recipientPhone: normalizedPhone,
        template,
        status: "sent",
        externalId: data.sid,
      });
      
      console.log(`✅ SMS sent to ${normalizedPhone} (original: ${phone}), SID: ${data.sid}`);
      return { success: true, sid: data.sid };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ SMS failed to ${normalizedPhone} (original: ${phone}):`, errorMessage);
      
      await ctx.runMutation(internal.messages.logMessage, {
        type: "sms",
        recipientId,
        recipientPhone: normalizedPhone,
        template,
        status: "failed",
        errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  },
});

export const sendPairingSMS = internalAction({
  args: {
    recipientId: v.string(),
    phone: v.string(),
    firstName: v.string(),
    ansarName: v.string(),
    communityName: v.string(),
  },
  handler: async (ctx, args) => {
    const { recipientId, phone, firstName, ansarName, communityName } = args;
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!accountSid || !authToken || !fromNumber) {
      console.error("❌ Missing Twilio environment variables");
      await ctx.runMutation(internal.messages.logMessage, {
        type: "sms",
        recipientId,
        recipientPhone: phone,
        template: "pairing",
        status: "failed",
        errorMessage: "Missing Twilio configuration",
      });
      return { success: false, error: "Missing Twilio configuration" };
    }
    
    // Normalize phone number to E.164 format
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhoneNumber(phone);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid phone number format";
      console.error(`❌ Invalid phone number format: ${phone}`, errorMessage);
      await ctx.runMutation(internal.messages.logMessage, {
        type: "sms",
        recipientId,
        recipientPhone: phone,
        template: "pairing",
        status: "failed",
        errorMessage: `Phone number normalization failed: ${errorMessage}`,
      });
      return { success: false, error: errorMessage };
    }
    
    const message = getPairingSMS(firstName, ansarName, communityName);
    
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          },
          body: new URLSearchParams({
            To: normalizedPhone,
            From: fromNumber,
            Body: message,
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Twilio API error");
      }
      
      await ctx.runMutation(internal.messages.logMessage, {
        type: "sms",
        recipientId,
        recipientPhone: normalizedPhone,
        template: "pairing",
        status: "sent",
        externalId: data.sid,
      });
      
      console.log(`✅ Pairing SMS sent to ${normalizedPhone} (original: ${phone}), SID: ${data.sid}`);
      return { success: true, sid: data.sid };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Pairing SMS failed to ${normalizedPhone} (original: ${phone}):`, errorMessage);
      
      await ctx.runMutation(internal.messages.logMessage, {
        type: "sms",
        recipientId,
        recipientPhone: normalizedPhone,
        template: "pairing",
        status: "failed",
        errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  },
});

// ═══════════════════════════════════════════════════════════════
// EMAIL ACTIONS (Resend)
// ═══════════════════════════════════════════════════════════════

export const sendWelcomeEmail = internalAction({
  args: {
    recipientId: v.string(),
    email: v.string(),
    firstName: v.string(),
    fullName: v.string(),
    template: v.union(
      v.literal("welcome_seeker"),
      v.literal("welcome_ansar"),
      v.literal("welcome_partner")
    ),
    journeyType: v.optional(v.union(
      v.literal("new_muslim"),
      v.literal("reconnecting"),
      v.literal("seeker")
    )),
    orgName: v.optional(v.string()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { recipientId, email, firstName, fullName, template, journeyType, orgName, slug } = args;
    
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.error("❌ Missing Resend API key");
      await ctx.runMutation(internal.messages.logMessage, {
        type: "email",
        recipientId,
        recipientEmail: email,
        template,
        status: "failed",
        errorMessage: "Missing Resend configuration",
      });
      return { success: false, error: "Missing Resend configuration" };
    }
    
    // Select email content based on template
    let emailContent: { subject: string; html: string };
    switch (template) {
      case "welcome_seeker":
        emailContent = getWelcomeSeekerEmail(firstName, journeyType || "seeker");
        break;
      case "welcome_ansar":
        emailContent = getWelcomeAnsarEmail(firstName);
        break;
      case "welcome_partner":
        emailContent = getWelcomePartnerEmail(firstName, orgName || fullName, slug || "partner");
        break;
      default:
        emailContent = getWelcomeSeekerEmail(firstName, "seeker");
    }
    
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "Ansar Family <welcome@ansar.family>",
          to: [email],
          subject: emailContent.subject,
          html: emailContent.html,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Resend API error");
      }
      
      await ctx.runMutation(internal.messages.logMessage, {
        type: "email",
        recipientId,
        recipientEmail: email,
        template,
        subject: emailContent.subject,
        status: "sent",
        externalId: data.id,
      });
      
      console.log(`✅ Email sent to ${email}, ID: ${data.id}`);
      return { success: true, id: data.id };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Email failed to ${email}:`, errorMessage);
      
      await ctx.runMutation(internal.messages.logMessage, {
        type: "email",
        recipientId,
        recipientEmail: email,
        template,
        subject: emailContent.subject,
        status: "failed",
        errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  },
});

export const sendPairingEmail = internalAction({
  args: {
    recipientId: v.string(),
    email: v.string(),
    seekerFirstName: v.string(),
    ansarName: v.string(),
    communityName: v.string(),
    jumaTime: v.optional(v.string()),
    monthlyGathering: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { recipientId, email, seekerFirstName, ansarName, communityName, jumaTime, monthlyGathering } = args;
    
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.error("❌ Missing Resend API key");
      await ctx.runMutation(internal.messages.logMessage, {
        type: "email",
        recipientId,
        recipientEmail: email,
        template: "pairing_seeker",
        status: "failed",
        errorMessage: "Missing Resend configuration",
      });
      return { success: false, error: "Missing Resend configuration" };
    }
    
    const emailContent = getPairingSeekerEmail(seekerFirstName, ansarName, communityName, jumaTime, monthlyGathering);
    
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "Ansar Family <welcome@ansar.family>",
          to: [email],
          subject: emailContent.subject,
          html: emailContent.html,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Resend API error");
      }
      
      await ctx.runMutation(internal.messages.logMessage, {
        type: "email",
        recipientId,
        recipientEmail: email,
        template: "pairing_seeker",
        subject: emailContent.subject,
        status: "sent",
        externalId: data.id,
      });
      
      console.log(`✅ Pairing email sent to ${email}, ID: ${data.id}`);
      return { success: true, id: data.id };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Pairing email failed to ${email}:`, errorMessage);
      
      await ctx.runMutation(internal.messages.logMessage, {
        type: "email",
        recipientId,
        recipientEmail: email,
        template: "pairing_seeker",
        subject: emailContent.subject,
        status: "failed",
        errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  },
});

// ═══════════════════════════════════════════════════════════════
// WRAPPER FUNCTIONS — For backward compatibility with existing code
// ═══════════════════════════════════════════════════════════════

/**
 * Sends welcome notifications to a Seeker (SMS + Email)
 * Wrapper function that calls both SMS and Email actions
 */
export const sendWelcomeSeeker = internalAction({
  args: {
    intakeId: v.id("intakes"),
    fullName: v.string(),
    phone: v.string(),
    email: v.string(),
    journeyType: v.union(
      v.literal("new_muslim"),
      v.literal("reconnecting"),
      v.literal("seeker")
    ),
  },
  handler: async (ctx, args) => {
    const firstName = getFirstName(args.fullName);
    const recipientId = args.intakeId.toString();

    // Send SMS
    try {
      await ctx.runAction(internal.notifications.sendWelcomeSMS, {
        recipientId,
        phone: args.phone,
        firstName,
        template: "welcome_seeker",
      });
    } catch (error) {
      console.error("Failed to send welcome SMS to seeker:", error);
      // Don't throw - continue with email
    }

    // Send Email
    try {
      await ctx.runAction(internal.notifications.sendWelcomeEmail, {
        recipientId,
        email: args.email,
        firstName,
        fullName: args.fullName,
        template: "welcome_seeker",
        journeyType: args.journeyType,
      });
    } catch (error) {
      console.error("Failed to send welcome email to seeker:", error);
      // Don't throw - notifications are best effort
    }
  },
});

/**
 * Sends welcome notifications to an Ansar (SMS + Email)
 */
export const sendWelcomeAnsar = internalAction({
  args: {
    ansarId: v.id("ansars"),
    fullName: v.string(),
    phone: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const firstName = getFirstName(args.fullName);
    const recipientId = args.ansarId.toString();

    // Send SMS
    try {
      await ctx.runAction(internal.notifications.sendWelcomeSMS, {
        recipientId,
        phone: args.phone,
        firstName,
        template: "welcome_ansar",
      });
    } catch (error) {
      console.error("Failed to send welcome SMS to ansar:", error);
    }

    // Send Email
    try {
      await ctx.runAction(internal.notifications.sendWelcomeEmail, {
        recipientId,
        email: args.email,
        firstName,
        fullName: args.fullName,
        template: "welcome_ansar",
      });
    } catch (error) {
      console.error("Failed to send welcome email to ansar:", error);
    }
  },
});

/**
 * Sends welcome notifications to a Partner (SMS + Email)
 */
export const sendWelcomePartner = internalAction({
  args: {
    partnerId: v.id("partners"),
    leadName: v.string(),
    leadPhone: v.string(),
    leadEmail: v.string(),
    orgName: v.string(),
  },
  handler: async (ctx, args) => {
    const firstName = getFirstName(args.leadName);
    const recipientId = args.partnerId.toString();

    // Get slug from organization if it exists
    // For now, generate a simple slug from org name
    const slug = args.orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Send SMS
    try {
      await ctx.runAction(internal.notifications.sendWelcomeSMS, {
        recipientId,
        phone: args.leadPhone,
        firstName,
        template: "welcome_partner",
        orgName: args.orgName,
      });
    } catch (error) {
      console.error("Failed to send welcome SMS to partner:", error);
    }

    // Send Email
    try {
      await ctx.runAction(internal.notifications.sendWelcomeEmail, {
        recipientId,
        email: args.leadEmail,
        firstName,
        fullName: args.leadName,
        template: "welcome_partner",
        orgName: args.orgName,
        slug,
      });
    } catch (error) {
      console.error("Failed to send welcome email to partner:", error);
    }
  },
});

/**
 * Sends welcome notifications to a Contact (SMS + Email)
 */
export const sendWelcomeContact = internalAction({
  args: {
    contactId: v.id("contacts"),
    fullName: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.string(),
    organizationName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const firstName = getFirstName(args.fullName);
    const recipientId = args.contactId.toString();

    // Send SMS (only if phone provided)
    if (args.phone) {
      try {
        await ctx.runAction(internal.notifications.sendWelcomeContactSMS, {
          recipientId,
          phone: args.phone,
          firstName,
          role: args.role,
        });
      } catch (error) {
        console.error("Failed to send welcome SMS to contact:", error);
      }
    }

    // Send Email (only if email provided)
    if (args.email) {
      try {
        await ctx.runAction(internal.notifications.sendWelcomeContactEmail, {
          recipientId,
          email: args.email,
          firstName,
          role: args.role,
          communityName: args.organizationName,
        });
      } catch (error) {
        console.error("Failed to send welcome email to contact:", error);
      }
    }
  },
});
