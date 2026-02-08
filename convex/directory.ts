import { query } from "./_generated/server";

/**
 * DIRECTORY — Public-safe queries for the /communities directory page.
 * Returns only aggregate counts. No PII is exposed.
 */

/**
 * Aggregate stats across all active organizations.
 * Returns total hub count, total ansars, and total seekers welcomed.
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const orgs = await ctx.db
      .query("organizations")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const ansars = await ctx.db.query("ansars").collect();
    const intakes = await ctx.db.query("intakes").collect();

    // Set of active org IDs for filtering
    const activeOrgIds = new Set(orgs.map((o) => o._id));

    // Count only ansars/seekers that belong to an active org
    let ansarCount = 0;
    for (const a of ansars) {
      if (a.organizationId && activeOrgIds.has(a.organizationId)) {
        ansarCount++;
      }
    }

    let seekerCount = 0;
    for (const i of intakes) {
      if (i.organizationId && activeOrgIds.has(i.organizationId)) {
        seekerCount++;
      }
    }

    return {
      hubCount: orgs.length,
      ansarCount,
      seekerCount,
    };
  },
});

/**
 * Per-organization seeker and ansar counts.
 * Returns a record of { [orgId]: { seekerCount, ansarCount } }.
 */
export const getOrgCounts = query({
  args: {},
  handler: async (ctx) => {
    const orgs = await ctx.db
      .query("organizations")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const counts: Record<string, { seekerCount: number; ansarCount: number }> = {};

    for (const org of orgs) {
      const seekers = await ctx.db
        .query("intakes")
        .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
        .collect();

      const ansars = await ctx.db
        .query("ansars")
        .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
        .collect();

      counts[org._id] = {
        seekerCount: seekers.length,
        ansarCount: ansars.length,
      };
    }

    return counts;
  },
});
