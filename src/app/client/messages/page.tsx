import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientMessages } from "@/components/client/client-messages";

export default async function ClientMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Get coach_id for this client
  const { data: clientRow } = await supabase
    .from("clients")
    .select("coach_id")
    .eq("id", user.id)
    .single();

  if (!clientRow) redirect("/auth/login");

  // Get coach profile
  const { data: coachData } = await supabase
    .from("coaches")
    .select("business_name, profiles(full_name, avatar_url)")
    .eq("id", clientRow.coach_id)
    .single();

  const coachProfile = Array.isArray(coachData?.profiles)
    ? coachData.profiles[0]
    : coachData?.profiles;

  const coachName = (coachProfile as { full_name: string | null } | null)?.full_name
    ?? coachData?.business_name
    ?? "Coach";

  // Find or load existing conversation
  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("coach_id", clientRow.coach_id)
    .eq("client_id", user.id)
    .maybeSingle();

  // Load initial messages if conversation exists
  const { data: initialMessages } = conv
    ? await supabase
        .from("messages")
        .select("id, sender_id, body, sent_at, read_at")
        .eq("conversation_id", conv.id)
        .order("sent_at", { ascending: true })
    : { data: [] };

  // Mark messages from coach as read
  if (conv) {
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conv.id)
      .neq("sender_id", user.id)
      .is("read_at", null);
  }

  return (
    <ClientMessages
      clientId={user.id}
      coachId={clientRow.coach_id}
      coachName={coachName}
      conversationId={conv?.id ?? null}
      initialMessages={(initialMessages ?? []) as Array<{
        id: string;
        sender_id: string;
        body: string;
        sent_at: string;
        read_at: string | null;
      }>}
    />
  );
}
