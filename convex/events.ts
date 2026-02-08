import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * EVENTS — Community events created by partner hubs.
 * Seekers assigned to an org see that org's upcoming events.
 */

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

/** Get upcoming events for a specific organization */
export const getByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const events = await ctx.db
      .query("events")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    // Filter to active, upcoming events and sort by date
    return events
      .filter((e) => e.isActive && e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

/** Get all events (for admin view — includes past and inactive) */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    return events.sort((a, b) => b.date.localeCompare(a.date));
  },
});

// ═══════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════

/** Create a new event */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    organizationId: v.id("organizations"),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", {
      ...args,
      isActive: true,
    });
  },
});

/** Update an event */
export const update = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { eventId, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[key] = val;
    }
    await ctx.db.patch(eventId, filtered);
  },
});

/** Delete an event */
export const remove = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.eventId);
  },
});
