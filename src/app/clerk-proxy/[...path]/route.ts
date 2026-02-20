import { NextRequest, NextResponse } from "next/server";

/**
 * Clerk Frontend API Proxy
 *
 * This route proxies requests from ansar.family/__clerk/* to the
 * Clerk Frontend API at frontend-api.clerk.dev, adding the required
 * headers (Clerk-Proxy-Url, Clerk-Secret-Key, X-Forwarded-For).
 *
 * This is needed because the clerk.ansar.family CNAME intermittently
 * returns 404 errors, breaking authentication on production.
 */

const CLERK_FAPI = "https://frontend-api.clerk.dev";

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const targetPath = path?.join("/") || "";
    const url = new URL(`/${targetPath}`, CLERK_FAPI);

    // Forward query params
    req.nextUrl.searchParams.forEach((value, key) => {
        url.searchParams.set(key, value);
    });

    // Clone request headers
    const headers = new Headers(req.headers);

    // Set required Clerk proxy headers
    const proxyUrl = `${req.nextUrl.origin}/clerk-proxy`;
    headers.set("Clerk-Proxy-Url", proxyUrl);
    headers.set("Clerk-Secret-Key", process.env.CLERK_SECRET_KEY || "");
    headers.set("X-Forwarded-For", req.headers.get("x-forwarded-for") || "127.0.0.1");

    // Remove host header (will be set to the target)
    headers.delete("host");

    try {
        const response = await fetch(url.toString(), {
            method: req.method,
            headers,
            body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
            // @ts-ignore - duplex needed for streaming body
            duplex: req.method !== "GET" && req.method !== "HEAD" ? "half" : undefined,
        });

        // Forward the response
        const responseHeaders = new Headers(response.headers);
        // Remove transfer-encoding as Next.js handles this
        responseHeaders.delete("transfer-encoding");

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error("Clerk proxy error:", error);
        return NextResponse.json(
            { error: "Failed to proxy request to Clerk" },
            { status: 502 }
        );
    }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
