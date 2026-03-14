"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Detects Supabase auth hash fragments (#access_token=...&type=recovery/invite/magiclink)
// on any page and redirects to /auth/confirm which handles them client-side.
export function AuthHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash.includes("access_token") || hash.includes("token_hash")) {
      router.replace("/auth/confirm" + hash);
    }
  }, [router]);

  return null;
}
