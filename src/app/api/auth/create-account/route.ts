import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * POST /api/auth/create-account
 *
 * Creates a Clerk user account with email + password.
 * Called from public signup forms (partner, ansar, seeker) BEFORE
 * the Convex mutation, so the real Clerk user ID can be stored.
 *
 * Body: { email: string, password: string, firstName: string, lastName?: string }
 * Returns: { clerkUserId: string } or { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName) {
      return NextResponse.json(
        { error: "Email, password, and first name are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // Create the Clerk user
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.createUser({
      emailAddress: [email.toLowerCase()],
      password,
      firstName,
      lastName: lastName || undefined,
    });

    return NextResponse.json({ clerkUserId: clerkUser.id });
  } catch (error: unknown) {
    // Handle Clerk-specific errors
    const clerkError = error as { errors?: Array<{ message: string; code: string }> };

    if (clerkError.errors && clerkError.errors.length > 0) {
      const firstError = clerkError.errors[0];

      // Duplicate email
      if (firstError.code === "form_identifier_exists") {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in instead." },
          { status: 409 }
        );
      }

      // Password too weak
      if (firstError.code === "form_password_pwned" || firstError.code === "form_password_length_too_short") {
        return NextResponse.json(
          { error: "Password is too weak. Please choose a stronger password." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    console.error("Failed to create Clerk account:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
