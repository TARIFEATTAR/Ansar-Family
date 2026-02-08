import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * ADMIN — Super Admin Operations
 * Dangerous mutations that should only be accessible to super admins.
 */

/**
 * Clears ALL data from the database (for testing/reset purposes).
 * WARNING: This is destructive and cannot be undone!
 */
export const clearAllData = mutation({
    args: {},
    handler: async (ctx) => {
        // Get all records from each table and delete them
        const intakes = await ctx.db.query("intakes").collect();
        const ansars = await ctx.db.query("ansars").collect();
        const partners = await ctx.db.query("partners").collect();
        const organizations = await ctx.db.query("organizations").collect();
        const pairings = await ctx.db.query("pairings").collect();

        // Delete all intakes
        for (const intake of intakes) {
            await ctx.db.delete(intake._id);
        }

        // Delete all ansars
        for (const ansar of ansars) {
            await ctx.db.delete(ansar._id);
        }

        // Delete all pairings
        for (const pairing of pairings) {
            await ctx.db.delete(pairing._id);
        }

        // Delete all organizations (before partners since partners reference them)
        for (const org of organizations) {
            await ctx.db.delete(org._id);
        }

        // Delete all partners
        for (const partner of partners) {
            await ctx.db.delete(partner._id);
        }

        return {
            deleted: {
                intakes: intakes.length,
                ansars: ansars.length,
                partners: partners.length,
                organizations: organizations.length,
                pairings: pairings.length,
            },
        };
    },
});

/**
 * Resends the login instructions (Approved) or Application Received (Pending) email to a user.
 * Useful if they lost the original email or need to sign in again.
 */
export const resendInvite = mutation({
    args: {
        role: v.union(v.literal("ansar"), v.literal("partner")),
        id: v.string(),
    },
    handler: async (ctx, args) => {
        if (args.role === "ansar") {
            const ansarId = args.id as Id<"ansars">;
            const ansar = await ctx.db.get(ansarId);
            if (!ansar) throw new Error("Ansar not found");

            if (ansar.status === "approved" || ansar.status === "active") {
                await ctx.scheduler.runAfter(0, internal.notifications.sendApprovalNotification, {
                    recipientId: ansar._id,
                    email: ansar.email,
                    phone: ansar.phone,
                    firstName: ansar.fullName.split(" ")[0] || ansar.fullName,
                    role: "ansar",
                });
            } else {
                // Pending
                await ctx.scheduler.runAfter(0, internal.notifications.sendWelcomeEmail, {
                    recipientId: ansar._id,
                    email: ansar.email,
                    firstName: ansar.fullName.split(" ")[0] || ansar.fullName,
                    fullName: ansar.fullName,
                    template: "welcome_ansar",
                });
            }
        } else if (args.role === "partner") {
            const partnerId = args.id as Id<"partners">;
            const partner = await ctx.db.get(partnerId);
            if (!partner) throw new Error("Partner not found");

            if (partner.status === "approved" || partner.status === "active") {
                await ctx.scheduler.runAfter(0, internal.notifications.sendApprovalNotification, {
                    recipientId: partner._id,
                    email: partner.leadEmail,
                    phone: partner.leadPhone,
                    firstName: partner.leadName.split(" ")[0] || partner.leadName,
                    role: "partner",
                });
            } else {
                // Pending
                // Assuming 'pending-approval' slug or no slug needed for welcome_partner if not yet approved
                await ctx.scheduler.runAfter(0, internal.notifications.sendWelcomeEmail, {
                    recipientId: partner._id,
                    email: partner.leadEmail,
                    firstName: partner.leadName.split(" ")[0] || partner.leadName,
                    fullName: partner.leadName,
                    template: "welcome_partner",
                    orgName: partner.orgName,
                    slug: "pending-approval",
                });
            }
        }
    },
});
