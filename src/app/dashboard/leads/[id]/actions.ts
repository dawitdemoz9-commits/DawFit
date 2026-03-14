"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendLeadConversionEmail } from "@/lib/email";

type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "rejected";

export async function deleteLead(leadId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("leads")
    .delete()
    .eq("id", leadId)
    .eq("coach_id", user.id);

  revalidatePath("/dashboard/leads");
  redirect("/dashboard/leads");
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("leads")
    .update({ status })
    .eq("id", leadId)
    .eq("coach_id", user.id);

  revalidatePath(`/dashboard/leads/${leadId}`);
  revalidatePath("/dashboard/leads");
}

export async function convertLeadToClient(leadId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Load lead — must belong to this coach
  const { data: lead } = await supabase
    .from("leads")
    .select("id, email, full_name, phone, status, converted_client_id")
    .eq("id", leadId)
    .eq("coach_id", user.id)
    .single();

  if (!lead) throw new Error("Lead not found");
  if (lead.status === "converted" && lead.converted_client_id) {
    // Already converted — redirect to client
    redirect(`/dashboard/clients/${lead.converted_client_id}`);
  }

  // Load application data to seed client goals
  const { data: application } = await supabase
    .from("lead_applications")
    .select("goals, experience_level, health_notes")
    .eq("lead_id", leadId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const admin = createAdminClient();

  // Check if user already exists
  const { data: existingList } = await admin.auth.admin.listUsers();
  const existingUser = existingList?.users.find(u => u.email === lead.email);

  let clientUserId: string;

  if (existingUser) {
    // User already has an account — use their existing ID
    clientUserId = existingUser.id;

    // Ensure profile has role=client (don't downgrade a coach)
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", clientUserId)
      .maybeSingle();

    if (!existingProfile) {
      await admin.from("profiles").insert({
        id: clientUserId,
        role: "client",
        full_name: lead.full_name,
      });
    }
  } else {
    // Invite user by email — sends magic link invitation
    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
      lead.email,
      {
        data: { role: "client", full_name: lead.full_name ?? "" },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback`,
      }
    );

    if (inviteErr || !invited?.user) {
      throw new Error(`Failed to invite user: ${inviteErr?.message ?? "unknown error"}`);
    }

    clientUserId = invited.user.id;

    // Create profile row
    await admin.from("profiles").insert({
      id: clientUserId,
      role: "client",
      full_name: lead.full_name,
    });
  }

  // Check if client record already exists for this coach
  const { data: existingClient } = await admin
    .from("clients")
    .select("id")
    .eq("id", clientUserId)
    .eq("coach_id", user.id)
    .maybeSingle();

  if (!existingClient) {
    await admin.from("clients").insert({
      id: clientUserId,
      coach_id: user.id,
      status: "active",
      goals: application?.goals ?? null,
    });
  }

  // Mark lead as converted
  await supabase
    .from("leads")
    .update({ status: "converted", converted_client_id: clientUserId })
    .eq("id", leadId)
    .eq("coach_id", user.id);

  // Send welcome email (non-blocking — Supabase sends the magic link separately)
  const { data: coachProfile } = await admin
    .from("coaches")
    .select("business_name, profiles(full_name)")
    .eq("id", user.id)
    .single();
  const coachName = (Array.isArray(coachProfile?.profiles) ? coachProfile.profiles[0] : coachProfile?.profiles)?.full_name ?? "Your coach";
  const coachBusiness = coachProfile?.business_name ?? coachName;
  await sendLeadConversionEmail({
    to: lead.email,
    clientName: lead.full_name ?? "",
    coachName,
    coachBusiness,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://dawfit.app",
  });

  revalidatePath("/dashboard/leads");
  redirect(`/dashboard/clients/${clientUserId}`);
}
