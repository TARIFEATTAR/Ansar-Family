import { NextRequest, NextResponse } from "next/server";

/**
 * Clerk Frontend API Proxy
 *
 * Proxies requests from ansar.family/clerk-proxy/* to Clerk's
 * Frontend API at frontend-api.clerk.dev with required headers.
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

    // Remove headers that cause issues with proxying
    headers.delete("host");
    headers.delete("accept-encoding"); // Prevent gzip — fetch decompresses internally

    try {
        const response = await fetch(url.toString(), {
            method: req.method,
            headers,
            body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
            redirect: "manual",
            // @ts-ignore - duplex needed for streaming body
            duplex: req.method !== "GET" && req.method !== "HEAD" ? "half" : undefined,
        });

        // Build clean response headers
        const responseHeaders = new Headers();
        response.headers.forEach((value, key) => {
            const lower = key.toLowerCase();
            // Skip headers that cause content decoding issues or are hop-by-hop
            if (
                lower === "transfer-encoding" ||
                lower === "content-encoding" ||
                lower === "content-length" ||
                lower === "connection" ||
                lower === "set-cookie" // Handle Set-Cookie separately below
            ) return;
            responseHeaders.set(key, value);
        });

        // Handle Set-Cookie headers specially — must use append() for multiple values
        const setCookies = response.headers.getSetCookie?.() ?? [];
        for (const cookie of setCookies) {
            responseHeaders.append("Set-Cookie", cookie);
        }

        // Read the body as an ArrayBuffer to avoid streaming issues
        const body = response.status === 204 || response.status === 304
            ? null
            : await response.arrayBuffer();

        return new NextResponse(body, {
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
