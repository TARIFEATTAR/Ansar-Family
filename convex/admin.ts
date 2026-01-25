import { mutation } from "./_generated/server";

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
