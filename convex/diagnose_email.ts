import { query } from "./_generated/server";
import { v } from "convex/values";

export const diagnose = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        // Try exact match
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", q => q.eq("email", args.email))
            .first();

        const partner = await ctx.db
            .query("partners")
            .withIndex("by_email", q => q.eq("leadEmail", args.email))
            .first();

        // Check case sensitivity issue?
        // We can't query case-insensitive easily without scanning, but we can return what we found.

        return {
            lookup_email: args.email,
            user_record: user ? {
                id: user._id,
                role: user.role,
                orgId: user.organizationId
            } : "NOT FOUND",

            partner_application: partner ? {
                id: partner._id,
                status: partner.status,
                orgId: partner.organizationId,
                leadEmail: partner.leadEmail // Check casing
            } : "NOT FOUND in 'partners' table via exact match",

            verdict: !partner ? "FAIL: No Partner Application found with this exact email." :
                partner.status !== "approved" ? `FAIL: Application is ${partner.status}, not 'approved'.` :
                    !user ? "FAIL: User record not created (Login didn't trigger upsert?)" :
                        user.role !== "partner_lead" ? `FAIL: User role is '${user.role}', expected 'partner_lead'.` :
                            "SUCCESS: Everything looks correct."
        };
    },
});
