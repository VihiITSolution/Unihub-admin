"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { chatService } from "@/services/chat.service";
import { useChatSocket } from "@/hooks/useChatSocket";
import type { ChatMessage, Conversation } from "@/types/chat";

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const { socket, connected } = useChatSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    setLoadingList(true);
    try {
      const response = await chatService.getConversations();
      if (response.success && response.data) {
        setConversations(response.data.conversations);
      }
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const loadThread = async () => {
      setLoadingThread(true);
      try {
        const response = await chatService.getMessages(activeId);
        if (response.success && response.data) {
          setMessages(response.data.messages);
        }
        await chatService.markRead(activeId);
      } finally {
        setLoadingThread(false);
      }
    };
    loadThread();
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!socket || !connected || !activeId) return;
    socket.emit("conversation:join", { conversationId: activeId });

    const handleNewMessage = (data: { conversationId: number; message: ChatMessage }) => {
      if (data.conversationId !== activeId) return;
      setMessages((prev) => [...prev, data.message]);
    };
    const handleRejected = (data: { conversationId: number; message: string }) => {
      if (data.conversationId !== activeId) return;
      setError(data.message);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:rejected", handleRejected);
    return () => {
      socket.emit("conversation:leave", { conversationId: activeId });
      socket.off("message:new", handleNewMessage);
      socket.off("message:rejected", handleRejected);
    };
  }, [socket, connected, activeId]);

  const handleSend = async () => {
    if (!activeId || !draft.trim()) return;
    setError(null);
    const body = draft.trim();
    setDraft("");

    if (connected && socket) {
      socket.emit("message:send", { conversationId: activeId, body, tempId: Date.now().toString() });
    } else {
      const response = await chatService.sendMessage(activeId, body);
      if (!response.success) {
        setError(response.message || "Failed to send message.");
        return;
      }
      if (response.data) setMessages((prev) => [...prev, response.data!.message]);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Messages</h1>
      <p className="text-gray-600 mb-6">
        Answer support conversations directly as an admin.
      </p>

      <div className="bg-white rounded-lg shadow-sm border flex" style={{ height: "70vh" }}>
        {/* Conversation list */}
        <div className="w-80 border-r overflow-y-auto">
          {loadingList ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No conversations yet.</div>
          ) : (
            conversations.map((conversation) => {
              const other = conversation.otherParticipant;
              return (
                <button
                  key={conversation.id}
                  onClick={() => setActiveId(conversation.id)}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 ${
                    activeId === conversation.id ? "bg-primary-50" : ""
                  }`}
                >
                  <div className="font-medium text-gray-900 truncate">
                    {other ? `${other.firstName} ${other.lastName}` : "Unknown user"}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {conversation.lastMessagePreview || "No messages yet"}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Thread */}
        <div className="flex-1 flex flex-col">
          {!activeId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation to view messages
            </div>
          ) : (
            <>
              <div className="border-b p-4 font-medium text-gray-900">
                {activeConversation?.otherParticipant
                  ? `${activeConversation.otherParticipant.firstName} ${activeConversation.otherParticipant.lastName}`
                  : "Conversation"}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {loadingThread ? (
                  <div className="text-center text-gray-500">Loading...</div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.senderId === Number(user?.id);
                    return (
                      <div
                        key={message.id}
                        className={`flex mb-3 ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                            isOwn ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {message.body}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>
              {error && (
                <div className="px-4 py-2 text-sm text-red-700 bg-red-50 border-t border-red-200">
                  {error}
                </div>
              )}
              <div className="border-t p-3 flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a reply..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={handleSend}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
