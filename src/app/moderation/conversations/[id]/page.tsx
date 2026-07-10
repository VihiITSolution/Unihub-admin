"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { chatService } from "@/services/chat.service";
import type { ChatMessage, Conversation } from "@/types/chat";

export default function ModerationConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const conversationId = Number(id);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await chatService.getConversationMessages(conversationId);
        if (response.success && response.data) {
          setConversation(response.data.conversation);
          setMessages(response.data.messages);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [conversationId]);

  const handleFlagToggle = async () => {
    if (!conversation) return;
    const reason = conversation.isFlagged
      ? undefined
      : prompt("Reason for flagging this conversation (optional):") || undefined;
    const response = await chatService.flagConversation(
      conversationId,
      !conversation.isFlagged,
      reason,
    );
    if (response.success && response.data) {
      setConversation(response.data.conversation);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!conversation) {
    return <div className="p-8 text-center text-gray-500">Conversation not found.</div>;
  }

  return (
    <div className="p-8">
      <button
        onClick={() => router.push("/moderation/conversations")}
        className="text-sm text-gray-600 hover:underline mb-4"
      >
        ← Back to Chat Moderation
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {conversation.participantOne?.firstName} {conversation.participantOne?.lastName}{" "}
            ↔ {conversation.participantTwo?.firstName} {conversation.participantTwo?.lastName}
          </h1>
          <p className="text-gray-600 text-sm capitalize">
            Context: {conversation.contextType.replace("_", " ")}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {conversation.participantOne?.email} · {conversation.participantTwo?.email}
          </p>
        </div>
        <button
          onClick={handleFlagToggle}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            conversation.isFlagged
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          {conversation.isFlagged ? "Unflag" : "Flag for follow-up"}
        </button>
      </div>

      {conversation.isFlagged && conversation.flagReason && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          Flag reason: {conversation.flagReason}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6" style={{ maxHeight: "65vh", overflowY: "auto" }}>
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages in this conversation.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="mb-4 pb-4 border-b last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-900">
                  {message.sender.firstName} {message.sender.lastName}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(message.createdAt).toLocaleString()}
                </span>
              </div>
              {message.body && <p className="text-sm text-gray-700">{message.body}</p>}
              {message.attachments?.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-primary-600 hover:underline mt-1"
                >
                  📎 {attachment.originalFilename || "Attachment"}
                </a>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
