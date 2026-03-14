"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function resendClientInvite(clientId: string, email: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Verify this client belongs to this coach
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("coach_id", user.id)
    .maybeSingle();

  if (!client) throw new Error("Client not found");

  const admin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Try invite first; if user already exists, fall back to a magic link
  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { role: "client" },
    redirectTo: `${appUrl}/auth/confirm`,
  });

  if (inviteError) {
    // User already exists — send a magic link so they can sign in
    const { error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${appUrl}/auth/confirm` },
    });
    if (linkError) throw new Error(linkError.message);
  }
}
