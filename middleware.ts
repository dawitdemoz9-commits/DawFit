import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_ROUTES = /^\/(dashboard|client)/;
const PUBLIC_ROUTES = /^\/(auth|apply|api|_next|favicon|pricing|compare|features|t\/)/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes entirely
  if (PUBLIC_ROUTES.test(pathname) || pathname === "/" || pathname === "/pricing") {
    return NextResponse.next({ request });
  }

  // Refresh Supabase session and check auth for protected routes
  const { supabaseResponse, user } = await updateSession(request);

  if (!user && PROTECTED_ROUTES.test(pathname)) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
