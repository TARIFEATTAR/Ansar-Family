"use client";

import { SignIn, useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut } from "lucide-react";
import Link from "next/link";

/**
 * SIGN IN PAGE — Clerk Authentication
 *
 * If the user is already signed in, shows who they are with options to:
 *   1. Continue to the dashboard
 *   2. Sign out and switch accounts
 *
 * If not signed in, shows the normal Clerk sign-in form.
 */

export default function SignInPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Still loading auth state
  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <div className="w-6 h-6 border-2 border-ansar-sage-600 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // Already signed in — show identity + options
  if (isSignedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-ansar-sage-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="font-heading text-xl text-ansar-sage-700">
              {user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
          <h1 className="font-heading text-2xl text-ansar-charcoal mb-1">
            You&apos;re signed in
          </h1>
          <p className="font-body text-sm text-ansar-muted mb-1">
            {user?.fullName || "User"}
          </p>
          <p className="font-body text-xs text-ansar-muted mb-8">
            {user?.primaryEmailAddress?.emailAddress}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-primary w-full inline-flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>

            <SignOutButton>
              <button className="w-full flex items-center justify-center gap-2 text-sm text-ansar-muted hover:text-ansar-charcoal border border-[rgba(61,61,61,0.12)] px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-body">
                <LogOut className="w-4 h-4" />
                Sign Out &amp; Switch Account
              </button>
            </SignOutButton>

            <Link
              href="/"
              className="block text-xs text-ansar-sage-600 hover:underline font-body mt-2"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Not signed in — show sign-in form
  return (
    <main className="min-h-screen flex items-center justify-center bg-ansar-cream px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl text-ansar-charcoal mb-2">
            Welcome Back
          </h1>
          <p className="font-body text-ansar-gray">
            Sign in to access your dashboard
          </p>
        </div>
        <SignIn
          forceRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: "#7D8B6A",
              colorTextOnPrimaryBackground: "#FFFFFF",
              colorBackground: "#FFFFFF",
              colorText: "#3D3D3D",
              colorTextSecondary: "#8A8A85",
              colorInputBackground: "#FFFFFF",
              colorInputText: "#3D3D3D",
              borderRadius: "0.5rem",
              fontFamily: "'Inter', system-ui, sans-serif",
            },
            elements: {
              formButtonPrimary:
                "bg-[#7D8B6A] hover:bg-[#6B7A58] text-white shadow-none transition-colors duration-200",
              card: "shadow-none border border-[#E8ECE4] rounded-xl",
              headerTitle: "font-semibold text-[#3D3D3D]",
              headerSubtitle: "text-[#8A8A85]",
              socialButtonsBlockButton:
                "border-[#E8ECE4] hover:bg-[#F5F3EE] transition-colors duration-200",
              formFieldInput:
                "border-[#E8ECE4] focus:border-[#7D8B6A] focus:ring-[#7D8B6A] rounded-lg",
              footerActionLink: "text-[#7D8B6A] hover:text-[#6B7A58]",
              identityPreviewEditButton: "text-[#7D8B6A] hover:text-[#6B7A58]",
              formFieldLabel: "text-[#3D3D3D]",
              dividerLine: "bg-[#E8ECE4]",
              dividerText: "text-[#8A8A85]",
            },
          }}
        />
      </div>
    </main>
  );
}
