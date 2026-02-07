import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * CONTACTS — Convex API Functions
 * Manages CRM contacts for community members.
 * 
 * Updated to trigger welcome SMS and Email on creation.
 */

// ═══════════════════════════════════════════════════════════════
// HELPER — Extract first name from full name
// ═══════════════════════════════════════════════════════════════
function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] || fullName;
}

// ═══════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Creates a new contact.
 */
export const create = mutation({
  args: {
    fullName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    role: v.union(
      v.literal("imam"),
      v.literal("donor"),
      v.literal("community_member"),
      v.literal("family_member"),
      v.literal("scholar"),
      v.literal("volunteer"),
      v.literal("other")
    ),
    roleOther: v.optional(v.string()),
    city: v.optional(v.string()),
    stateRegion: v.optional(v.string()),
    address: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const contactId = await ctx.db.insert("contacts", {
      fullName: args.fullName,
      email: args.email,
      phone: args.phone,
      gender: args.gender,
      role: args.role,
      roleOther: args.roleOther,
      city: args.city,
      stateRegion: args.stateRegion,
      address: args.address,
      organizationId: args.organizationId,
      tags: args.tags ?? [],
      notes: args.notes,
      status: "active",
    });
    
    // ═══════════════════════════════════════════════════════════
    // TRIGGER WELCOME NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════
    
    // Get organization name if organizationId is provided
    let organizationName: string | undefined;
    if (args.organizationId) {
      const org = await ctx.db.get(args.organizationId);
      organizationName = org?.name;
    }
    
    // Send welcome notifications (SMS + Email)
    await ctx.scheduler.runAfter(0, internal.notifications.sendWelcomeContact, {
      contactId,
      fullName: args.fullName,
      phone: args.phone,
      email: args.email,
      role: args.role,
      organizationName,
    });
    
    return contactId;
  },
});

/**
 * Updates the status of a contact.
 */
export const updateStatus = mutation({
  args: {
    id: v.id("contacts"),
    status: v.union(
      v.literal("active"),
      v.literal("inactive")
    ),
  },
  handler: async (ctx, args) => {
    const { id, status } = args;
    const contact = await ctx.db.get(id);

    if (!contact) {
      throw new Error("Contact not found.");
    }

    await ctx.db.patch(id, { status });
  },
});

/**
 * Updates contact profile fields.
 */
export const update = mutation({
  args: {
    id: v.id("contacts"),
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    role: v.optional(v.union(
      v.literal("imam"),
      v.literal("donor"),
      v.literal("community_member"),
      v.literal("family_member"),
      v.literal("scholar"),
      v.literal("volunteer"),
      v.literal("other")
    )),
    roleOther: v.optional(v.string()),
    city: v.optional(v.string()),
    stateRegion: v.optional(v.string()),
    address: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const contact = await ctx.db.get(id);
    if (!contact) throw new Error("Contact not found.");

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
 * Deletes a contact record.
 */
export const deleteContact = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

/**
 * Lists all contacts (Admin view).
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contacts").order("desc").collect();
  },
});

/**
 * Lists contacts by status.
 */
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("active"),
      v.literal("inactive")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contacts")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

/**
 * Gets a single contact by ID.
 */
export const getById = query({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ═══════════════════════════════════════════════════════════════
// ORGANIZATION-SCOPED QUERIES (Partner Lead Access)
// ═══════════════════════════════════════════════════════════════

/**
 * Lists contacts for a specific organization (Partner Lead view).
 */
export const listByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contacts")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .collect();
  },
});

/**
 * Assigns a contact to an organization.
 */
export const assignToOrganization = mutation({
  args: {
    id: v.id("contacts"),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      organizationId: args.organizationId,
    });
  },
});
