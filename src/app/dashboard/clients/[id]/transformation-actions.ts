"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const SaveSchema = z.object({
  testimonial: z.string().max(2000).optional(),
  before_photo_url: z.string().url().optional().nullable(),
  after_photo_url: z.string().url().optional().nullable(),
});

export async function saveTransformation(
  clientId: string,
  input: z.infer<typeof SaveSchema>
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const parsed = SaveSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  // Verify coach owns this client
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("coach_id", user.id)
    .single();
  if (!client) throw new Error("Client not found");

  const { data: existing } = await supabase
    .from("transformations")
    .select("id, share_token")
    .eq("client_id", clientId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("transformations")
      .update({
        testimonial: parsed.data.testimonial ?? null,
        before_photo_url: parsed.data.before_photo_url ?? null,
        after_photo_url: parsed.data.after_photo_url ?? null,
      })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("transformations")
      .insert({
        client_id: clientId,
        testimonial: parsed.data.testimonial ?? null,
        before_photo_url: parsed.data.before_photo_url ?? null,
        after_photo_url: parsed.data.after_photo_url ?? null,
        share_token: crypto.randomUUID(),
        is_public: false,
      });
  }

  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function toggleTransformationPublic(
  transformationId: string,
  clientId: string,
  isPublic: boolean
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Verify ownership via client
  const { data: tx } = await supabase
    .from("transformations")
    .select("id, clients(coach_id)")
    .eq("id", transformationId)
    .single();

  const coachId = Array.isArray(tx?.clients)
    ? (tx.clients[0] as { coach_id: string })?.coach_id
    : (tx?.clients as unknown as { coach_id: string } | null)?.coach_id;

  if (!tx || coachId !== user.id) throw new Error("Forbidden");

  await supabase
    .from("transformations")
    .update({ is_public: isPublic })
    .eq("id", transformationId);

  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function deleteTransformation(transformationId: string, clientId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: tx } = await supabase
    .from("transformations")
    .select("id, clients(coach_id)")
    .eq("id", transformationId)
    .single();

  const coachId = Array.isArray(tx?.clients)
    ? (tx.clients[0] as { coach_id: string })?.coach_id
    : (tx?.clients as unknown as { coach_id: string } | null)?.coach_id;

  if (!tx || coachId !== user.id) throw new Error("Forbidden");

  await supabase.from("transformations").delete().eq("id", transformationId);

  revalidatePath(`/dashboard/clients/${clientId}`);
}
