import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * HUB RESOURCES — Videos, articles & links managed by partner hubs.
 * Partner leads can add YouTube videos, articles, and links that appear
 * on their seekers' dashboards. Resources can target all seekers in a hub
 * or be assigned to a specific seeker.
 */

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/** Extract YouTube video ID from various URL formats */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // bare ID
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

/** Get all resources for an organization (Partner Hub view) */
export const listByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const resources = await ctx.db
      .query("hub_resources")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    return resources.sort((a, b) => {
      // Active first, then by creation time (newest first)
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return b._creationTime - a._creationTime;
    });
  },
});

/** Get active resources for a seeker's organization (Seeker Hub view) */
export const listForSeeker = query({
  args: {
    organizationId: v.id("organizations"),
    seekerId: v.optional(v.id("intakes")),
  },
  handler: async (ctx, args) => {
    const resources = await ctx.db
      .query("hub_resources")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    // Filter to active resources that target "all" or this specific seeker
    return resources
      .filter((r) => {
        if (!r.isActive) return false;
        if (r.targetType === "all") return true;
        if (r.targetType === "specific" && args.seekerId) {
          return r.targetSeekerId === args.seekerId;
        }
        return false;
      })
      .sort((a, b) => {
        // Custom order first, then by creation time
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return b._creationTime - a._creationTime;
      });
  },
});

// ═══════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════

/** Create a new hub resource */
export const create = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("video"), v.literal("article"), v.literal("link")),
    targetType: v.union(v.literal("all"), v.literal("specific")),
    targetSeekerId: v.optional(v.id("intakes")),
    organizationId: v.id("organizations"),
    createdBy: v.id("users"),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Auto-extract YouTube ID and thumbnail for videos
    let videoId: string | undefined;
    let thumbnailUrl: string | undefined;

    if (args.type === "video") {
      const extracted = extractYouTubeId(args.url);
      if (extracted) {
        videoId = extracted;
        thumbnailUrl = `https://img.youtube.com/vi/${extracted}/mqdefault.jpg`;
      }
    }

    return await ctx.db.insert("hub_resources", {
      title: args.title,
      url: args.url,
      description: args.description,
      type: args.type,
      videoId,
      thumbnailUrl,
      targetType: args.targetType,
      targetSeekerId: args.targetSeekerId,
      organizationId: args.organizationId,
      createdBy: args.createdBy,
      isActive: true,
      order: args.order,
    });
  },
});

/** Update a hub resource */
export const update = mutation({
  args: {
    id: v.id("hub_resources"),
    title: v.optional(v.string()),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(v.literal("video"), v.literal("article"), v.literal("link"))),
    targetType: v.optional(v.union(v.literal("all"), v.literal("specific"))),
    targetSeekerId: v.optional(v.id("intakes")),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const resource = await ctx.db.get(id);
    if (!resource) throw new Error("Resource not found.");

    const patch: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }

    // Re-extract YouTube ID if URL or type changed
    const newUrl = (updates.url ?? resource.url) as string;
    const newType = (updates.type ?? resource.type) as string;
    if (newType === "video" && (updates.url || updates.type)) {
      const extracted = extractYouTubeId(newUrl);
      if (extracted) {
        patch.videoId = extracted;
        patch.thumbnailUrl = `https://img.youtube.com/vi/${extracted}/mqdefault.jpg`;
      }
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(id, patch);
    }
  },
});

/** Delete a hub resource */
export const remove = mutation({
  args: { id: v.id("hub_resources") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
