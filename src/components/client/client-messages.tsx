"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, MessageSquareIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  body: string;
  sent_at: string;
  read_at: string | null;
}

interface ClientMessagesProps {
  clientId: string;
  coachId: string;
  coachName: string;
  conversationId: string | null;
  initialMessages: Message[];
}

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ClientMessages({
  clientId,
  coachId,
  coachName,
  conversationId: initialConvId,
  initialMessages,
}: ClientMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [convId, setConvId] = useState<string | null>(initialConvId);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
  const subscribeToConv = useCallback((id: string) => {
    const channel = supabase
      .channel(`messages:client:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          const msg = payload.new as Message;
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // Auto-mark read if from coach
          if (msg.sender_id !== clientId) {
            fetch("/api/messages/read", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ conversation_id: id }),
            });
          }
        }
      )
      .subscribe();
    return channel;
  }, [supabase, clientId]);

  useEffect(() => {
    if (!convId) return;
    const channel = subscribeToConv(convId);
    return () => { supabase.removeChannel(channel); };
  }, [convId, subscribeToConv, supabase]);

  async function sendMessage() {
    if (!body.trim() || sending) return;
    setSending(true);
    const text = body.trim();
    setBody("");

    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });

    const json = await res.json();

    // First message creates the conversation
    if (!convId && json.conversation_id) {
      setConvId(json.conversation_id);
      // The sent message will come back via realtime; add it optimistically
      if (json.message) {
        setMessages(prev => {
          if (prev.find(m => m.id === json.message.id)) return prev;
          return [...prev, json.message];
        });
      }
    }

    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-sm bg-indigo-100 text-indigo-700">
            {initials(coachName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-slate-900 text-sm">{coachName}</p>
          <p className="text-xs text-slate-400">Your coach</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 pt-20">
            <MessageSquareIcon className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No messages yet. Say hi to your coach!</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === clientId;
          return (
            <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
              {!isMe && (
                <Avatar className="w-7 h-7 flex-shrink-0 mr-2 self-end mb-1">
                  <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                    {initials(coachName)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn(
                "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                isMe
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100"
              )}>
                <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                <p className={cn("text-[10px] mt-1 text-right", isMe ? "text-indigo-200" : "text-slate-400")}>
                  {formatTime(msg.sent_at)}
                  {isMe && msg.read_at && " · Read"}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="px-4 py-3 border-t border-slate-200 bg-white flex gap-2 items-end">
        <Textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message your coach… (Enter to send)"
          className="flex-1 resize-none min-h-[40px] max-h-[120px] text-sm"
          rows={1}
        />
        <Button
          size="icon"
          disabled={!body.trim() || sending}
          onClick={sendMessage}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex-shrink-0"
        >
          <SendIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
