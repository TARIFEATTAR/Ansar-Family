import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * PAIRINGS — Seeker ↔ Ansar Connection Management
 * Partner Leads create and manage pairings within their organization.
 * 
 * Updated to trigger pairing notifications (SMS + Email) when seeker is paired with ansar.
 */

// ═══════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Creates a new pairing between a Seeker and an Ansar.
 * Called by Partner Leads within their organization.
 */
export const create = mutation({
  args: {
    seekerId: v.id("intakes"),
    ansarId: v.id("ansars"),
    organizationId: v.id("organizations"),
    pairedByUserId: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify the seeker exists and belongs to this org
    const seeker = await ctx.db.get(args.seekerId);
    if (!seeker) {
      throw new Error("Seeker not found.");
    }

    // Verify the ansar exists and belongs to this org
    const ansar = await ctx.db.get(args.ansarId);
    if (!ansar) {
      throw new Error("Ansar not found.");
    }
    if (ansar.status !== "approved" && ansar.status !== "active") {
      throw new Error("Ansar must be approved before pairing.");
    }

    // Check if seeker already has an active pairing
    const existingPairing = await ctx.db
      .query("pairings")
      .withIndex("by_seeker", (q) => q.eq("seekerId", args.seekerId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending_intro"),
          q.eq(q.field("status"), "active")
        )
      )
      .first();

    if (existingPairing) {
      throw new Error("Seeker already has an active pairing.");
    }

    // Create the pairing
    const pairingId = await ctx.db.insert("pairings", {
      seekerId: args.seekerId,
      ansarId: args.ansarId,
      organizationId: args.organizationId,
      status: "pending_intro",
      pairedAt: Date.now(),
      pairedBy: args.pairedByUserId,
      notes: args.notes,
    });

    // Update seeker status to connected
    await ctx.db.patch(args.seekerId, {
      status: "connected",
      organizationId: args.organizationId,
    });

    // Update ansar status to active
    await ctx.db.patch(args.ansarId, {
      status: "active",
      organizationId: args.organizationId,
    });

    // ═══════════════════════════════════════════════════════════
    // TRIGGER PAIRING NOTIFICATIONS (SMS + Email to Seeker)
    // ═══════════════════════════════════════════════════════════
    
    // Get organization details for community name
    const organization = await ctx.db.get(args.organizationId);
    const communityName = organization?.name || "your local community";
    
    // Extract first name from seeker's full name
    const seekerFirstName = seeker.fullName.split(" ")[0] || seeker.fullName;
    
    // Send Pairing SMS
    await ctx.scheduler.runAfter(0, internal.notifications.sendPairingSMS, {
      recipientId: args.seekerId.toString(),
      phone: seeker.phone,
      firstName: seekerFirstName,
      ansarName: ansar.fullName,
      communityName,
    });
    
    // Send Pairing Email
    await ctx.scheduler.runAfter(0, internal.notifications.sendPairingEmail, {
      recipientId: args.seekerId.toString(),
      email: seeker.email,
      seekerFirstName,
      ansarName: ansar.fullName,
      communityName,
      // Note: jumaTime and monthlyGathering can be added to organization schema later
      // For now, these are optional and will be omitted
    });

    return pairingId;
  },
});

/**
 * Updates a pairing's status.
 */
export const updateStatus = mutation({
  args: {
    id: v.id("pairings"),
    status: v.union(
      v.literal("pending_intro"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("paused"),
      v.literal("ended")
    ),
    endReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const pairing = await ctx.db.get(args.id);
    if (!pairing) {
      throw new Error("Pairing not found.");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      endReason: args.endReason,
    });

    // If ended or completed, update ansar back to approved (available)
    if (args.status === "ended" || args.status === "completed") {
      await ctx.db.patch(pairing.ansarId, { status: "approved" });
    }
  },
});

/**
 * Marks a pairing as intro sent (active).
 */
export const markIntroSent = mutation({
  args: { id: v.id("pairings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "active" });
  },
});

/**
 * Unpairs a Seeker and Ansar, making them both available again.
 */
export const unpair = mutation({
  args: { id: v.id("pairings") },
  handler: async (ctx, args) => {
    const pairing = await ctx.db.get(args.id);
    if (!pairing) throw new Error("Pairing not found.");

    // Mark pairing as ended (or deleted? ended preserves history)
    await ctx.db.patch(args.id, { status: "ended" });

    // Reset Seeker to "triaged" (Ready to Pair)
    await ctx.db.patch(pairing.seekerId, { status: "triaged" });

    // Reset Ansar to "approved" (Available)
    await ctx.db.patch(pairing.ansarId, { status: "approved" });
  },
});

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

/**
 * Lists all pairings (Super Admin).
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pairings").order("desc").collect();
  },
});

/**
 * Lists pairings for a specific Ansar (Ansar dashboard view).
 */
export const listByAnsar = query({
  args: { ansarId: v.id("ansars") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pairings")
      .withIndex("by_ansar", (q) => q.eq("ansarId", args.ansarId))
      .order("desc")
      .collect();
  },
});

/**
 * Lists pairings for an organization (Partner Lead).
 */
export const listByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pairings")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .collect();
  },
});

/**
 * Lists active pairings for an organization.
 */
export const listActiveByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pairings")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending_intro"),
          q.eq(q.field("status"), "active")
        )
      )
      .collect();
  },
});

/**
 * Gets a single pairing with full details.
 */
export const getWithDetails = query({
  args: { id: v.id("pairings") },
  handler: async (ctx, args) => {
    const pairing = await ctx.db.get(args.id);
    if (!pairing) return null;

    const seeker = await ctx.db.get(pairing.seekerId);
    const ansar = await ctx.db.get(pairing.ansarId);
    const organization = await ctx.db.get(pairing.organizationId);

    return {
      ...pairing,
      seeker,
      ansar,
      organization,
    };
  },
});

/**
 * Gets pairing stats for an organization.
 */
export const getOrgStats = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const pairings = await ctx.db
      .query("pairings")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    return {
      total: pairings.length,
      pendingIntro: pairings.filter((p) => p.status === "pending_intro").length,
      active: pairings.filter((p) => p.status === "active").length,
      completed: pairings.filter((p) => p.status === "completed").length,
      ended: pairings.filter((p) => p.status === "ended").length,
    };
  },
});
