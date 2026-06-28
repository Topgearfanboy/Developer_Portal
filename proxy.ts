import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./src/lib/auth";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/terms",
  "/privacy",
  "/contact",
  "/api/contact",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/health",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (!token) {
    console.log("[PROXY] No token for protected route:", pathname);
    // Redirect to login for page routes
    if (!pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Return 401 for API routes
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify token
  const payload = await verifyToken(token);

  if (!payload) {
    console.log("[PROXY] Invalid token for:", pathname);
    // Token is invalid or expired
    if (!pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
