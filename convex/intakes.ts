import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * INTAKES — Seeker submission operations
 * Handles New Muslim, Reconnecting, and Seeker intake forms.
 */

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
    // Determine status and organizationId based on source
    let status = "disconnected";
    let organizationId = undefined;

    if (args.partnerId && args.source === "partner_specific") {
      status = "triaged"; // Auto-triage for partner-specific intakes
      organizationId = args.partnerId as any; // Cast to Id<"organizations">
    }

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
      status: status as any,
      source: args.source ?? "general",
      partnerId: args.partnerId,
      organizationId: organizationId,
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
      .filter((q) => q.eq(q.field("organizationId"), undefined))
      .order("desc")
      .collect();
  },
});

/**
 * Assigns a seeker to an organization.
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

/**
 * Lists seekers ready to be paired (triaged but not connected).
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
