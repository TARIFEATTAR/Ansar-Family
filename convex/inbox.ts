import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * INBOX — In-App Messaging System
 *
 * Supports direct 1-to-1 messages and broadcast announcements.
 * Every new message also triggers an SMS/email notification.
 */

// ═══════════════════════════════════════════════════════════════
// INTERNAL QUERIES — Used by notifications action
// ═══════════════════════════════════════════════════════════════

export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getIntakeByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("intakes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getAnsarByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ansars")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getPartnerByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("partners")
      .withIndex("by_email", (q) => q.eq("leadEmail", args.email))
      .first();
  },
});

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

/**
 * Get inbox — all conversations for the current user, sorted by most recent.
 */
export const getInbox = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get all participant rows for this user
    const participantRows = await ctx.db
      .query("conversation_participants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (participantRows.length === 0) return [];

    // Fetch conversations + build inbox items
    const inbox = await Promise.all(
      participantRows.map(async (p) => {
        const conversation = await ctx.db.get(p.conversationId);
        if (!conversation) return null;

        // Get the other participants for display
        const allParticipants = await ctx.db
          .query("conversation_participants")
          .withIndex("by_conversation", (q) => q.eq("conversationId", p.conversationId))
          .collect();

        const otherParticipants = allParticipants.filter(
          (op) => op.userId !== args.userId
        );

        return {
          conversationId: conversation._id,
          type: conversation.type,
          subject: conversation.subject,
          organizationId: conversation.organizationId,
          lastMessageAt: conversation.lastMessageAt,
          lastMessagePreview: conversation.lastMessagePreview,
          lastMessageSenderName: conversation.lastMessageSenderName,
          unreadCount: p.unreadCount,
          otherParticipants: otherParticipants.map((op) => ({
            userId: op.userId,
            userName: op.userName,
            userRole: op.userRole,
          })),
          participantCount: allParticipants.length,
        };
      })
    );

    // Filter nulls and sort by most recent
    return inbox
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

/**
 * Get a single conversation with all its messages.
 */
export const getConversation = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    // Verify the user is a participant
    const participants = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    const isParticipant = participants.some((p) => p.userId === args.userId);
    if (!isParticipant) return null;

    // Get all messages
    const messages = await ctx.db
      .query("conversation_messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    return {
      ...conversation,
      participants: participants.map((p) => ({
        userId: p.userId,
        userName: p.userName,
        userRole: p.userRole,
      })),
      messages: messages.sort((a, b) => a.sentAt - b.sentAt),
    };
  },
});

/**
 * Get total unread count across all conversations (for tab badge).
 */
export const getUnreadTotal = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const participantRows = await ctx.db
      .query("conversation_participants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return participantRows.reduce((sum, p) => sum + p.unreadCount, 0);
  },
});

/**
 * Get available recipients the current user can message.
 */
export const getAvailableRecipients = query({
  args: {
    userId: v.id("users"),
    userRole: v.string(),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();
    const activeUsers = allUsers.filter(
      (u) => u.isActive && u._id !== args.userId
    );

    switch (args.userRole) {
      case "super_admin": {
        // Super Admin can message all partner_leads, ansars, seekers
        return activeUsers
          .filter((u) => ["partner_lead", "ansar", "seeker"].includes(u.role))
          .map((u) => ({
            userId: u._id,
            name: u.name,
            role: u.role,
            organizationId: u.organizationId,
          }));
      }

      case "partner_lead": {
        if (!args.organizationId) return [];
        // Partner Leads can message ansars + seekers in their org, and super admins
        const orgUsers = activeUsers.filter(
          (u) =>
            (u.organizationId === args.organizationId &&
              ["ansar", "seeker"].includes(u.role)) ||
            u.role === "super_admin"
        );
        return orgUsers.map((u) => ({
          userId: u._id,
          name: u.name,
          role: u.role,
          organizationId: u.organizationId,
        }));
      }

      case "ansar": {
        if (!args.organizationId) return [];
        // Ansars can message partner_leads in their org + paired seekers
        // First get partner leads in org
        const orgLeads = activeUsers.filter(
          (u) =>
            u.organizationId === args.organizationId &&
            u.role === "partner_lead"
        );

        // Get paired seekers
        // Find the ansar record
        const currentUserRecord = allUsers.find((u) => u._id === args.userId);
        const ansarRecord = currentUserRecord?.email
          ? await ctx.db
              .query("ansars")
              .withIndex("by_email", (q) => q.eq("email", currentUserRecord.email))
              .first()
          : null;

        let pairedSeekerUsers: typeof activeUsers = [];
        if (ansarRecord) {
          const pairings = await ctx.db
            .query("pairings")
            .withIndex("by_ansar", (q) => q.eq("ansarId", ansarRecord._id))
            .collect();
          const activePairings = pairings.filter(
            (p) => p.status === "active" || p.status === "pending_intro"
          );

          for (const pairing of activePairings) {
            const intake = await ctx.db.get(pairing.seekerId);
            if (intake?.userId) {
              const seekerUser = activeUsers.find((u) => u._id === intake.userId);
              if (seekerUser) pairedSeekerUsers.push(seekerUser);
            }
          }
        }

        return [...orgLeads, ...pairedSeekerUsers].map((u) => ({
          userId: u._id,
          name: u.name,
          role: u.role,
          organizationId: u.organizationId,
        }));
      }

      case "seeker": {
        // Seekers can message their paired ansar only
        const currentUserRecord = allUsers.find((u) => u._id === args.userId);
        const intake = currentUserRecord?.email
          ? await ctx.db
              .query("intakes")
              .withIndex("by_email", (q) => q.eq("email", currentUserRecord.email))
              .first()
          : null;

        if (!intake) return [];

        const pairings = await ctx.db
          .query("pairings")
          .withIndex("by_seeker", (q) => q.eq("seekerId", intake._id))
          .collect();
        const activePairing = pairings.find(
          (p) => p.status === "active" || p.status === "pending_intro"
        );

        if (!activePairing) return [];

        const ansar = await ctx.db.get(activePairing.ansarId);
        if (!ansar) return [];

        // Find the user account for this ansar
        const ansarUser = activeUsers.find(
          (u) => u.email === ansar.email && u.role === "ansar"
        );

        return ansarUser
          ? [
              {
                userId: ansarUser._id,
                name: ansarUser.name,
                role: ansarUser.role,
                organizationId: ansarUser.organizationId,
              },
            ]
          : [];
      }

      default:
        return [];
    }
  },
});

// ═══════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Start a new direct conversation between two users.
 */
export const startConversation = mutation({
  args: {
    senderId: v.id("users"),
    senderName: v.string(),
    senderRole: v.string(),
    recipientId: v.id("users"),
    recipientName: v.string(),
    recipientRole: v.string(),
    body: v.string(),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    if (!args.body.trim()) throw new Error("Message cannot be empty");

    const now = Date.now();
    const preview =
      args.body.length > 80 ? args.body.substring(0, 80) + "…" : args.body;

    // Check for existing direct conversation between these two users
    const senderParticipations = await ctx.db
      .query("conversation_participants")
      .withIndex("by_user", (q) => q.eq("userId", args.senderId))
      .collect();

    let existingConvoId: Id<"conversations"> | null = null;

    for (const sp of senderParticipations) {
      const convo = await ctx.db.get(sp.conversationId);
      if (!convo || convo.type !== "direct") continue;

      const participants = await ctx.db
        .query("conversation_participants")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", sp.conversationId)
        )
        .collect();

      if (
        participants.length === 2 &&
        participants.some((p) => p.userId === args.recipientId)
      ) {
        existingConvoId = sp.conversationId;
        break;
      }
    }

    if (existingConvoId) {
      // Add to existing conversation
      await ctx.db.insert("conversation_messages", {
        conversationId: existingConvoId,
        senderId: args.senderId,
        senderName: args.senderName,
        senderRole: args.senderRole,
        body: args.body.trim(),
        sentAt: now,
      });

      await ctx.db.patch(existingConvoId, {
        lastMessageAt: now,
        lastMessagePreview: preview,
        lastMessageSenderName: args.senderName,
      });

      // Increment unread for recipient
      const recipientParticipant = await ctx.db
        .query("conversation_participants")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", existingConvoId!)
        )
        .collect()
        .then((ps) => ps.find((p) => p.userId === args.recipientId));

      if (recipientParticipant) {
        await ctx.db.patch(recipientParticipant._id, {
          unreadCount: recipientParticipant.unreadCount + 1,
        });
      }

      // Schedule notification
      await ctx.scheduler.runAfter(
        0,
        internal.notifications.notifyInboxMessage,
        {
          recipientUserId: args.recipientId,
          senderName: args.senderName,
          preview,
        }
      );

      return existingConvoId;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      type: "direct",
      organizationId: args.organizationId,
      lastMessageAt: now,
      lastMessagePreview: preview,
      lastMessageSenderName: args.senderName,
      createdBy: args.senderId,
      createdAt: now,
    });

    // Add participants
    await ctx.db.insert("conversation_participants", {
      conversationId,
      userId: args.senderId,
      userName: args.senderName,
      userRole: args.senderRole,
      unreadCount: 0,
      lastReadAt: now,
    });

    await ctx.db.insert("conversation_participants", {
      conversationId,
      userId: args.recipientId,
      userName: args.recipientName,
      userRole: args.recipientRole,
      unreadCount: 1,
    });

    // Insert the first message
    await ctx.db.insert("conversation_messages", {
      conversationId,
      senderId: args.senderId,
      senderName: args.senderName,
      senderRole: args.senderRole,
      body: args.body.trim(),
      sentAt: now,
    });

    // Schedule notification
    await ctx.scheduler.runAfter(
      0,
      internal.notifications.notifyInboxMessage,
      {
        recipientUserId: args.recipientId,
        senderName: args.senderName,
        preview,
      }
    );

    return conversationId;
  },
});

/**
 * Send a broadcast message to all users of a given role in scope.
 */
export const sendBroadcast = mutation({
  args: {
    senderId: v.id("users"),
    senderName: v.string(),
    senderRole: v.string(),
    subject: v.string(),
    body: v.string(),
    recipientRole: v.string(), // "partner_lead", "ansar", "seeker"
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    if (!args.body.trim()) throw new Error("Message cannot be empty");
    if (!args.subject.trim()) throw new Error("Subject is required for broadcasts");

    const now = Date.now();
    const preview =
      args.body.length > 80 ? args.body.substring(0, 80) + "…" : args.body;

    // Find all recipients
    const allUsers = await ctx.db.query("users").collect();
    let recipients = allUsers.filter(
      (u) => u.isActive && u.role === args.recipientRole && u._id !== args.senderId
    );

    // Scope to organization if provided
    if (args.organizationId) {
      recipients = recipients.filter(
        (u) => u.organizationId === args.organizationId
      );
    }

    if (recipients.length === 0) {
      throw new Error("No recipients found for this broadcast");
    }

    // Create conversation
    const conversationId = await ctx.db.insert("conversations", {
      type: "broadcast",
      subject: args.subject.trim(),
      organizationId: args.organizationId,
      lastMessageAt: now,
      lastMessagePreview: preview,
      lastMessageSenderName: args.senderName,
      createdBy: args.senderId,
      createdAt: now,
    });

    // Add sender as participant
    await ctx.db.insert("conversation_participants", {
      conversationId,
      userId: args.senderId,
      userName: args.senderName,
      userRole: args.senderRole,
      unreadCount: 0,
      lastReadAt: now,
    });

    // Add all recipients
    for (const recipient of recipients) {
      await ctx.db.insert("conversation_participants", {
        conversationId,
        userId: recipient._id,
        userName: recipient.name,
        userRole: recipient.role,
        unreadCount: 1,
      });
    }

    // Insert the message
    await ctx.db.insert("conversation_messages", {
      conversationId,
      senderId: args.senderId,
      senderName: args.senderName,
      senderRole: args.senderRole,
      body: args.body.trim(),
      sentAt: now,
    });

    // Schedule notifications for each recipient
    for (const recipient of recipients) {
      await ctx.scheduler.runAfter(
        0,
        internal.notifications.notifyInboxMessage,
        {
          recipientUserId: recipient._id,
          senderName: args.senderName,
          preview: `[${args.subject.trim()}] ${preview}`,
        }
      );
    }

    return conversationId;
  },
});

/**
 * Reply to an existing conversation.
 */
export const replyToConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    senderName: v.string(),
    senderRole: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.body.trim()) throw new Error("Message cannot be empty");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const now = Date.now();
    const preview =
      args.body.length > 80 ? args.body.substring(0, 80) + "…" : args.body;

    // Insert message
    await ctx.db.insert("conversation_messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      senderName: args.senderName,
      senderRole: args.senderRole,
      body: args.body.trim(),
      sentAt: now,
    });

    // Update conversation metadata
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
      lastMessagePreview: preview,
      lastMessageSenderName: args.senderName,
    });

    // Get all participants to increment unread
    const participants = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    for (const p of participants) {
      if (p.userId !== args.senderId) {
        await ctx.db.patch(p._id, {
          unreadCount: p.unreadCount + 1,
        });

        // Schedule notification
        await ctx.scheduler.runAfter(
          0,
          internal.notifications.notifyInboxMessage,
          {
            recipientUserId: p.userId,
            senderName: args.senderName,
            preview,
          }
        );
      }
    }
  },
});

/**
 * Mark a conversation as read for the current user.
 */
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const myRow = participants.find((p) => p.userId === args.userId);
    if (myRow && myRow.unreadCount > 0) {
      await ctx.db.patch(myRow._id, {
        unreadCount: 0,
        lastReadAt: Date.now(),
      });
    }
  },
});
