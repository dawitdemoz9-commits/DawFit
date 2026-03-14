"use client";

import { useEffect } from "react";

// Detects Supabase auth hash fragments (#access_token=...&type=recovery/invite/magiclink)
// on any page and redirects to /auth/confirm which handles them client-side.
export function AuthHashRedirect() {

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Already on the confirm page — don't redirect, let it handle the token itself
    if (window.location.pathname === "/auth/confirm") return;
    const hash = window.location.hash;
    if (hash.includes("access_token") || hash.includes("token_hash")) {
      window.location.replace("/auth/confirm" + hash);
    }
  }, []);

  return null;
}
