import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * PARTNERS — Convex API Functions
 * Manages Partner Hub applications and community registrations.
 */

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Calculates Hub Level (1-5) based on infrastructure responses.
 * 
 * Level 5 (Full-Service Hub): Has everything
 * Level 4 (Advanced Hub): Most services, missing 1-2
 * Level 3 (Growing Hub): Solid foundation
 * Level 2 (Emerging Hub): Basic infrastructure
 * Level 1 (Seed Hub): Minimal infrastructure
 */
function calculateHubLevel(infrastructure: {
  hasWeeklyProgramming: boolean;
  canHostNewMuslimSessions: boolean;
  hasImamAccess: boolean;
  hasExistingNewMuslimProgram: boolean;
  wantsDinnerKit: boolean;
  hasPhysicalSpace: boolean;
}): number {
  const points = [
    infrastructure.hasWeeklyProgramming,
    infrastructure.canHostNewMuslimSessions,
    infrastructure.hasImamAccess,
    infrastructure.hasExistingNewMuslimProgram,
    infrastructure.hasPhysicalSpace,
  ].filter(Boolean).length;

  if (points === 5) return 5;
  if (points === 4) return 4;
  if (points >= 3) return 3;
  if (points >= 1) return 2;
  return 1;
}

// ═══════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Creates a new Partner Hub application.
 */
export const create = mutation({
  args: {
    // Partner Lead
    leadName: v.string(),
    leadPhone: v.string(),
    leadEmail: v.string(),
    leadIsConvert: v.boolean(),

    // Organization
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

    // Infrastructure
    infrastructure: v.object({
      hasWeeklyProgramming: v.boolean(),
      canHostNewMuslimSessions: v.boolean(),
      hasImamAccess: v.boolean(),
      hasExistingNewMuslimProgram: v.boolean(),
      wantsDinnerKit: v.boolean(),
      hasPhysicalSpace: v.boolean(),
    }),

    // Core Trio
    coreTrio: v.object({
      imamName: v.optional(v.string()),
      imamPhone: v.optional(v.string()),
      imamEmail: v.optional(v.string()),
      secondName: v.optional(v.string()),
      secondPhone: v.optional(v.string()),
      secondEmail: v.optional(v.string()),
    }),

    agreementsAccepted: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.agreementsAccepted) {
      throw new Error("All agreements must be accepted to submit a Partner application.");
    }

    const hubLevel = calculateHubLevel(args.infrastructure);

    const partnerId = await ctx.db.insert("partners", {
      leadName: args.leadName,
      leadPhone: args.leadPhone,
      leadEmail: args.leadEmail.toLowerCase(),
      leadIsConvert: args.leadIsConvert,
      orgName: args.orgName,
      orgType: args.orgType,
      orgTypeOther: args.orgTypeOther,
      address: args.address,
      city: args.city,
      stateRegion: args.stateRegion,
      genderFocus: args.genderFocus,
      infrastructure: args.infrastructure,
      hubLevel,
      coreTrio: args.coreTrio,
      agreementsAccepted: args.agreementsAccepted,
      status: "pending",
    });

    return partnerId;
  },
});

/**
 * Updates the status of a Partner application.
 */
export const updateStatus = mutation({
  args: {
    id: v.id("partners"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("active"),
      v.literal("inactive")
    ),
  },
  handler: async (ctx, args) => {
    const partner = await ctx.db.get(args.id);
    if (!partner) {
      throw new Error("Partner application not found.");
    }

    await ctx.db.patch(args.id, { status: args.status });
  },
});

/**
 * Approves a Partner and creates an Organization.
 */
export const approveAndCreateOrg = mutation({
  args: {
    id: v.id("partners"),
  },
  handler: async (ctx, args) => {
    const partner = await ctx.db.get(args.id);
    if (!partner) {
      throw new Error("Partner application not found.");
    }

    // Generate slug from org name
    const slug = partner.orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: partner.orgName,
      slug,
      type: partner.orgType,
      city: partner.city,
      stateRegion: partner.stateRegion,
      hubLevel: partner.hubLevel,
      isActive: true,
      partnerApplicationId: args.id,
    });

    // Update partner with org link and status
    await ctx.db.patch(args.id, {
      status: "approved",
      organizationId: orgId,
    });

    return { partnerId: args.id, organizationId: orgId, slug };
  },
});

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

/**
 * Lists all Partner applications.
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("partners").collect();
  },
});

/**
 * Lists Partner applications by status.
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
      .query("partners")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

/**
 * Gets a single Partner application by ID.
 */
export const getById = query({
  args: { id: v.id("partners") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Deletes a Partner record.
 */
export const deletePartner = mutation({
  args: { id: v.id("partners") },
  handler: async (ctx, args) => {
    const partner = await ctx.db.get(args.id);
    if (!partner) return;

    // If this partner has an active organization, delete it too
    if (partner.organizationId) {
      const org = await ctx.db.get(partner.organizationId);
      if (org) {
        await ctx.db.delete(partner.organizationId);
      }
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Rejects a Partner application.
 */
export const rejectPartner = mutation({
  args: { id: v.id("partners") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "rejected" as any });
  },
});
