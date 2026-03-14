"use client";

import { useEffect } from "react";

// Client-side page that handles Supabase auth tokens delivered as URL hash fragments
// (#access_token=...) which server-side Route Handlers can't read.
export default function ConfirmPage() {
  useEffect(() => {
    async function handle() {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Sign out any existing session so we don't accidentally update the wrong account
      await supabase.auth.signOut();

      // Wait for the new session to be established from the hash token
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY" || event === "USER_UPDATED")) {
          subscription.unsubscribe();
          window.location.replace("/auth/set-password");
        }
      });

      // Timeout fallback — if no session after 5s, go to login
      setTimeout(() => {
        subscription.unsubscribe();
        window.location.replace("/auth/login?error=Link expired or already used. Request a new one.");
      }, 5000);
    }

    handle();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500 rounded-xl mb-4">
          <span className="text-white font-bold text-lg">D</span>
        </div>
        <p className="text-slate-600 text-sm">Verifying your link…</p>
      </div>
    </div>
  );
}
