import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * USERS — Authentication & Role Management
 * Handles user creation, role assignment, and lookups.
 */

// ═══════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Creates or updates a user from Clerk webhook/sync.
 */
export const upsertFromClerk = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      // Update existing user
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
      });
      return existing._id;
    }

    // Check if this email is a Partner Lead (from approved partner application)
    const partnerApp = await ctx.db
      .query("partners")
      .withIndex("by_email", (q) => q.eq("leadEmail", args.email))
      .filter((q) => q.neq(q.field("status"), "pending"))
      .first();

    // Determine role
    let role: "super_admin" | "partner_lead" | "ansar" | "seeker" = "seeker";
    let organizationId = undefined;

    if (partnerApp && partnerApp.organizationId) {
      role = "partner_lead";
      organizationId = partnerApp.organizationId;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role,
      organizationId,
      isActive: true,
    });

    return userId;
  },
});

/**
 * Manually set a user's role (Super Admin only).
 */
export const setRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("super_admin"),
      v.literal("partner_lead"),
      v.literal("ansar"),
      v.literal("seeker")
    ),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: args.role,
      organizationId: args.organizationId,
    });
  },
});

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

/**
 * Gets the current user by Clerk ID.
 */
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

/**
 * Gets a user by email.
 */
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

/**
 * Lists all users (Super Admin only).
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

/**
 * Lists users by organization.
 */
export const listByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});
