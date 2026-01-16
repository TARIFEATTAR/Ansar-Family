"use client";

import { SignUp } from "@clerk/nextjs";

/**
 * SIGN UP PAGE — Clerk Authentication
 */

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ansar-cream px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl text-ansar-charcoal mb-2">
            Create Account
          </h1>
          <p className="font-body text-ansar-gray">
            Join the Ansar Family network
          </p>
        </div>
        <SignUp 
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
