/**
 * Clerk Custom Session Claims
 *
 * Extends Clerk's JWT session token with our custom `publicMetadata.role`.
 * This lets middleware read `sessionClaims.metadata.role` from the JWT
 * without making a database call on every request.
 *
 * To work, Clerk must have a Session Token customization that includes:
 *   "metadata": "{{user.public_metadata}}"
 *
 * @see https://clerk.com/docs/backend-requests/making/custom-session-token
 */

export { };

declare global {
    interface CustomJwtSessionClaims {
        metadata?: {
            role?: "super_admin" | "partner_lead" | "ansar" | "seeker";
        };
    }
}
