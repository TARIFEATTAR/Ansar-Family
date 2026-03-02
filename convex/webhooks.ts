import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const handleCalBookingCreated = internalMutation({
    args: {
        payload: v.any(),
    },
    handler: async (ctx, args) => {
        const { payload } = args;

        try {
            // The attendee's email is usually available in payload.payload.attendees[0].email
            // or payload.payload.responses.email depending on the Cal.com webhook structure.
            // We will try a few common paths.
            const bookingData = payload.payload;
            if (!bookingData) {
                console.error("No payload data in booking");
                return;
            }

            let attendeeEmail = "";

            if (bookingData.responses && bookingData.responses.email) {
                attendeeEmail = bookingData.responses.email;
            } else if (bookingData.attendees && bookingData.attendees.length > 0) {
                attendeeEmail = bookingData.attendees[0].email;
            }

            if (!attendeeEmail) {
                console.error("Could not find attendee email in Cal.com webhook payload");
                return;
            }

            const normalizedEmail = attendeeEmail.toLowerCase().trim();

            // Find a lead with this email
            const lead = await ctx.db
                .query("leads")
                .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
                .filter((q) => q.eq(q.field("status"), "new")) // Ideally only update if they are "new"
                .first();

            if (lead) {
                console.log(`Found matching lead for email ${normalizedEmail}. Updating status to scheduled.`);
                await ctx.db.patch(lead._id, {
                    status: "scheduled",
                    calBookingId: bookingData.uid || bookingData.id?.toString(),
                });
            } else {
                console.log(`No active lead found for email ${normalizedEmail} to schedule.`);
            }
        } catch (error) {
            console.error("Error handling Cal.com booking created webhook:", error);
        }
    },
});
