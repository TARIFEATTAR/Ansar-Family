"use client";

import { SignIn } from "@clerk/nextjs";

/**
 * SIGN IN PAGE — Clerk Authentication
 */

export default function SignInPage() {
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
