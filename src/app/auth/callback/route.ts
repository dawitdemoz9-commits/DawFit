import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();
  let sessionError = true;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) sessionError = false;
  } else if (tokenHash && type) {
    // Invite / magic-link flow
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "invite" | "magiclink" | "recovery" | "email",
    });
    if (!error) sessionError = false;
  }

  if (!sessionError) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";
    const destination = isLocalEnv
      ? `${origin}${next}`
      : forwardedHost
        ? `https://${forwardedHost}${next}`
        : `${origin}${next}`;
    return NextResponse.redirect(destination);
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`);
}
