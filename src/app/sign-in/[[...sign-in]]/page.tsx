"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * SIGN IN PAGE — Clerk Authentication
 * Redirects to /dashboard if the user is already signed in.
 */

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Don't render <SignIn /> if already signed in — avoids Clerk warning
  if (!isLoaded || isSignedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ansar-cream">
        <div className="w-6 h-6 border-2 border-ansar-sage-600 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

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
            elements: {
              formButtonPrimary: "bg-ansar-sage-600 hover:bg-ansar-sage-700",
              card: "shadow-none border border-ansar-sage-100",
            },
          }}
        />
      </div>
    </main>
  );
}
