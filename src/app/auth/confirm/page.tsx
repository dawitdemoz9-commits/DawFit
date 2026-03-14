"use client";

import { useEffect } from "react";

export default function ConfirmPage() {
  useEffect(() => {
    // Must have an auth token in the URL hash to proceed
    const hash = window.location.hash;
    const hasToken = hash.includes("access_token") || hash.includes("token_hash");

    if (!hasToken) {
      window.location.replace("/auth/login");
      return;
    }

    async function handle() {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Supabase auto-processes the hash token when the client is created.
      // Listen for the resulting auth event.
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY" || event === "USER_UPDATED")) {
          subscription.unsubscribe();
          window.location.replace("/auth/set-password");
        }
      });

      // Fallback: if no event fires in 6s the link is expired
      setTimeout(() => {
        subscription.unsubscribe();
        window.location.replace("/auth/login?error=Link expired. Request a new one.");
      }, 6000);
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
