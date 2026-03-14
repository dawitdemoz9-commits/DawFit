"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SendIcon, MessageSquareIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConvRow {
  id: string;
  client_id: string;
  last_message_at: string | null;
  client_name: string;
  client_avatar: string | null;
  unread: number;
}

interface NewableClient {
  id: string;
  name: string;
  avatar: string | null;
}

interface Message {
  id: string;
  sender_id: string;
  body: string;
  sent_at: string;
  read_at: string | null;
}

interface CoachMessagesProps {
  coachId: string;
  conversations: ConvRow[];
  newableClients: NewableClient[];
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

export function CoachMessages({ coachId, conversations: initialConvs, newableClients }: CoachMessagesProps) {
  const [conversations, setConversations] = useState<ConvRow[]>(initialConvs);
  const [selectedId, setSelectedId] = useState<string | null>(initialConvs[0]?.id ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const selectedConv = conversations.find(c => c.id === selectedId) ?? null;

  // Load messages for selected conversation
  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMessages(true);
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, body, sent_at, read_at")
      .eq("conversation_id", convId)
      .order("sent_at", { ascending: true });
    setMessages((data ?? []) as Message[]);
    setLoadingMessages(false);

    // Mark as read
    await fetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: convId }),
    });

    // Clear unread count locally
    setConversations(prev => prev.map(c =>
      c.id === convId ? { ...c, unread: 0 } : c
    ));
  }, [supabase]);

  useEffect(() => {
    if (!selectedId) return;
    loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!selectedId) return;

    const channel = supabase
      .channel(`messages:conv:${selectedId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` },
        (payload) => {
          const msg = payload.new as Message;
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // Auto-mark read if not our own message
          if (msg.sender_id !== coachId) {
            fetch("/api/messages/read", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ conversation_id: selectedId }),
            });
          }
          // Update last_message_at in conversation list
          setConversations(prev => prev.map(c =>
            c.id === selectedId
              ? { ...c, last_message_at: msg.sent_at, unread: 0 }
              : c
          ));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedId, coachId, supabase]);

  async function sendMessage() {
    if (!body.trim() || !selectedId) return;
    setSending(true);
    const text = body.trim();
    setBody("");

    // Optimistic update — show immediately without waiting for Realtime
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      sender_id: coachId,
      body: text,
      sent_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages(prev => [...prev, optimistic]);

    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: selectedId, body: text }),
    });
    const json = await res.json();

    // Replace temp with the real message from DB
    if (json.message) {
      setMessages(prev => prev.map(m => m.id === tempId ? json.message : m));
    }

    setSending(false);
  }

  async function startConversation(client: NewableClient) {
    setSending(true);
    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: client.id, body: "👋 Hey! Let me know if you have any questions." }),
    });
    const json = await res.json();
    const newConvId: string = json.conversation_id;

    const newConv: ConvRow = {
      id: newConvId,
      client_id: client.id,
      last_message_at: new Date().toISOString(),
      client_name: client.name,
      client_avatar: client.avatar,
      unread: 0,
    };
    setConversations(prev => [newConv, ...prev]);
    setSelectedId(newConvId);
    setShowNewClient(false);
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-72 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">Messages</h1>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8"
            onClick={() => setShowNewClient(v => !v)}
            title="New conversation"
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>

        {showNewClient && newableClients.length > 0 && (
          <div className="border-b border-slate-100 bg-slate-50 p-2 space-y-1">
            <p className="text-xs text-slate-500 px-2 pb-1">Start new conversation</p>
            {newableClients.map(c => (
              <button
                key={c.id}
                disabled={sending}
                onClick={() => startConversation(c)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 text-left text-sm"
              >
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">{initials(c.name)}</AvatarFallback>
                </Avatar>
                {c.name}
              </button>
            ))}
          </div>
        )}

        {showNewClient && newableClients.length === 0 && (
          <div className="p-3 text-xs text-slate-500 bg-slate-50 border-b border-slate-100">
            All active clients already have conversations.
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="p-4 text-sm text-slate-400 text-center mt-8">
              <MessageSquareIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No conversations yet
            </div>
          )}
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 text-left transition-colors",
                selectedId === conv.id && "bg-indigo-50 border-l-2 border-l-indigo-500"
              )}
            >
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarFallback className="text-sm bg-slate-200">
                  {initials(conv.client_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900 truncate">{conv.client_name}</span>
                  {conv.last_message_at && (
                    <span className="text-xs text-slate-400 flex-shrink-0 ml-1">
                      {formatTime(conv.last_message_at)}
                    </span>
                  )}
                </div>
                {conv.unread > 0 && (
                  <Badge className="mt-0.5 h-4 text-[10px] bg-indigo-600 text-white">
                    {conv.unread} new
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-sm bg-slate-200">
                  {initials(selectedConv.client_name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-slate-900">{selectedConv.client_name}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-slate-50">
              {loadingMessages && (
                <p className="text-center text-sm text-slate-400">Loading...</p>
              )}
              {!loadingMessages && messages.length === 0 && (
                <p className="text-center text-sm text-slate-400 mt-12">
                  No messages yet. Say hello!
                </p>
              )}
              {messages.map(msg => {
                const isMe = msg.sender_id === coachId;
                return (
                  <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
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
                placeholder="Type a message… (Enter to send)"
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <MessageSquareIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a conversation or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
