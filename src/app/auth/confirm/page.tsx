"use client";

import { useEffect } from "react";

export default function ConfirmPage() {
  useEffect(() => {
    async function handle() {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const hash = window.location.hash;
      const search = window.location.search;
      const params = new URLSearchParams(search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type") as "recovery" | "invite" | "magiclink" | "signup" | null;

      // PKCE flow — token is in the query string
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (error) {
          window.location.replace("/auth/login?error=" + encodeURIComponent(error.message));
          return;
        }
        window.location.replace("/auth/set-password");
        return;
      }

      // Implicit flow — token is in the hash fragment
      const hasHashToken = hash.includes("access_token") || hash.includes("token_hash");
      if (!hasHashToken) {
        window.location.replace("/auth/login");
        return;
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY" || event === "USER_UPDATED")) {
          subscription.unsubscribe();
          window.location.replace("/auth/set-password");
        }
      });

      // Fallback: if no event fires in 6s the link is expired
      setTimeout(() => {
        subscription.unsubscribe();
        window.location.replace("/auth/login?error=" + encodeURIComponent("Link expired. Request a new one."));
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
