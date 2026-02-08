import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * MESSAGES — Audit Log for Notifications
 * 
 * Internal mutations for logging SMS and Email messages.
 * Called by the notifications system.
 */

/**
 * Logs a message to the audit table.
 */
export const logMessage = internalMutation({
  args: {
    type: v.union(v.literal("sms"), v.literal("email")),
    recipientId: v.string(),
    recipientPhone: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    template: v.string(),
    subject: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
    externalId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      type: args.type,
      recipientId: args.recipientId,
      recipientPhone: args.recipientPhone,
      recipientEmail: args.recipientEmail,
      template: args.template,
      subject: args.subject,
      status: args.status,
      errorMessage: args.errorMessage,
      externalId: args.externalId,
      sentAt: Date.now(),
    });
    return messageId;
  },
});

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

/**
 * Lists all messages (Super Admin view).
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").order("desc").collect();
  },
});

/**
 * Lists messages by recipient ID (for detail panels).
 */
export const listByRecipient = query({
  args: { recipientId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) => q.eq("recipientId", args.recipientId))
      .order("desc")
      .collect();
  },
});

/**
 * Updates a message's status (pending → sent/failed).
 */
export const updateMessageStatus = internalMutation({
  args: {
    messageId: v.id("messages"),
    status: v.union(v.literal("sent"), v.literal("failed")),
    externalId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      status: args.status,
      externalId: args.externalId,
      errorMessage: args.errorMessage,
    });
  },
});

// ═══════════════════════════════════════════════════════════════
// DIRECT MESSAGE — Send ad-hoc SMS / Email from Partner Lead dashboard
// ═══════════════════════════════════════════════════════════════

export const sendMessage = mutation({
  args: {
    recipientId: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    message: v.string(),
    senderName: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.phone && !args.email) {
      throw new Error("At least one of phone or email is required");
    }
    if (!args.message.trim()) {
      throw new Error("Message cannot be empty");
    }

    // Schedule the internal action to send SMS/Email
    await ctx.scheduler.runAfter(0, internal.notifications.sendDirectMessage, {
      recipientId: args.recipientId,
      phone: args.phone,
      email: args.email,
      message: args.message.trim(),
      senderName: args.senderName,
    });

    return { scheduled: true };
  },
});
