import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * TEST WORKFLOWS
 * 
 * Usage:
 * npx convex run test_workflows:runTest '{ "testName": "seeker", "email": "your@email.com", "phone": "+15555555555" }'
 * 
 * This action executes the REAL public mutations to ensure full end-to-end testing 
 * of the database, user creation, and notification triggers.
 */

export const runTest = internalAction({
    args: {
        testName: v.union(
            v.literal("seeker"),
            v.literal("ansar"),
            v.literal("partner"),
            v.literal("pairing"),
            v.literal("contact")
        ),
        email: v.string(),
        phone: v.string(),
    },
    handler: async (ctx, args): Promise<{ success: boolean; message?: string; error?: string }> => {
        console.log(`🧪 Starting INTEGRATION TEST: ${args.testName.toUpperCase()}`);
        console.log(`📍 Target: ${args.email} / ${args.phone}`);

        // 1. Check Env Vars (Vital for notifications)
        const missingVars = [];
        if (!process.env.RESEND_API_KEY) missingVars.push("RESEND_API_KEY");
        if (!process.env.TWILIO_ACCOUNT_SID) missingVars.push("TWILIO_ACCOUNT_SID");
        if (!process.env.TWILIO_AUTH_TOKEN) missingVars.push("TWILIO_AUTH_TOKEN");
        if (!process.env.TWILIO_PHONE_NUMBER) missingVars.push("TWILIO_PHONE_NUMBER");

        if (missingVars.length > 0) {
            const msg = `❌ Aborting: Missing Environment Variables: ${missingVars.join(", ")}`;
            console.error(msg);
            return { success: false, error: msg };
        }

        try {
            let resultId;
            const timestamp = Date.now();

            switch (args.testName) {

                // ---------------------------------------------------------
                // SEEKER FLOW
                // ---------------------------------------------------------
                case "seeker": {
                    console.log("👉 Executing: api.intakes.create");
                    resultId = await ctx.runMutation(api.intakes.create, {
                        fullName: `Test Seeker ${timestamp}`,
                        phone: args.phone,
                        email: args.email,
                        gender: "male",
                        journeyType: "seeker",
                        city: "Test City",
                        supportAreas: ["community"],
                        consentGiven: true,
                        source: "general"
                    });
                    console.log(`✅ Seeker Created: ${resultId}`);
                    console.log("👉 Check logs for: 'Welcome notifications scheduled'");
                    break;
                }

                // ---------------------------------------------------------
                // ANSAR FLOW
                // ---------------------------------------------------------
                case "ansar": {
                    console.log("👉 Executing: api.ansars.create");
                    const ansarId: any = await ctx.runMutation(api.ansars.create, {
                        fullName: `Test Ansar ${timestamp}`,
                        phone: args.phone,
                        email: args.email,
                        gender: "male",
                        address: "123 Test St",
                        city: "Test City",
                        isConvert: false,
                        practiceLevel: "steady",
                        knowledgeBackground: [],
                        experience: [],
                        supportAreas: [],
                        checkInFrequency: "weekly",
                        motivation: "Test motivation",
                        agreementsAccepted: true,
                        organizationId: undefined
                    });

                    console.log(`✅ Ansar Created: ${ansarId}`);
                    console.log("👉 Executing: api.ansars.updateStatus (Approve)");

                    await ctx.runMutation(api.ansars.updateStatus, {
                        id: ansarId,
                        status: "approved"
                    });

                    console.log(`✅ Ansar Approved. Check logs for Approval Notification.`);
                    resultId = ansarId;
                    break;
                }

                // ---------------------------------------------------------
                // PARTNER FLOW
                // ---------------------------------------------------------
                case "partner": {
                    console.log("👉 Executing: api.partners.create");
                    const partnerId: any = await ctx.runMutation(api.partners.create, {
                        leadName: `Test Partner Lead ${timestamp}`,
                        leadPhone: args.phone,
                        leadEmail: args.email,
                        leadIsConvert: false,
                        orgName: `Test Org ${timestamp}`,
                        orgType: "masjid",
                        address: "123 Test St",
                        city: "Test City",
                        genderFocus: "both",
                        infrastructure: {
                            hasWeeklyProgramming: true,
                            canHostNewMuslimSessions: true,
                            hasImamAccess: true,
                            hasExistingNewMuslimProgram: false,
                            wantsDinnerKit: false,
                            hasPhysicalSpace: true
                        },
                        coreTrio: {},
                        agreementsAccepted: true
                    });

                    console.log(`✅ Partner Application Created: ${partnerId}`);
                    console.log("👉 Executing: api.partners.approveAndCreateOrg");

                    await ctx.runMutation(api.partners.approveAndCreateOrg, {
                        id: partnerId
                    });

                    console.log(`✅ Partner Approved & Org Created. Check logs for notifications.`);
                    resultId = partnerId;
                    break;
                }

                // ---------------------------------------------------------
                // CONTACT FLOW
                // ---------------------------------------------------------
                case "contact": {
                    console.log("👉 Executing: api.contacts.create");
                    resultId = await ctx.runMutation(api.contacts.create, {
                        fullName: `Test Contact ${timestamp}`,
                        email: args.email,
                        phone: args.phone,
                        role: "volunteer",
                        tags: ["test"]
                    });
                    console.log(`✅ Contact Created: ${resultId}`);
                    break;
                }

                // ---------------------------------------------------------
                // PAIRING FLOW
                // ---------------------------------------------------------
                case "pairing": {
                    // We need a helper mutation to set up the data because we need IDs
                    // Actually we can just run sequential mutations here in the action!

                    console.log("👉 Setting up Pairing Prerequisites...");

                    // 1. Create Partner (to get Org)
                    const partnerId: any = await ctx.runMutation(api.partners.create, {
                        leadName: `Test Lead ${timestamp}`,
                        leadPhone: args.phone,
                        leadEmail: `lead${timestamp}@test.com`, // Dummy email for lead
                        leadIsConvert: false,
                        orgName: `Test Community ${timestamp}`,
                        orgType: "masjid",
                        address: "Test St",
                        city: "Test City",
                        genderFocus: "both",
                        infrastructure: { hasWeeklyProgramming: true, canHostNewMuslimSessions: true, hasImamAccess: true, hasExistingNewMuslimProgram: false, wantsDinnerKit: false, hasPhysicalSpace: true },
                        coreTrio: {},
                        agreementsAccepted: true
                    });

                    const { organizationId }: any = await ctx.runMutation(api.partners.approveAndCreateOrg, { id: partnerId });
                    console.log(`   Organization setup: ${organizationId}`);

                    // 2. Create Seeker
                    const seekerId: any = await ctx.runMutation(api.intakes.create, {
                        fullName: `Test Seeker ${timestamp}`,
                        phone: args.phone,
                        email: args.email, // Use real email
                        gender: "male",
                        journeyType: "seeker",
                        city: "Test City",
                        supportAreas: [],
                        consentGiven: true,
                        source: "general"
                    });
                    // Assign to Org
                    await ctx.runMutation(api.intakes.assignToOrganization, { id: seekerId, organizationId });
                    console.log(`   Seeker setup: ${seekerId}`);

                    // 3. Create Ansar
                    const ansarId: any = await ctx.runMutation(api.ansars.create, {
                        fullName: `Test Ansar ${timestamp}`,
                        phone: args.phone,
                        email: args.email, // Use real email
                        gender: "male",
                        address: "Test St",
                        city: "Test City",
                        isConvert: false,
                        practiceLevel: "steady",
                        knowledgeBackground: [],
                        experience: [],
                        supportAreas: [],
                        checkInFrequency: "weekly",
                        motivation: "Test",
                        agreementsAccepted: true,
                        organizationId // Directly assign
                    });
                    await ctx.runMutation(api.ansars.updateStatus, { id: ansarId, status: "approved" });
                    console.log(`   Ansar setup: ${ansarId}`);

                    // 4. Create Pairing
                    console.log("👉 Executing: api.pairings.create");
                    resultId = await ctx.runMutation(api.pairings.create, {
                        seekerId,
                        ansarId,
                        organizationId,
                    });

                    console.log(`✅ Pairing Created: ${resultId}`);
                    console.log("👉 Check logs for Dual Notifications (Seeker & Ansar).");
                    break;
                }
            }

            return { success: true, message: `Test '${args.testName}' completed successfully. ID: ${resultId}` };

        } catch (error: any) {
            console.error(`❌ Test failed:`, error);
            return { success: false, error: error.message };
        }
    },
});
