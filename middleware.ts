import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/hire", "/api/auth/me"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Local-dev convenience: skip auth entirely when running `npm run dev`.
  // WHY safe: Next sets NODE_ENV=development ONLY for the local dev server.
  // Vercel deployments and `next start` run as production, where the login gate
  // below is always enforced. So this removes login friction during development
  // without weakening the deployed app.
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/team") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("nora_session")?.value;
  const secret  = process.env.DASHBOARD_SESSION_SECRET;

  if (!session || !secret || session !== secret) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
