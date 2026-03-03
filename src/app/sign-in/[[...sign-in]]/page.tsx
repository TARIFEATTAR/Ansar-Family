"use client";

import { useEffect } from "react";
import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // If already signed in, route straight to dashboard to avoid interim UI flicker.
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Still loading auth state, or redirecting a signed-in user.
  if (!isLoaded || isSignedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <div className="w-6 h-6 border-2 border-ansar-sage-600 border-t-transparent rounded-full animate-spin" />
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
