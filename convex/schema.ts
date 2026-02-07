import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * ANSAR FAMILY — Database Schema
 * Complete System with Auth, Pairings, and Role-Based Access
 * 
 * Tables:
 * - users: Authenticated users with roles
 * - intakes: Seeker submissions
 * - ansars: Volunteer applications
 * - partners: Community Hub applications
 * - organizations: Active Partner Hubs
 * - pairings: Seeker ↔ Ansar connections
 * - messages: Notification audit log (SMS & Email)
 * - contacts: CRM contacts for community members
 */

export default defineSchema({
  // ═══════════════════════════════════════════════════════════════
  // USERS — Authenticated users with roles
  // ═══════════════════════════════════════════════════════════════
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("super_admin"),    // Full access to everything
      v.literal("partner_lead"),   // Access to their organization only
      v.literal("ansar"),          // Future: Ansar self-service
      v.literal("seeker")          // Future: Seeker self-service
    ),
    organizationId: v.optional(v.union(v.id("organizations"), v.null())), // For partner_leads
    isActive: v.boolean(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_organization", ["organizationId"]),

  // ═══════════════════════════════════════════════════════════════
  // INTAKES — Seeker submissions awaiting connection
  // ═══════════════════════════════════════════════════════════════
  intakes: defineTable({
    // Personal Details
    fullName: v.string(),
    phone: v.string(),
    email: v.string(),
    gender: v.union(v.literal("male"), v.literal("female")),
    dateOfBirth: v.optional(v.string()),
    countryOfOrigin: v.optional(v.string()),

    // Journey
    journeyType: v.union(
      v.literal("new_muslim"),
      v.literal("reconnecting"),
      v.literal("seeker")
    ),

    // Location
    address: v.optional(v.string()),
    city: v.string(),
    stateRegion: v.optional(v.string()),

    // Support Areas
    supportAreas: v.array(v.string()),
    otherDetails: v.optional(v.string()),

    // Consent
    consentGiven: v.boolean(),

    // System Fields
    status: v.union(
      v.literal("awaiting_outreach"), // Submitted, awaiting initial contact
      v.literal("triaged"),           // Assigned to a partner
      v.literal("connected"),         // Paired with an Ansar
      v.literal("active")             // Engaged in the program
    ),
    userId: v.optional(v.id("users")), // Link to user account
    organizationId: v.optional(v.id("organizations")), // Which org owns this seeker
    source: v.union(v.literal("general"), v.literal("partner_specific")),
    partnerId: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .index("by_city", ["city"])
    .index("by_organization", ["organizationId"]),

  // ═══════════════════════════════════════════════════════════════
  // ANSARS — Volunteer applications
  // ═══════════════════════════════════════════════════════════════
  ansars: defineTable({
    // About You
    fullName: v.string(),
    gender: v.union(v.literal("male"), v.literal("female")),
    dateOfBirth: v.optional(v.string()),
    phone: v.string(),
    email: v.string(),
    address: v.string(),
    city: v.string(),
    stateRegion: v.optional(v.string()),
    isConvert: v.boolean(),

    // Islamic Practice & Knowledge
    practiceLevel: v.union(
      v.literal("consistent"),
      v.literal("steady"),
      v.literal("reconnecting")
    ),
    knowledgeBackground: v.array(v.string()),
    studyDetails: v.optional(v.string()),

    // Experience & Skills
    experience: v.array(v.string()),
    supportAreas: v.array(v.string()),

    // Commitment
    checkInFrequency: v.union(
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly")
    ),
    motivation: v.string(),
    agreementsAccepted: v.boolean(),

    // System Fields
    status: v.union(
      v.literal("pending"),   // Awaiting approval
      v.literal("approved"),  // Approved, awaiting pairing
      v.literal("active"),    // Paired with a seeker
      v.literal("inactive")   // Not currently active
    ),
    organizationId: v.optional(v.id("organizations")), // Which org this ansar belongs to
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .index("by_city", ["city"])
    .index("by_organization", ["organizationId"]),

  // ═══════════════════════════════════════════════════════════════
  // PAIRINGS — Seeker ↔ Ansar connections
  // ═══════════════════════════════════════════════════════════════
  pairings: defineTable({
    seekerId: v.id("intakes"),
    ansarId: v.id("ansars"),
    organizationId: v.id("organizations"),

    status: v.union(
      v.literal("pending_intro"),  // Awaiting 3-way intro text
      v.literal("active"),         // Active pairing
      v.literal("completed"),      // 90-day journey complete
      v.literal("paused"),         // Temporarily paused
      v.literal("ended")           // Ended early
    ),

    // Tracking
    pairedAt: v.number(), // Timestamp
    pairedBy: v.optional(v.id("users")), // Partner Lead who made the pairing

    // Notes
    notes: v.optional(v.string()),
    endReason: v.optional(v.string()),
  })
    .index("by_seeker", ["seekerId"])
    .index("by_ansar", ["ansarId"])
    .index("by_organization", ["organizationId"])
    .index("by_status", ["status"]),

  // ═══════════════════════════════════════════════════════════════
  // PARTNERS — Community Hub Applications
  // ═══════════════════════════════════════════════════════════════
  partners: defineTable({
    // Partner Lead Info
    leadName: v.string(),
    leadPhone: v.string(),
    leadEmail: v.string(),
    leadIsConvert: v.boolean(),

    // Organization Identity
    orgName: v.string(),
    orgType: v.union(
      v.literal("masjid"),
      v.literal("msa"),
      v.literal("nonprofit"),
      v.literal("informal_circle"),
      v.literal("other")
    ),
    orgTypeOther: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    stateRegion: v.optional(v.string()),
    genderFocus: v.union(
      v.literal("brothers"),
      v.literal("sisters"),
      v.literal("both")
    ),

    // Infrastructure Responses
    infrastructure: v.object({
      hasWeeklyProgramming: v.boolean(),
      canHostNewMuslimSessions: v.boolean(),
      hasImamAccess: v.boolean(),
      hasExistingNewMuslimProgram: v.boolean(),
      wantsDinnerKit: v.boolean(),
      hasPhysicalSpace: v.boolean(),
    }),

    // Calculated Hub Level (1-5)
    hubLevel: v.number(),

    // Core Trio
    coreTrio: v.object({
      imamName: v.optional(v.string()),
      imamPhone: v.optional(v.string()),
      imamEmail: v.optional(v.string()),
      secondName: v.optional(v.string()),
      secondPhone: v.optional(v.string()),
      secondEmail: v.optional(v.string()),
    }),

    // Agreements
    agreementsAccepted: v.boolean(),

    // System Fields
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("active"),
      v.literal("inactive"),
      v.literal("rejected")
    ),
    organizationId: v.optional(v.id("organizations")),
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_email", ["leadEmail"])
    .index("by_city", ["city"]),

  // ═══════════════════════════════════════════════════════════════
  // ORGANIZATIONS — Active Partner Hubs
  // ═══════════════════════════════════════════════════════════════
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    type: v.union(
      v.literal("masjid"),
      v.literal("msa"),
      v.literal("nonprofit"),
      v.literal("informal_circle"),
      v.literal("other")
    ),
    city: v.string(),
    stateRegion: v.optional(v.string()),
    hubLevel: v.number(),
    isActive: v.boolean(),
    partnerApplicationId: v.optional(v.id("partners")),
  })
    .index("by_slug", ["slug"])
    .index("by_city", ["city"]),

  // ═══════════════════════════════════════════════════════════════
  // MESSAGES — Notification audit log (SMS & Email)
  // ═══════════════════════════════════════════════════════════════
  messages: defineTable({
    // What type of message
    type: v.union(v.literal("sms"), v.literal("email")),
    
    // Who received it
    recipientId: v.string(), // Can be intake, ansar, or partner ID
    recipientPhone: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    
    // What was sent
    template: v.string(), // e.g., "welcome_seeker", "welcome_ansar", "pairing"
    subject: v.optional(v.string()), // For emails
    
    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
    
    // External IDs for debugging
    externalId: v.optional(v.string()), // Twilio SID or Resend ID
    
    // Timestamps
    sentAt: v.number(),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_template", ["template"]),

  // ═══════════════════════════════════════════════════════════════
  // CONTACTS — CRM contacts for community members
  // ═══════════════════════════════════════════════════════════════
  contacts: defineTable({
    // Personal Details
    fullName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),

    // Role/Type
    role: v.union(
      v.literal("imam"),
      v.literal("donor"),
      v.literal("community_member"),
      v.literal("family_member"),
      v.literal("scholar"),
      v.literal("volunteer"),
      v.literal("other")
    ),
    roleOther: v.optional(v.string()), // For when role is "other"

    // Location
    city: v.optional(v.string()),
    stateRegion: v.optional(v.string()),
    address: v.optional(v.string()),

    // Organization Scoping
    organizationId: v.optional(v.id("organizations")), // Which org owns this contact

    // Additional Info
    tags: v.array(v.string()), // Freeform labels like "speaks Arabic", "available weekends"
    notes: v.optional(v.string()),

    // System Fields
    status: v.union(
      v.literal("active"),
      v.literal("inactive")
    ),
  })
    .index("by_organization", ["organizationId"])
    .index("by_status", ["status"])
    .index("by_role", ["role"])
    .index("by_email", ["email"]),
});
