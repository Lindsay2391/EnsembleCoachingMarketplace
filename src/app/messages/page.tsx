"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerType: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string };
}

function MessagesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTo = searchParams.get("to");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(initialTo);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) setConversations(await res.json());
      } catch (err) {
        console.error("Error:", err);
      }
    }
    if (session) fetchConversations();
  }, [session]);

  useEffect(() => {
    async function fetchMessages() {
      if (!selectedPartnerId) return;
      try {
        const res = await fetch(`/api/messages/${selectedPartnerId}`);
        if (res.ok) setMessages(await res.json());
      } catch (err) {
        console.error("Error:", err);
      }
    }
    fetchMessages();
  }, [selectedPartnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartnerId) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: selectedPartnerId, content: newMessage }),
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ height: "calc(100vh - 300px)" }}>
        {/* Conversation List */}
        <Card className="overflow-hidden">
          <CardHeader><h2 className="text-sm font-semibold text-gray-900">Conversations</h2></CardHeader>
          <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 400px)" }}>
            {conversations.length === 0 ? (
              <CardContent><p className="text-sm text-gray-500">No conversations yet</p></CardContent>
            ) : (
              conversations.map((conv) => (
                <button key={conv.partnerId}
                  onClick={() => setSelectedPartnerId(conv.partnerId)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    selectedPartnerId === conv.partnerId ? "bg-coral-50" : ""
                  }`}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 text-sm">{conv.partnerName}</p>
                    {conv.unreadCount > 0 && (
                      <Badge variant="info">{conv.unreadCount}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Message Area */}
        <Card className="md:col-span-2 flex flex-col overflow-hidden">
          {selectedPartnerId ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "calc(100vh - 440px)" }}>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === session?.user?.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                      msg.senderId === session?.user?.id
                        ? "bg-coral-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.senderId === session?.user?.id ? "text-coral-200" : "text-gray-400"
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-coral-500 focus:outline-none focus:ring-1 focus:ring-coral-400"
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
