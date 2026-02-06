import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * ANSARS — Convex API Functions
 * Manages Ansar volunteer applications and data.
 * 
 * Updated to trigger welcome SMS and Email on submission.
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
  },
  handler: async (ctx, args) => {
    // Validate agreements
    if (!args.agreementsAccepted) {
      throw new Error("All agreements must be accepted to submit an Ansar application.");
    }

    const ansarId = await ctx.db.insert("ansars", {
      fullName: args.fullName,
      gender: args.gender,
      dateOfBirth: args.dateOfBirth ?? "",
      phone: args.phone,
      email: args.email,
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
    // TRIGGER WELCOME NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════
    
    const firstName = getFirstName(args.fullName);
    
    // Send Welcome SMS
    await ctx.scheduler.runAfter(0, internal.notifications.sendWelcomeSMS, {
      recipientId: ansarId.toString(),
      phone: args.phone,
      firstName,
      template: "welcome_ansar" as const,
    });
    
    // Send Welcome Email
    await ctx.scheduler.runAfter(0, internal.notifications.sendWelcomeEmail, {
      recipientId: ansarId.toString(),
      email: args.email,
      firstName,
      fullName: args.fullName,
      template: "welcome_ansar" as const,
    });
    
    return ansarId;
  },
});

/**
 * Updates the status of an Ansar application.
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
 * Lists approved Ansars available for pairing in an organization.
 */
export const listAvailableForPairing = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ansars")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "approved"))
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
