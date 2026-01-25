import { mutation } from "./_generated/server";

export const lowercaseAll = mutation({
    args: {},
    handler: async (ctx) => {
        const partners = await ctx.db.query("partners").collect();
        let count = 0;
        for (const p of partners) {
            if (p.leadEmail !== p.leadEmail.toLowerCase()) {
                await ctx.db.patch(p._id, { leadEmail: p.leadEmail.toLowerCase() });
                count++;
            }
        }
        return `Fixed ${count} emails.`;
    },
});
