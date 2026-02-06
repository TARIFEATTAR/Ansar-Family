import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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
