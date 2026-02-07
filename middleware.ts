import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * CLERK MIDDLEWARE — Route Protection
 * 
 * Protected routes:
 * - /admin/* — Super Admin only
 * - /dashboard/* — Partner Leads (authenticated users)
 * 
 * Public routes:
 * - / — Landing page
 * - /join — Seeker intake
 * - /volunteer — Ansar application
 * - /partner — Partner application
 * - /[slug]/* — Partner-specific public pages
 */

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/dashboard(.*)",
  "/seeker(.*)",
  "/ansar(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
