/**
 * Edge middleware: protects /dashboard and /admin by requiring auth_session cookie.
 * Full session verification (JWT) remains in getSession() / verifyAdminAccess() on the server.
 */

import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "auth_session";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect /dashboard and all dashboard sub-routes
    if (pathname.startsWith("/dashboard")) {
        const token = request.cookies.get(AUTH_COOKIE)?.value;
        if (!token || !token.trim()) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    // Protect /admin and all admin sub-routes (only "is logged in" check; role checked server-side)
    if (pathname.startsWith("/admin")) {
        const token = request.cookies.get(AUTH_COOKIE)?.value;
        if (!token || !token.trim()) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};
