"use client";

import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

/**
 * NOT FOUND — Invalid Partner Slug
 * 
 * Shown when a user navigates to a partner URL that doesn't exist.
 */

export default function PartnerNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-ansar-cream">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-ansar-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-8 h-8 text-ansar-sage-600" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl text-ansar-charcoal mb-4">
          Community Not Found
        </h1>
        <p className="font-body text-ansar-gray mb-8">
          We couldn't find a partner community at this address. They may not be registered yet, 
          or the link may be incorrect.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary inline-flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go to Ansar Family
          </Link>
          <Link href="/partner" className="btn-secondary inline-flex items-center justify-center">
            Register a Community
          </Link>
        </div>
      </div>
    </main>
  );
}
