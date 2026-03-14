import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/", "/pricing", "/auth/login", "/auth/signup", "/auth/callback", "/auth/reset-password"];
const APPLY_ROUTE_PATTERN = /^\/apply\//;
const COACH_ROUTES = /^\/dashboard/;
const CLIENT_ROUTES = /^\/client/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_ROUTES.includes(pathname) ||
    APPLY_ROUTE_PATTERN.test(pathname) ||
    pathname.startsWith("/api/leads") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next({ request });
  }

  const { supabaseResponse, user, supabase } = await updateSession(request);

  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  if (role === "coach" && CLIENT_ROUTES.test(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (role === "client" && COACH_ROUTES.test(pathname)) {
    return NextResponse.redirect(new URL("/client", request.url));
  }

  if (pathname === "/") {
    if (role === "coach") return NextResponse.redirect(new URL("/dashboard", request.url));
    if (role === "client") return NextResponse.redirect(new URL("/client", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
