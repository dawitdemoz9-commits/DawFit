"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { sendClientInviteEmail } from "@/lib/email";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "coach",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const serviceSupabase = await createServiceClient();

    // Create coach record with generated slug
    const baseSlug = slugify(fullName || email.split("@")[0]);
    let slug = baseSlug;
    let attempt = 0;

    // Ensure slug uniqueness
    while (true) {
      const { data: existing } = await serviceSupabase
        .from("coaches")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    await serviceSupabase.from("profiles").upsert({
      id: data.user.id,
      role: "coach" as const,
      full_name: fullName || null,
    }, { onConflict: "id" });

    const { error: coachError } = await serviceSupabase.from("coaches").insert({
      id: data.user.id,
      slug,
      business_name: fullName,
    });

    if (coachError) {
      return { error: coachError.message };
    }
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Determine role and redirect
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    revalidatePath("/", "layout");
    if (profile?.role === "coach") {
      redirect("/dashboard");
    } else {
      redirect("/client");
    }
  }

  redirect("/auth/login");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Check your email for the password reset link." };
}

export async function inviteClient(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const email = formData.get("email") as string;
  const fullName = formData.get("full_name") as string;

  // Use service role to invite (bypasses email confirmation)
  const { createServiceClient } = await import("@/lib/supabase/server");
  const serviceSupabase = await createServiceClient();

  const { data: invited, error } = await serviceSupabase.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        full_name: fullName,
        role: "client",
        coach_id: user.id,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/client`,
    }
  );

  if (error) {
    return { error: error.message };
  }

  if (invited.user) {
    // Create client record
    const { error: clientError } = await serviceSupabase.from("clients").insert({
      id: invited.user.id,
      coach_id: user.id,
      status: "active",
    });

    if (clientError) {
      return { error: clientError.message };
    }

    // Create conversation thread
    await serviceSupabase.from("conversations").insert({
      coach_id: user.id,
      client_id: invited.user.id,
    });

    // Send branded welcome email (non-blocking — Supabase sends the magic link separately)
    const { data: coachProfile } = await serviceSupabase
      .from("coaches")
      .select("business_name, profiles(full_name)")
      .eq("id", user.id)
      .single();
    const coachName = (Array.isArray(coachProfile?.profiles) ? coachProfile.profiles[0] : coachProfile?.profiles)?.full_name ?? "Your coach";
    const coachBusiness = coachProfile?.business_name ?? coachName;
    await sendClientInviteEmail({
      to: email,
      clientName: fullName,
      coachName,
      coachBusiness,
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://dawfit.app",
    });
  }

  return { success: `Invitation sent to ${email}` };
}
