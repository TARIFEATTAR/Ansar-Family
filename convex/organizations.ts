import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * ORGANIZATIONS — Convex API Functions
 * Queries for active Partner Hubs / Organizations.
 */

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

/**
 * Gets an organization by its URL slug.
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return org;
  },
});

/**
 * Lists all active organizations.
 */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("organizations")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/**
 * Gets an organization by ID.
 */
export const getById = query({
  args: { id: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ═══════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Deletes an organization (Partner Hub).
 */
export const deleteOrganization = mutation({
  args: { id: v.id("organizations") },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.id);
    if (!org) {
      // Already deleted, ignore
      return;
    }

    // If there is a linked partner application, update it to remove the organizationId
    // so it doesn't point to a dead record.
    if (org.partnerApplicationId) {
      const partner = await ctx.db.get(org.partnerApplicationId);
      if (partner) {
        // Option A: Delete the partner too?
        // Option B: Set status to pending?
        // Option C: Just UNSET the org ID but keep it approved (broken state).

        // Let's go with Option A: If we are deleting the Hub, we likely want to remove the Partner entry from the "Active List".
        // But maybe we want to keep the application?
        // Let's just Unset it for now to be safe, or set status 'inactive'.
        await ctx.db.patch(org.partnerApplicationId, {
          organizationId: undefined,
          status: "pending" // Revert to pending so it shows up in Pending list?
        });
      }
    }

    await ctx.db.delete(args.id);
  },
});
