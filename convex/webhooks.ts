import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const handleCalBookingCreated = internalMutation({
    args: {
        payload: v.any(),
    },
    handler: async (ctx, args) => {
        const { payload } = args;

        // Log the full payload for debugging
        console.log("Cal.com webhook received. Full payload keys:", Object.keys(payload));

        // Extract the booking data from the nested payload
        const bookingData = payload.payload;
        if (!bookingData) {
            console.error("Cal webhook: No nested 'payload' field found. Top-level keys:", Object.keys(payload));
            // Fallback: maybe the data IS at the top level (some Cal.com versions)
            // Try to find email directly in the top-level payload
            const fallbackEmail = payload.responses?.email || payload.attendees?.[0]?.email;
            if (!fallbackEmail) {
                console.error("Cal webhook: Could not find email anywhere in payload.");
                return;
            }
            // Use the fallback
            await updateLeadByEmail(ctx, fallbackEmail.toLowerCase().trim(), payload.uid || payload.id?.toString());
            return;
        }

        console.log("Cal webhook bookingData keys:", Object.keys(bookingData));

        // Try multiple paths to find the attendee email
        let attendeeEmail = "";

        if (bookingData.responses && bookingData.responses.email) {
            attendeeEmail = bookingData.responses.email;
            console.log("Cal webhook: Found email in responses.email:", attendeeEmail);
        } else if (bookingData.attendees && bookingData.attendees.length > 0) {
            attendeeEmail = bookingData.attendees[0].email;
            console.log("Cal webhook: Found email in attendees[0].email:", attendeeEmail);
        } else if (bookingData.email) {
            attendeeEmail = bookingData.email;
            console.log("Cal webhook: Found email in bookingData.email:", attendeeEmail);
        }

        if (!attendeeEmail) {
            console.error("Cal webhook: Could not find attendee email. bookingData:", JSON.stringify(bookingData).slice(0, 500));
            return;
        }

        const bookingId = bookingData.uid || bookingData.id?.toString() || "unknown";
        await updateLeadByEmail(ctx, attendeeEmail.toLowerCase().trim(), bookingId);
    },
});

async function updateLeadByEmail(ctx: any, email: string, bookingId: string | undefined) {
    console.log(`Cal webhook: Looking for lead with email: "${email}"`);

    // Get ALL leads and find the match manually (avoids any index issues)
    const allLeads = await ctx.db.query("leads").collect();
    console.log(`Cal webhook: Total leads in database: ${allLeads.length}`);

    const matchingLeads = allLeads.filter(
        (l: any) => l.email === email && l.status === "new"
    );

    console.log(`Cal webhook: Found ${matchingLeads.length} matching lead(s) with status "new" for email "${email}"`);

    if (matchingLeads.length === 0) {
        // Check if there's a lead with this email but a different status
        const anyMatch = allLeads.filter((l: any) => l.email === email);
        console.log(`Cal webhook: Found ${anyMatch.length} total lead(s) with this email (any status). Statuses: ${anyMatch.map((l: any) => l.status).join(", ")}`);
        return;
    }

    // Update the most recent matching lead
    const lead = matchingLeads[0];
    console.log(`Cal webhook: Updating lead ${lead._id} (${lead.fullName}) from "new" to "scheduled"`);

    await ctx.db.patch(lead._id, {
        status: "scheduled" as const,
        calBookingId: bookingId,
    });

    console.log(`Cal webhook: ✅ Successfully updated lead ${lead._id} to "scheduled"`);
}
