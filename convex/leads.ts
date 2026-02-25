import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * LEADS — Inbound partner interest from homepage
 *
 * Flow: Homepage form -> submit mutation -> Resend email + Slack webhook
 * Admin panel reads via list query, updates status via updateStatus.
 */

// ═══════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════

export const submit = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    organizationType: v.union(
      v.literal("masjid"),
      v.literal("msa"),
      v.literal("community_org"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    const leadId = await ctx.db.insert("leads", {
      fullName: args.fullName,
      email: args.email.toLowerCase(),
      organizationType: args.organizationType,
      status: "new",
    });

    try {
      await ctx.scheduler.runAfter(0, internal.leadsActions.sendConfirmationEmail, {
        email: args.email.toLowerCase(),
        firstName: args.fullName.split(" ")[0] || args.fullName,
      });
    } catch {
      // Don't block form submission if email scheduling fails
    }

    try {
      await ctx.scheduler.runAfter(0, internal.leadsActions.sendSlackNotification, {
        fullName: args.fullName,
        email: args.email.toLowerCase(),
        organizationType: args.organizationType,
      });
    } catch {
      // Don't block form submission if Slack scheduling fails
    }

    return leadId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("scheduled"),
      v.literal("converted")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updateNotes = mutation({
  args: {
    id: v.id("leads"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { notes: args.notes });
  },
});

export const deleteLead = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("leads").order("desc").collect();
  },
});

export const countByStatus = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("leads").collect();
    return {
      total: all.length,
      new: all.filter((l) => l.status === "new").length,
      contacted: all.filter((l) => l.status === "contacted").length,
      scheduled: all.filter((l) => l.status === "scheduled").length,
      converted: all.filter((l) => l.status === "converted").length,
    };
  },
});
