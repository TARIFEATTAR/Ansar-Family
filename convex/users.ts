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
    // 1. Check if this email is associated with an approved Partner Application
    const partnerApp = await ctx.db
      .query("partners")
      .withIndex("by_email", (q) => q.eq("leadEmail", args.email))
      .filter((q) => q.neq(q.field("status"), "pending"))
      .first();

    // 2. Determine intended role and organization based on partner app
    let newRole: "super_admin" | "partner_lead" | "ansar" | "seeker" | undefined = undefined;
    let newOrganizationId = undefined;

    if (partnerApp && partnerApp.organizationId) {
      newRole = "partner_lead";
      newOrganizationId = partnerApp.organizationId;
    }

    // 3. Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      // Prepare updates
      const updates: any = {
        email: args.email,
        name: args.name,
      };

      // Upgrade role if they are now a partner lead (and not a super_admin)
      if (existing.role !== "super_admin" && newRole === "partner_lead") {
        updates.role = "partner_lead";
        updates.organizationId = newOrganizationId;
      }

      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }

    // 4. Create new user if not exists
    const role = newRole || "seeker"; // Default to seeker if no partner app found

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role,
      organizationId: newOrganizationId,
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
