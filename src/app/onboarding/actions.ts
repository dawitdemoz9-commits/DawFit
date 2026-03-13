"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const businessName = formData.get("business_name") as string;
  const bio = formData.get("bio") as string;
  const brandColor = formData.get("brand_color") as string;
  const websiteUrl = formData.get("website_url") as string;

  // Generate a clean slug from business name
  const baseSlug = slugify(businessName);
  let slug = baseSlug;
  let attempt = 0;

  // Check if slug is already taken (excluding this coach)
  while (true) {
    const { data: existing } = await supabase
      .from("coaches")
      .select("id")
      .eq("slug", slug)
      .neq("id", user.id)
      .single();

    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const { error } = await supabase.from("coaches").update({
    business_name: businessName,
    bio,
    brand_color: brandColor || "#3B82F6",
    website_url: websiteUrl || null,
    slug,
    onboarded_at: new Date().toISOString(),
  }).eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Also update profile full_name if provided
  const fullName = formData.get("full_name") as string;
  if (fullName) {
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
