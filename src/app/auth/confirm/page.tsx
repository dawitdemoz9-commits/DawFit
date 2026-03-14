"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

// Client-side page that handles Supabase invite/magic-link tokens delivered as
// URL hash fragments (#access_token=...) which server-side Route Handlers can't read.
// The browser Supabase client detects and exchanges the hash automatically.
export default function ConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Invited users need to set a password; existing users go to their portal
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          router.replace("/auth/set-password");
        }
      }
    });

    // Also check immediately in case already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/auth/set-password");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500 rounded-xl mb-4">
          <span className="text-white font-bold text-lg">D</span>
        </div>
        <p className="text-slate-600 text-sm">Setting up your account…</p>
      </div>
    </div>
  );
}
