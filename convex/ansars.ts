import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * ANSARS — Convex API Functions
 * Manages Ansar volunteer applications and data.
 * 
 * Updated to:
 * - Auto-create user accounts for ansars
 * - Trigger welcome SMS and Email on submission
 * - Link user accounts to ansar applications
 */

// ═══════════════════════════════════════════════════════════════
// HELPER — Extract first name from full name
// ═══════════════════════════════════════════════════════════════
function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] || fullName;
}

// ═══════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Creates a new Ansar volunteer application.
 */
export const create = mutation({
  args: {
    fullName: v.string(),
    gender: v.union(v.literal("male"), v.literal("female")),
    dateOfBirth: v.optional(v.string()),
    phone: v.string(),
    email: v.string(),
    address: v.string(),
    city: v.string(),
    stateRegion: v.optional(v.string()),
    isConvert: v.boolean(),
    practiceLevel: v.union(
      v.literal("consistent"),
      v.literal("steady"),
      v.literal("reconnecting")
    ),
    knowledgeBackground: v.array(v.string()),
    studyDetails: v.optional(v.string()),
    experience: v.array(v.string()),
    supportAreas: v.array(v.string()),
    checkInFrequency: v.union(
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly")
    ),
    motivation: v.string(),
    agreementsAccepted: v.boolean(),
    organizationId: v.optional(v.id("organizations")),

    // Clerk user ID — provided by the API route after Clerk account creation
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate agreements
    if (!args.agreementsAccepted) {
      throw new Error("All agreements must be accepted to submit an Ansar application.");
    }

    const email = args.email.toLowerCase();

    const ansarId = await ctx.db.insert("ansars", {
      fullName: args.fullName,
      gender: args.gender,
      dateOfBirth: args.dateOfBirth ?? "",
      phone: args.phone,
      email,
      address: args.address,
      city: args.city,
      stateRegion: args.stateRegion,
      isConvert: args.isConvert,
      practiceLevel: args.practiceLevel,
      knowledgeBackground: args.knowledgeBackground,
      studyDetails: args.studyDetails,
      experience: args.experience,
      supportAreas: args.supportAreas,
      checkInFrequency: args.checkInFrequency,
      motivation: args.motivation,
      agreementsAccepted: args.agreementsAccepted,
      organizationId: args.organizationId,
      status: "pending",
    });

    // ═══════════════════════════════════════════════════════════
    // CREATE USER ACCOUNT (inline)
    // Uses real Clerk ID if provided, falls back to pending_ for backward compat
    // ═══════════════════════════════════════════════════════════

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      // Always update clerkId if we have a real one — handles both pending
      // users and users who signed in via a different auth method (e.g. Google OAuth)
      if (args.clerkId && args.clerkId !== existingUser.clerkId) {
        await ctx.db.patch(existingUser._id, { clerkId: args.clerkId });
      }
      console.log(`✅ User ${existingUser._id} already exists for ansar ${ansarId}`);
    } else {
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId || `pending_${email}`,
        email,
        name: args.fullName,
        role: "ansar",
        organizationId: args.organizationId,
        isActive: false, // Inactive until approved by Hub Admin
      });
      console.log(`✅ Created user account ${userId} for ansar ${args.fullName}`);
    }
    
    // ═══════════════════════════════════════════════════════════
    // TRIGGER WELCOME NOTIFICATIONS
    // Wrapped in try-catch so notification failures never prevent
    // the ansar record from being saved.
    // ═══════════════════════════════════════════════════════════
    
    const firstName = getFirstName(args.fullName);
    
    try {
      await ctx.scheduler.runAfter(0, internal.notifications.sendWelcomeSMS, {
        recipientId: ansarId.toString(),
        phone: args.phone,
        firstName,
        template: "welcome_ansar" as const,
      });
    } catch (e) {
      console.error("⚠️ Failed to schedule welcome SMS:", e);
    }
    
    try {
      await ctx.scheduler.runAfter(0, internal.notifications.sendWelcomeEmail, {
        recipientId: ansarId.toString(),
        email,
        firstName,
        fullName: args.fullName,
        template: "welcome_ansar" as const,
      });
    } catch (e) {
      console.error("⚠️ Failed to schedule welcome email:", e);
    }
    
    console.log(`✅ Ansar ${ansarId} created for ${args.fullName} (${email})`);
    return ansarId;
  },
});

/**
 * Updates the status of an Ansar application.
 * When approved, activates the ansar's user account.
 */
export const updateStatus = mutation({
  args: {
    id: v.id("ansars"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("active"),
      v.literal("inactive")
    ),
  },
  handler: async (ctx, args) => {
    const { id, status } = args;
    const ansar = await ctx.db.get(id);

    if (!ansar) {
      throw new Error("Ansar application not found.");
    }

    await ctx.db.patch(id, { status });

    // If approved, activate the ansar's user account and send notification
    if (status === "approved" || status === "active") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", ansar.email))
        .first();

      if (user) {
        await ctx.db.patch(user._id, {
          isActive: true,
        });
        console.log(`✅ Activated user account ${user._id} for ansar ${ansar.fullName}`);
      }

      // Send approval notification email + SMS
      const firstName = getFirstName(ansar.fullName);
      try {
        await ctx.scheduler.runAfter(0, internal.notifications.sendApprovalNotification, {
          recipientId: args.id.toString(),
          email: ansar.email,
          phone: ansar.phone,
          firstName,
          role: "ansar" as const,
        });
      } catch (e) {
        console.error("⚠️ Failed to schedule approval notification:", e);
      }
    }
  },
});

// ═══════════════════════════════════════════════════════════════
// UPDATE — Edit ansar profile fields
// ═══════════════════════════════════════════════════════════════
export const update = mutation({
  args: {
    id: v.id("ansars"),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    dateOfBirth: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    stateRegion: v.optional(v.string()),
    isConvert: v.optional(v.boolean()),
    practiceLevel: v.optional(v.union(
      v.literal("consistent"),
      v.literal("steady"),
      v.literal("reconnecting")
    )),
    knowledgeBackground: v.optional(v.array(v.string())),
    studyDetails: v.optional(v.string()),
    experience: v.optional(v.array(v.string())),
    supportAreas: v.optional(v.array(v.string())),
    checkInFrequency: v.optional(v.union(
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly")
    )),
    motivation: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const ansar = await ctx.db.get(id);
    if (!ansar) throw new Error("Ansar not found.");

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
// QUERIES
// ═══════════════════════════════════════════════════════════════

/**
 * Lists all Ansar applications.
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("ansars").collect();
  },
});

/**
 * Lists Ansar applications by status.
 */
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("active"),
      v.literal("inactive")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ansars")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

/**
 * Gets a single Ansar application by ID.
 */
export const getById = query({
  args: { id: v.id("ansars") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Gets an Ansar record by email (for Ansar dashboard lookup).
 */
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ansars")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
  },
});

// ═══════════════════════════════════════════════════════════════
// ORGANIZATION-SCOPED QUERIES (Partner Lead Access)
// ═══════════════════════════════════════════════════════════════

/**
 * Lists Ansars for a specific organization (Partner Lead view).
 */
export const listByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ansars")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .collect();
  },
});

/**
 * Lists Ansars available for pairing in an organization.
 * Includes both "approved" (never paired) and "active" (already paired but
 * can mentor additional seekers) Ansars.
 */
export const listAvailableForPairing = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ansars")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "approved"),
          q.eq(q.field("status"), "active")
        )
      )
      .collect();
  },
});

/**
 * Assigns an Ansar to an organization.
 */
export const assignToOrganization = mutation({
  args: {
    id: v.id("ansars"),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      organizationId: args.organizationId,
    });
  },
});

/**
 * Deletes an Ansar record.
 */
export const deleteAnsar = mutation({
  args: { id: v.id("ansars") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ═══════════════════════════════════════════════════════════════
// INTERNAL MUTATIONS — Account Creation
// ═══════════════════════════════════════════════════════════════

/**
 * Creates a user account for an ansar (internal only).
 * This is triggered automatically after ansar application submission.
 * Account will have limited access until application is approved by Hub Admin.
 */
export const createAnsarAccount = internalMutation({
  args: {
    ansarId: v.id("ansars"),
    fullName: v.string(),
    email: v.string(),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      console.log(`✅ User ${existingUser._id} already exists for ansar ${args.ansarId}`);
      return existingUser._id;
    }

    // Create new user account with ansar role
    // Note: Account is created but inactive until approved
    const userId = await ctx.db.insert("users", {
      clerkId: `pending_${args.email}`, // Temporary until Clerk webhook updates it
      email: args.email,
      name: args.fullName,
      role: "ansar",
      organizationId: args.organizationId,
      isActive: false, // Inactive until approved by Hub Admin
    });

    console.log(`✅ Created user account ${userId} for ansar ${args.fullName}`);
    return userId;
  },
});
