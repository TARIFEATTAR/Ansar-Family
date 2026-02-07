import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * INTAKES — Seeker submission operations
 * Handles New Muslim, Reconnecting, and Seeker intake forms.
 * 
 * Updated to:
 * - Auto-create Clerk accounts for seekers
 * - Trigger welcome SMS and Email on submission
 * - Link user accounts to intake records
 */

// ═══════════════════════════════════════════════════════════════
// HELPER — Extract first name from full name
// ═══════════════════════════════════════════════════════════════
function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] || fullName;
}

// ═══════════════════════════════════════════════════════════════
// CREATE INTAKE — Public form submission
// ═══════════════════════════════════════════════════════════════
export const create = mutation({
  args: {
    fullName: v.string(),
    phone: v.string(),
    email: v.string(),
    gender: v.union(v.literal("male"), v.literal("female")),
    dateOfBirth: v.optional(v.string()),
    countryOfOrigin: v.optional(v.string()),
    journeyType: v.union(
      v.literal("new_muslim"),
      v.literal("reconnecting"),
      v.literal("seeker")
    ),
    address: v.optional(v.string()),
    city: v.string(),
    stateRegion: v.optional(v.string()),
    supportAreas: v.array(v.string()),
    otherDetails: v.optional(v.string()),
    consentGiven: v.boolean(),
    source: v.optional(v.union(v.literal("general"), v.literal("partner_specific"))),
    partnerId: v.optional(v.string()),

    // Clerk user ID — provided by the API route after Clerk account creation
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();

    // Insert the intake with awaiting_outreach status
    const intakeId = await ctx.db.insert("intakes", {
      fullName: args.fullName,
      phone: args.phone,
      email,
      gender: args.gender,
      dateOfBirth: args.dateOfBirth ?? "",
      countryOfOrigin: args.countryOfOrigin ?? "",
      journeyType: args.journeyType,
      address: args.address ?? "",
      city: args.city,
      stateRegion: args.stateRegion,
      supportAreas: args.supportAreas,
      otherDetails: args.otherDetails,
      consentGiven: args.consentGiven,
      status: "awaiting_outreach",
      source: args.source ?? "general",
      partnerId: args.partnerId,
    });

    // ═══════════════════════════════════════════════════════════
    // CREATE USER ACCOUNT (inline)
    // Uses real Clerk ID if provided. Seekers are auto-approved (isActive: true).
    // ═══════════════════════════════════════════════════════════

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      if (args.clerkId && existingUser.clerkId.startsWith("pending_")) {
        await ctx.db.patch(existingUser._id, { clerkId: args.clerkId });
      }
      await ctx.db.patch(intakeId, { userId: existingUser._id });
      console.log(`✅ Linked existing user ${existingUser._id} to intake ${intakeId}`);
    } else {
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId || `pending_${email}`,
        email,
        name: args.fullName,
        role: "seeker",
        isActive: true, // Seekers are auto-approved
      });
      await ctx.db.patch(intakeId, { userId });
      console.log(`✅ Created user account ${userId} for seeker ${args.fullName}`);
    }
    
    // ═══════════════════════════════════════════════════════════
    // TRIGGER WELCOME NOTIFICATIONS
    // Wrapped in try-catch so notification failures never prevent
    // the intake record from being saved.
    // ═══════════════════════════════════════════════════════════
    
    const firstName = getFirstName(args.fullName);
    
    try {
      // Send Welcome SMS
      await ctx.scheduler.runAfter(0, internal.notifications.sendWelcomeSMS, {
        recipientId: intakeId.toString(),
        phone: args.phone,
        firstName,
        template: "welcome_seeker" as const,
      });
    } catch (e) {
      console.error("⚠️ Failed to schedule welcome SMS:", e);
    }
    
    try {
      // Send Welcome Email
      await ctx.scheduler.runAfter(0, internal.notifications.sendWelcomeEmail, {
        recipientId: intakeId.toString(),
        email,
        firstName,
        fullName: args.fullName,
        template: "welcome_seeker" as const,
        journeyType: args.journeyType,
      });
    } catch (e) {
      console.error("⚠️ Failed to schedule welcome email:", e);
    }
    
    console.log(`✅ Intake ${intakeId} created for ${args.fullName} (${email})`);
    return intakeId;
  },
});

// ═══════════════════════════════════════════════════════════════
// LIST AWAITING OUTREACH — Admin view of seekers awaiting contact
// ═══════════════════════════════════════════════════════════════
export const listAwaitingOutreach = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("intakes")
      .withIndex("by_status", (q) => q.eq("status", "awaiting_outreach"))
      .order("desc")
      .collect();
  },
});

// Deprecated: Use listAwaitingOutreach instead
export const listDisconnected = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("intakes")
      .withIndex("by_status", (q) => q.eq("status", "awaiting_outreach"))
      .order("desc")
      .collect();
  },
});

// ═══════════════════════════════════════════════════════════════
// LIST ALL — Admin view of all intakes
// ═══════════════════════════════════════════════════════════════
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("intakes").order("desc").collect();
  },
});

// ═══════════════════════════════════════════════════════════════
// UPDATE STATUS — Triage an intake
// ═══════════════════════════════════════════════════════════════
export const updateStatus = mutation({
  args: {
    id: v.id("intakes"),
    status: v.union(
      v.literal("awaiting_outreach"),
      v.literal("triaged"),
      v.literal("connected"),
      v.literal("active")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      notes: args.notes,
    });
  },
});

// ═══════════════════════════════════════════════════════════════
// UPDATE — Edit seeker profile fields
// ═══════════════════════════════════════════════════════════════
export const update = mutation({
  args: {
    id: v.id("intakes"),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    dateOfBirth: v.optional(v.string()),
    countryOfOrigin: v.optional(v.string()),
    journeyType: v.optional(v.union(
      v.literal("new_muslim"),
      v.literal("reconnecting"),
      v.literal("seeker")
    )),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    stateRegion: v.optional(v.string()),
    supportAreas: v.optional(v.array(v.string())),
    otherDetails: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const intake = await ctx.db.get(id);
    if (!intake) throw new Error("Seeker not found.");

    // Only patch defined fields
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(id, patch);
    }
  },
});

// ═══════════════════════════════════════════════════════════════
// GET BY ID — Single intake
// ═══════════════════════════════════════════════════════════════
export const getById = query({
  args: { id: v.id("intakes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ═══════════════════════════════════════════════════════════════
// GET BY EMAIL — Find a seeker's intake by email (for seeker portal)
// ═══════════════════════════════════════════════════════════════
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("intakes")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
  },
});

// ═══════════════════════════════════════════════════════════════
// DELETE — Remove an intake (Super Admin / Cleanup)
// ═══════════════════════════════════════════════════════════════
export const deleteIntake = mutation({
  args: { id: v.id("intakes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ═══════════════════════════════════════════════════════════════
// ORGANIZATION-SCOPED QUERIES (Partner Lead Access)
// ═══════════════════════════════════════════════════════════════

/**
 * Lists intakes for a specific organization (Partner Lead view).
 */
export const listByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("intakes")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .collect();
  },
});

/**
 * Lists unassigned seekers that can be claimed by any partner.
 * These are "awaiting_outreach" seekers from the general intake.
 */
export const listUnassigned = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("intakes")
      .withIndex("by_status", (q) => q.eq("status", "awaiting_outreach"))
      .filter((q) => q.eq(q.field("source"), "general"))
      .order("desc")
      .collect();
  },
});

/**
 * Lists seekers ready for pairing within an organization.
 */
export const listReadyForPairing = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("intakes")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "triaged"))
      .collect();
  },
});

/**
 * Assigns a seeker to an organization (for Partner Leads to claim floaters).
 */
export const assignToOrganization = mutation({
  args: {
    id: v.id("intakes"),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      organizationId: args.organizationId,
      status: "triaged",
    });
  },
});

// ═══════════════════════════════════════════════════════════════
// INTERNAL MUTATIONS — Account Creation
// ═══════════════════════════════════════════════════════════════

/**
 * Creates a Clerk user account for a seeker (internal only).
 * This is triggered automatically after intake submission.
 * Clerk will send the user a "set password" email.
 */
export const createSeekerAccount = internalMutation({
  args: {
    intakeId: v.id("intakes"),
    fullName: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Link existing user to intake
      await ctx.db.patch(args.intakeId, {
        userId: existingUser._id,
      });
      console.log(`✅ Linked existing user ${existingUser._id} to intake ${args.intakeId}`);
      return existingUser._id;
    }

    // Create new user account
    // Note: This creates the Convex user record. Clerk account creation
    // will happen via the Clerk webhook when they set their password.
    // For now, we'll use a temporary clerkId that will be updated by the webhook.
    const userId = await ctx.db.insert("users", {
      clerkId: `pending_${args.email}`, // Temporary until Clerk webhook updates it
      email: args.email,
      name: args.fullName,
      role: "seeker",
      isActive: true,
    });

    // Link user to intake
    await ctx.db.patch(args.intakeId, {
      userId,
    });

    console.log(`✅ Created user account ${userId} for seeker ${args.fullName}`);
    return userId;
  },
});
