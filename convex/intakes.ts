import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * INTAKES — Seeker submission operations
 * Handles New Muslim, Reconnecting, and Seeker intake forms.
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
  },
  handler: async (ctx, args) => {
    // Insert the intake
    const intakeId = await ctx.db.insert("intakes", {
      fullName: args.fullName,
      phone: args.phone,
      email: args.email,
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
      status: "disconnected",
      source: args.source ?? "general",
      partnerId: args.partnerId,
    });
    
    // ═══════════════════════════════════════════════════════════
    // TRIGGER WELCOME NOTIFICATIONS
    // Schedule immediately (0ms delay) to run after this mutation
    // ═══════════════════════════════════════════════════════════
    
    const firstName = getFirstName(args.fullName);
    
    // Send Welcome SMS
    await ctx.scheduler.runAfter(0, internal.notifications.sendWelcomeSMS, {
      recipientId: intakeId.toString(),
      phone: args.phone,
      firstName,
      template: "welcome_seeker" as const,
    });
    
    // Send Welcome Email
    await ctx.scheduler.runAfter(0, internal.notifications.sendWelcomeEmail, {
      recipientId: intakeId.toString(),
      email: args.email,
      firstName,
      fullName: args.fullName,
      template: "welcome_seeker" as const,
      journeyType: args.journeyType,
    });
    
    return intakeId;
  },
});

// ═══════════════════════════════════════════════════════════════
// LIST DISCONNECTED — Admin view of unassigned seekers
// ═══════════════════════════════════════════════════════════════
export const listDisconnected = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("intakes")
      .withIndex("by_status", (q) => q.eq("status", "disconnected"))
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
      v.literal("disconnected"),
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
// GET BY ID — Single intake
// ═══════════════════════════════════════════════════════════════
export const getById = query({
  args: { id: v.id("intakes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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
 * These are "disconnected" seekers from the general intake.
 */
export const listUnassigned = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("intakes")
      .withIndex("by_status", (q) => q.eq("status", "disconnected"))
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
