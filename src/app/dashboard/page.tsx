"use client";

import { useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Building2 } from "lucide-react";
import Link from "next/link";

/**
 * DASHBOARD GATEWAY — Smart Routing for Authenticated Users
 * 
 * This page acts as a traffic controller:
 * - Super Admins → /admin
 * - Partner Leads → /dashboard/[their-org-slug]
 * - Others → Pending/Unauthorized state
 */

export default function DashboardGatewayPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    // Sync user to Convex
    const upsertUser = useMutation(api.users.upsertFromClerk);

    // Get current user from Convex
    const currentUser = useQuery(
        api.users.getByClerkId,
        user?.id ? { clerkId: user.id } : "skip"
    );

    useEffect(() => {
        if (user && isLoaded) {
            upsertUser({
                clerkId: user.id,
                email: user.primaryEmailAddress?.emailAddress ?? "",
                name: user.fullName ?? user.firstName ?? "User",
            });
        }
    }, [user, isLoaded, upsertUser]);

    // If user is a partner_lead, get their organization to find the slug
    const organization = useQuery(
        api.organizations.getById,
        currentUser?.organizationId ? { id: currentUser.organizationId } : "skip"
    );

    useEffect(() => {
        // Wait for all data to load
        if (!isLoaded || currentUser === undefined) return;

        // Handle Super Admin
        if (currentUser?.role === "super_admin") {
            router.replace("/admin");
            return;
        }

        // Handle Partner Lead with organization
        if (currentUser?.role === "partner_lead" && organization) {
            router.replace(`/dashboard/${organization.slug}`);
            return;
        }

        // Handle Seeker
        if (currentUser?.role === "seeker") {
            router.replace("/seeker");
            return;
        }
    }, [isLoaded, currentUser, organization, router]);

    // Loading state
    if (!isLoaded || currentUser === undefined) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-ansar-sage-600 animate-spin mx-auto mb-4" />
                    <p className="font-body text-ansar-gray">Loading your dashboard...</p>
                </div>
            </main>
        );
    }

    // Not authenticated (shouldn't happen due to middleware, but safety first)
    if (!user) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
                <div className="text-center max-w-md mx-auto px-6">
                    <AlertCircle className="w-12 h-12 text-ansar-terracotta mx-auto mb-4" />
                    <h1 className="font-heading text-2xl text-ansar-charcoal mb-4">
                        Please Sign In
                    </h1>
                    <p className="font-body text-ansar-gray mb-6">
                        You need to be signed in to access the dashboard.
                    </p>
                    <Link href="/sign-in" className="btn-primary inline-block">
                        Sign In
                    </Link>
                </div>
            </main>
        );
    }

    // Partner Lead waiting for organization data
    if (currentUser?.role === "partner_lead" && organization === undefined) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-ansar-sage-600 animate-spin mx-auto mb-4" />
                    <p className="font-body text-ansar-gray">Finding your organization...</p>
                </div>
            </main>
        );
    }

    // Partner Lead without an organization (edge case - pending approval)
    if (currentUser?.role === "partner_lead" && !currentUser?.organizationId) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
                <div className="text-center max-w-md mx-auto px-6">
                    <Building2 className="w-12 h-12 text-ansar-ochre mx-auto mb-4" />
                    <h1 className="font-heading text-2xl text-ansar-charcoal mb-4">
                        Application Pending
                    </h1>
                    <p className="font-body text-ansar-gray mb-6">
                        Your partner application is being reviewed. Once approved, you'll be
                        able to access your organization's dashboard.
                    </p>
                    <Link href="/" className="text-ansar-sage-600 font-body hover:underline">
                        ← Return to Home
                    </Link>
                </div>
            </main>
        );
    }

    // User exists but doesn't have dashboard access (ansar or unknown role)
    return (
        <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
            <div className="text-center max-w-md mx-auto px-6">
                <AlertCircle className="w-12 h-12 text-ansar-ochre mx-auto mb-4" />
                <h1 className="font-heading text-2xl text-ansar-charcoal mb-4">
                    No Dashboard Access
                </h1>
                <p className="font-body text-ansar-gray mb-6">
                    The account <strong>{user.primaryEmailAddress?.emailAddress}</strong> doesn&apos;t have
                    access to a dashboard yet.
                </p>
                <div className="space-y-3">
                    <SignOutButton>
                        <button className="btn-primary w-full">
                            Sign Out & Try Another Email
                        </button>
                    </SignOutButton>

                    <Link href="/" className="text-ansar-sage-600 font-body hover:underline block text-sm mt-4">
                        Return to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
