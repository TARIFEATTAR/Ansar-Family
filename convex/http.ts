import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
    path: "/cal-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const payload = await request.json();

            // Basic validation
            if (!payload || !payload.triggerEvent) {
                return new Response("Invalid payload", { status: 400 });
            }

            // We only care about new bookings being created
            if (payload.triggerEvent === "BOOKING_CREATED") {
                await ctx.runMutation(internal.webhooks.handleCalBookingCreated, {
                    payload,
                });
            }

            return new Response("OK", { status: 200 });
        } catch (error) {
            console.error("Error processing Cal.com webhook:", error);
            return new Response("Webhook Error", { status: 500 });
        }
    }),
});

export default http;
