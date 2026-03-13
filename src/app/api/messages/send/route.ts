import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const RequestSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  body: z.string().min(1).max(4000),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { conversation_id, client_id, body: messageBody } = parsed.data;

  if (!conversation_id && !client_id) {
    return NextResponse.json({ error: "Provide conversation_id or client_id" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let convId = conversation_id;

  if (!convId) {
    // Coach initiating: conversation keyed by coach_id + client_id
    if (profile?.role === "coach") {
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("coach_id", user.id)
        .eq("client_id", client_id!)
        .maybeSingle();

      if (existing) {
        convId = existing.id;
      } else {
        const { data: created, error } = await supabase
          .from("conversations")
          .insert({ coach_id: user.id, client_id: client_id! })
          .select("id")
          .single();
        if (error || !created) {
          return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
        }
        convId = created.id;
      }
    } else {
      // Client initiating: find their coach
      const { data: clientRow } = await supabase
        .from("clients")
        .select("coach_id")
        .eq("id", user.id)
        .single();

      if (!clientRow) return NextResponse.json({ error: "No coach found" }, { status: 400 });

      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("coach_id", clientRow.coach_id)
        .eq("client_id", user.id)
        .maybeSingle();

      if (existing) {
        convId = existing.id;
      } else {
        const { data: created, error } = await supabase
          .from("conversations")
          .insert({ coach_id: clientRow.coach_id, client_id: user.id })
          .select("id")
          .single();
        if (error || !created) {
          return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
        }
        convId = created.id;
      }
    }
  }

  // Verify user is a participant of this conversation
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, coach_id, client_id")
    .eq("id", convId!)
    .single();

  if (!conv || (conv.coach_id !== user.id && conv.client_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: message, error: msgError } = await supabase
    .from("messages")
    .insert({ conversation_id: convId!, sender_id: user.id, body: messageBody })
    .select("id, sender_id, body, sent_at, read_at")
    .single();

  if (msgError || !message) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  // Update conversation's last_message_at
  await supabase
    .from("conversations")
    .update({ last_message_at: message.sent_at })
    .eq("id", convId!);

  return NextResponse.json({ message, conversation_id: convId });
}
