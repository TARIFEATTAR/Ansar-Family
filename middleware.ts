import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * CLERK MIDDLEWARE — Role-Based Route Protection
 *
 * Protected routes (require authentication):
 *   /admin/*      → super_admin only
 *   /dashboard/*  → super_admin or partner_lead
 *   /seeker/*     → seeker only
 *   /ansar/*      → ansar only
 *
 * Public routes (no auth required):
 *   /             → Landing page
 *   /join         → Seeker intake
 *   /volunteer    → Ansar application
 *   /partner      → Partner application
 *   /sign-in, /sign-up → Auth pages
 *
 * Role is read from Clerk publicMetadata via session token customization.
 * If no role is set yet (first sign-in), user is allowed through to
 * /dashboard where the gateway page will detect and sync their role.
 *
 * Clerk Dashboard → Sessions → Customize session token:
 *   { "metadata": "{{user.public_metadata}}" }
 */

// Routes that require login
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/dashboard(.*)",
  "/seeker(.*)",
  "/ansar(.*)",
]);

// Role-to-route access map
const ROUTE_ROLE_MAP: Record<string, string[]> = {
  "/admin": ["super_admin"],
  "/dashboard": ["super_admin", "partner_lead"],
  "/seeker": ["seeker"],
  "/ansar": ["ansar"],
};

/**
 * Determine which route group a given pathname belongs to.
 * e.g. "/admin/leads" → "/admin"
 */
function getRouteGroup(pathname: string): string | null {
  for (const prefix of Object.keys(ROUTE_ROLE_MAP)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return prefix;
    }
  }
  return null;
}

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Step 1: Ensure the user is authenticated (redirects to sign-in if not)
    await auth.protect();

    // Step 2: Check role-based access
    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role;

    const routeGroup = getRouteGroup(req.nextUrl.pathname);

    if (routeGroup) {
      const allowedRoles = ROUTE_ROLE_MAP[routeGroup];

      // If user has no role in Clerk metadata yet (first login), allow them
      // through to /dashboard where the gateway page will detect + sync role.
      // Block them from other role-specific routes until role is synced.
      if (!role) {
        if (routeGroup === "/dashboard") {
          // Allow — gateway page will handle role detection + sync
          return;
        }
        // No role yet but hitting /admin, /seeker, /ansar — redirect to gateway
        const dashboardUrl = new URL("/dashboard", req.url);
        return NextResponse.redirect(dashboardUrl);
      }

      // User has a role — enforce it
      if (!allowedRoles.includes(role)) {
        // Redirect to the correct dashboard for their role
        const redirectUrl = getRoleHomepage(role, req.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }
});

/**
 * Returns the appropriate homepage URL for a given role.
 */
function getRoleHomepage(role: string, baseUrl: string): URL {
  switch (role) {
    case "super_admin":
      return new URL("/admin", baseUrl);
    case "partner_lead":
      return new URL("/dashboard", baseUrl);
    case "ansar":
      return new URL("/ansar", baseUrl);
    case "seeker":
      return new URL("/seeker", baseUrl);
    default:
      return new URL("/dashboard", baseUrl);
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
