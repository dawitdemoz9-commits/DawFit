import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const RequestSchema = z.object({
  conversation_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { conversation_id } = parsed.data;

  // Verify participant
  const { data: conv } = await supabase
    .from("conversations")
    .select("coach_id, client_id")
    .eq("id", conversation_id)
    .single();

  if (!conv || (conv.coach_id !== user.id && conv.client_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Mark all messages NOT sent by this user as read
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversation_id)
    .neq("sender_id", user.id)
    .is("read_at", null);

  return NextResponse.json({ ok: true });
}
