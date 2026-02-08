import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * POST /api/auth/create-account
 *
 * Creates a Clerk user account with email + password.
 * Called from public signup forms (partner, ansar, seeker) BEFORE
 * the Convex mutation, so the real Clerk user ID can be stored.
 *
 * If the email already exists in Clerk, we look up the existing user
 * and return their ID so the intake can still be created.
 *
 * Body: { email: string, password: string, firstName: string, lastName?: string }
 * Returns: { clerkUserId: string } or { error: string }
 */
export async function POST(request: NextRequest) {
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

  try {
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

      // Duplicate email — look up existing Clerk user and return their ID
      // so the intake can still be created (handles retry after partial failure)
      if (firstError.code === "form_identifier_exists") {
        try {
          const clerk = await clerkClient();
          const existingUsers = await clerk.users.getUserList({
            emailAddress: [email.toLowerCase()],
          });
          if (existingUsers.data.length > 0) {
            console.log(`ℹ️ Clerk account already exists for ${email}, returning existing ID`);
            return NextResponse.json({
              clerkUserId: existingUsers.data[0].id,
              existing: true,
            });
          }
        } catch (lookupError) {
          console.error("Failed to look up existing Clerk user:", lookupError);
        }
        // If lookup fails, still return a helpful error
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in instead." },
          { status: 409 }
        );
      }

      // Password too weak or compromised
      if (
        firstError.code === "form_password_pwned" ||
        firstError.code === "form_password_length_too_short" ||
        firstError.code === "form_password_not_strong_enough" ||
        firstError.code === "form_password_size_in_bytes_exceeded"
      ) {
        const hint =
          firstError.code === "form_password_pwned"
            ? "This password has appeared in a data breach. Please choose a different one."
            : "Password is too weak. Use 8+ characters with a mix of letters, numbers, and symbols.";
        return NextResponse.json(
          { error: hint },
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
