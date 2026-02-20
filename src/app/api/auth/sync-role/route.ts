import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * POST /api/auth/sync-role
 *
 * Syncs the user's role from Convex into Clerk's publicMetadata.
 * Called by the Dashboard Gateway page after upsertFromClerk determines
 * the correct role. This ensures middleware can read the role from the
 * JWT session claims on subsequent requests.
 *
 * Body: { role: string }
 * Returns: { success: true } or { error: string }
 *
 * Security: Only the authenticated user can sync their own role.
 * The role value comes from the trusted Convex backend — this endpoint
 * simply bridges the gap between Convex and Clerk metadata.
 */
export async function POST(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json(
            { error: "Not authenticated" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { role } = body;

        // Validate role value
        const validRoles = ["super_admin", "partner_lead", "ansar", "seeker"];
        if (!role || !validRoles.includes(role)) {
            return NextResponse.json(
                { error: `Invalid role: ${role}` },
                { status: 400 }
            );
        }

        // Update Clerk user's publicMetadata with the role
        const clerk = await clerkClient();
        await clerk.users.updateUser(userId, {
            publicMetadata: { role },
        });

        console.log(`✅ Synced role "${role}" to Clerk for user ${userId}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to sync role to Clerk:", error);
        return NextResponse.json(
            { error: "Failed to sync role" },
            { status: 500 }
        );
    }
}
