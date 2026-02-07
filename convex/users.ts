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
 * Creates or updates a user from Clerk sync (called on dashboard load).
 * 
 * This now handles ALL user types: super_admin, partner_lead, ansar, seeker.
 * It first checks if a "pending_" user exists for this email (created during
 * form submission) and upgrades it with the real Clerk ID.
 */
export const upsertFromClerk = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();

    // 1. Check if user already exists by real Clerk ID
    const existingByClerkId = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingByClerkId) {
      // Update name/email in case they changed
      await ctx.db.patch(existingByClerkId._id, {
        email,
        name: args.name,
      });

      // Force super admin if email matches
      const superAdminEmails = ["jordan@tarifeattar.com"];
      if (superAdminEmails.includes(email) && existingByClerkId.role !== "super_admin") {
        await ctx.db.patch(existingByClerkId._id, {
          role: "super_admin",
          isActive: true,
        });
      }

      return existingByClerkId._id;
    }

    // 2. Check if a pending user exists for this email (created during form submission)
    const pendingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (pendingUser && pendingUser.clerkId.startsWith("pending_")) {
      // Upgrade the pending user with the real Clerk ID
      await ctx.db.patch(pendingUser._id, {
        clerkId: args.clerkId,
        name: args.name,
      });
      console.log(`✅ Upgraded pending user ${pendingUser._id} (${pendingUser.role}) with real Clerk ID`);
      return pendingUser._id;
    }

    if (pendingUser) {
      // User exists with a different clerkId — this shouldn't happen normally.
      // Just return their ID without overwriting clerkId.
      return pendingUser._id;
    }

    // 3. No existing user — determine role from applications
    const superAdminEmails = ["jordan@tarifeattar.com"];
    let role: "super_admin" | "partner_lead" | "ansar" | "seeker" = "seeker";
    let organizationId = undefined;
    let isActive = true;

    if (superAdminEmails.includes(email)) {
      role = "super_admin";
    } else {
      // Check partner applications
      const partnerApp = await ctx.db
        .query("partners")
        .withIndex("by_email", (q) => q.eq("leadEmail", email))
        .first();

      if (partnerApp) {
        role = "partner_lead";
        organizationId = partnerApp.organizationId ?? undefined;
        isActive = partnerApp.status === "approved" || partnerApp.status === "active";
      } else {
        // Check ansar applications
        const ansarApp = await ctx.db
          .query("ansars")
          .withIndex("by_email", (q) => q.eq("email", email))
          .first();

        if (ansarApp) {
          role = "ansar";
          organizationId = ansarApp.organizationId ?? undefined;
          isActive = ansarApp.status === "approved" || ansarApp.status === "active";
        }
        // Default: seeker (isActive: true)
      }
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email,
      name: args.name,
      role,
      organizationId,
      isActive,
    });

    return userId;
  },
});

/**
 * Manually create a user (Super Admin only).
 */
export const createManual = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("super_admin"),
      v.literal("partner_lead"),
      v.literal("ansar"),
      v.literal("seeker")
    ),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      throw new Error("User with this Clerk ID already exists.");
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role: args.role,
      organizationId: args.organizationId,
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

/**
 * Update user details (Super Admin only).
 */
export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("super_admin"),
      v.literal("partner_lead"),
      v.literal("ansar"),
      v.literal("seeker")
    )),
    organizationId: v.optional(v.union(v.id("organizations"), v.null())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const user = await ctx.db.get(id);
    if (!user) throw new Error("User not found.");

    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(id, patch);
    }
  },
});

/**
 * Delete a user (Super Admin only).
 */
export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
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
