import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CoachMessages } from "@/components/coach/coach-messages";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "coach") redirect("/client/messages");

  // Load all conversations this coach has, with client profile + unread count
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, client_id, last_message_at")
    .eq("coach_id", user.id)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  // Load active clients to allow starting new conversations
  const { data: activeClients } = await supabase
    .from("clients")
    .select("id, profiles(full_name, avatar_url)")
    .eq("coach_id", user.id)
    .eq("status", "active");

  // Load unread counts per conversation
  const convIds = (conversations ?? []).map(c => c.id);
  const { data: unreadRows } = convIds.length > 0
    ? await supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", convIds)
        .neq("sender_id", user.id)
        .is("read_at", null)
    : { data: [] };

  const unreadByConv: Record<string, number> = {};
  for (const row of (unreadRows ?? [])) {
    unreadByConv[row.conversation_id] = (unreadByConv[row.conversation_id] ?? 0) + 1;
  }

  // Build conversation list enriched with client name
  type ConvRow = {
    id: string;
    client_id: string;
    last_message_at: string | null;
    client_name: string;
    client_avatar: string | null;
    unread: number;
  };

  const clientMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
  for (const c of (activeClients ?? [])) {
    const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
    clientMap[c.id] = {
      full_name: (p as { full_name: string | null } | null)?.full_name ?? null,
      avatar_url: (p as { avatar_url: string | null } | null)?.avatar_url ?? null,
    };
  }

  const enrichedConversations: ConvRow[] = (conversations ?? []).map(conv => ({
    id: conv.id,
    client_id: conv.client_id,
    last_message_at: conv.last_message_at,
    client_name: clientMap[conv.client_id]?.full_name ?? "Client",
    client_avatar: clientMap[conv.client_id]?.avatar_url ?? null,
    unread: unreadByConv[conv.id] ?? 0,
  }));

  // Clients without an existing conversation (can start new)
  const existingClientIds = new Set((conversations ?? []).map(c => c.client_id));
  const newableClients = (activeClients ?? [])
    .filter(c => !existingClientIds.has(c.id))
    .map(c => {
      const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
      return {
        id: c.id,
        name: (p as { full_name: string | null } | null)?.full_name ?? "Client",
        avatar: (p as { avatar_url: string | null } | null)?.avatar_url ?? null,
      };
    });

  return (
    <CoachMessages
      coachId={user.id}
      conversations={enrichedConversations}
      newableClients={newableClients}
    />
  );
}
